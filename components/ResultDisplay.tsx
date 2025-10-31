
import React from 'react';
import { AnalysisResult, Source } from '../types';
import { VERDICT_STYLES } from '../constants';

interface ResultDisplayProps {
  result: AnalysisResult;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-6">
        <h3 className="text-xl font-semibold text-slate-300 border-b-2 border-slate-700 pb-2 mb-3">{title}</h3>
        {children}
    </div>
);

const SourceLink: React.FC<{ source: Source }> = ({ source }) => (
    <a 
        href={source.uri} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors duration-200 group"
    >
        <p className="font-semibold text-sky-400 group-hover:underline truncate">{source.title}</p>
        <p className="text-sm text-slate-500 truncate">{source.uri}</p>
    </a>
);


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const styles = VERDICT_STYLES[result.verdict];
  const Icon = styles.icon;

  return (
    <div className="mt-8 p-4 sm:p-6 bg-slate-800 border border-slate-700 rounded-xl animate-fade-in-up">
      <div className={`flex flex-col sm:flex-row items-start sm:items-center p-4 border-2 ${styles.borderColor} ${styles.bgColor} rounded-lg`}>
        <Icon className={`h-12 w-12 sm:h-16 sm:w-16 ${styles.textColor} flex-shrink-0 mr-4`} />
        <div>
          <h2 className={`text-2xl sm:text-3xl font-bold ${styles.textColor}`}>{styles.label}</h2>
          <p className="mt-1 text-slate-300">{result.summary}</p>
        </div>
      </div>

      <Section title="Detailed Reasoning">
        <div className="prose prose-invert prose-p:text-slate-300 prose-p:leading-relaxed whitespace-pre-wrap">
          {result.reasoning}
        </div>
      </Section>
      
      {result.sources.length > 0 && (
        <Section title="Evidence & Sources">
            <div className="space-y-3">
               {result.sources.map((source, index) => (
                    <SourceLink key={index} source={source} />
               ))}
            </div>
        </Section>
      )}
    </div>
  );
};

// Add keyframes for animation in a style tag, as it's not directly supported by Tailwind classes
const style = document.createElement('style');
style.innerHTML = `
@keyframes fade-in-up {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}
.animate-fade-in-up {
    animation: fade-in-up 0.5s ease-out forwards;
}
@keyframes fade-in {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}
.animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
}
`;
document.head.appendChild(style);
