import React from 'react';
import { motion } from 'motion/react';
import { RoastEvaluation } from '../constants';
import { Trophy, Zap, Smile, Brain } from 'lucide-react';
import { UI_TRANSLATIONS, Language } from '../translations';
import { View, Text, Button } from './TaroCompat';

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
      <View className="flex justify-between items-start">
        <View className="font-display text-3xl md:text-4xl uppercase">{t.score}</View>
        <View className="bg-brutal-black text-neon-green px-4 py-2 font-display text-2xl md:text-3xl">
          {evaluation.score}
        </View>
      </View>

      <View className="grid grid-cols-3 gap-2 md:gap-4">
        <StatBox icon={<Zap size={18} />} label={t.damage} value={evaluation.damage} color="text-red-600" />
        <StatBox icon={<Smile size={18} />} label={t.humor} value={evaluation.humor} color="text-blue-600" />
        <StatBox icon={<Brain size={18} />} label={t.eq} value={evaluation.eq} color="text-emerald-600" />
      </View>

      <View className="space-y-4 border-t-2 border-brutal-black pt-4">
        <View>
          <Text className="font-mono text-xs uppercase font-bold opacity-50 block">{t.feedback}</Text>
          <Text className="font-sans font-semibold text-base md:text-lg block">{evaluation.feedback}</Text>
        </View>
        <View className="bg-neon-green/20 p-4 border-l-4 border-neon-green">
          <Text className="font-mono text-xs uppercase font-bold text-emerald-800 block">{t.suggestion}</Text>
          <Text className="font-sans italic text-xs md:text-sm block">“{evaluation.suggestion}”</Text>
        </View>
      </View>

      <Button 
        onClick={onReset}
        className="w-full py-3 md:py-4 bg-brutal-black text-gallery-white font-display text-lg md:text-xl uppercase hover:bg-neon-green hover:text-brutal-black transition-colors"
      >
        {t.backToTrain}
      </Button>
    </motion.div>
  );
};

const StatBox = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) => (
  <View className="border-2 border-brutal-black p-3 flex flex-col items-center">
    <View className={color}>{icon}</View>
    <Text className="font-mono text-[10px] uppercase font-bold mt-1">{label}</Text>
    <Text className="font-display text-2xl">{value}</Text>
  </View>
);
