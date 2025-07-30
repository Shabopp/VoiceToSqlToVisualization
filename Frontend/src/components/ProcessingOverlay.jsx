import React, { useState, useEffect } from 'react';
import { Mic, FileText, Database, BarChart3, CheckCircle, Sparkles, Zap, Brain } from 'lucide-react';

const ProcessingOverlay = ({ isVisible = true, currentStep = 'transcribe', steps = ['upload', 'transcribe', 'generate', 'visualize', 'complete'] }) => {
  const [particles, setParticles] = useState([]);

  const stepConfig = {
    'upload': { 
      icon: Mic, 
      label: 'Capturing Voice', 
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-400/40',
      description: 'Processing audio input...'
    },
    'transcribe': { 
      icon: FileText, 
      label: 'Understanding Speech', 
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-400/40',
      description: 'Converting speech to text...'
    },
    'generate': { 
      icon: Database, 
      label: 'Crafting SQL Query', 
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-400/40',
      description: 'Generating database query...'
    },
    'visualize': { 
      icon: BarChart3, 
      label: 'Creating Insights', 
      color: 'from-orange-400 to-red-500',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-400/40',
      description: 'Building visualizations...'
    },
    'complete': { 
      icon: CheckCircle, 
      label: 'Mission Complete', 
      color: 'from-emerald-400 to-green-500',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-400/40',
      description: 'Ready to explore data!'
    },
  };

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 3,
    }));
    setParticles(newParticles);
  }, []);

  const getCurrentStepIndex = () => steps.indexOf(currentStep);
  const getProgress = () => ((getCurrentStepIndex() + 1) / steps.length) * 100;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950/96 via-blue-950/96 to-violet-950/96 backdrop-blur-lg z-50 flex items-center justify-center overflow-hidden">
      {/* Dynamic background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated mesh gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/8 via-purple-600/8 to-cyan-600/8 animate-pulse" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl animate-pulse-slow opacity-60" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl animate-pulse-slow-delayed opacity-60" />
        
        {/* Floating particles */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute bg-blue-400/30 rounded-full animate-float-particle"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Main content container */}
      <div className="relative max-w-4xl w-full mx-4 px-4 mt-10">
        {/* Central hub with current step */}
        <div className="text-center mb-16">
          {/* Main processing icon with orbital rings */}
          <div className="relative w-36 h-36 mx-auto mb-8">
            {/* Orbital rings - adjusted sizes to prevent overlap */}
            <div className="absolute inset-0 border-2 border-blue-400/25 rounded-full animate-spin-slow" />
            <div className="absolute inset-3 border border-purple-400/20 rounded-full animate-spin-reverse" />
            <div className="absolute inset-6 border border-cyan-400/15 rounded-full animate-spin-medium" />
            
            {/* Central icon container */}
            <div className={`absolute inset-8 bg-gradient-to-br ${stepConfig[currentStep]?.color} rounded-full flex items-center justify-center shadow-2xl animate-scale-breathe`}>
              <div className="absolute inset-0 bg-white/20 rounded-full blur-sm" />
              {React.createElement(stepConfig[currentStep]?.icon || Database, {
                className: "relative w-12 h-12 text-white drop-shadow-lg"
              })}
            </div>

            {/* Floating mini icons - positioned to avoid overlap */}
            <div className="absolute -top-3 -right-3 w-9 h-9 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-orbit-1 shadow-lg z-10">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-3 -left-3 w-7 h-7 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center animate-orbit-2 shadow-lg z-10">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <div className="absolute top-0 -left-5 w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center animate-orbit-3 shadow-lg z-10">
              <Brain className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Current step info */}
          <div className="animate-fade-in-up space-y-3">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent leading-tight">
              {stepConfig[currentStep]?.label}
            </h2>
            <p className="text-blue-200/80 text-xl">
              {stepConfig[currentStep]?.description}
            </p>
          </div>
        </div>

        {/* Step flow visualization */}
        <div className="relative mb-12">
          {/* Step nodes container with proper spacing */}
          <div className="flex justify-between items-center relative px-4">
            {steps.map((step, index) => {
              const config = stepConfig[step];
              const isActive = step === currentStep;
              const isCompleted = getCurrentStepIndex() > index;
              
              return (
                <div key={step} className="relative flex flex-col items-center">
                  {/* Connection line before each step (except first) */}
                  {index > 0 && (
                    <div className="absolute top-8 right-full w-full h-0.5 z-0">
                      <div className={`h-full transition-all duration-1000 ${
                        isCompleted ? 'bg-gradient-to-r from-green-400 to-blue-400' : 
                        isActive ? 'bg-gradient-to-r from-blue-400/50 to-transparent' :
                        'bg-gray-600/20'
                      }`} />
                    </div>
                  )}
                  
                  {/* Step node */}
                  <div className="relative z-10 mb-4">
                    <div 
                      className={`
                        w-16 h-16 rounded-full flex items-center justify-center relative transition-all duration-500 transform
                        ${isActive ? 'scale-125' : isCompleted ? 'scale-110' : 'scale-100'}
                        ${isActive ? config.bgColor + ' ' + config.borderColor + ' border-2 shadow-xl' : 
                          isCompleted ? 'bg-green-500/25 border-2 border-green-400/50 shadow-lg' : 
                          'bg-white/10 border border-white/20'}
                      `}
                    >
                      {/* Glow effect for active step */}
                      {isActive && (
                        <div className={`absolute inset-0 bg-gradient-to-r ${config.color} rounded-full opacity-40 blur-lg animate-pulse`} />
                      )}
                      
                      {/* Icon */}
                      <div className="relative">
                        {React.createElement(config.icon, {
                          className: `w-7 h-7 transition-colors duration-300 ${
                            isActive ? 'text-white' : 
                            isCompleted ? 'text-green-300' : 
                            'text-gray-400'
                          }`
                        })}
                      </div>

                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute -inset-3 border-2 border-blue-400/40 rounded-full animate-ping" />
                      )}

                      {/* Completion checkmark */}
                      {isCompleted && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-scale-in shadow-lg">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step label - positioned below with enough space */}
                  <div className="text-center min-h-[3rem] flex items-center justify-center">
                    <p className={`text-sm font-medium transition-colors duration-300 leading-tight ${
                      isActive ? 'text-white' : 
                      isCompleted ? 'text-green-300' : 
                      'text-gray-400'
                    }`}>
                      {config.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress bar and stats */}
        <div className="bg-white/8 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-blue-200 font-semibold text-lg">Overall Progress</span>
              <span className="text-white font-bold text-xl">{Math.round(getProgress())}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 h-4 rounded-full transition-all duration-1000 animate-gradient-flow shadow-lg"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl font-bold text-green-400">{getCurrentStepIndex()}</div>
              <div className="text-sm text-gray-400 font-medium">Completed</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-blue-400">1</div>
              <div className="text-sm text-gray-400 font-medium">Processing</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-gray-400">{steps.length - getCurrentStepIndex() - 1}</div>
              <div className="text-sm text-gray-400 font-medium">Remaining</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.3; }
          25% { transform: translateY(-25px) translateX(15px) scale(1.2); opacity: 0.6; }
          50% { transform: translateY(-15px) translateX(-20px) scale(0.8); opacity: 0.8; }
          75% { transform: translateY(-35px) translateX(10px) scale(1.1); opacity: 0.4; }
        }
        
        @keyframes orbit-1 {
          0% { transform: rotate(0deg) translateX(60px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
        }
        
        @keyframes orbit-2 {
          0% { transform: rotate(0deg) translateX(55px) rotate(0deg); }
          100% { transform: rotate(-360deg) translateX(55px) rotate(360deg); }
        }
        
        @keyframes orbit-3 {
          0% { transform: rotate(0deg) translateX(65px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(65px) rotate(-360deg); }
        }
        
        @keyframes gradient-flow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes scale-in {
          0% { transform: scale(0) rotate(180deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(90deg); opacity: 0.8; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        
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
        
        .animate-float-particle { animation: float-particle 6s ease-in-out infinite; }
        .animate-orbit-1 { animation: orbit-1 10s linear infinite; }
        .animate-orbit-2 { animation: orbit-2 14s linear infinite; }
        .animate-orbit-3 { animation: orbit-3 12s linear infinite; }
        .animate-spin-slow { animation: spin 15s linear infinite; }
        .animate-spin-reverse { animation: spin 12s linear infinite reverse; }
        .animate-spin-medium { animation: spin 9s linear infinite; }
        .animate-scale-breathe { animation: pulse 3s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse 5s ease-in-out infinite; }
        .animate-pulse-slow-delayed { animation: pulse 5s ease-in-out infinite; animation-delay: 1.5s; }
        .animate-fade-in-up { animation: fadeInUp 1s ease-out; }
        .animate-scale-in { animation: scale-in 0.6s ease-out; }
        .animate-gradient-flow { 
          background-size: 200% 200%;
          animation: gradient-flow 3s ease infinite; 
        }
      `}</style>
    </div>
  );
};

export default ProcessingOverlay;