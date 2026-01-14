
import { GoogleGenAI, Type } from "@google/genai";
import { SwotData, RoadmapInitiative } from "../types";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const THINKING_CONFIG = {
  thinkingConfig: { thinkingBudget: 32768 }
};

export const conductResearch = async (companyName: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Conduct detailed research on the company "${companyName}". Focus on their current market position, recent product launches, financial health, and customer sentiment. Provide a comprehensive summary.`,
    config: {
      tools: [{ googleSearch: {} }],
      ...THINKING_CONFIG
    },
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || 'Source',
    uri: chunk.web?.uri || '',
  })).filter((s: any) => s.uri) || [];

  return {
    text: response.text || '',
    sources: sources,
  };
};

export const generateSWOT = async (researchText: string): Promise<SwotData> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Based on the following research, generate a structured SWOT analysis:\n\n${researchText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
          threats: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["strengths", "weaknesses", "opportunities", "threats"],
      },
      ...THINKING_CONFIG
    },
  });

  return JSON.parse(response.text || '{}');
};

export const generateRoadmap = async (swot: SwotData, companyName: string): Promise<RoadmapInitiative[]> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Based on the SWOT analysis for ${companyName}, propose a 4-quarter product roadmap that leverages strengths/opportunities and mitigates weaknesses/threats.\n\nSWOT: ${JSON.stringify(swot)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            quarter: { type: Type.STRING, enum: ["Q1", "Q2", "Q3", "Q4"] },
            priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            category: { type: Type.STRING },
          },
          required: ["title", "description", "quarter", "priority", "category"],
        },
      },
      ...THINKING_CONFIG
    },
  });

  return JSON.parse(response.text || '[]');
};
