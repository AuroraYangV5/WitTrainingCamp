import React from 'react';
import { motion } from 'motion/react';
import { RoastEvaluation } from '../constants';
import { Trophy, Zap, Smile, Brain } from 'lucide-react';
import { UI_TRANSLATIONS, Language } from '../translations';

interface ScoreBoardProps {
  evaluation: RoastEvaluation;
  onReset: () => void;
  language: Language;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ evaluation, onReset, language }) => {
  const t = UI_TRANSLATIONS[language];
  
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-gallery-white text-brutal-black p-6 md:p-8 brutal-shadow-neon space-y-6 max-w-xl w-full"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-display text-3xl md:text-4xl uppercase">{t.score}</h3>
        <div className="bg-brutal-black text-neon-green px-4 py-2 font-display text-2xl md:text-3xl">
          {evaluation.score}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <StatBox icon={<Zap size={18} />} label={t.damage} value={evaluation.damage} color="text-red-600" />
        <StatBox icon={<Smile size={18} />} label={t.humor} value={evaluation.humor} color="text-blue-600" />
        <StatBox icon={<Brain size={18} />} label={t.eq} value={evaluation.eq} color="text-emerald-600" />
      </div>

      <div className="space-y-4 border-t-2 border-brutal-black pt-4">
        <div>
          <h4 className="font-mono text-xs uppercase font-bold opacity-50">{t.feedback}</h4>
          <p className="font-sans font-semibold text-base md:text-lg">{evaluation.feedback}</p>
        </div>
        <div className="bg-neon-green/20 p-4 border-l-4 border-neon-green">
          <h4 className="font-mono text-xs uppercase font-bold text-emerald-800">{t.suggestion}</h4>
          <p className="font-sans italic text-xs md:text-sm">“{evaluation.suggestion}”</p>
        </div>
      </div>

      <button 
        onClick={onReset}
        className="w-full py-3 md:py-4 bg-brutal-black text-gallery-white font-display text-lg md:text-xl uppercase hover:bg-neon-green hover:text-brutal-black transition-colors"
      >
        {t.backToTrain}
      </button>
    </motion.div>
  );
};

const StatBox = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) => (
  <div className="border-2 border-brutal-black p-3 flex flex-col items-center">
    <div className={color}>{icon}</div>
    <span className="font-mono text-[10px] uppercase font-bold mt-1">{label}</span>
    <span className="font-display text-2xl">{value}</span>
  </div>
);
