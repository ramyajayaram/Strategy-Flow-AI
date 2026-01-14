
export interface SwotData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface RoadmapInitiative {
  title: string;
  description: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  priority: 'High' | 'Medium' | 'Low';
  category: string;
}

export interface AnalysisState {
  companyName: string;
  researchData: string;
  swot: SwotData | null;
  roadmap: RoadmapInitiative[] | null;
  isSearching: boolean;
  isAnalyzing: boolean;
  isGeneratingRoadmap: boolean;
  sources: { title: string; uri: string }[];
}

export enum Step {
  INPUT,
  RESEARCH,
  SWOT,
  ROADMAP
}
