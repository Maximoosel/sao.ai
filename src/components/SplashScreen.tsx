import { useState, useEffect } from 'react';
import { Wind } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'sweep' | 'exit'>('enter');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('hold'), 800),
      setTimeout(() => setPhase('sweep'), 1800),
      setTimeout(() => setPhase('exit'), 2500),
      setTimeout(() => onComplete(), 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-500 ${phase === 'exit' ? 'opacity-0' : 'opacity-100'}`}>
      <div className="relative flex flex-col items-center">
        {/* Icon */}
        <div className={`mb-6 transition-all duration-500 ${phase === 'enter' ? 'animate-sweep-text-in' : ''} ${phase === 'sweep' || phase === 'exit' ? 'opacity-0 scale-90' : ''}`}>
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Wind size={28} className="text-primary" />
          </div>
        </div>

        {/* Title with sweep effect */}
        <div className="relative overflow-hidden">
          <h1
            className={`text-5xl font-extrabold tracking-tight text-foreground ${
              phase === 'enter' ? 'animate-sweep-text-in' : ''
            } ${phase === 'sweep' || phase === 'exit' ? 'animate-sweep-text-away' : ''}`}
          >
            Sweep
          </h1>

          {/* Sweep line */}
          {phase === 'sweep' && (
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-primary to-transparent animate-sweep-line" />
          )}
        </div>

        {/* Subtitle */}
        <p className={`mt-3 text-sm text-muted-foreground animate-subtitle-fade ${phase === 'sweep' || phase === 'exit' ? 'opacity-0 transition-opacity duration-300' : ''}`}>
          Clean. Simple. Fast.
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
