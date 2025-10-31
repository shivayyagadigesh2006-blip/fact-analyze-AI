
export enum Verdict {
  TRUE = 'TRUE',
  LIKELY_TRUE = 'LIKELY TRUE',
  MISLEADING = 'MISLEADING',
  LIKELY_FALSE = 'LIKELY FALSE',
  FALSE = 'FALSE',
  UNVERIFIABLE = 'UNVERIFIABLE',
}

export interface Source {
  uri: string;
  title: string;
}

export interface AnalysisResult {
  verdict: Verdict;
  summary: string;
  reasoning: string;
  sources: Source[];
}
