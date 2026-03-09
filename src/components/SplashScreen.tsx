import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
  bgBlur?: number;
  panelOpacity?: number;
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

// Partially fanned out on hover — subtle peek
const peekOffsets = [
  { x: -30, y: 12, rotate: -8 },
  { x: 28, y: -8, rotate: 6 },
  { x: -22, y: -28, rotate: -4 },
  { x: 24, y: -48, rotate: 5 },
  { x: 0, y: -60, rotate: 1 },
];

const SplashScreen = ({ onComplete, bgBlur = 60, panelOpacity = 35 }: SplashScreenProps) => {
  const [isHovered, setIsHovered] = useState(false);
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
          className="fixed z-[100] inset-0 flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden rounded-3xl"
          style={{
            background: `hsla(235, 24%, 15%, ${panelOpacity === 15 ? 0.95 : panelOpacity / 100})`,
            backdropFilter: `blur(${bgBlur}px) saturate(200%)`,
            WebkitBackdropFilter: `blur(${bgBlur}px) saturate(200%)`,
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          }}
          onClick={handleClick}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Card pile / explosion */}
          <div 
            className="relative w-[120px] h-[160px] mb-8"
            onMouseEnter={() => phase === 'idle' && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {cards.map((card, i) => {
              const stacked = stackOffsets[i];
              const peeked = peekOffsets[i];
              const scattered = scatteredPositions[i];
              const isExploded = phase === 'exploded';

              const target = isExploded
                ? { x: scattered.x, y: scattered.y, rotate: scattered.rotate, scale: 0.6, opacity: 0.7 }
                : isHovered
                ? { x: peeked.x, y: peeked.y, rotate: peeked.rotate, scale: 0.88, opacity: 0.95 }
                : { x: stacked.x, y: stacked.y, rotate: stacked.rotate, scale: 1, opacity: 0.9 };

              return (
                <motion.div
                  key={card.id}
                  className="absolute inset-0 rounded-xl border border-black/5 overflow-hidden"
                  style={{ background: card.gradient, zIndex: cards.length - i, backdropFilter: 'blur(10px)' }}
                  initial={{ x: stacked.x, y: stacked.y, rotate: stacked.rotate, scale: 1, opacity: 0.9 }}
                  animate={target}
                  transition={{
                    type: 'spring',
                    stiffness: isHovered && !isExploded ? 120 : 80,
                    damping: isHovered && !isExploded ? 14 : 20,
                    mass: 0.8,
                    delay: isExploded ? i * 0.04 : i * 0.02,
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
              sao.ai
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
const AbstractShape = ({ size = 48, showLimbs = false, limbState = 'idle' }: { size?: number; showLimbs?: boolean; limbState?: 'idle' | 'walking' | 'picked-up' | 'popping' }) => {
  const limbClass = limbState === 'popping' ? 'animate-pop-in' : '';
  const isWalking = limbState === 'walking';
  
  return (
    <svg 
      width={size} 
      height={showLimbs ? size * 1.6 : size} 
      viewBox={showLimbs ? "0 0 100 160" : "0 0 100 100"} 
      className={`overflow-visible ${isWalking ? 'animate-walk-bounce' : ''}`}
    >
      <defs>
        <linearGradient id="shape-grad" x1="0%" y1="0%" x2="100%" y2="100%" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4B6A6A" />
          <stop offset="20%" stopColor="#6B9B9B" />
          <stop offset="40%" stopColor="#F5F0E8" />
          <stop offset="60%" stopColor="#D4A5B0" />
          <stop offset="80%" stopColor="#B87A8C" />
          <stop offset="100%" stopColor="#5A1F2A" />
          <animateTransform
            attributeName="gradientTransform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur={showLimbs ? "6s" : "20s"}
            repeatCount="indefinite"
          />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Sketchy effect filter */}
        <filter id="sketchy" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="noise" seed="2"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
        {/* Red glow for scanner tip */}
        <filter id="red-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Backpack - crosshatched style, behind the ball */}
      {showLimbs && (
        <g className={`${limbClass} ${isWalking ? 'animate-backpack-bob' : ''}`} style={{ transformOrigin: '50px 50px' }}>
          {/* Backpack body - rounded rectangle with crosshatch */}
          <rect x="62" y="25" width="28" height="45" rx="6" ry="6" 
            fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"
          />
          {/* Crosshatch lines */}
          <line x1="66" y1="30" x2="86" y2="50" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.6" />
          <line x1="66" y1="40" x2="86" y2="60" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.6" />
          <line x1="66" y1="50" x2="82" y2="66" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.6" />
          <line x1="86" y1="30" x2="66" y2="50" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.6" />
          <line x1="86" y1="40" x2="66" y2="60" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.6" />
          <line x1="86" y1="50" x2="70" y2="66" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.6" />
          {/* Backpack straps */}
          <path d="M62 35 Q55 38 55 45" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M62 55 Q55 52 55 45" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
          {/* Backpack flap */}
          <path d="M64 25 Q76 18 88 25" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
          {/* Scanner/flashlight in backpack pocket */}
          {isWalking && (
            <g>
              <line x1="78" y1="70" x2="78" y2="82" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
              <circle cx="78" cy="85" r="3" fill="#ff3b3b" filter="url(#red-glow)" opacity="0.9">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.2s" repeatCount="indefinite" />
              </circle>
              <circle cx="78" cy="85" r="6" fill="#ff3b3b" opacity="0.15">
                <animate attributeName="r" values="5;8;5" dur="1.2s" repeatCount="indefinite" />
              </circle>
            </g>
          )}
        </g>
      )}
      
      {/* Main ball body — squash and stretch when walking */}
      <g className={isWalking ? 'animate-squash-stretch' : ''} style={{ transformOrigin: '50px 50px' }}>
        <path
          d="M50,10 C70,10 90,30 90,50 C90,70 70,90 50,90 C30,90 10,70 10,50 C10,30 30,10 50,10"
          fill="url(#shape-grad)"
          filter="url(#glow)"
          opacity="0.9"
          className="animate-morph-body"
        />
      </g>
      
      {/* Legs - simple pendulum style extending from bottom of ball */}
      {showLimbs && (
        <g className={limbClass}>
          {/* Left leg */}
          <g className={isWalking ? 'animate-leg-pendulum-left' : limbState === 'picked-up' ? 'animate-leg-dangle-left' : ''}
             style={{ transformOrigin: '42px 85px' }}>
            <line x1="42" y1="85" x2="38" y2="130"
              stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"
            />
            {/* Left foot - simple */}
            {limbState !== 'picked-up' && (
              <ellipse cx="36" cy="132" rx="6" ry="3" fill="none" stroke="#1a1a1a" strokeWidth="3" />
            )}
          </g>
          
          {/* Right leg - with striped/hatched shoe */}
          <g className={isWalking ? 'animate-leg-pendulum-right' : limbState === 'picked-up' ? 'animate-leg-dangle-right' : ''}
             style={{ transformOrigin: '58px 85px' }}>
            <line x1="58" y1="85" x2="62" y2="130"
              stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"
            />
            {/* Right foot - striped shoe */}
            {limbState !== 'picked-up' && (
              <g>
                <ellipse cx="64" cy="132" rx="7" ry="4" fill="none" stroke="#1a1a1a" strokeWidth="3" />
                {/* Stripes on shoe */}
                <line x1="60" y1="130" x2="60" y2="134" stroke="#1a1a1a" strokeWidth="1.5" />
                <line x1="64" y1="129" x2="64" y2="135" stroke="#1a1a1a" strokeWidth="1.5" />
                <line x1="68" y1="130" x2="68" y2="134" stroke="#1a1a1a" strokeWidth="1.5" />
              </g>
            )}
          </g>
        </g>
      )}
    </svg>
  );
};

export { AbstractShape };
export default SplashScreen;
