import { GoogleGenAI } from "@google/genai";
import { EVALUATION_SCHEMA, GET_SYSTEM_INSTRUCTION } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  }

  public setApiKey(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY || '' });
  }

  async generateContent(prompt: string, systemInstruction?: string) {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { systemInstruction }
    });
    return response.text || "";
  }

  async generateChallenge(levelPrompt: string, lang: 'zh' | 'en') {
    const response = await this.ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: levelPrompt,
      config: {
        systemInstruction: GET_SYSTEM_INSTRUCTION(lang),
      },
    });
    return response.text;
  }

  async evaluateResponse(history: { role: string; text: string }[], lang: 'zh' | 'en') {
    const historyText = history.map(m => `${m.role === 'user' ? (lang === 'en' ? 'User' : '用户') : 'AI'}: ${m.text}`).join('\n');
    const prompt = lang === 'en' 
      ? `Here is the conversation history:\n${historyText}\n\nPlease provide a comprehensive evaluation based on the entire performance.`
      : `以下是整场对线的对话记录：\n${historyText}\n\n请根据整场表现给出综合评价。`;
    
    const response = await this.ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: lang === 'en' 
          ? "You are a roast level evaluator. Please provide a JSON evaluation of the user's comebacks (logic, humor, damage, EQ) throughout the conversation."
          : "你是一个怼人等级评测员。请根据整场对话中用户的回击表现（逻辑、幽默、杀伤力、情商）给出JSON格式的综合评价。",
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

  createChat(systemInstruction: string, history: { role: 'user' | 'model'; text: string }[] = []) {
    return this.ai.chats.create({
      model: "gemini-3-flash-preview",
      history: history.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      })),
      config: {
        systemInstruction,
      },
    });
  }
}

export const geminiService = new GeminiService();
