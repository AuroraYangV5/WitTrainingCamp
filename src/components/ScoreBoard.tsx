import React from 'react';
import { motion } from 'motion/react';
import { RoastEvaluation } from '../constants';
import { Trophy, Zap, Smile, Brain } from 'lucide-react';

interface ScoreBoardProps {
  evaluation: RoastEvaluation;
  onReset: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ evaluation, onReset }) => {
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-gallery-white text-brutal-black p-8 brutal-shadow-neon space-y-6 max-w-xl w-full"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-display text-4xl uppercase">战果结算</h3>
        <div className="bg-brutal-black text-neon-green px-4 py-2 font-display text-3xl">
          {evaluation.score}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatBox icon={<Zap size={20} />} label="伤害" value={evaluation.damage} color="text-red-600" />
        <StatBox icon={<Smile size={20} />} label="幽默" value={evaluation.humor} color="text-blue-600" />
        <StatBox icon={<Brain size={20} />} label="情商" value={evaluation.eq} color="text-emerald-600" />
      </div>

      <div className="space-y-4 border-t-2 border-brutal-black pt-4">
        <div>
          <h4 className="font-mono text-xs uppercase font-bold opacity-50">毒舌点评</h4>
          <p className="font-sans font-semibold text-lg">{evaluation.feedback}</p>
        </div>
        <div className="bg-neon-green/20 p-4 border-l-4 border-neon-green">
          <h4 className="font-mono text-xs uppercase font-bold text-emerald-800">大师建议</h4>
          <p className="font-sans italic text-sm">“{evaluation.suggestion}”</p>
        </div>
      </div>

      <button 
        onClick={onReset}
        className="w-full py-4 bg-brutal-black text-gallery-white font-display text-xl uppercase hover:bg-neon-green hover:text-brutal-black transition-colors"
      >
        再次挑战
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
