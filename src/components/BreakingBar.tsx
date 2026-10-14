import React from 'react';
import { BREAKING_NEWS_ITEMS } from '../data/mockData';

interface BreakingBarProps {
  onSelectHeadline: (headlineText: string) => void;
}

export const BreakingBar: React.FC<BreakingBarProps> = ({ onSelectHeadline }) => {
  return (
    <div className="bg-[#0b101b] border-b border-slate-800/80 text-xs text-slate-300 py-2 px-4 select-none overflow-hidden relative z-30">
      <div className="max-w-[1440px] mx-auto flex items-center gap-3">
        {/* Red Breaking Pill */}
        <div className="flex-shrink-0 flex items-center gap-1.5 bg-[#e11d48] text-white font-black px-2.5 py-0.5 rounded-full text-[10px] tracking-wider uppercase shadow-sm">
          <span className="w-2 h-2 rounded-full bg-white animate-ping opacity-75"></span>
          <span>BREAKING</span>
        </div>

        {/* Marquee ticker container */}
        <div className="overflow-hidden relative flex-1 mask-fade">
          <div className="animate-ticker flex items-center gap-8 whitespace-nowrap cursor-pointer">
            {/* Repeat items twice for continuous infinite scroll */}
            {[...BREAKING_NEWS_ITEMS, ...BREAKING_NEWS_ITEMS].map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                onClick={() => onSelectHeadline(item.text)}
                className="inline-flex items-center gap-2 group hover:text-white transition-colors"
              >
                <span className="font-medium text-slate-200 group-hover:underline">
                  {item.text}
                </span>
                <span className="text-slate-500 text-[11px] font-mono">
                  {item.date}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block ml-4"></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
