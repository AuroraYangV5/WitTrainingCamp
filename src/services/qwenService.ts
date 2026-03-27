import { EVALUATION_SCHEMA, GET_SYSTEM_INSTRUCTION } from "../constants";

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class QwenService {
  private apiKey: string;
  private apiBase: string;
  private coachApiKey: string;
  private coachApiBase: string;

  constructor() {
    // Use process.env as defined in vite.config.ts
    this.apiKey = process.env.VITE_QWEN_API_KEY || '';
    this.apiBase = process.env.VITE_QWEN_API_BASE || '';
    this.coachApiKey = process.env.VITE_QWEN_COACH_API_KEY || this.apiKey;
    this.coachApiBase = process.env.VITE_QWEN_COACH_API_BASE || this.apiBase;
  }

  public setApiKey(apiKey: string) {
    this.apiKey = apiKey || process.env.VITE_QWEN_API_KEY || '';
    this.coachApiKey = apiKey || process.env.VITE_QWEN_COACH_API_KEY || this.apiKey;
  }

  async generateChallenge(levelPrompt: string, lang: 'zh' | 'en') {
    // If it's Qwen and instructions are in backend, we should pass empty string.
    // However, generateChallenge is a specific task. 
    // But per user request, we skip passing the global instructions.
    return this.callApi("", [{ role: 'user', content: levelPrompt }]);
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

  async sendMessage(chatHistory: { role: string; text: string }[], message: string, systemInstruction: string, isCoach: boolean = false) {
    const messages: Message[] = [
      ...chatHistory.map(m => ({
        role: (m.role === 'model' || m.role === 'assistant') ? 'assistant' as const : 'user' as const,
        content: m.text
      })),
      { role: 'user' as const, content: message }
    ];
    return this.callApi(systemInstruction, messages, false, isCoach);
  }

  private async callApi(systemInstruction: string, messages: Message[], isJson: boolean = false, isCoach: boolean = false) {
    const currentApiKey = isCoach ? this.coachApiKey : this.apiKey;
    const currentApiBase = isCoach ? this.coachApiBase : this.apiBase;

    if (!currentApiKey) {
      throw new Error(`${isCoach ? 'QWEN_COACH_API_KEY' : 'QWEN_API_KEY'} is not set. Please configure it in your environment.`);
    }

    const isAppApi = currentApiBase.includes('/api/v1/apps/');
    
    // If it's the Model API (OpenAI compatible), we might need to append /chat/completions
    let url = currentApiBase;
    if (!isAppApi && !url.endsWith('/chat/completions')) {
      url = url.endsWith('/') ? `${url}chat/completions` : `${url}/chat/completions`;
    }

    const body: any = isAppApi ? {
      input: {
        messages: systemInstruction ? [
          { role: 'system', content: systemInstruction },
          ...messages
        ] : messages
      },
      parameters: {
        result_format: 'message'
      }
    } : {
      model: "qwen-plus-latest",
      messages: systemInstruction ? [
        { role: 'system', content: systemInstruction },
        ...messages
      ] : messages,
      response_format: isJson ? { type: "json_object" } : undefined
    };

    console.log(`Calling Qwen API: ${url}`, { isAppApi, body });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 30 second timeout

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentApiKey}`
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        console.error("Qwen API Error Response:", errorData);
        throw new Error(`Qwen API Error (${response.status}): ${errorData.error?.message || errorData.message || response.statusText}`);
      }

      const data = await response.json();
      console.log("Qwen API Success Response:", data);
      
      if (isAppApi) {
        // DashScope App API response structure
        const content = data.output?.choices?.[0]?.message?.content || data.output?.text || "";
        if (!content && data.output?.text === undefined) {
          console.warn("Qwen App API returned empty content. Full data:", data);
        }
        return content;
      }
      
      // DashScope Model API (OpenAI compatible) response structure
      return data.choices?.[0]?.message?.content || "";
    } catch (e: any) {
      clearTimeout(timeoutId);
      if (e.name === 'AbortError') {
        throw new Error("Qwen API request timed out after 30 seconds.");
      }
      console.error("Qwen API Fetch Exception:", e);
      throw e;
    }
  }
}

export const qwenService = new QwenService();
