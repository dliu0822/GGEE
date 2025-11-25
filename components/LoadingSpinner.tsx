import React from 'react';
import { Atom } from 'lucide-react';

interface Props {
  text?: string;
}

export const LoadingSpinner: React.FC<Props> = ({ text = "正在同步 Evol 波動..." }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 animate-pulse-slow">
      <div className="relative">
        <Atom className="w-12 h-12 text-deepspace-highlight animate-spin" style={{ animationDuration: '4s' }} />
        <div className="absolute inset-0 bg-deepspace-accent opacity-20 blur-xl rounded-full"></div>
        <div className="absolute -inset-2 border border-deepspace-primary/30 rounded-full animate-ping opacity-20"></div>
      </div>
      <p className="font-display text-deepspace-primary text-sm tracking-widest uppercase">{text}</p>
    </div>
  );
};