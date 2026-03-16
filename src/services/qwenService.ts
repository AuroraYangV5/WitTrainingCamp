import { EVALUATION_SCHEMA, GET_SYSTEM_INSTRUCTION } from "../constants";

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class QwenService {
  private apiKey: string;
  private apiBase: string;

  constructor() {
    // Use process.env as defined in vite.config.ts
    this.apiKey = process.env.VITE_QWEN_API_KEY || '';
    this.apiBase = process.env.VITE_QWEN_API_BASE || 'https://dashscope.aliyuncs.com/api/v1/apps/a4075b0461ed48c39ab1ce359639e4a6/completion';
  }

  async generateChallenge(levelPrompt: string, lang: 'zh' | 'en') {
    const systemInstruction = GET_SYSTEM_INSTRUCTION(lang);
    return this.callApi(systemInstruction, [{ role: 'user', content: levelPrompt }]);
  }

  async evaluateResponse(history: { role: string; text: string }[], lang: 'zh' | 'en') {
    const historyText = history.map(m => `${m.role === 'user' ? (lang === 'en' ? 'User' : '用户') : 'AI'}: ${m.text}`).join('\n');
    
    const schemaDescription = lang === 'en'
      ? `{
          "score": number (0-100),
          "damage": number (0-100),
          "humor": number (0-100),
          "eq": number (0-100),
          "feedback": "string (short evaluation)",
          "suggestion": "string (better comeback suggestion)"
        }`
      : `{
          "score": 数字 (0-100),
          "damage": 数字 (0-100),
          "humor": 数字 (0-100),
          "eq": 数字 (0-100),
          "feedback": "字符串 (简短评价)",
          "suggestion": "字符串 (更好的回击建议)"
        }`;

    const prompt = lang === 'en' 
      ? `Here is the conversation history:\n${historyText}\n\nPlease provide a comprehensive evaluation based on the entire performance. 
         Your response MUST be a valid JSON object matching this schema:
         ${schemaDescription}
         Do not include any conversational filler, markdown formatting, or text outside the JSON object.`
      : `以下是整场对线的对话记录：\n${historyText}\n\n请根据整场表现给出综合评价。
         你的回复必须是一个符合以下结构的 JSON 对象：
         ${schemaDescription}
         重要提示：不要包含任何开场白、解释、Markdown 标记或 JSON 以外的任何字符。`;
    
    const systemInstruction = lang === 'en' 
      ? "You are a roast level evaluator. You MUST output ONLY a valid JSON object. No markdown, no preamble, no explanation."
      : "你是一个怼人等级评测员。你必须只输出一个有效的 JSON 对象，不要包含任何 Markdown 格式、开场白、解释或额外文字。";

    const responseText = await this.callApi(systemInstruction, [{ role: 'user', content: prompt }], true);
    try {
      // Try to find JSON block, handling potential markdown code blocks and surrounding text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error("No JSON object found in response");
      }
      
      // Remove potential markdown markers if they were caught inside the match
      let jsonStr = jsonMatch[0].replace(/```json\n?|```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse Qwen evaluation. Raw response:", responseText);
      console.error("Error details:", e);
      return null;
    }
  }

  async sendMessage(chatHistory: { role: string; text: string }[], message: string, systemInstruction: string) {
    const messages: Message[] = [
      ...chatHistory.map(m => ({
        role: (m.role === 'model' || m.role === 'assistant') ? 'assistant' as const : 'user' as const,
        content: m.text
      })),
      { role: 'user' as const, content: message }
    ];
    return this.callApi(systemInstruction, messages);
  }

  private async callApi(systemInstruction: string, messages: Message[], isJson: boolean = false) {
    if (!this.apiKey) {
      throw new Error("QWEN_API_KEY is not set. Please configure it in your environment.");
    }

    const isAppApi = this.apiBase.includes('/api/v1/apps/');
    
    // If it's the Model API (OpenAI compatible), we might need to append /chat/completions
    let url = this.apiBase;
    if (!isAppApi && !url.endsWith('/chat/completions')) {
      url = url.endsWith('/') ? `${url}chat/completions` : `${url}/chat/completions`;
    }

    const body: any = isAppApi ? {
      input: {
        messages: [
          { role: 'system', content: systemInstruction },
          ...messages
        ]
      },
      parameters: {
        result_format: 'message'
      }
    } : {
      model: "qwen-plus-latest",
      messages: [
        { role: 'system', content: systemInstruction },
        ...messages
      ],
      response_format: isJson ? { type: "json_object" } : undefined
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Qwen API Error: ${error.error?.message || error.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (isAppApi) {
      // DashScope App API response structure
      return data.output?.choices?.[0]?.message?.content || data.output?.text || "";
    }
    
    // DashScope Model API (OpenAI compatible) response structure
    return data.choices[0].message.content;
  }
}

export const qwenService = new QwenService();
