import React from 'react';
import { Database, Zap, Mic, Brain, Activity, Sparkles } from 'lucide-react';

// Simulating framer-motion with CSS animations and React state
const LoadingScreen = () => {
  return (
    
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 flex items-center justify-center z-50 overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-cyan-600/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow-delayed" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-medium" />
      </div>

      {/* Enhanced floating particles with varied motion */}
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className={`absolute animate-float-${i % 4} opacity-30`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          >
            <div className={`rounded-full blur-sm ${
              i % 5 === 0 ? 'w-3 h-3 bg-blue-400/60' :
              i % 5 === 1 ? 'w-2 h-2 bg-purple-400/50' :
              i % 5 === 2 ? 'w-1 h-1 bg-cyan-400/70' :
              i % 5 === 3 ? 'w-2 h-2 bg-pink-400/40' :
              'w-1 h-1 bg-emerald-400/60'
            }`} />
          </div>
        ))}
      </div>

      {/* Animated grid overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full animate-grid-drift" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="text-center z-10 relative">
        {/* Enhanced logo container with multiple animation layers */}
        <div className="relative mb-10">
          {/* Outer rotating rings */}
          <div className="absolute inset-0 w-40 h-40 mx-auto">
            <div className="w-full h-full border-2 border-blue-400/20 rounded-full animate-spin-ultra-slow" />
            <div className="absolute inset-3 border border-purple-400/30 rounded-full animate-spin-reverse-slow" />
            <div className="absolute inset-6 border border-cyan-400/20 rounded-full animate-spin-medium" />
          </div>

          {/* Pulsing energy rings */}
          <div className="absolute inset-0 w-40 h-40 mx-auto">
            <div className="absolute inset-8 border-2 border-blue-500/30 rounded-full animate-ping-slow" />
            <div className="absolute inset-12 border border-purple-500/40 rounded-full animate-ping-medium" />
          </div>

          {/* Central logo with enhanced glassmorphism */}
          <div className="relative w-40 h-40 mx-auto">
            {/* Multi-layer glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 rounded-full opacity-20 blur-3xl animate-pulse-glow" />
            <div className="absolute inset-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-15 blur-2xl animate-pulse-glow-delayed" />
            
            {/* Glass container */}
            <div className="relative w-full h-full bg-white/5 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-2xl animate-scale-breathe">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg blur-sm opacity-50" />
                <Database className="relative w-20 h-20 text-white drop-shadow-2xl animate-float-gentle" />
                
                {/* Enhanced floating satellites */}
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-orbit-1 shadow-xl">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                
                <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-orbit-2 shadow-lg">
                  <Mic className="w-4 h-4 text-white" />
                </div>
                
                <div className="absolute top-1 -left-5 w-9 h-9 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center animate-orbit-3 shadow-lg">
                  <Brain className="w-4 h-4 text-white" />
                </div>

                <div className="absolute -top-2 left-6 w-7 h-7 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center animate-orbit-4 shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced title with advanced animations */}
        <div className="mb-8 animate-title-entrance">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent mb-3 drop-shadow-sm animate-gradient-shift">
            VOCALATICS
          </h1>
          <h2 className="text-3xl font-semibold bg-gradient-to-r from-purple-200 to-cyan-200 bg-clip-text text-transparent animate-subtitle-glow">
            SAY IT !! SEE IT !!
          </h2>
        </div>

        <p className="text-blue-200/90 text-xl mb-10 font-medium animate-fade-in-up">
          From Voice to Insight — End-to-End AI Data Interface
        </p>

        {/* Sophisticated loading animation */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="relative">
              <div 
                className={`w-4 h-4 rounded-full animate-bounce-sophisticated ${
                  i % 5 === 0 ? 'bg-blue-400' :
                  i % 5 === 1 ? 'bg-purple-400' :
                  i % 5 === 2 ? 'bg-cyan-400' :
                  i % 5 === 3 ? 'bg-pink-400' : 'bg-emerald-400'
                }`}
                style={{ 
                  animationDelay: `${i * 0.12}s`,
                  animationDuration: '1.5s'
                }}
              />
              <div 
                className={`absolute inset-0 w-4 h-4 rounded-full animate-ping-staggered ${
                  i % 5 === 0 ? 'bg-blue-400/40' :
                  i % 5 === 1 ? 'bg-purple-400/40' :
                  i % 5 === 2 ? 'bg-cyan-400/40' :
                  i % 5 === 3 ? 'bg-pink-400/40' : 'bg-emerald-400/40'
                }`}
                style={{ animationDelay: `${i * 0.12}s` }}
              />
              <div 
                className={`absolute -inset-1 w-6 h-6 rounded-full animate-pulse-ring ${
                  i % 5 === 0 ? 'bg-blue-400/20' :
                  i % 5 === 1 ? 'bg-purple-400/20' :
                  i % 5 === 2 ? 'bg-cyan-400/20' :
                  i % 5 === 3 ? 'bg-pink-400/20' : 'bg-emerald-400/20'
                }`}
                style={{ animationDelay: `${i * 0.12 + 0.5}s` }}
              />
            </div>
          ))}
        </div>

        {/* Enhanced status section */}
        <div className="space-y-4 animate-status-entrance">
          <p className="text-blue-300/95 text-lg font-medium flex items-center justify-center gap-3">
            <Activity className="w-5 h-5 animate-pulse-gentle" />
            <span className="animate-typewriter">Initializing voice recognition system...</span>
          </p>
          
          <div className="flex justify-center items-center gap-6 text-sm text-blue-400/80">
            <span className="flex items-center gap-2 animate-status-item-1">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse-success" />
              Neural Network: Online
            </span>
            <span className="flex items-center gap-2 animate-status-item-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse-warning" />
              Database: Connecting
            </span>
            <span className="flex items-center gap-2 animate-status-item-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse-info" />
              Voice AI: Loading
            </span>
          </div>
        </div>

        {/* Advanced progress visualization */}
        <div className="mt-10 w-80 mx-auto animate-progress-entrance">
          <div className="relative">
            {/* Background track */}
            <div className="w-full bg-white/10 rounded-full h-2 backdrop-blur-sm border border-white/20 shadow-inner">
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 via-cyan-500 to-blue-500 h-2 rounded-full animate-progress-flow shadow-lg bg-size-200 animate-gradient-flow" />
            </div>
            
            {/* Floating progress indicators */}
            <div className="absolute -top-1 left-0 w-4 h-4 bg-blue-400 rounded-full animate-progress-dot shadow-lg" />
            <div className="absolute -top-1 left-1/3 w-3 h-3 bg-purple-400 rounded-full animate-progress-dot-delayed shadow-md" />
            <div className="absolute -top-1 right-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-progress-dot-late shadow-sm" />
          </div>
          
          <div className="mt-3 text-center">
            <span className="text-xs text-blue-400/70 animate-percentage-count">Loading: 87%</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-0 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          33% { transform: translateY(-15px) translateX(10px) rotate(120deg); }
          66% { transform: translateY(-5px) translateX(-8px) rotate(240deg); }
        }
        
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-20px) translateX(-12px) rotate(90deg); }
          50% { transform: translateY(-8px) translateX(15px) rotate(180deg); }
          75% { transform: translateY(-25px) translateX(5px) rotate(270deg); }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          50% { transform: translateY(-12px) translateX(-10px) rotate(180deg); }
        }
        
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          40% { transform: translateY(-18px) translateX(8px) rotate(144deg); }
          80% { transform: translateY(-3px) translateX(-15px) rotate(288deg); }
        }
        
        @keyframes orbit-1 {
          0% { transform: rotate(0deg) translateX(50px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
        }
        
        @keyframes orbit-2 {
          0% { transform: rotate(0deg) translateX(45px) rotate(0deg); }
          100% { transform: rotate(-360deg) translateX(45px) rotate(360deg); }
        }
        
        @keyframes orbit-3 {
          0% { transform: rotate(0deg) translateX(55px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(55px) rotate(-360deg); }
        }
        
        @keyframes orbit-4 {
          0% { transform: rotate(0deg) translateX(40px) rotate(0deg); }
          100% { transform: rotate(-360deg) translateX(40px) rotate(360deg); }
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes progress-flow {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 87%; }
        }
        
        .animate-float-0 { animation: float-0 8s ease-in-out infinite; }
        .animate-float-1 { animation: float-1 10s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 6s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 12s ease-in-out infinite; }
        
        .animate-orbit-1 { animation: orbit-1 8s linear infinite; }
        .animate-orbit-2 { animation: orbit-2 12s linear infinite; }
        .animate-orbit-3 { animation: orbit-3 10s linear infinite; }
        .animate-orbit-4 { animation: orbit-4 6s linear infinite; }
        
        .animate-gradient-shift { 
          background-size: 300% 300%;
          animation: gradient-shift 4s ease infinite; 
        }
        
        .animate-gradient-flow { 
          background-size: 200% 200%;
          animation: gradient-flow 3s ease infinite; 
        }
        
        .animate-progress-flow { animation: progress-flow 4s ease-out infinite; }
        
        .animate-spin-ultra-slow { animation: spin 15s linear infinite; }
        .animate-spin-reverse-slow { animation: spin 12s linear infinite reverse; }
        .animate-spin-medium { animation: spin 8s linear infinite; }
        
        .animate-pulse-slow { animation: pulse 4s ease-in-out infinite; }
        .animate-pulse-slow-delayed { animation: pulse 4s ease-in-out infinite; animation-delay: 1s; }
        .animate-pulse-medium { animation: pulse 3s ease-in-out infinite; animation-delay: 0.5s; }
        
        .animate-ping-slow { animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-ping-medium { animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; animation-delay: 0.5s; }
        
        .animate-scale-breathe { animation: pulse 6s ease-in-out infinite; }
        .animate-float-gentle { animation: float-2 4s ease-in-out infinite; }
        
        .animate-bounce-sophisticated { animation: bounce 1.5s infinite; }
        .animate-ping-staggered { animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-pulse-ring { animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
        
        .animate-pulse-success { animation: pulse 2s ease-in-out infinite; }
        .animate-pulse-warning { animation: pulse 1.5s ease-in-out infinite; }
        .animate-pulse-info { animation: pulse 2.5s ease-in-out infinite; }
        .animate-pulse-gentle { animation: pulse 3s ease-in-out infinite; }
        
        .animate-title-entrance { animation: fadeInUp 1s ease-out; }
        .animate-subtitle-glow { animation: pulse 4s ease-in-out infinite; }
        .animate-fade-in-up { animation: fadeInUp 1s ease-out 0.5s both; }
        .animate-status-entrance { animation: fadeInUp 1s ease-out 1s both; }
        .animate-progress-entrance { animation: fadeInUp 1s ease-out 1.5s both; }
        
        .animate-status-item-1 { animation: fadeInUp 0.5s ease-out 1.2s both; }
        .animate-status-item-2 { animation: fadeInUp 0.5s ease-out 1.4s both; }
        .animate-status-item-3 { animation: fadeInUp 0.5s ease-out 1.6s both; }
        
        .animate-progress-dot { animation: bounce 2s infinite; }
        .animate-progress-dot-delayed { animation: bounce 2s infinite; animation-delay: 0.3s; }
        .animate-progress-dot-late { animation: bounce 2s infinite; animation-delay: 0.6s; }
        
        .animate-percentage-count { animation: fadeIn 1s ease-out 2s both; }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;