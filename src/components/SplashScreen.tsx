import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

const cards = [
  { id: 1, gradient: 'linear-gradient(135deg, rgba(102,126,234,0.25), rgba(118,75,162,0.25))', label: 'Documents' },
  { id: 2, gradient: 'linear-gradient(135deg, rgba(240,147,251,0.25), rgba(245,87,108,0.25))', label: 'Downloads' },
  { id: 3, gradient: 'linear-gradient(135deg, rgba(79,172,254,0.25), rgba(0,242,254,0.25))', label: 'Screenshots' },
  { id: 4, gradient: 'linear-gradient(135deg, rgba(67,233,123,0.25), rgba(56,249,215,0.25))', label: 'Archives' },
  { id: 5, gradient: 'linear-gradient(135deg, rgba(250,112,154,0.25), rgba(254,225,64,0.25))', label: 'Media' },
];

// Smaller scatter for overlay-sized container
const scatteredPositions = [
  { x: -140, y: -100, rotate: -12 },
  { x: 120, y: -110, rotate: 8 },
  { x: -130, y: 80, rotate: 15 },
  { x: 130, y: 70, rotate: -6 },
  { x: 0, y: -140, rotate: 3 },
];

const stackOffsets = [
  { x: 0, y: 0, rotate: -2 },
  { x: 3, y: -5, rotate: 1.5 },
  { x: -2, y: -10, rotate: -1 },
  { x: 4, y: -15, rotate: 2 },
  { x: -1, y: -20, rotate: -0.5 },
];

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState<'idle' | 'exploded' | 'exit'>('idle');

  const handleClick = useCallback(() => {
    if (phase === 'idle') {
      setPhase('exploded');
      setTimeout(() => setPhase('exit'), 2000);
      setTimeout(() => onComplete(), 2500);
    }
  }, [phase, onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'exit' ? (
        <motion.div
          className="fixed z-[100] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden rounded-3xl"
          style={{
            top: 20, left: 20,
            width: 420, height: 600,
            background: 'hsla(0, 0%, 100%, 0.35)',
            backdropFilter: 'blur(60px) saturate(200%)',
            WebkitBackdropFilter: 'blur(60px) saturate(200%)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          }}
          onClick={handleClick}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Card pile / explosion */}
          <div className="relative w-[120px] h-[160px] mb-8">
            {cards.map((card, i) => {
              const stacked = stackOffsets[i];
              const scattered = scatteredPositions[i];
              const isExploded = phase === 'exploded';

              return (
                <motion.div
                  key={card.id}
                  className="absolute inset-0 rounded-xl border border-black/5 overflow-hidden"
                  style={{ background: card.gradient, zIndex: cards.length - i, backdropFilter: 'blur(10px)' }}
                  initial={{ x: stacked.x, y: stacked.y, rotate: stacked.rotate, scale: 1, opacity: 0.9 }}
                  animate={
                    isExploded
                      ? { x: scattered.x, y: scattered.y, rotate: scattered.rotate, scale: 0.6, opacity: 0.7 }
                      : { x: stacked.x, y: stacked.y, rotate: stacked.rotate, scale: 1, opacity: 0.9 }
                  }
                  transition={{
                    type: 'spring',
                    stiffness: 80,
                    damping: 20,
                    mass: 0.8,
                    delay: isExploded ? i * 0.04 : 0,
                  }}
                >
                  <div className="absolute inset-0 flex flex-col justify-end p-3">
                    <div className="w-full h-0.5 bg-black/8 rounded-full mb-1.5" />
                    <div className="w-3/4 h-0.5 bg-black/5 rounded-full mb-2" />
                    <span className="text-white/40 text-[9px] font-medium">{card.label}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent" />
                </motion.div>
              );
            })}
          </div>

          {/* Title */}
          <motion.div
            className="relative z-10 text-center"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-2xl font-black tracking-tight text-white">
              swept.ai
            </h1>
            <p className="mt-1.5 text-[10px] font-medium text-white/50 tracking-[0.1em] uppercase">
              Smart File Intelligence
            </p>
          </motion.div>

          {phase === 'idle' && (
            <motion.p
              className="absolute bottom-6 text-[10px] text-white/25 tracking-widest uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Tap to begin
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
