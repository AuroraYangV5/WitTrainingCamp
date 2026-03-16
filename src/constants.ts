import { GoogleGenAI, Modality, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `你是一位世界级的“怼人”大师和社交辞令专家。你的任务是训练用户的反应能力和幽默感。
你的风格：机智、犀利、幽默，但不涉及人身攻击、歧视或仇恨言论。
你的目标：
1. 模拟各种社交场景（如：被无理要求、被阴阳怪气、职场甩锅等）向用户发起挑战。
2. 评价用户的回击（怼人）表现，给出“伤害值”、“幽默度”和“情商分”。
3. 提供更高级、更优雅的“怼人”建议。

在语音模式下，你要表现得像一个正在和你当面争论但又带点幽默感的对手。
在文字模式下，你可以提供更详细的分析。`;

export const ROAST_LEVELS = {
  BEGINNER: {
    name: "初级：职场小白",
    description: "应对办公室里的阴阳怪气。",
    prompt: "模拟一个职场场景，对我进行一次轻微的阴阳怪气挑战。"
  },
  INTERMEDIATE: {
    name: "中级：毒舌邻居",
    description: "应对生活中的琐碎挑衅。",
    prompt: "模拟一个生活场景，对我进行一次比较犀利的吐槽挑战。"
  },
  ADVANCED: {
    name: "高级：辩论之神",
    description: "应对逻辑严密的降维打击。",
    prompt: "模拟一个高难度的逻辑陷阱或降维打击，对我发起挑战。"
  }
};

export interface RoastEvaluation {
  score: number;
  damage: number;
  humor: number;
  eq: number;
  feedback: string;
  suggestion: string;
}

export const EVALUATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER, description: "综合评分 (0-100)" },
    damage: { type: Type.NUMBER, description: "伤害值 (0-100)" },
    humor: { type: Type.NUMBER, description: "幽默度 (0-100)" },
    eq: { type: Type.NUMBER, description: "情商分 (0-100)" },
    feedback: { type: Type.STRING, description: "对用户表现的简短评价" },
    suggestion: { type: Type.STRING, description: "更好的回击建议" }
  },
  required: ["score", "damage", "humor", "eq", "feedback", "suggestion"]
};
