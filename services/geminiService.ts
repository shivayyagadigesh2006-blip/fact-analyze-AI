import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult, Source, Verdict } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}

const genAI = new GoogleGenerativeAI(API_KEY);

function createPrompt(claim: string): string {
  return `
    You are a highly advanced AI fact-checker named Fact Check AI.
    Your task is to analyze the following claim and determine its veracity.

    Claim: "${claim}"

    Follow these steps:
    1. Analyze the claim carefully and determine its veracity based on known facts and data.
    2. Consider the context, potential interpretations, and any relevant time periods.
    3. Formulate a step-by-step reasoning process that explains how you arrived at your conclusion.
    4. Assign a final verdict based on your analysis. The verdict must be one of the following exact strings: 'TRUE', 'LIKELY TRUE', 'MISLEADING', 'LIKELY FALSE', 'FALSE', 'UNVERIFIABLE'.
    5. Write a concise, one-to-two sentence summary of your findings.

    Your final response MUST be a single, valid JSON object with this exact structure:
    {
      "verdict": "YOUR_VERDICT_HERE",
      "summary": "Your concise summary here.",
      "reasoning": "Your detailed, step-by-step reasoning here. Use newline characters (\\n) for paragraphs."
    }
  `;
}

// Type guard to check if a value is a valid Verdict enum key
function isValidVerdict(value: any): value is Verdict {
  return Object.values(Verdict).includes(value as Verdict);
}

export const analyzeClaim = async (claim: string): Promise<AnalysisResult> => {
  try {
    console.log('Starting analysis with API key:', API_KEY ? 'Present' : 'Missing');
    
    // Get the generative model
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.1, // Lower temperature for more factual responses
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    // Generate content
    const result = await model.generateContent(createPrompt(claim));
    const response = await result.response;
    let jsonString = response.text().trim();
    
    // Handle markdown code blocks if present
    const match = jsonString.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    if (match) {
      jsonString = match[1];
    }

    // Parse the response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonString);
    } catch (jsonError) {
      console.error("Failed to parse JSON response from Gemini:", jsonString);
      throw new Error("The AI returned an invalid response format. Please try rephrasing your claim.");
    }
    
    // Validate the verdict
    if (!isValidVerdict(parsedResponse.verdict)) {
      throw new Error(`The AI returned an unknown verdict: ${parsedResponse.verdict}`);
    }

    // Construct the result
    return {
      verdict: parsedResponse.verdict as Verdict,
      summary: parsedResponse.summary || 'No summary provided.',
      reasoning: parsedResponse.reasoning || 'No reasoning provided.',
      sources: [], // Since Gemini Pro doesn't directly provide source information
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
      if (error.message.includes('429')) {
        throw new Error("API rate limit exceeded. Please wait a moment before trying again.");
      }
      throw error;
    }
    throw new Error("An unknown error occurred during analysis.");
  }
};