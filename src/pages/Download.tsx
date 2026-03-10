import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Apple, Monitor } from 'lucide-react';
import { AbstractShape } from '@/components/SplashScreen';

// Animated GB counter
const GBCounter = () => {
  const [count, setCount] = useState(0);
  const target = 12.7;
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    let frame: number;
    const duration = 2000;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((eased * target).toFixed(1)));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [started]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="inline-flex items-baseline gap-1">
      <span className="text-5xl sm:text-6xl font-black tabular-nums bg-gradient-to-b from-primary to-primary/60 bg-clip-text text-transparent">
        {count.toFixed(1)}
      </span>
      <span className="text-lg font-bold text-white/30">GB freed</span>
    </div>
  );
};

// Fan-out presets
const fanStyleA = [
  { x: -60, y: 20, r: -18 },
  { x: -20, y: -10, r: -6 },
  { x: 20, y: -30, r: 6 },
  { x: 60, y: -10, r: 18 },
];

const fanStyleB = [
  { x: 0, y: 50, r: -12 },
  { x: 0, y: 15, r: -4 },
  { x: 0, y: -20, r: 4 },
  { x: 0, y: -55, r: 12 },
];

// Reusable floating card stack with hover fan-out
const FloatingCardStack = ({ 
  scale = 1, 
  rotate = 0, 
  className = '',
  fanStyle = 'A',
}: { 
  scale?: number; 
  rotate?: number; 
  className?: string;
  fanStyle?: 'A' | 'B';
}) => {
  const [hovered, setHovered] = useState(false);
  const fan = fanStyle === 'A' ? fanStyleA : fanStyleB;

  const cards = [
    { gradient: 'linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2))', label: 'Documents', offset: { x: 0, y: 0, r: -3 } },
    { gradient: 'linear-gradient(135deg, rgba(240,147,251,0.2), rgba(245,87,108,0.2))', label: 'Downloads', offset: { x: 4, y: -8, r: 2 } },
    { gradient: 'linear-gradient(135deg, rgba(79,172,254,0.2), rgba(0,242,254,0.2))', label: 'Screenshots', offset: { x: -3, y: -16, r: -1 } },
    { gradient: 'linear-gradient(135deg, rgba(67,233,123,0.2), rgba(56,249,215,0.2))', label: 'Archives', offset: { x: 2, y: -24, r: 1.5 } },
  ];

  return (
    <div 
      className={`relative cursor-pointer ${className}`} 
      style={{ width: 120 * scale, height: 160 * scale, transform: `rotate(${rotate}deg)` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {cards.map((card, i) => {
        const stacked = card.offset;
        const fanned = fan[i];

        return (
          <motion.div
            key={card.label}
            className="absolute rounded-xl overflow-hidden"
            style={{
              width: 100 * scale,
              height: 130 * scale,
              background: card.gradient,
              backdropFilter: 'blur(12px)',
              border: '0.5px solid rgba(255,255,255,0.12)',
              left: '50%',
              top: '50%',
              marginLeft: -50 * scale,
              marginTop: -65 * scale,
              zIndex: cards.length - i,
            }}
            animate={hovered ? {
              x: fanned.x * scale,
              y: fanned.y * scale,
              rotate: fanned.r,
              scale: 0.92,
              opacity: 0.95,
            } : {
              x: stacked.x * scale,
              y: stacked.y * scale,
              rotate: stacked.r,
              scale: 1,
              opacity: 0.9,
            }}
            transition={{
              type: 'spring',
              stiffness: hovered ? 120 : 80,
              damping: hovered ? 14 : 20,
              mass: 0.8,
              delay: i * 0.03,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="w-full h-[1px] bg-white/[0.06] rounded-full mb-1.5" />
              <div className="w-3/4 h-[1px] bg-white/[0.04] rounded-full mb-2" />
              <span className="text-white/30 font-medium" style={{ fontSize: 8 * scale }}>{card.label}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

const DownloadPage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-[hsl(235,24%,8%)] text-foreground overflow-x-hidden selection:bg-primary/30">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/[0.07] rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mt-4 flex items-center justify-between rounded-2xl px-5 h-14 border border-white/[0.06] bg-white/[0.03] backdrop-blur-2xl">
            <div className="flex items-center gap-2.5">
              <AbstractShape size={22} />
              <span className="text-sm font-bold tracking-tight text-foreground">sao.ai</span>
            </div>
            <a
              href="#download"
              className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-xl text-xs font-semibold hover:bg-primary/20 transition-all"
            >
              Download
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative pt-36 pb-10 px-6">
        <motion.div
          className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          {/* Left: Text */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 border border-white/[0.08] bg-white/[0.04] rounded-full px-4 py-1.5 mb-8 backdrop-blur-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-medium text-white/50 tracking-wide uppercase">AI cleans your Mac in seconds</span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-black leading-[1.05] tracking-tight mb-6">
              <span className="text-foreground">Seconds to scan.</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Gigabytes freed.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-white/35 max-w-lg mb-6 leading-relaxed font-light">
              Point sao.ai at any folder and watch AI instantly identify what's safe to delete. No manual sorting — just scan, review, sweep. Done before your coffee gets cold.
            </p>

            {/* Animated GB counter */}
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <GBCounter />
              <p className="text-[11px] text-white/20 mt-1">average per scan</p>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <a
                href="#download"
                className="group inline-flex items-center justify-center gap-2.5 bg-primary text-primary-foreground px-7 py-3.5 rounded-2xl text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
              >
                <Apple size={16} />
                Download for macOS
              </a>
              <a
                href="#how"
                className="inline-flex items-center justify-center gap-2 border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl px-7 py-3.5 rounded-2xl text-sm font-medium text-white/50 hover:text-white/70 hover:bg-white/[0.06] transition-all"
              >
                How it works
              </a>
            </div>
          </motion.div>

          {/* Right: Floating transparent card stack */}
          <motion.div
            className="flex-1 flex items-center justify-center relative"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 bg-primary/[0.06] rounded-full blur-[80px]" />
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <FloatingCardStack scale={1.8} fanStyle="A" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Speed-focused stats */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6">
          {[
            ['< 30s', 'Full folder scan'],
            ['10GB+', 'Avg. reclaimed'],
            ['1-click', 'Sweep to clean'],
          ].map(([value, label], i) => (
            <motion.div
              key={label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div className="text-2xl sm:text-3xl font-black bg-gradient-to-b from-primary to-primary/60 bg-clip-text text-transparent">{value}</div>
              <div className="text-xs text-white/30 mt-1.5 font-medium">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features with card stacks as decoration */}
      <section className="py-20 px-6 relative">
        {/* Decorative card stacks */}
        <div className="hidden lg:block absolute top-16 left-8 opacity-30">
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FloatingCardStack scale={0.6} rotate={-15} />
          </motion.div>
        </div>
        <div className="hidden lg:block absolute bottom-16 right-8 opacity-20">
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, -3, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            <FloatingCardStack scale={0.5} rotate={12} />
          </motion.div>
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-black mb-3">Speed meets intelligence</h2>
            <p className="text-white/30 text-sm max-w-sm mx-auto">AI does the thinking so you don't have to. Scan → review → clean in under a minute.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ['Instant AI Scoring', 'AI analyzes every file in seconds — not hours. Two-pass verification ensures nothing important gets flagged.'],
              ['Smart Categories', 'Automatically sorts into Big Offenders, Old Files, Screenshots, Downloads & Duplicates. Zero manual work.'],
              ['One-Click Sweep', 'Select all junk with one click and sweep to Trash. Undo anytime — nothing is permanently deleted.'],
              ['100% Local & Private', 'Runs entirely on your Mac. No uploads, no cloud processing — only metadata touches AI.'],
            ].map(([title, desc], i) => (
              <motion.div
                key={title}
                className="group relative p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h3 className="text-sm font-bold mb-1.5 relative">{title}</h3>
                <p className="text-xs text-white/30 leading-relaxed relative">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            className="text-3xl sm:text-4xl font-black text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Three steps
          </motion.h2>

          <div className="relative">
            <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                ['01', 'Scan', 'Point at any folder. AI scans thousands of files in seconds — not minutes.'],
                ['02', 'Review', 'AI scores every file instantly. Confidence ratings highlight what\'s safe to remove.'],
                ['03', 'Sweep', 'One click. Gigabytes freed. Files go to Trash — undo anytime.'],
              ].map(([step, title, desc], i) => (
                <motion.div
                  key={step}
                  className="text-center relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-white/[0.06] bg-white/[0.03] mb-5">
                    <span className="text-lg font-black text-primary/40">{step}</span>
                  </div>
                  <h3 className="text-base font-bold mb-2">{title}</h3>
                  <p className="text-xs text-white/30 leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Download CTA with floating cards */}
      <section id="download" className="py-24 px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[100px]" />
        </div>
        <motion.div
          className="max-w-xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Small card stack as visual accent */}
          <motion.div
            className="inline-block mb-8"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FloatingCardStack scale={0.7} />
          </motion.div>

          <h2 className="text-3xl sm:text-4xl font-black mb-3">Reclaim your space</h2>
          <p className="text-white/30 text-sm mb-8 max-w-sm mx-auto">
            Download sao.ai and start cleaning in under 30 seconds. Free to use.
          </p>
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2.5 bg-primary text-primary-foreground px-8 py-4 rounded-2xl text-base font-bold hover:brightness-110 transition-all shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30"
          >
            <Apple size={18} />
            Download for macOS
          </a>
          <div className="flex items-center justify-center gap-3 mt-5 text-[11px] text-white/20">
            <span className="flex items-center gap-1"><Monitor size={11} /> macOS 12+</span>
            <span className="text-white/10">·</span>
            <span>Universal binary</span>
            <span className="text-white/10">·</span>
            <span>v1.0.0</span>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-[11px] text-white/20">
          <div className="flex items-center gap-2">
            <AbstractShape size={14} />
            <span>sao.ai</span>
          </div>
          <span>© {new Date().getFullYear()} sao.ai</span>
        </div>
      </footer>
    </div>
  );
};

export default DownloadPage;
