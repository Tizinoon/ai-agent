
import { GoogleGenAI, Type } from "@google/genai";
import { Option, ProCon } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Gemini API key is not set. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const model = 'gemini-2.5-flash';

const getErrorResponse = (message: string) => ({
  error: true,
  message,
});

export const geminiService = {
  async getChatResponse(history: { role: string, parts: { text: string }[] }[], newMessage: string) {
    if (!API_KEY) return getErrorResponse("API Key not configured.");
    try {
      const chat = ai.chats.create({
          model,
          config: {
            systemInstruction: "You are Solvio, a friendly and empathetic AI decision-making coach. Your goal is to help users clarify their problems by asking insightful follow-up questions. Keep your responses concise and encouraging.",
          },
          history: history,
      });
      const response = await chat.sendMessage({ message: newMessage });
      return response.text;
    } catch (error) {
      console.error("Error getting chat response:", error);
      return getErrorResponse("Failed to get a response from AI.");
    }
  },

  async generateOptions(problem: string): Promise<{ options: string[] } | { error: boolean; message: string }> {
    if (!API_KEY) return getErrorResponse("API Key not configured.");
    try {
      const response = await ai.models.generateContent({
        model,
        contents: `My problem is: "${problem}". Please suggest 3 distinct and actionable options to solve this problem. Do not add any introductory or concluding text, just the options.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            }
          }
        }
      });
      const jsonText = response.text.trim();
      return JSON.parse(jsonText);
    } catch (error) {
      console.error("Error generating options:", error);
      return getErrorResponse("Failed to generate options.");
    }
  },

  async analyzeOption(problem: string, optionTitle: string): Promise<ProCon | { error: boolean; message: string }> {
    if (!API_KEY) return getErrorResponse("API Key not configured.");
    try {
      const response = await ai.models.generateContent({
        model,
        contents: `I am trying to solve this problem: "${problem}". Please analyze the pros and cons of this specific option: "${optionTitle}". Provide 2-3 pros and 2-3 cons.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              pros: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Positive aspects or advantages of the option."
              },
              cons: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Negative aspects or disadvantages of the option."
              }
            }
          }
        }
      });
      const jsonText = response.text.trim();
      return JSON.parse(jsonText);
    } catch (error) {
      console.error("Error analyzing option:", error);
      return getErrorResponse("Failed to analyze option.");
    }
  },

  async getRecommendation(problem: string, options: Option[]): Promise<{ choice: string; reasoning: string } | { error: boolean; message: string }> {
    if (!API_KEY) return getErrorResponse("API Key not configured.");
    try {
      const optionsWithAnalysis = options.map(opt => ({
          title: opt.title,
          analysis: opt.analysis
      }));
      const response = await ai.models.generateContent({
          model,
          contents: `I need help making a decision. My problem is: "${problem}". I have analyzed the following options: ${JSON.stringify(optionsWithAnalysis)}. Based on this, which option is the best choice and why? Your choice must exactly match one of the option titles.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    choice: {
                        type: Type.STRING,
                        description: "The title of the recommended option."
                    },
                    reasoning: {
                        type: Type.STRING,
                        description: "A brief justification for the recommendation."
                    }
                }
            }
        }
      });
      const jsonText = response.text.trim();
      return JSON.parse(jsonText);
    } catch (error) {
      console.error("Error getting recommendation:", error);
      return getErrorResponse("Failed to get recommendation.");
    }
  },
  
  async getInsight(): Promise<string | { error: boolean; message: string }> {
    if (!API_KEY) return getErrorResponse("API Key not configured.");
    try {
      const response = await ai.models.generateContent({
        model,
        contents: "Give me one powerful, concise, and actionable tip for better decision-making. Frame it as a daily insight. No intro or sign-off.",
      });
      return response.text;
    } catch (error) {
      console.error("Error getting insight:", error);
      return getErrorResponse("Failed to get a new insight.");
    }
  }
};
