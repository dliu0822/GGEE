import React from 'react';
import { Scene, Option } from '../types';
import { Sparkles, ChevronRight, AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  scene: Scene;
  onOptionSelect: (option: Option) => void;
  onBack: () => void;
  turn: number;
}

export const StoryCard: React.FC<Props> = ({ scene, onOptionSelect, onBack, turn }) => {
  const isFinalTurn = turn === 4; // 0-based index, so 4 is the 5th turn

  return (
    <div className={`w-full max-w-2xl mx-auto p-1 rounded-xl backdrop-blur-sm animate-float transition-all duration-500 ${isFinalTurn ? 'bg-gradient-to-br from-red-600/60 via-black to-red-600/60 shadow-[0_0_50px_rgba(220,20,60,0.5)]' : 'bg-gradient-to-br from-deepspace-primary/40 via-transparent to-deepspace-accent/40'}`}>
      <div className={`bg-deepspace-dark/90 p-6 md:p-8 rounded-lg relative overflow-hidden border ${isFinalTurn ? 'border-red-500' : 'border-deepspace-border'}`}>
        {/* Holographic Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,6px_100%]"></div>
        
        {/* Decorative Tech Bits */}
        <div className="absolute top-4 right-4 flex gap-1">
          <div className={`w-2 h-2 rounded-full animate-pulse ${isFinalTurn ? 'bg-red-500' : 'bg-deepspace-highlight'}`}></div>
          <div className="w-2 h-2 bg-deepspace-primary rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-deepspace-accent rounded-full animate-pulse delay-150"></div>
        </div>

        <div className="relative z-10">
          <div className="mb-4 text-left flex justify-between items-center">
            <span className={`text-xs font-display tracking-[0.2em] border px-2 py-1 rounded transition-colors duration-300 ${isFinalTurn ? 'text-red-500 border-red-500 bg-red-950/50 animate-pulse' : 'text-deepspace-primary/60 border-deepspace-primary/30'}`}>
              {isFinalTurn ? '⚠ FINAL DECISION // ULTIMATUM' : `SIMULATION SEQUENCE ${turn + 1} // 5`}
            </span>
          </div>

          <div className="mb-8">
            <p className="text-lg md:text-xl font-serif leading-relaxed text-gray-200 text-justify">
              {scene.narrative}
            </p>
          </div>

          <div className="mb-6">
            <h3 className={`font-display text-center text-lg mb-6 tracking-wide flex items-center justify-center gap-2 ${isFinalTurn ? 'text-red-500 font-bold' : 'text-deepspace-highlight'}`}>
              {isFinalTurn ? <AlertTriangle className="w-5 h-5" /> : <Sparkles className="w-4 h-4" />}
              {scene.question}
              {isFinalTurn ? <AlertTriangle className="w-5 h-5" /> : <Sparkles className="w-4 h-4" />}
            </h3>
            
            <div className="space-y-4">
              {scene.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onOptionSelect(opt)}
                  className={`group w-full relative p-4 transition-all duration-300 rounded text-left flex items-center justify-between overflow-hidden border ${
                    isFinalTurn 
                    ? 'bg-red-950/20 border-red-900 hover:border-red-500 hover:bg-red-900/40' 
                    : 'bg-deepspace-glass border-deepspace-border hover:border-deepspace-highlight hover:bg-deepspace-primary/20'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-deepspace-highlight/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className={`font-serif transition-colors relative z-10 ${isFinalTurn ? 'text-gray-200 group-hover:text-white' : 'text-gray-300 group-hover:text-white'}`}>
                    {opt.text}
                  </span>
                  <ChevronRight className={`w-5 h-5 transition-transform relative z-10 group-hover:translate-x-1 ${isFinalTurn ? 'text-red-500' : 'text-deepspace-primary'}`} />
                </button>
              ))}
            </div>

            {/* Back Button Area - Now at the bottom */}
            {turn > 0 && (
              <div className="mt-10 flex justify-center">
                 <button
                    onClick={onBack}
                    className="group flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity duration-300"
                 >
                    <div className="w-8 h-8 rounded-full border border-deepspace-primary/40 flex items-center justify-center group-hover:bg-deepspace-primary/10 group-hover:border-deepspace-primary transition-all shadow-[0_0_10px_transparent] group-hover:shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                        <RotateCcw className="w-3 h-3 text-deepspace-primary group-hover:-rotate-180 transition-transform duration-700" />
                    </div>
                    <span className="text-[10px] font-display tracking-[0.2em] text-deepspace-primary uppercase">
                        Rewind
                    </span>
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};