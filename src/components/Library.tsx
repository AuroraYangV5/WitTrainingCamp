import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Brain, Library as LibraryIcon, ChevronRight, X } from 'lucide-react';
import { DEFENSE_TECHNIQUES, EMOTION_TIPS, DEBATE_TOPICS } from '../constants';
import { UI_TRANSLATIONS, Language } from '../translations';
import { View, Text, ScrollView, Button } from './TaroCompat';

interface LibraryProps {
  onSelectTopic: (topic: any) => void;
  language: Language;
}

export const Library: React.FC<LibraryProps> = ({ onSelectTopic, language }) => {
  const [activeSection, setActiveSection] = useState<'defense' | 'emotion' | 'topics'>('defense');
  const t = UI_TRANSLATIONS[language];

  return (
    <View className="flex-1 flex flex-col min-h-0 bg-brutal-black">
      {/* Sub-navigation */}
      <View className="flex border-b-2 border-gallery-white shrink-0">
        <TabButton 
          active={activeSection === 'defense'} 
          onClick={() => setActiveSection('defense')}
          icon={<Shield size={18} />}
          label={t.defenseTab}
        />
        <TabButton 
          active={activeSection === 'emotion'} 
          onClick={() => setActiveSection('emotion')}
          icon={<Brain size={18} />}
          label={t.emotionTab}
        />
        <TabButton 
          active={activeSection === 'topics'} 
          onClick={() => setActiveSection('topics')}
          icon={<LibraryIcon size={18} />}
          label={t.topicsTab}
        />
      </View>

      {/* Content Area */}
      <ScrollView className="flex-1 overflow-y-auto p-6" scrollY>
        <AnimatePresence mode="wait">
          {activeSection === 'defense' && (
            <motion.div 
              key="defense"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {DEFENSE_TECHNIQUES.map((tech: any, i) => (
                <View key={i} className="p-4 md:p-6 brutal-border bg-white/5 hover:bg-white/10 transition-colors">
                  <View className="font-display text-xl md:text-2xl uppercase text-neon-green mb-2">{tech[language].title}</View>
                  <Text className="font-sans text-xs md:text-sm opacity-70 mb-4">{tech[language].description}</Text>
                  <View className="bg-white/10 p-3 border-l-4 border-white/30">
                    <Text className="font-mono text-[10px] uppercase opacity-50 block mb-1">{t.scenario}</Text>
                    <Text className="text-xs md:text-sm italic">“{tech[language].scenario}”</Text>
                  </View>
                </View>
              ))}
            </motion.div>
          )}

          {activeSection === 'emotion' && (
            <motion.div 
              key="emotion"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 max-w-3xl mx-auto"
            >
              {EMOTION_TIPS.map((tip: any, i) => (
                <View key={i} className="p-4 md:p-8 brutal-border bg-white/5 flex gap-4 md:gap-6 items-start">
                  <View className="bg-neon-green text-brutal-black font-display text-2xl md:text-4xl p-3 md:p-4 leading-none">
                    0{i + 1}
                  </View>
                  <View>
                    <View className="font-display text-xl md:text-3xl uppercase mb-2">{tip[language].title}</View>
                    <Text className="font-sans text-base md:text-lg opacity-80 leading-relaxed">{tip[language].tip}</Text>
                  </View>
                </View>
              ))}
            </motion.div>
          )}

          {activeSection === 'topics' && (
            <motion.div 
              key="topics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 gap-4"
            >
              {DEBATE_TOPICS.map((topic: any, i) => (
                <Button 
                  key={i} 
                  onClick={() => onSelectTopic(topic)}
                  className="group p-4 brutal-border bg-white/5 flex items-center justify-between hover:bg-neon-green hover:text-brutal-black transition-all text-left w-full"
                >
                  <View className="flex-1">
                    <View className="font-display text-xl uppercase mb-1">{topic[language].title}</View>
                    <Text className="font-sans text-xs opacity-70 group-hover:opacity-100">{topic[language].context}</Text>
                  </View>
                  <ChevronRight className="opacity-30 group-hover:opacity-100" />
                </Button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollView>
    </View>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <Button 
    onClick={onClick}
    className={`flex-1 py-3 md:py-4 flex items-center justify-center gap-2 font-display text-base md:text-lg uppercase transition-all ${
      active ? 'bg-gallery-white text-brutal-black' : 'hover:bg-white/10'
    }`}
  >
    {icon}
    <Text className="hidden sm:inline">{label}</Text>
  </Button>
);
