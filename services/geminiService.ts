
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ChoiceHistory, Scene, AnalysisResult } from "../types";

const GEMINI_API_KEY = process.env.API_KEY || '';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Schemas
const sceneSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    narrative: {
      type: Type.STRING,
      description: "A paragraph describing the current situation in the N109 Zone with Sylus. Atmospheric, tense, mature.",
    },
    question: {
      type: Type.STRING,
      description: "The decision the user must make.",
    },
    options: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING, description: "The action the user takes." },
          traitSignal: { type: Type.STRING, description: "One word personality trait focusing on power dynamics (e.g., 'Dominance', 'Submission', 'Defiance', 'Seduction')." }
        },
        required: ["id", "text", "traitSignal"]
      }
    },
    backgroundTheme: {
      type: Type.STRING,
      enum: ["n109-zone", "combat", "mansion"],
      description: "The setting of the scene."
    }
  },
  required: ["narrative", "question", "options", "backgroundTheme"]
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    hunterTitle: { type: Type.STRING, description: "A unique title for the user based on their N109 persona." },
    evolType: { type: Type.STRING, enum: ['Energy', 'Resonance', 'Aether', 'Gravity', 'Shadow', 'Blood'] },
    description: { type: Type.STRING, description: "A deep psychological analysis of the user's relationship dynamic with Sylus." },
    notableTraits: { type: Type.ARRAY, items: { type: Type.STRING } },
    destinedCompanion: { type: Type.STRING, enum: ['Sylus'] }, 
    weapon: { type: Type.STRING, description: "A weapon fitting for the user's vibe in N109 Zone." },
    compatibilityRate: { type: Type.STRING, description: "A percentage string e.g., '99%'." }
  },
  required: ["hunterTitle", "evolType", "description", "notableTraits", "destinedCompanion", "weapon", "compatibilityRate"]
};

export const generateScene = async (turn: number, history: ChoiceHistory[]): Promise<Scene> => {
  const model = "gemini-2.5-flash";
  const totalTurns = 5;
  
  let prompt = "";
  
  if (turn === 0) {
    // Introduction
    prompt = `
      Create the OPENING SCENE (Chapter 1/${totalTurns}) of a 'Love and Deepspace' story starring SYLUS (秦徹).
      
      Setting: N109 Zone. Dark, neon, dangerous.
      
      Scenario: The user meets Sylus. It could be a negotiation, a capture, a ballroom infiltration, or a joint mission.
      The atmosphere should be charged with tension (danger or sexual tension).
      
      Options:
      Provide 3 distinct approaches to dealing with him:
      1. Aggressive/Confident (Challenging him)
      2. Cautious/Observant (Analyzing him)
      3. Manipulative/Seductive (Playing his game)
      
      Output JSON only. Use Traditional Chinese. Tone: Mature, Cinematic.
    `;
  } else if (turn < totalTurns - 1) {
    // Middle Chapters
    const historyText = history.map(h => `Chapter ${h.sceneId + 1} Choice: ${h.chosenOptionText} (${h.chosenTraitSignal})`).join("\n");
    prompt = `
      Continue the N109 Zone story with Sylus. Chapter ${turn + 1}/${totalTurns}.
      
      Previous Context:
      ${historyText}
      
      Narrative Goal:
      Deepen the interaction. Raise the stakes.
      Show Sylus's reaction to the user's previous choices.
      If they were defiant, he might be amused or annoyed.
      If they were submissive, he might be demanding or protective.
      
      Output JSON only. Use Traditional Chinese.
    `;
  } else {
    // Final Chapter
    const historyText = history.map(h => `Chapter ${h.sceneId + 1} Choice: ${h.chosenOptionText}`).join("\n");
    prompt = `
      FINAL CHAPTER (${turn + 1}/${totalTurns}). The Climax with Sylus.
      
      Previous Context:
      ${historyText}
      
      The Ultimate Choice:
      Define the final relationship dynamic with Sylus.
      
      Options should represent:
      1. PARTNERSHIP: Standing as equals, ruling the N109 Zone together.
      2. SUBMISSION: Becoming his possession/pet, finding safety in his control.
      3. DOMINANCE/RISK: holding a gun to his heart, a dangerous game of love and death.
      4. INDEPENDENCE: Using him for personal gain, leaving a mystery.
      
      Output JSON only. Use Traditional Chinese. Emotional and dramatic.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: sceneSchema,
        systemInstruction: "You are the N109 Zone Narrator. Focus exclusively on Sylus (秦徹). The tone is mature, dark romance, sci-fi action. No other male leads exist in this timeline.",
      },
    });
    
    const text = response.text;
    if (!text) throw new Error("No text returned");
    return JSON.parse(text) as Scene;
  } catch (error) {
    console.error("Gemini Scene Error:", error);
    throw error;
  }
};

export const generateAnalysis = async (history: ChoiceHistory[]): Promise<AnalysisResult> => {
  const model = "gemini-2.5-flash";
  const historyText = history.map(h => `Scene ${h.sceneId}: User chose "${h.chosenOptionText}" (${h.chosenTraitSignal})`).join("\n");

  const prompt = `
    Analyze the USER PERSONA based on their story with Sylus.
    
    Story Decisions:
    ${historyText}

    Determine:
    1. A cool Hunter Title (e.g. "The Iron Rose", "The Shadow Queen").
    2. An Evol Type that fits their personality (e.g., Blood for intense/passionate, Shadow for secretive, Energy for bold).
    3. A description of their dynamic with Sylus (Are they his equal? His weakness? His predator?).
    
    Output JSON only. Use Traditional Chinese.
    destinedCompanion is always "Sylus".
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are the Onychinus Database. Analyze the user's aptitude for surviving by Sylus's side.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No analysis returned");
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
