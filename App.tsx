
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ClaimInput } from './components/ClaimInput';
import { ResultDisplay } from './components/ResultDisplay';
import { Loader } from './components/Loader';
import { analyzeClaim } from './services/geminiService';
import { AnalysisResult } from './types';

function App() {
  const [claim, setClaim] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = useCallback(async (claimToAnalyze: string) => {
    if (!claimToAnalyze.trim()) {
      setError('Please enter a claim to analyze.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await analyzeClaim(claimToAnalyze);
      setResult(analysisResult);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred. Please try again.';
      setError(`Analysis failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 font-sans p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-3xl">
        <Header />
        <main>
          <ClaimInput
            claim={claim}
            setClaim={setClaim}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
          {isLoading && <Loader />}
          {error && (
            <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg animate-fade-in">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}
          {result && !isLoading && <ResultDisplay result={result} />}
          {!isLoading && !result && !error && (
             <div className="mt-12 text-center text-slate-500">
              <p>Enter a news headline or claim above to begin your analysis.</p>
              <p className="text-sm mt-2">Our AI will use real-time web access to provide an evidence-based verdict.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
