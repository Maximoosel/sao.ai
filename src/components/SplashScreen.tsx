import { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'sweep' | 'exit'>('enter');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('hold'), 1200),
      setTimeout(() => setPhase('sweep'), 2800),
      setTimeout(() => setPhase('exit'), 3600),
      setTimeout(() => onComplete(), 4200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-700 ${phase === 'exit' ? 'opacity-0' : 'opacity-100'}`}>
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      >
        <source src="/videos/splash-effect.mp4" type="video/mp4" />
      </video>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />

      <div className="relative flex flex-col items-center z-10">
        {/* Animated abstract shape */}
        <div className={`mb-8 transition-all duration-700 ${phase === 'enter' ? 'animate-sweep-text-in' : ''} ${phase === 'sweep' || phase === 'exit' ? 'opacity-0 scale-75 transition-all duration-500' : ''}`}>
          <AbstractShape size={72} />
        </div>

        {/* Title */}
        <div className="relative overflow-hidden">
          <h1
            className={`text-6xl font-black tracking-tighter text-white ${
              phase === 'enter' ? 'animate-sweep-text-in' : ''
            } ${phase === 'sweep' || phase === 'exit' ? 'animate-sweep-text-away' : ''}`}
          >
            Sift
          </h1>
          {phase === 'sweep' && (
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-white to-transparent animate-sweep-line" />
          )}
        </div>

        <p className={`mt-4 text-sm font-medium text-white/60 tracking-widest uppercase animate-subtitle-fade ${phase === 'sweep' || phase === 'exit' ? 'opacity-0 transition-opacity duration-300' : ''}`}>
          Smart File Intelligence
        </p>
      </div>
    </div>
  );
};

// Animated morphing abstract shape
const AbstractShape = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className="animate-morph-shape">
    <defs>
      <linearGradient id="shape-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(214, 100%, 60%)" />
        <stop offset="50%" stopColor="hsl(270, 80%, 65%)" />
        <stop offset="100%" stopColor="hsl(330, 80%, 60%)" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <path
      d="M50,10 C70,10 90,30 90,50 C90,70 70,90 50,90 C30,90 10,70 10,50 C10,30 30,10 50,10"
      fill="url(#shape-grad)"
      filter="url(#glow)"
      opacity="0.9"
    />
  </svg>
);

export { AbstractShape };
export default SplashScreen;
