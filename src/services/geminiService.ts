import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { EVALUATION_SCHEMA } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async generateChallenge(levelPrompt: string) {
    const response = await this.ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: levelPrompt,
      config: {
        systemInstruction: "你现在要发起一个怼人挑战。直接说出你的挑衅内容，不要废话。",
      },
    });
    return response.text;
  }

  async evaluateResponse(history: { role: string; text: string }[]) {
    const historyText = history.map(m => `${m.role === 'user' ? '用户' : 'AI'}: ${m.text}`).join('\n');
    const prompt = `以下是整场对线的对话记录：\n${historyText}\n\n请根据整场表现给出综合评价。`;
    
    const response = await this.ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: "你是一个怼人等级评测员。请根据整场对话中用户的回击表现（逻辑、幽默、杀伤力、情商）给出JSON格式的综合评价。",
        responseMimeType: "application/json",
        responseSchema: EVALUATION_SCHEMA,
      },
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      console.error("Failed to parse evaluation", e);
      return null;
    }
  }

  createChat(systemInstruction: string) {
    return this.ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction,
      },
    });
  }
}

export const geminiService = new GeminiService();
