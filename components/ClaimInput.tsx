
import React from 'react';

interface ClaimInputProps {
  claim: string;
  setClaim: (claim: string) => void;
  onAnalyze: (claim: string) => void;
  isLoading: boolean;
}

export const ClaimInput: React.FC<ClaimInputProps> = ({ claim, setClaim, onAnalyze, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(claim);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={claim}
        onChange={(e) => setClaim(e.target.value)}
        placeholder="Enter a news headline, quote, or claim to analyze..."
        className="w-full h-32 p-4 bg-slate-800 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-300 resize-none placeholder-slate-500"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !claim.trim()}
        className="w-full flex items-center justify-center px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95 disabled:scale-100"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </>
        ) : (
          'Analyze Claim'
        )}
      </button>
    </form>
  );
};
