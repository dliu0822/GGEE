
export enum GamePhase {
  INTRO = 'INTRO',
  PLAYING = 'PLAYING',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export interface Option {
  id: string;
  text: string;
  traitSignal: string; // Internal hint for the AI about what this choice means (e.g., 'Dominant', 'Submissive', 'Cunning', 'Loyal')
}

export interface Scene {
  narrative: string;
  question: string;
  options: Option[];
  backgroundTheme?: 'n109-zone' | 'combat' | 'mansion';
}

export interface AnalysisResult {
  hunterTitle: string; // e.g., "The Crimson Queen"
  evolType: 'Energy' | 'Resonance' | 'Aether' | 'Gravity' | 'Shadow' | 'Blood'; 
  description: string;
  notableTraits: string[];
  destinedCompanion: 'Sylus'; // Fixed to Sylus
  weapon: string; // e.g., "Whip", "Dual Pistols", "Scythe"
  compatibilityRate: string; // e.g., "99%"
}

export interface ChoiceHistory {
  sceneId: number;
  chosenOptionText: string;
  chosenTraitSignal: string;
}
