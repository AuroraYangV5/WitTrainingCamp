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

export const DEFENSE_TECHNIQUES = [
  {
    title: "反问法 (The Mirror)",
    description: "将对方的问题原封不动抛回去，让对方解释自己的无礼。",
    scenario: "当有人问你‘你怎么还没结婚？’时，反问‘你为什么对我的私生活这么感兴趣？’"
  },
  {
    title: "幽默自黑 (Self-Deprecation)",
    description: "抢在对方之前嘲笑自己，让对方的攻击失去着力点。",
    scenario: "别人笑你胖，你可以说‘是啊，我这人就是心宽体胖，装的东西多。’"
  },
  {
    title: "降维打击 (Logic Trap)",
    description: "指出对方逻辑中的荒谬之处，而不是纠结于事实。",
    scenario: "对方说‘你行你上’，你可以回‘我评价个电冰箱还得自己会制冷吗？’"
  },
  {
    title: "夸张法 (Hyperbole)",
    description: "顺着对方的话极度夸张，让攻击变得荒诞可笑。",
    scenario: "对方说‘你这衣服真难看’，回‘是吧？我专门挑了件能衬托你审美的。’"
  },
  {
    title: "沉默力量 (The Void)",
    description: "盯着对方看3秒不说话，让尴尬的气氛反噬攻击者。",
    scenario: "对方讲了一个针对你的冷笑话，你面无表情地盯着他直到他自己觉得尴尬。"
  },
  {
    title: "转移视线 (Redirection)",
    description: "不正面回应，直接开启一个完全无关但让对方无法拒绝的话题。",
    scenario: "对方在饭桌上刁难你，你转头问‘哎，你听说了吗？那家公司最近股票大跌。’"
  },
  {
    title: "承认并升华 (Acknowledge & Elevate)",
    description: "大方承认对方指出的事实，但赋予其正面意义。",
    scenario: "对方说‘你这人真固执’，回‘谢谢，我更愿意称之为对目标的坚持。’"
  },
  {
    title: "逻辑拆解 (Deconstruction)",
    description: "把对方的攻击拆解成几个客观事实，消除其情绪伤害。",
    scenario: "对方大吼‘你真笨’，回‘所以你的意思是，我刚才那个操作不符合你的预期？’"
  },
  {
    title: "降温处理 (Cooling Down)",
    description: "用极度冷静、礼貌的语气回应愤怒，让对方显得像个疯子。",
    scenario: "面对咆哮，平静地说‘我理解你现在很激动，等你想清楚怎么沟通了我们再谈。’"
  },
  {
    title: "礼貌拒绝 (Polite Refusal)",
    description: "不解释，不借口，直接拒绝，不给对方纠缠的机会。",
    scenario: "被要求无理加班，直接说‘不好意思，我今天有个人安排，无法配合。’"
  }
];

export const EMOTION_TIPS = [
  {
    title: "深呼吸法 (6-2-8法则)",
    tip: "吸气6秒，憋气2秒，呼气8秒。这能强制切换副交感神经，降低心率。"
  },
  {
    title: "认知重构 (Reframing)",
    tip: "告诉自己：‘他不是在攻击我，他只是在展示他自己的无能和焦虑。’"
  },
  {
    title: "物理抽离 (Space Out)",
    tip: "在脑海中想象自己站在天花板俯瞰这场争吵，把参与者看作两只滑稽的猴子。"
  },
  {
    title: "延迟反应 (The 5-Second Rule)",
    tip: "在开口回击前，在心里默数5个数。这5秒足以让理智重新上线。"
  }
];

export const DEBATE_TOPICS = [
  {
    title: "远程办公 vs 办公室办公",
    context: "随着技术成熟，远程办公是否应该成为所有企业的标配？"
  },
  {
    title: "AI 艺术是否具有灵魂",
    context: "AI生成的画作是否能被称为‘艺术’，还是仅仅是数据的堆砌？"
  },
  {
    title: "婚姻是否是现代社会的必需品",
    context: "在个体经济独立的今天，婚姻制度是否已经过时？"
  },
  {
    title: "社交媒体让人们更亲近还是更孤独",
    context: "数字连接的增加是否以牺牲真实的深度社交为代价？"
  },
  {
    title: "隐私权是否应该为公共安全让步",
    context: "在反恐和防疫背景下，政府是否有权监控公民隐私？"
  },
  {
    title: "加班文化是奋斗还是剥削",
    context: "‘996’是年轻人提升竞争力的捷径，还是对劳动权的侵犯？"
  },
  {
    title: "元宇宙是人类的未来还是逃避",
    context: "虚拟世界的发展是否会导致人类对现实世界的彻底放弃？"
  },
  {
    title: "素食主义是否应该全球推广",
    context: "基于环保和伦理，全人类是否应该停止食用肉类？"
  },
  {
    title: "电子竞技是否应该进入奥运会",
    context: "智力与反应的竞技是否等同于传统体育的身体竞技？"
  },
  {
    title: "短视频是否正在摧毁人类的专注力",
    context: "碎片化信息流是否导致了人类深度思考能力的退化？"
  },
  {
    title: "大学学历是否依然是成功的敲门砖",
    context: "在技能导向的时代，四年大学教育的投资回报率是否合理？"
  },
  {
    title: "是否应该支持基因编辑婴儿",
    context: "为了消除遗传病，人类是否有权修改后代的基因？"
  },
  {
    title: "网红经济是否误导了青少年的价值观",
    context: "‘出名要趁早’的氛围是否让年轻人变得浮躁？"
  },
  {
    title: "延迟退休是否是解决养老金危机的唯一出路",
    context: "面对老龄化，除了让老人多干几年，还有更好的办法吗？"
  },
  {
    title: "网络匿名制是否应该被取消",
    context: "为了打击网络暴力，是否应该强制推行全网实名制？"
  },
  {
    title: "宠物是否应该享有法律意义上的‘人权’",
    context: "作为家庭成员，宠物的法律地位是否应该得到提升？"
  },
  {
    title: "太空探索是否是浪费资源",
    context: "在地球问题尚未解决前，投入巨资探索火星是否值得？"
  },
  {
    title: "知识付费是缓解焦虑还是制造焦虑",
    context: "买课是为了学习，还是为了买一个‘我在进步’的幻觉？"
  },
  {
    title: "单身税是否具有合理性",
    context: "为了应对少子化，国家是否应该对单身人士征收更多税费？"
  },
  {
    title: "人工智能是否应该拥有法律责任",
    context: "如果自动驾驶汽车撞了人，责任应该归属于谁？"
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
