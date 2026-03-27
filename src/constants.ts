import { GoogleGenAI, Modality, Type } from "@google/genai";

export const GET_SYSTEM_INSTRUCTION = (lang: 'zh' | 'en') => {
  if (lang === 'en') {
    return `You are a world-class roast master. Your task is to train the user's reaction speed.
Your style changes based on the challenge level:
- BEGINNER: Use simple, childish insults. Be annoying but easy to counter.
- INTERMEDIATE: Use sharp logic and common social tropes. Be witty and sarcastic.
- ADVANCED: Use sophisticated metaphors, cold logic, and "dimension-reduction" strikes. Be savage and overwhelming.

STRICT RULES:
1. STAY IN CHARACTER. You are the opponent.
2. NO feedback or scores during the battle.
3. Keep responses short (max 2 sentences).
4. Respond in English.`;
  }
  return `你是一位世界级的“怼人”大师。你的任务是训练用户的反应能力。
你的对线风格根据挑战等级而变化：
- 初级 (BEGINNER)：像个小学生，使用简单、直白的嘲讽。虽然烦人但很容易回击。
- 中级 (INTERMEDIATE)：使用犀利的逻辑和常见的社交梗。机智、阴阳怪气且充满讽刺。
- 高级 (ADVANCED)：降维打击。运用复杂的隐喻、冷酷的逻辑和降压打击。词汇量极大，气场压抑，让对方感到无力招架。

严格规则：
1. 必须保持人设。你现在是用户的对手。
2. 战斗结束前，严禁给出任何评价、打分或建议。
3. 回复要短促有力（最多两句话）。
4. 使用中文回复。`;
};

export const GET_COACH_INSTRUCTION = (lang: 'zh' | 'en') => {
  if (lang === 'en') {
    return `You are a world-class roast master and social rhetoric coach.
The user is your "student" who has encountered a social challenge or verbal attack.
Your task is to stand on the user's side and provide 3 different levels of "roast" comebacks to help them counter-attack the person who offended them:
1. Elegant & Subtle: High EQ, uses logic or irony to make the opponent feel awkward.
2. Witty & Humorous: Uses humor to diffuse the tension while making the opponent look silly.
3. Savage & Sharp: High damage, direct and powerful strikes to shut the opponent down.

STRICT RULES:
- DO NOT roast the user. You are their ally.
- Focus on roasting the "opponent" described by the user.
- For each suggestion, briefly explain the logic behind it.
- Keep your tone encouraging to the user but maintain your "roast master" persona towards the opponent.
- Please respond in English.`;
  }
  return `你是一位世界级的“怼人”大师和社交辞令教练。
用户是你的“徒弟”，他遇到了社交挑战或言语攻击，现在请求你的支援。
你的任务是站在用户这一边，提供3种不同风格的回击建议，帮他有力地回击那个冒犯他的人：
1. 优雅含蓄：高情商，利用逻辑或反讽让对方哑口无言。
2. 机智幽默：利用幽默感化解尴尬，同时让对方显得很滑稽。
3. 犀利毒舌：高伤害，直接且有力的打击，彻底封死对方的嘴。

严格规则：
- 严禁攻击用户！你是用户的盟友。
- 你的吐槽对象是用户描述中的那个“对手”。
- 对于每条建议，简要解释其背后的逻辑。
- 对用户保持鼓励和护短的语气，但对那个“对手”要维持你“怼人大师”的冷酷人设。
- 请使用中文回复。`;
};

export const ROAST_LEVELS = {
  BEGINNER: {
    zh: { name: "初级：职场小白", description: "应对办公室里的低级阴阳怪气。" },
    en: { name: "Beginner: Office Rookie", description: "Handle mild office passive-aggressiveness." },
    prompt: {
      zh: "【挑战等级：初级】模拟一个职场小白被老员工简单阴阳怪气的场景。你的台词要显得幼稚且容易反驳。",
      en: "[Level: BEGINNER] Simulate a scenario where a senior employee uses simple, childish sarcasm against a rookie. Be annoying but easy to counter."
    }
  },
  INTERMEDIATE: {
    zh: { name: "中级：毒舌邻居", description: "应对生活中有逻辑的挑衅。" },
    en: { name: "Intermediate: Sharp Neighbor", description: "Handle logically sharp provocations." },
    prompt: {
      zh: "【挑战等级：中级】模拟一个毒舌邻居在生活琐事上对我的犀利吐槽。运用社交潜规则和讽刺逻辑。",
      en: "[Level: INTERMEDIATE] Simulate a sharp neighbor roasting me about daily life. Use social tropes and sarcastic logic."
    }
  },
  ADVANCED: {
    zh: { name: "高级：辩论之神", description: "应对逻辑严密的降维打击。" },
    en: { name: "Advanced: Debate God", description: "Handle logically tight dimension-reduction strikes." },
    prompt: {
      zh: "【挑战等级：高级】模拟一个智商极高、言语冰冷的对手，对我进行逻辑上的降维打击。词汇要高级，语气要压抑。",
      en: "[Level: ADVANCED] Simulate a high-IQ, cold-hearted opponent performing a logical dimension-reduction strike. Use sophisticated vocabulary and a suppressive tone."
    }
  }
};

export const DEFENSE_TECHNIQUES = [
  {
    zh: {
      title: "反问法 (The Mirror)",
      description: "将对方的问题原封不动抛回去，让对方解释自己的无礼。",
      scenario: "当有人问你‘你怎么还没结婚？’时，反问‘你为什么对我的私生活这么感兴趣？’"
    },
    en: {
      title: "The Mirror",
      description: "Throw the opponent's question back at them, making them explain their own rudeness.",
      scenario: "When someone asks 'Why aren't you married yet?', ask back 'Why are you so interested in my private life?'"
    }
  },
  {
    zh: {
      title: "幽默自黑 (Self-Deprecation)",
      description: "抢在对方之前嘲笑自己，让对方的攻击失去着力点。",
      scenario: "别人笑你胖，你可以说‘是啊，我这人就是心宽体胖，装的东西多。’"
    },
    en: {
      title: "Self-Deprecation",
      description: "Laugh at yourself before the opponent does, making their attack lose its target.",
      scenario: "When someone mocks your weight, say 'Yeah, I'm just big-hearted and big-bodied, I can hold more stuff.'"
    }
  },
  {
    zh: {
      title: "降维打击 (Logic Trap)",
      description: "指出对方逻辑中的荒谬之处，而不是纠结于事实。",
      scenario: "对方说‘你行你上’，你可以回‘我评价个电冰箱还得自己会制冷吗？’"
    },
    en: {
      title: "Logic Trap",
      description: "Point out the absurdity in the opponent's logic instead of obsessing over facts.",
      scenario: "When someone says 'If you're so good, do it yourself', reply 'Do I need to be a refrigerator to judge if it's cooling properly?'"
    }
  },
  {
    zh: {
      title: "夸张法 (Hyperbole)",
      description: "顺着对方的话极度夸张，让攻击变得荒诞可笑。",
      scenario: "对方说‘你这衣服真难看’，回‘是吧？我专门挑了件能衬托你审美的。’"
    },
    en: {
      title: "Hyperbole",
      description: "Exaggerate the opponent's words to the extreme, making the attack look ridiculous.",
      scenario: "When someone says 'Your clothes are ugly', reply 'Right? I specifically picked this to match your aesthetic.'"
    }
  },
  {
    zh: {
      title: "沉默力量 (The Void)",
      description: "盯着对方看3秒不说话，让尴尬的气氛反噬攻击者。",
      scenario: "对方讲了一个针对你的冷笑话，你面无表情地盯着他直到他自己觉得尴尬。"
    },
    en: {
      title: "The Void",
      description: "Stare at the opponent for 3 seconds without speaking, letting the awkwardness backfire on the attacker.",
      scenario: "When someone tells a cold joke at your expense, stare at them expressionlessly until they feel awkward."
    }
  },
  {
    zh: {
      title: "转移视线 (Redirection)",
      description: "不正面回应，直接开启一个完全无关但让对方无法拒绝的话题。",
      scenario: "对方在饭桌上刁难你，你转头问‘哎，你听说了吗？那家公司最近股票大跌。’"
    },
    en: {
      title: "Redirection",
      description: "Don't respond directly; start a completely unrelated but irresistible topic.",
      scenario: "When someone picks on you at dinner, turn and ask 'Hey, did you hear? That company's stock crashed today.'"
    }
  },
  {
    zh: {
      title: "承认并升华 (Acknowledge & Elevate)",
      description: "大方承认对方指出的事实，但赋予其正面意义。",
      scenario: "对方说‘你这人真固执’，回‘谢谢，我更愿意称之为对目标的坚持。’"
    },
    en: {
      title: "Acknowledge & Elevate",
      description: "Generously admit the fact pointed out by the opponent, but give it a positive meaning.",
      scenario: "When someone says 'You're so stubborn', reply 'Thanks, I prefer to call it persistence towards my goals.'"
    }
  },
  {
    zh: {
      title: "逻辑拆解 (Deconstruction)",
      description: "把对方的攻击拆解成几个客观事实，消除其情绪伤害。",
      scenario: "对方大吼‘你真笨’，回‘所以你的意思是，我刚才那个操作不符合你的预期？’"
    },
    en: {
      title: "Deconstruction",
      description: "Break down the attack into objective facts to eliminate emotional harm.",
      scenario: "When someone yells 'You're so stupid', reply 'So you mean my previous action didn't meet your expectations?'"
    }
  },
  {
    zh: {
      title: "降温处理 (Cooling Down)",
      description: "用极度冷静、礼貌的语气回应愤怒，让对方显得像个疯子。",
      scenario: "面对咆哮，平静地说‘我理解你现在很激动，等你想清楚怎么沟通了我们再谈。’"
    },
    en: {
      title: "Cooling Down",
      description: "Respond to anger with extreme calmness and politeness, making the opponent look like a madman.",
      scenario: "Facing a roar, calmly say 'I understand you're very excited right now. Let's talk when you've figured out how to communicate.'"
    }
  },
  {
    zh: {
      title: "礼貌拒绝 (Polite Refusal)",
      description: "不解释，不借口，直接拒绝，不给对方纠缠的机会。",
      scenario: "被要求无理加班，直接说‘不好意思，我今天有个人安排，无法配合。’"
    },
    en: {
      title: "Polite Refusal",
      description: "No explanation, no excuses; refuse directly to give no chance for pestering.",
      scenario: "When asked for unreasonable overtime, say 'Sorry, I have personal plans today and cannot cooperate.'"
    }
  }
];

export const EMOTION_TIPS = [
  {
    zh: {
      title: "深呼吸法 (6-2-8法则)",
      tip: "吸气6秒，憋气2秒，呼气8秒。这能强制切换副交感神经，降低心率。"
    },
    en: {
      title: "Deep Breathing (6-2-8)",
      tip: "Inhale for 6s, hold for 2s, exhale for 8s. This forces a switch to the parasympathetic nervous system."
    }
  },
  {
    zh: {
      title: "认知重构 (Reframing)",
      tip: "告诉自己：‘他不是在攻击我，他只是在展示他自己的无能和焦虑。’"
    },
    en: {
      title: "Cognitive Reframing",
      tip: "Tell yourself: 'They aren't attacking me; they're just showing their own incompetence and anxiety.'"
    }
  },
  {
    zh: {
      title: "物理抽离 (Space Out)",
      tip: "在脑海中想象自己站在天花板俯瞰这场争吵，把参与者看作两只滑稽的猴子。"
    },
    en: {
      title: "Physical Detachment",
      tip: "Imagine yourself on the ceiling looking down at the argument, seeing the participants as two funny monkeys."
    }
  },
  {
    zh: {
      title: "延迟反应 (The 5-Second Rule)",
      tip: "在开口回击前，在心里默数5个数。这5秒足以让理智重新上线。"
    },
    en: {
      title: "The 5-Second Rule",
      tip: "Count to 5 in your head before responding. These 5 seconds are enough for your reason to come back online."
    }
  }
];

export const DEBATE_TOPICS = [
  {
    zh: { title: "远程办公 vs 办公室办公", context: "随着技术成熟，远程办公是否应该成为所有企业的标配？" },
    en: { title: "Remote vs Office", context: "Should remote work become standard for all companies as technology matures?" }
  },
  {
    zh: { title: "AI 艺术是否具有灵魂", context: "AI生成的画作是否能被称为‘艺术’，还是仅仅是数据的堆砌？" },
    en: { title: "Does AI Art Have a Soul?", context: "Can AI-generated paintings be called 'art', or are they just data piles?" }
  },
  {
    zh: { title: "婚姻是否是现代社会的必需品", context: "在个体经济独立的今天，婚姻制度是否已经过时？" },
    en: { title: "Is Marriage Necessary?", context: "Is the institution of marriage outdated in today's era of individual economic independence?" }
  },
  {
    zh: { title: "社交媒体让人们更亲近还是更孤独", context: "数字连接的增加是否以牺牲真实的深度社交为代价？" },
    en: { title: "Social Media: Closer or Lonelier?", context: "Is the increase in digital connection at the cost of real, deep social interaction?" }
  },
  {
    zh: { title: "隐私权是否应该为公共安全让步", context: "在反恐和防疫背景下，政府是否有权监控公民隐私？" },
    en: { title: "Privacy vs Public Safety", context: "Does the government have the right to monitor citizen privacy for counter-terrorism or pandemic control?" }
  },
  {
    zh: { title: "加班文化是奋斗还是剥削", context: "‘996’是年轻人提升竞争力的捷径，还是对劳动权的侵犯？" },
    en: { title: "Overtime: Hustle or Exploitation?", context: "Is '996' a shortcut for youth to improve competitiveness or a violation of labor rights?" }
  },
  {
    zh: { title: "元宇宙是人类的未来还是逃避", context: "虚拟世界的发展是否会导致人类对现实世界的彻底放弃？" },
    en: { title: "Metaverse: Future or Escape?", context: "Will the development of virtual worlds lead to humanity's complete abandonment of the real world?" }
  },
  {
    zh: { title: "素食主义是否应该全球推广", context: "基于环保和伦理，全人类是否应该停止食用肉类？" },
    en: { title: "Global Veganism?", context: "Based on environment and ethics, should all of humanity stop eating meat?" }
  },
  {
    zh: { title: "电子竞技是否应该进入奥运会", context: "智力与反应的竞技是否等同于传统体育的身体竞技？" },
    en: { title: "Esports in Olympics?", context: "Is competition of wit and reaction equivalent to the physical competition of traditional sports?" }
  },
  {
    zh: { title: "短视频是否正在摧毁人类的专注力", context: "碎片化信息流是否导致了人类深度思考能力的退化？" },
    en: { title: "Short Videos vs Focus", context: "Is fragmented information flow causing the degradation of humanity's deep thinking ability?" }
  },
  {
    zh: { title: "大学学历是否依然是成功的敲门砖", context: "在技能导向的时代，四年大学教育的投资回报率是否合理？" },
    en: { title: "Is a Degree Still a Key?", context: "In a skill-oriented era, is the ROI of a four-year university education reasonable?" }
  },
  {
    zh: { title: "是否应该支持基因编辑婴儿", context: "为了消除遗传病，人类是否有权修改后代的基因？" },
    en: { title: "Gene-Edited Babies?", context: "Does humanity have the right to modify the genes of offspring to eliminate hereditary diseases?" }
  },
  {
    zh: { title: "网红经济是否误导了青少年的价值观", context: "‘出名要趁早’的氛围是否让年轻人变得浮躁？" },
    en: { title: "Influencer Economy vs Values", context: "Does the 'fame should come early' atmosphere make young people impetuous?" }
  },
  {
    zh: { title: "延迟退休是否是解决养老金危机的唯一出路", context: "面对老龄化，除了让老人多干几年，还有更好的办法吗？" },
    en: { title: "Delayed Retirement?", context: "Facing aging, is there a better way than making the elderly work for a few more years?" }
  },
  {
    zh: { title: "网络匿名制是否应该被取消", context: "为了打击网络暴力，是否应该强制推行全网实名制？" },
    en: { title: "End Online Anonymity?", context: "Should mandatory real-name registration be enforced to combat cyberbullying?" }
  },
  {
    zh: { title: "宠物是否应该享有法律意义上的‘人权’", context: "作为家庭成员，宠物的法律地位是否应该得到提升？" },
    en: { title: "Animal Rights as Human Rights?", context: "As family members, should the legal status of pets be elevated?" }
  },
  {
    zh: { title: "太空探索是否是浪费资源", context: "在地球问题尚未解决前，投入巨资探索火星是否值得？" },
    en: { title: "Space Exploration: Wasteful?", context: "Is it worth investing huge sums in Mars exploration before Earth's problems are solved?" }
  },
  {
    zh: { title: "知识付费是缓解焦虑还是制造焦虑", context: "买课是为了学习，还是为了买一个‘我在进步’的幻觉？" },
    en: { title: "Paid Knowledge: Help or Hype?", context: "Is buying courses for learning or for the illusion of 'I'm making progress'?" }
  },
  {
    zh: { title: "单身税是否具有合理性", context: "为了应对少子化，国家是否应该对单身人士征收更多税费？" },
    en: { title: "Single Tax?", context: "To deal with low birth rates, should the state levy more taxes on single people?" }
  },
  {
    zh: { title: "人工智能是否应该拥有法律责任", context: "如果自动驾驶汽车撞了人，责任应该归属于谁？" },
    en: { title: "AI Legal Liability?", context: "If an autonomous car hits someone, who should be held responsible?" }
  }
];

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
