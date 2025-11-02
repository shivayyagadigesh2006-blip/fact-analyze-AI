import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, Source, Verdict } from '../types';

// Vite exposes client-side env vars prefixed with VITE_ via import.meta.env
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Validate environment variables
if (!API_KEY) {
  console.error("Environment variables check failed:");
  console.error("VITE_GEMINI_API_KEY:", API_KEY ? "Set" : "Not set");
  throw new Error("API key not found. Please check your .env file and ensure VITE_GEMINI_API_KEY is set correctly.");
}

// Initialize Google Gemini AI with error handling
let ai;
try {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} catch (error) {
  console.error("Failed to initialize Gemini AI:", error);
  throw new Error("Failed to initialize AI service. Please check your API key and try again.");
}

function createPrompt(claim: string): string {
  const currentDate = new Date().toISOString().split('T')[0];
  return `
    Current date: ${currentDate}
    You are a highly advanced AI fact-checker named Fact Check AI.
    Your task is to analyze the following claim and determine its veracity using live web evidence when available.

    Claim: "${claim}"

    Important requirements:
    - Use web search tools to find recent, authoritative sources where possible. Prefer sources published within the last 12 months when relevant.
    - Always include the publication date for each source you cite.
    - Critically evaluate evidence for credibility, corroboration, and bias.
    - Formulate a step-by-step reasoning process that explains how you arrived at your conclusion.
    - Assign a final verdict using one of these exact strings: 'TRUE', 'LIKELY TRUE', 'MISLEADING', 'LIKELY FALSE', 'FALSE', 'UNVERIFIABLE'.
    - Write a concise, one-to-two sentence summary of your findings.

    Your final response MUST be a single, valid JSON object (no surrounding text or markdown) with this exact structure:
    {
      "verdict": "YOUR_VERDICT_HERE",
      "summary": "Your concise summary here.",
      "reasoning": "Your detailed, step-by-step reasoning here. Use newline characters (\\n) for paragraphs.",
      "sources": [{ "uri": "https://...", "title": "...", "published": "YYYY-MM-DD" }]
    }

    If the claim cannot be verified with reliable sources, return "UNVERIFIABLE" and explain which checks you performed.
  `;
}

// A type guard to check if a value is a valid Verdict enum key
function isValidVerdict(value: any): value is Verdict {
  return Object.values(Verdict).includes(value);
}

export const analyzeClaim = async (claim: string): Promise<AnalysisResult> => {
  try {
    const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-pro';
    // Build generation config and optionally enable web search tools if allowed
    const allowWebSearch = import.meta.env.VITE_ALLOW_WEB_SEARCH === 'true';
    const genConfig: any = { temperature: 0.1 };
    if (allowWebSearch) {
      genConfig.tools = [{ googleSearch: {} }];
    }

    console.log("Attempting to call Gemini API with model:", MODEL);
    let apiResponse;
    try {
      apiResponse = await ai.models.generateContent({
        model: MODEL,
        contents: createPrompt(claim),
        config: genConfig,
      });
      console.log("API call successful");
    } catch (apiError) {
      console.error("API call failed:", apiError);
      if (apiError.response?.status === 401) {
        throw new Error("API key is invalid. Please check your API key in the .env file.");
      }
      if (apiError.response?.status === 403) {
        throw new Error("API access forbidden. Please ensure your API key has the correct permissions.");
      }
      throw new Error("Failed to connect to the AI service. Please try again later.");
    }

    // Normalize response across SDK versions
    const raw: any = apiResponse as any;
    let jsonString = '';
    if (typeof raw.text === 'function') {
      // some SDK versions expose an async text() method
      jsonString = String(await raw.text());
    } else {
      jsonString = raw.text ?? raw.candidates?.[0]?.content ?? raw.candidates?.[0]?.text ?? '';
    }
    jsonString = (jsonString || '').trim();

    // The model sometimes wraps the JSON in a markdown code block like ```json ... ```
    const match = jsonString.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    if (match) {
      jsonString = match[1];
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonString);
    } catch (jsonError) {
      console.error("Failed to parse JSON response from Gemini:", jsonString);
      throw new Error("The AI returned an invalid response format. Please try rephrasing your claim.");
    }
    
    if (!isValidVerdict(parsedResponse.verdict)) {
      throw new Error(`The AI returned an unknown verdict: ${parsedResponse.verdict}`);
    }

    const candidates: any[] = raw.candidates ?? [];
    const sources: Source[] = candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({ uri: chunk.web?.uri, title: chunk.web?.title }))
      .filter((s: any): s is Source => Boolean(s && s.uri && s.title)) ?? [];

    // Deduplicate sources based on URI
    const uniqueSources = Array.from(new Map(sources.map(item => [item['uri'], item])).values());


    return {
      verdict: parsedResponse.verdict,
      summary: parsedResponse.summary || 'No summary provided.',
      reasoning: parsedResponse.reasoning || 'No reasoning provided.',
      sources: uniqueSources,
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
      if (error.message.includes('429')) {
         throw new Error("API rate limit exceeded. Please wait a moment before trying again.");
      }
      // Rethrow our custom errors or other specific API errors
      throw error;
    }
    // Fallback for non-Error exceptions
    throw new Error("An unknown error occurred during analysis.");
  }
};