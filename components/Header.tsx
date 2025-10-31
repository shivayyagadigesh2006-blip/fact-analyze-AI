
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center py-8 sm:py-12">
      <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
        Fact Check AI
      </h1>
      <p className="mt-3 text-lg text-slate-400">
        Real-time News & Claim Analysis with Evidence
      </p>
    </header>
  );
};
