import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

// Card data — mock "file preview" cards with gradients
const cards = [
  { id: 1, gradient: 'linear-gradient(135deg, #667eea, #764ba2)', label: 'Documents' },
  { id: 2, gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', label: 'Downloads' },
  { id: 3, gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', label: 'Screenshots' },
  { id: 4, gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', label: 'Archives' },
  { id: 5, gradient: 'linear-gradient(135deg, #fa709a, #fee140)', label: 'Media' },
];

// Scattered positions for each card after explosion
const scatteredPositions = [
  { x: -320, y: -180, rotate: -12 },
  { x: 280, y: -200, rotate: 8 },
  { x: -280, y: 160, rotate: 15 },
  { x: 300, y: 140, rotate: -6 },
  { x: 0, y: -260, rotate: 3 },
];

const stackOffsets = [
  { x: 0, y: 0, rotate: -2 },
  { x: 4, y: -6, rotate: 1.5 },
  { x: -3, y: -12, rotate: -1 },
  { x: 5, y: -18, rotate: 2 },
  { x: -2, y: -24, rotate: -0.5 },
];

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState<'idle' | 'exploded' | 'exit'>('idle');

  const handleClick = useCallback(() => {
    if (phase === 'idle') {
      setPhase('exploded');
      // After explosion plays out, fade and exit
      setTimeout(() => setPhase('exit'), 2200);
      setTimeout(() => onComplete(), 2800);
    }
  }, [phase, onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'exit' ? (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black cursor-pointer select-none overflow-hidden"
          onClick={handleClick}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Subtle radial glow behind cards */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(120,100,255,0.4) 0%, transparent 70%)' }}
            />
          </div>

          {/* Card pile / explosion */}
          <div className="relative w-[200px] h-[280px] mb-12">
            {cards.map((card, i) => {
              const stacked = stackOffsets[i];
              const scattered = scatteredPositions[i];
              const isExploded = phase === 'exploded';

              return (
                <motion.div
                  key={card.id}
                  className="absolute inset-0 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
                  style={{ background: card.gradient, zIndex: cards.length - i }}
                  initial={{
                    x: stacked.x,
                    y: stacked.y,
                    rotate: stacked.rotate,
                    scale: 1,
                  }}
                  animate={
                    isExploded
                      ? {
                          x: scattered.x,
                          y: scattered.y,
                          rotate: scattered.rotate,
                          scale: 0.75,
                          opacity: [1, 1, 0.9],
                        }
                      : {
                          x: stacked.x,
                          y: stacked.y,
                          rotate: stacked.rotate,
                          scale: 1,
                        }
                  }
                  transition={{
                    type: 'spring',
                    stiffness: 120,
                    damping: 18,
                    delay: isExploded ? i * 0.06 : 0,
                  }}
                >
                  {/* Card content — minimal */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <div className="w-full h-1 bg-white/20 rounded-full mb-2" />
                    <div className="w-3/4 h-1 bg-white/15 rounded-full mb-3" />
                    <span className="text-white/70 text-xs font-medium">{card.label}</span>
                  </div>
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                </motion.div>
              );
            })}
          </div>

          {/* Title text */}
          <motion.div
            className="relative z-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-black tracking-[0.2em] text-white uppercase">
              Sift
            </h1>
            <p className="mt-3 text-xs md:text-sm font-medium text-white/40 tracking-[0.15em] uppercase">
              Smart File Intelligence
            </p>
          </motion.div>

          {/* Click hint — only in idle */}
          {phase === 'idle' && (
            <motion.p
              className="absolute bottom-10 text-xs text-white/25 tracking-widest uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Click anywhere to begin
            </motion.p>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

// Animated morphing abstract shape (used in overlay)
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
