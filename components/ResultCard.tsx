
import React from 'react';
import { AnalysisResult } from '../types';
import { RefreshCw, Zap, Shield, Sparkles, Crown } from 'lucide-react';

interface Props {
  result: AnalysisResult;
  onRestart: () => void;
}

export const ResultCard: React.FC<Props> = ({ result, onRestart }) => {
  
  // Fixed Theme for Sylus Route
  const theme = {
    color: 'text-red-500',
    bg: 'from-[#2a0a0a] to-black',
    border: 'border-red-600/30',
    highlight: 'text-red-200',
    accent: 'bg-red-600',
    shadow: 'shadow-[0_0_50px_rgba(220,20,60,0.3)]',
    glow: 'bg-red-600',
    icon: <Crown className="w-6 h-6 text-red-500 mx-auto mb-2 opacity-80" />,
    nameCN: '秦徹',
    nameEN: 'SYLUS'
  };

  return (
    <div className={`w-full max-w-4xl mx-auto bg-gradient-to-br ${theme.bg} p-1 rounded-2xl ${theme.shadow} animate-float border ${theme.border}`}>
      <div className="bg-black/80 backdrop-blur-xl rounded-xl p-8 md:p-10 border border-white/5 h-full relative overflow-hidden">
        
        {/* Background glow */}
        <div className={`absolute -top-20 -right-20 w-[500px] h-[500px] ${theme.glow} blur-[150px] opacity-20 pointer-events-none`}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-10">
            <div className="flex-1 text-center md:text-left">
              <div className={`inline-block px-3 py-1 mb-4 rounded border ${theme.border} bg-white/5 text-xs font-display tracking-[0.2em] ${theme.color}`}>
                N109 ARCHIVES // IDENTIFIED
              </div>
              <h2 className={`font-display text-3xl md:text-5xl text-white mb-2 uppercase tracking-wider`}>
                {result.hunterTitle}
              </h2>
              <div className="text-lg font-serif text-gray-400 italic flex items-center justify-center md:justify-start gap-2 mt-4">
                <Zap className={`w-4 h-4 ${theme.color}`} /> Evol 屬性: <span className={theme.highlight}>{result.evolType}</span>
              </div>
            </div>
            
            <div className={`bg-gradient-to-b from-white/10 to-black p-6 rounded-lg border ${theme.border} text-center min-w-[220px] shadow-lg relative overflow-hidden group`}>
              <div className={`absolute top-0 left-0 w-full h-1 ${theme.accent} shadow-[0_0_10px_currentColor]`}></div>
              {theme.icon}
              <div className="text-sm text-gray-500 mb-1 tracking-widest uppercase">Destined Partner</div>
              <div className={`text-3xl font-bold text-white mb-1 font-serif`}>{theme.nameCN}</div>
              <div className={`text-xs ${theme.color} uppercase tracking-[0.3em] opacity-70 mb-4`}>{theme.nameEN}</div>
              
              <div className="mt-2 w-full bg-gray-900 h-1.5 rounded-full overflow-hidden border border-white/5">
                <div className={`h-full ${theme.accent} w-[${result.compatibilityRate.replace('%', '')}%] shadow-[0_0_10px_currentColor]`}></div>
              </div>
              <div className="text-right text-xs mt-2 text-gray-400 font-mono">共鳴率 {result.compatibilityRate}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className={`bg-white/5 p-5 rounded border ${theme.border} hover:bg-white/10 transition-colors`}>
              <h3 className={`font-display ${theme.color} mb-3 text-sm tracking-wide flex items-center gap-2`}>
                <Shield className="w-4 h-4" /> 專屬武裝
              </h3>
              <p className="text-gray-200 font-serif tracking-wide">{result.weapon}</p>
            </div>
            <div className={`bg-white/5 p-5 rounded border ${theme.border} col-span-2 hover:bg-white/10 transition-colors`}>
              <h3 className={`font-display ${theme.color} mb-3 text-sm tracking-wide flex items-center gap-2`}>
                <Sparkles className="w-4 h-4" /> 靈魂特質
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.notableTraits.map((trait, idx) => (
                  <span key={idx} className={`px-3 py-1 bg-white/5 ${theme.highlight} rounded-sm text-sm font-serif border border-white/10`}>
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={`bg-gradient-to-r from-black via-[#1a0a0a] to-black p-8 rounded-lg border-y ${theme.border} mb-10 relative`}>
            <p className="font-serif text-lg leading-loose text-gray-300 text-justify opacity-90">
              {result.description}
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={onRestart}
              className={`group flex items-center gap-3 px-10 py-4 bg-transparent border ${theme.border} text-white font-display text-sm tracking-[0.2em] uppercase hover:bg-white/10 transition-all rounded-sm`}
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              Re-Sync (重新校準)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
