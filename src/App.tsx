import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Mic, Send, Trash2, Info, ChevronRight, Sparkles, Zap } from 'lucide-react';
import { ROAST_LEVELS, RoastEvaluation } from './constants';
import { geminiService } from './services/geminiService';
import { VoiceInterface } from './components/VoiceInterface';
import { ScoreBoard } from './components/ScoreBoard';
import Markdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'voice'>('chat');
  const [level, setLevel] = useState<keyof typeof ROAST_LEVELS | null>(null);
  const [challenge, setChallenge] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [evaluation, setEvaluation] = useState<RoastEvaluation | null>(null);
  const [showVoice, setShowVoice] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startChallenge = async (selectedLevel: keyof typeof ROAST_LEVELS) => {
    setLevel(selectedLevel);
    setIsTyping(true);
    try {
      const challengeText = await geminiService.generateChallenge(ROAST_LEVELS[selectedLevel].prompt);
      setChallenge(challengeText);
      setMessages([{ role: 'model', text: challengeText }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !challenge) return;

    const userMsg = input;
    setInput('');
    const updatedMessages: Message[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      // Get a witty reply from the bot to continue the argument
      const chat = geminiService.createChat(`你是一个怼人大师。你正在和一个用户进行对线挑战。
      当前挑战场景：${challenge}
      你的目标是继续用犀利、幽默、带点攻击性但不失风度的语言回击用户，引导对话继续。
      保持简短，不要超过两句话。`);
      
      // Pass history to chat if needed, but for simplicity we'll just send the last message or use the chat object
      const response = await chat.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: response.text || "不错，有点意思，再来！" }]);
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
      const evalResult = await geminiService.evaluateResponse(messages);
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
      <aside className="w-full md:w-80 border-b-2 md:border-b-0 md:border-r-2 border-gallery-white p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="font-display text-5xl uppercase leading-none tracking-tighter mb-2">毒舌<br />训练营</h1>
          <p className="font-mono text-[10px] uppercase tracking-widest opacity-50">Sarcasm Bootcamp v1.0</p>
        </div>

        <div className="flex-1 space-y-4">
          <h2 className="font-mono text-xs uppercase font-bold mb-4 flex items-center gap-2">
            <Sparkles size={14} className="text-neon-green" /> 选择段位
          </h2>
          {(Object.keys(ROAST_LEVELS) as Array<keyof typeof ROAST_LEVELS>).map((key) => (
            <button
              key={key}
              onClick={() => startChallenge(key)}
              disabled={!!level}
              className={`w-full text-left p-4 brutal-border transition-all group ${
                level === key 
                  ? 'bg-neon-green text-brutal-black' 
                  : 'hover:bg-gallery-white hover:text-brutal-black'
              } ${level && level !== key ? 'opacity-30 grayscale' : ''}`}
            >
              <div className="font-display text-xl uppercase">{ROAST_LEVELS[key].name}</div>
              <div className="font-mono text-[10px] mt-1 opacity-70">{ROAST_LEVELS[key].description}</div>
            </button>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-white/10">
          <button 
            onClick={() => setShowVoice(true)}
            className="w-full py-4 bg-neon-green text-brutal-black font-display text-2xl uppercase brutal-shadow flex items-center justify-center gap-3 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            <Mic size={24} /> 语音对线
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
          {!level ? (
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
                <h2 className="font-display text-6xl uppercase tracking-tighter">准备好<br />被虐了吗？</h2>
                <p className="font-sans text-lg opacity-70">选择一个段位，开始你的“怼人”进阶之路。我们会模拟真实场景，训练你的临场反应。</p>
                <div className="pt-8 flex flex-col gap-4">
                  <div className="flex items-center gap-4 text-left p-4 glass-panel">
                    <div className="bg-white/10 p-2 rounded"><MessageSquare size={20} /></div>
                    <div>
                      <div className="font-bold text-sm">文字训练</div>
                      <div className="text-xs opacity-50">深度分析，优雅回击</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-left p-4 glass-panel">
                    <div className="bg-white/10 p-2 rounded"><Mic size={20} /></div>
                    <div>
                      <div className="font-bold text-sm">语音对线</div>
                      <div className="text-xs opacity-50">实时模拟，压力测试</div>
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
                    {level[0]}
                  </div>
                  <div>
                    <div className="font-bold text-sm uppercase">{ROAST_LEVELS[level].name}</div>
                    <div className="text-[10px] font-mono text-neon-green">ACTIVE SESSION</div>
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
                        {msg.role === 'user' ? 'YOU' : 'ROAST MASTER'}
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
                    placeholder="输入你的回击..."
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
                    [ 结束对线并查看评分 ]
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
              <ScoreBoard evaluation={evaluation} onReset={() => setEvaluation(null)} />
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Voice Interface Overlay */}
      <AnimatePresence>
        {showVoice && (
          <VoiceInterface 
            onClose={() => setShowVoice(false)} 
            systemInstruction="你是一个怼人大师。现在进入语音对线模式。你要用犀利、幽默、机智的语言和用户对线。用户说话后，你要立刻给出回击，并偶尔评价一下用户的表现。保持快节奏，充满能量。"
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
