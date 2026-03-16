import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Mic, MicOff, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceInterfaceProps {
  onClose: () => void;
  systemInstruction: string;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onClose, systemInstruction }) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [aiTranscript, setAiTranscript] = useState<string>('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueue = useRef<Int16Array[]>([]);
  const isPlaying = useRef(false);

  useEffect(() => {
    const initSession = async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      try {
        const session = await ai.live.connect({
          model: "gemini-2.5-flash-native-audio-preview-09-2025",
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
            },
            systemInstruction,
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          },
          callbacks: {
            onopen: () => {
              setIsConnecting(false);
              startMic();
            },
            onmessage: async (message: LiveServerMessage) => {
              if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
                const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
                const binaryString = atob(base64Audio);
                const bytes = new Int16Array(binaryString.length / 2);
                for (let i = 0; i < bytes.length; i++) {
                  bytes[i] = (binaryString.charCodeAt(i * 2) & 0xFF) | (binaryString.charCodeAt(i * 2 + 1) << 8);
                }
                audioQueue.current.push(bytes);
                if (!isPlaying.current) playNextInQueue();
              }

              if (message.serverContent?.interrupted) {
                audioQueue.current = [];
                isPlaying.current = false;
              }

              if (message.serverContent?.modelTurn?.parts[0]?.text) {
                setAiTranscript(prev => prev + message.serverContent!.modelTurn!.parts[0].text);
              }
            },
            onclose: () => onClose(),
            onerror: (err) => console.error("Live API Error:", err),
          },
        });
        sessionRef.current = session;
      } catch (err) {
        console.error("Failed to connect to Live API", err);
        onClose();
      }
    };

    initSession();

    return () => {
      stopMic();
      sessionRef.current?.close();
    };
  }, []);

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        sessionRef.current?.sendRealtimeInput({
          media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
        });
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied", err);
    }
  };

  const stopMic = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    processorRef.current?.disconnect();
    audioContextRef.current?.close();
    setIsRecording(false);
  };

  const playNextInQueue = async () => {
    if (audioQueue.current.length === 0) {
      isPlaying.current = false;
      return;
    }

    isPlaying.current = true;
    const audioData = audioQueue.current.shift()!;
    
    const ctx = new AudioContext({ sampleRate: 24000 });
    const buffer = ctx.createBuffer(1, audioData.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < audioData.length; i++) {
      channelData[i] = audioData[i] / 0x7FFF;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => {
      ctx.close();
      playNextInQueue();
    };
    source.start();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-brutal-black flex flex-col items-center justify-center p-6"
    >
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 p-2 border-2 border-white hover:bg-white hover:text-black transition-colors"
      >
        <X size={24} />
      </button>

      <div className="text-center space-y-8 max-w-2xl w-full">
        <h2 className="font-display text-6xl uppercase tracking-tighter">语音对线中</h2>
        
        <div className="relative h-64 flex items-center justify-center">
          <AnimatePresence>
            {isRecording && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 0.2 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="absolute w-48 h-48 bg-neon-green rounded-full blur-3xl"
              />
            )}
          </AnimatePresence>
          
          <div className={`relative z-10 w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${isRecording ? 'border-neon-green text-neon-green shadow-[0_0_30px_rgba(0,255,0,0.5)]' : 'border-white text-white'}`}>
            {isConnecting ? (
              <Zap className="animate-pulse" size={48} />
            ) : (
              isRecording ? <Mic size={48} /> : <MicOff size={48} />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <p className="font-mono text-sm uppercase tracking-widest opacity-50">
            {isConnecting ? "正在建立连接..." : "请开始你的表演（回击）"}
          </p>
          
          <div className="h-24 overflow-y-auto font-mono text-sm text-neon-green/80 italic">
            {aiTranscript && <p>AI: {aiTranscript}</p>}
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 left-0 w-full overflow-hidden">
        <div className="marquee-track whitespace-nowrap">
          {Array(10).fill(" ROAST TRAINING IN PROGRESS • ").map((text, i) => (
            <span key={i} className="font-display text-4xl uppercase opacity-20 mx-4">{text}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
