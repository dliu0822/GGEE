
import React, { useState, useCallback } from 'react';
import { GamePhase, Scene, ChoiceHistory, AnalysisResult, Option } from './types';
import { generateScene, generateAnalysis } from './services/geminiService';
import { StoryCard } from './components/StoryCard';
import { ResultCard } from './components/ResultCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Activity, Skull, Zap } from 'lucide-react';

const TOTAL_TURNS = 5;

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.INTRO);
  const [turn, setTurn] = useState<number>(0);
  const [history, setHistory] = useState<ChoiceHistory[]>([]);
  // We need to store previous scenes to support "Back" functionality without re-generating
  const [sceneHistory, setSceneHistory] = useState<Scene[]>([]); 
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loadingText, setLoadingText] = useState<string>("正在入侵 N109 區數據庫...");

  // Start game
  const startGame = useCallback(async () => {
    setPhase(GamePhase.PLAYING);
    setLoadingText("正在定位秦徹座標...");
    setTurn(0);
    setHistory([]);
    setSceneHistory([]);
    setResult(null);
    try {
      const scene = await generateScene(0, []);
      setCurrentScene(scene);
    } catch (error) {
      console.error(error);
      setPhase(GamePhase.ERROR);
    }
  }, []);

  // Handle Option Selection
  const handleOptionSelect = async (option: Option) => {
    if (!currentScene) return;

    // Save current scene to stack before moving forward
    setSceneHistory(prev => [...prev, currentScene]);

    const newHistory: ChoiceHistory = {
      sceneId: turn,
      chosenOptionText: option.text,
      chosenTraitSignal: option.traitSignal
    };

    const updatedHistory = [...history, newHistory];
    setHistory(updatedHistory);
    setCurrentScene(null); // Clear scene to show loading

    // If reached max turns, analyze
    if (turn + 1 >= TOTAL_TURNS) {
      setPhase(GamePhase.ANALYZING);
      setLoadingText("正在計算共鳴指數...");
      try {
        const analysis = await generateAnalysis(updatedHistory);
        setResult(analysis);
        setPhase(GamePhase.RESULT);
      } catch (error) {
        console.error(error);
        setPhase(GamePhase.ERROR);
      }
    } else {
      // Next Turn
      const nextTurn = turn + 1;
      setTurn(nextTurn);
      setLoadingText(nextTurn === 4 ? "警告：決戰時刻逼近..." : "Evol 波動檢測中...");
      try {
        const nextScene = await generateScene(nextTurn, updatedHistory);
        setCurrentScene(nextScene);
      } catch (error) {
        console.error(error);
        setPhase(GamePhase.ERROR);
      }
    }
  };

  // Handle Back (Undo)
  const handleBack = () => {
    if (turn === 0 || sceneHistory.length === 0) return;

    // Pop the last scene from history
    const previousScene = sceneHistory[sceneHistory.length - 1];
    const newSceneHistory = sceneHistory.slice(0, -1);
    
    // Pop the last choice from history
    const newHistory = history.slice(0, -1);

    // Restore state
    setCurrentScene(previousScene);
    setSceneHistory(newSceneHistory);
    setHistory(newHistory);
    setTurn(turn - 1);
  };

  // Intro Screen
  if (phase === GamePhase.INTRO) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-deepspace-dark relative overflow-hidden">
        <div className="absolute inset-0 z-0">
             {/* Sci-fi grid background effect - RED/DARK */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
             <div className="absolute top-0 bg-gradient-to-t from-transparent to-deepspace-dark/95 h-full w-full"></div>
             {/* Red Mist */}
             <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-deepspace-accent/20 to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center max-w-2xl px-6 py-12 bg-deepspace-glass border border-deepspace-border rounded-xl backdrop-blur-md animate-float shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <div className="relative inline-block mb-6">
            <Zap className="w-16 h-16 text-deepspace-primary mx-auto animate-pulse" />
            <Skull className="w-8 h-8 text-deepspace-dark absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-50" />
          </div>
          
          <h1 className="font-display text-4xl md:text-6xl text-white mb-2 tracking-widest uppercase text-shadow-red">
            N109 ZONE<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-deepspace-primary to-deepspace-highlight">SYLUS ARCHIVES</span>
          </h1>
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-deepspace-primary to-transparent mx-auto mb-10"></div>
          
          <p className="font-serif text-xl text-gray-300 mb-4 leading-relaxed">
            這裡是法外之地，力量即是一切。
          </p>
          <p className="font-serif text-md text-deepspace-primary/80 mb-10 italic">
            「別想著逃跑...妳已經是我的獵物了。」
          </p>

          <button
            onClick={startGame}
            className="group relative px-10 py-4 bg-transparent border border-deepspace-primary text-deepspace-primary font-display text-lg overflow-hidden transition-all duration-300 rounded uppercase tracking-[0.2em]"
          >
            <div className="absolute inset-0 w-0 bg-deepspace-primary transition-all duration-[250ms] ease-out group-hover:w-full opacity-10"></div>
            <span className="relative group-hover:text-white transition-colors flex items-center gap-2">
              Enter The Zone <Zap className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
    );
  }

  // Error State
  if (phase === GamePhase.ERROR) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deepspace-dark p-4">
        <div className="text-center border border-red-500/50 p-8 rounded bg-red-950/40 backdrop-blur-sm">
          <h2 className="text-3xl font-display text-red-500 mb-4 tracking-widest">SIGNAL LOST</h2>
          <p className="font-serif text-gray-400 mb-6">暗點組織攔截了訊號。請稍後重試。</p>
          <button onClick={() => setPhase(GamePhase.INTRO)} className="text-white border-b border-red-500 hover:text-red-400">
            重啟連接
          </button>
        </div>
      </div>
    );
  }

  // Main Layout
  return (
    <div className="min-h-screen flex flex-col items-center py-8 md:py-16 px-4 relative overflow-hidden bg-deepspace-dark selection:bg-red-900 selection:text-white">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#1a0505] to-[#0a0000] opacity-95"></div>
        {/* Animated particles - Red & Crow feathers vibe */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-deepspace-primary/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-900/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        
        {/* Floating dust/ember effect simulation */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-50 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col min-h-[80vh]">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 border-b border-deepspace-border/50 pb-4">
          <div className="font-display text-red-500/80 text-sm md:text-base tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-heartbeat"></div>
            ONYCHINUS ARCHIVES // ACTIVE
          </div>
          {phase === GamePhase.PLAYING && (
            <div className="flex gap-1">
              {Array.from({ length: TOTAL_TURNS }).map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 w-8 rounded-full transition-all duration-500 ${i <= turn ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-gray-800'}`}
                />
              ))}
            </div>
          )}
        </header>

        {/* Content Area */}
        <div className="flex-grow flex items-center justify-center">
          {(!currentScene && phase === GamePhase.PLAYING) || phase === GamePhase.ANALYZING ? (
            <LoadingSpinner text={loadingText} />
          ) : phase === GamePhase.RESULT && result ? (
            <ResultCard result={result} onRestart={() => setPhase(GamePhase.INTRO)} />
          ) : currentScene ? (
            <StoryCard 
              scene={currentScene} 
              onOptionSelect={handleOptionSelect} 
              onBack={handleBack}
              turn={turn}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default App;
