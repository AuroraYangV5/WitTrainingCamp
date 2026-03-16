import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Mic, Send, Trash2, Info, ChevronRight, Sparkles, Zap, Languages } from 'lucide-react';
import { ROAST_LEVELS, RoastEvaluation, GET_SYSTEM_INSTRUCTION } from './constants';
import { geminiService } from './services/geminiService';
import { qwenService } from './services/qwenService';
import { VoiceInterface } from './components/VoiceInterface';
import { ScoreBoard } from './components/ScoreBoard';
import { Library } from './components/Library';
import { UI_TRANSLATIONS, Language } from './translations';
import Markdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function App() {
  const [language, setLanguage] = useState<Language>('zh');
  const [provider, setProvider] = useState<'gemini' | 'qwen'>('qwen');
  const [activeTab, setActiveTab] = useState<'train' | 'library'>('train');
  const [level, setLevel] = useState<keyof typeof ROAST_LEVELS | 'CUSTOM' | null>(null);
  const [challenge, setChallenge] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [evaluation, setEvaluation] = useState<RoastEvaluation | null>(null);
  const [showVoice, setShowVoice] = useState(false);

  const t = UI_TRANSLATIONS[language];

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
    reset(); // Reset session when language changes to avoid mixed language history
  };

  const toggleProvider = () => {
    const nextProvider = provider === 'gemini' ? 'qwen' : 'gemini';
    setProvider(nextProvider);
    reset();
  };

  const startChallenge = async (selectedLevel: keyof typeof ROAST_LEVELS | 'CUSTOM', customPrompt?: string) => {
    setLevel(selectedLevel);
    setIsTyping(true);
    try {
      const prompt = selectedLevel === 'CUSTOM' 
        ? (language === 'en' ? `Start a roast challenge on this topic: ${customPrompt}` : `针对以下主题发起一个怼人挑战：${customPrompt}`)
        : ROAST_LEVELS[selectedLevel].prompt[language];
      
      const challengeText = provider === 'gemini' 
        ? await geminiService.generateChallenge(prompt, language)
        : await qwenService.generateChallenge(prompt, language);
        
      setChallenge(challengeText);
      setMessages([{ role: 'model', text: challengeText || '' }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSelectTopic = (topic: { zh: { title: string; context: string }; en: { title: string; context: string } }) => {
    setActiveTab('train');
    const localizedTopic = topic[language];
    startChallenge('CUSTOM', `${language === 'en' ? 'Topic' : '主题'}：${localizedTopic.title}。${language === 'en' ? 'Context' : '背景'}：${localizedTopic.context}`);
  };

  const handleSend = async () => {
    if (!input.trim() || !challenge) return;

    const userMsg = input;
    setInput('');
    const updatedMessages: Message[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      const replyInstruction = language === 'en'
        ? `You are a world-class roast master. You are currently in a HEATED roast battle with the user.
        Current scenario: ${challenge}
        
        STRICT RULES:
        1. STAY IN CHARACTER. You are the opponent, not a coach.
        2. DO NOT provide any feedback, scores, or suggestions during the battle.
        3. DO NOT be polite. Be witty, sharp, and savage.
        4. Keep your response short and punchy (max 2 sentences).
        5. Your goal is to keep the battle going by provoking the user further.
        6. Respond in English.`
        : `你是一个世界级的怼人大师。你现在正和用户进行一场激烈的对线挑战。
        当前场景：${challenge}
        
        严格规则：
        1. 必须保持人设。你现在是用户的对手，不是教练。
        2. 战斗结束前，严禁给出任何评价、打分或改进建议。
        3. 不要礼貌，要机智、犀利、毒舌。
        4. 回复要短促有力（最多两句话）。
        5. 你的目标是通过进一步的挑衅让对线持续下去。
        6. 使用中文回复。`;

      let replyText = "";
      if (provider === 'gemini') {
        // Pass the existing messages (history) to createChat
        const chat = geminiService.createChat(replyInstruction, messages);
        const response = await chat.sendMessage({ message: userMsg });
        replyText = response.text || "";
      } else {
        // Pass the existing messages (history) to sendMessage
        // The service will append the new userMsg to the history it sends to the API
        replyText = await qwenService.sendMessage(messages.map(m => ({ role: m.role, text: m.text })), userMsg, replyInstruction) || "";
      }
      
      setMessages(prev => [...prev, { role: 'model', text: replyText || (language === 'en' ? "Not bad, interesting!" : "不错，有点意思，再来！") }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleEvaluate = async () => {
    if (messages.length < 2) return;
    setIsTyping(true);
    try {
      const evalResult = provider === 'gemini'
        ? await geminiService.evaluateResponse(messages, language)
        : await qwenService.evaluateResponse(messages, language);
        
      if (evalResult) {
        setEvaluation(evalResult);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const reset = () => {
    setLevel(null);
    setChallenge(null);
    setMessages([]);
    setEvaluation(null);
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-brutal-black text-gallery-white">
      {/* Sidebar / Level Selection */}
      <aside className="w-full md:w-80 border-b-2 md:border-b-0 md:border-r-2 border-gallery-white p-6 flex flex-col min-h-0">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="font-display text-5xl uppercase leading-none tracking-tighter mb-2">{t.title}</h1>
            <p className="font-mono text-[10px] uppercase tracking-widest opacity-50">{t.subtitle}</p>
          </div>
          <div className="flex flex-col gap-2">
            <button 
              onClick={toggleLanguage}
              className="p-2 brutal-border hover:bg-neon-green hover:text-brutal-black transition-all"
              title="Switch Language"
            >
              <Languages size={20} />
            </button>
            <button 
              onClick={toggleProvider}
              className={`p-2 brutal-border transition-all flex items-center justify-center gap-2 ${provider === 'qwen' ? 'bg-neon-green text-brutal-black' : 'hover:bg-neon-green hover:text-brutal-black'}`}
              title={t.selectModel}
            >
              <Sparkles size={16} />
              <span className="font-mono text-[10px] font-bold">{provider === 'gemini' ? 'GEMINI' : 'QWEN'}</span>
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
          <div className="flex gap-2 mb-6">
            <button 
              onClick={() => { setActiveTab('train'); reset(); }}
              className={`flex-1 py-2 font-mono text-[10px] uppercase tracking-widest border-2 transition-all ${activeTab === 'train' ? 'bg-gallery-white text-brutal-black border-gallery-white' : 'border-white/20 hover:border-white'}`}
            >
              {t.trainTab}
            </button>
            <button 
              onClick={() => setActiveTab('library')}
              className={`flex-1 py-2 font-mono text-[10px] uppercase tracking-widest border-2 transition-all ${activeTab === 'library' ? 'bg-gallery-white text-brutal-black border-gallery-white' : 'border-white/20 hover:border-white'}`}
            >
              {t.libraryTab}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'train' ? (
              <motion.div 
                key="train-nav"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <h2 className="font-mono text-xs uppercase font-bold mb-4 flex items-center gap-2">
                  <Sparkles size={14} className="text-neon-green" /> {t.selectLevel}
                </h2>
                {(Object.keys(ROAST_LEVELS) as Array<keyof typeof ROAST_LEVELS>).map((key) => (
                  <button
                    key={String(key)}
                    onClick={() => startChallenge(key)}
                    disabled={!!level}
                    className={`w-full text-left p-4 brutal-border transition-all group ${
                      level === key 
                        ? 'bg-neon-green text-brutal-black' 
                        : 'hover:bg-gallery-white hover:text-brutal-black'
                    } ${level && level !== key ? 'opacity-30 grayscale' : ''}`}
                  >
                    <div className="font-display text-xl uppercase">{ROAST_LEVELS[key][language].name}</div>
                    <div className="font-mono text-[10px] mt-1 opacity-70">{ROAST_LEVELS[key][language].description}</div>
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="library-nav"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="p-4 glass-panel space-y-4"
              >
                <div className="flex items-center gap-3 text-neon-green">
                  <Info size={16} />
                  <span className="font-mono text-xs uppercase font-bold">{t.theoryGuide}</span>
                </div>
                <p className="text-xs opacity-60 leading-relaxed">
                  {t.theoryGuideDesc}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-auto pt-6 border-t border-white/10">
          <button 
            onClick={() => setShowVoice(true)}
            className="w-full py-4 bg-neon-green text-brutal-black font-display text-2xl uppercase brutal-shadow flex items-center justify-center gap-3 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            <Mic size={24} /> {t.voiceBattle}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden min-h-0">
        <AnimatePresence mode="wait">
          {activeTab === 'library' ? (
            <motion.div 
              key="library-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <Library onSelectTopic={handleSelectTopic} language={language} />
            </motion.div>
          ) : !level ? (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="max-w-md space-y-6">
                <div className="w-24 h-24 bg-neon-green rounded-full mx-auto flex items-center justify-center text-brutal-black">
                  <Zap size={48} />
                </div>
                <h2 className="font-display text-6xl uppercase tracking-tighter">{t.readyToRoast}</h2>
                <p className="font-sans text-lg opacity-70">{t.welcomeDesc}</p>
                <div className="pt-8 flex flex-col gap-4">
                  <div className="flex items-center gap-4 text-left p-4 glass-panel">
                    <div className="bg-white/10 p-2 rounded"><MessageSquare size={20} /></div>
                    <div>
                      <div className="font-bold text-sm">{t.textTraining}</div>
                      <div className="text-xs opacity-50">{t.textTrainingDesc}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-left p-4 glass-panel">
                    <div className="bg-white/10 p-2 rounded"><Mic size={20} /></div>
                    <div>
                      <div className="font-bold text-sm">{t.voiceTraining}</div>
                      <div className="text-xs opacity-50">{t.voiceTrainingDesc}</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col h-full"
            >
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neon-green rounded-full flex items-center justify-center text-brutal-black font-bold">
                    {level === 'CUSTOM' ? 'C' : level[0]}
                  </div>
                  <div>
                    <div className="font-bold text-sm uppercase">
                      {level === 'CUSTOM' ? t.customTopic : ROAST_LEVELS[level][language].name}
                    </div>
                    <div className="text-[10px] font-mono text-neon-green">{t.activeSession}</div>
                  </div>
                </div>
                <button onClick={reset} className="p-2 hover:bg-red-500/20 text-red-500 transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-4 ${
                      msg.role === 'user' 
                        ? 'bg-gallery-white text-brutal-black brutal-shadow' 
                        : 'bg-white/10 border border-white/20'
                    }`}>
                      <div className="font-mono text-[10px] uppercase opacity-50 mb-1">
                        {msg.role === 'user' ? t.you : t.roastMaster}
                      </div>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 p-4 border border-white/20 animate-pulse">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-white rounded-full" />
                        <div className="w-2 h-2 bg-white rounded-full" />
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <span className="text-[10px] font-mono ml-2 opacity-50">{t.typing}</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-white/10 space-y-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={t.inputPlaceholder}
                    className="flex-1 bg-white/5 border-2 border-white/20 p-4 font-sans focus:border-neon-green outline-none transition-colors"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="bg-gallery-white text-brutal-black px-8 font-display text-xl uppercase hover:bg-neon-green transition-colors disabled:opacity-50"
                  >
                    <Send size={24} />
                  </button>
                </div>
                
                {messages.length >= 3 && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleEvaluate}
                    disabled={isTyping}
                    className="w-full py-2 border-2 border-neon-green text-neon-green font-mono text-xs uppercase tracking-widest hover:bg-neon-green hover:text-brutal-black transition-all disabled:opacity-50"
                  >
                    {t.endAndEvaluate}
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Evaluation Overlay */}
        <AnimatePresence>
          {evaluation && (
            <div className="absolute inset-0 z-40 bg-brutal-black/80 backdrop-blur-sm flex items-center justify-center p-6">
              <ScoreBoard evaluation={evaluation} onReset={() => setEvaluation(null)} language={language} />
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Voice Interface Overlay */}
      <AnimatePresence>
        {showVoice && (
          <VoiceInterface 
            onClose={() => setShowVoice(false)} 
            language={language}
            systemInstruction={GET_SYSTEM_INSTRUCTION(language)}
          />
        )}
      </AnimatePresence>

      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>
    </div>
  );
}
