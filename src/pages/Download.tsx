import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Apple, Monitor } from 'lucide-react';
import { AbstractShape } from '@/components/SplashScreen';
import { supabase } from '@/integrations/supabase/client';

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

  // Generate shimmer particles
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 120 * scale,
    y: (Math.random() - 0.5) * 160 * scale,
    size: (1 + Math.random() * 2) * scale,
    delay: Math.random() * 0.4,
    duration: 0.8 + Math.random() * 0.6,
  }));

  return (
    <div 
      className={`relative cursor-pointer ${className}`} 
      style={{ width: 120 * scale, height: 160 * scale, transform: `rotate(${rotate}deg)` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Shimmer particles on fan-out */}
      <AnimatePresence>
        {hovered && particles.map((p) => (
          <motion.div
            key={`particle-${p.id}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: p.size,
              height: p.size,
              left: '50%',
              top: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.8), rgba(59,130,246,0.4))',
              boxShadow: `0 0 ${4 * scale}px rgba(59,130,246,0.3)`,
              zIndex: 20,
            }}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              x: p.x,
              y: p.y,
              scale: [0, 1.5, 0],
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: 'easeOut',
            }}
          />
        ))}
      </AnimatePresence>

      {/* Glow pulse on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ 
          background: 'radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%)',
          zIndex: 0,
        }}
        animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1.3 : 0.8 }}
        transition={{ duration: 0.5 }}
      />

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
            {/* Shimmer sweep across card on hover */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
              }}
              animate={hovered ? { x: ['-100%', '200%'] } : { x: '-100%' }}
              transition={{ duration: 0.8, delay: i * 0.06, ease: 'easeInOut' }}
            />
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

  // Check for tip=thanks query param
  const [showThanks, setShowThanks] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tip') === 'thanks';
  });

  useEffect(() => {
    if (showThanks) {
      // Clean up the URL
      const url = new URL(window.location.href);
      url.searchParams.delete('tip');
      window.history.replaceState({}, '', url.pathname + url.hash);
    }
  }, [showThanks]);

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
            <div className="flex items-center gap-2">
              <a
                href="#pricing"
                className="text-white/40 hover:text-white/70 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              >
                Pricing
              </a>
              <a
                href="/auth"
                className="text-white/40 hover:text-white/70 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              >
                Sign In
              </a>
              <a
                href="#download"
                className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-xl text-xs font-semibold hover:bg-primary/20 transition-all"
              >
                Download
              </a>
            </div>
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
            <FloatingCardStack scale={0.6} rotate={-15} fanStyle="A" />
          </motion.div>
        </div>
        <div className="hidden lg:block absolute bottom-16 right-8 opacity-20">
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, -3, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            <FloatingCardStack scale={0.5} rotate={12} fanStyle="B" />
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: '01',
                  title: 'Scan',
                  desc: 'AI scans thousands of files in seconds.',
                  detail: 'Point sao.ai at any folder — Desktop, Downloads, Documents. It recursively discovers every file, extracts metadata like size, age, and type, then passes it all to the AI engine. The whole process takes under 30 seconds.',
                },
                {
                  step: '02',
                  title: 'Review',
                  desc: 'Confidence ratings highlight what\'s safe.',
                  detail: 'Two-pass AI analysis scores each file\'s keep-priority. Files with low confidence get flagged so you can review them manually. Smart categories automatically sort everything into Big Offenders, Old Files, Screenshots, and more.',
                },
                {
                  step: '03',
                  title: 'Sweep',
                  desc: 'One click. Gigabytes freed.',
                  detail: 'Select files individually or by category, then sweep them all to Trash with a single click. Nothing is permanently deleted — you can undo anytime. Most users reclaim 10GB+ on their first scan.',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  className="group text-center relative rounded-2xl border border-transparent hover:border-white/[0.08] hover:bg-white/[0.02] p-6 transition-colors duration-300 cursor-default"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                >
                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-white/[0.06] bg-white/[0.03] mb-5"
                    whileHover={{ scale: 1.1, borderColor: 'rgba(59,130,246,0.3)' }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <span className="text-lg font-black text-primary/40 group-hover:text-primary/70 transition-colors duration-300">{item.step}</span>
                  </motion.div>
                  <h3 className="text-base font-bold mb-2">{item.title}</h3>
                  <p className="text-xs text-white/30 leading-relaxed">{item.desc}</p>

                  {/* Expandable detail on hover */}
                  <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
                    <div className="overflow-hidden">
                      <div className="pt-4 border-t border-white/[0.06] mt-4">
                        <p className="text-[11px] text-white/25 leading-relaxed">{item.detail}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/[0.05] rounded-full blur-[120px]" />
        </div>
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-black mb-3">Simple pricing</h2>
            <p className="text-white/30 text-sm max-w-sm mx-auto">Try 1 scan free. Upgrade for unlimited cleaning power.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Free */}
            <motion.div
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
            >
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-4">Free</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-black text-foreground">$0</span>
              </div>
              <p className="text-xs text-white/25 mb-6">1 scan included</p>
              <div className="space-y-2.5">
                {['1 folder scan', 'AI file analysis', 'One-click sweep'].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-xs text-white/40">
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    {f}
                  </div>
                ))}
              </div>
              <a
                href="/auth"
                className="mt-6 w-full inline-flex items-center justify-center border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 rounded-xl text-xs font-semibold text-white/50 hover:text-white/70 hover:bg-white/[0.06] transition-all"
              >
                Get Started
              </a>
            </motion.div>

            {/* Pro */}
            <motion.div
              className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-6 backdrop-blur-sm relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl">Popular</div>
              <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-4">Pro</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-black text-foreground">$3.99</span>
                <span className="text-xs text-white/30">/mo</span>
              </div>
              <p className="text-xs text-white/25 mb-6">Unlimited scans</p>
              <div className="space-y-2.5">
                {['Unlimited folder scans', 'AI file analysis', 'One-click sweep', 'Priority support'].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-xs text-white/50">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    {f}
                  </div>
                ))}
              </div>
              <a
                href="/auth"
                className="mt-6 w-full inline-flex items-center justify-center bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-xs font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20"
              >
                Subscribe — $3.99/mo
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tip Jar */}
      <section className="py-20 px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/[0.04] rounded-full blur-[100px]" />
        </div>
        <div className="max-w-xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 border border-white/[0.08] bg-white/[0.04] rounded-full px-4 py-1.5 mb-6 backdrop-blur-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-medium text-white/50 tracking-wide uppercase">Support the dev</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-2">Show Your Support</h2>
            <p className="text-white/30 text-sm max-w-xs mx-auto">
              If sao.ai saved you time, every bit helps keep the project alive.
            </p>
          </motion.div>

          <AnimatePresence>
            {showThanks && (
              <motion.div
                className="mb-8 rounded-2xl border border-primary/20 bg-primary/[0.06] backdrop-blur-sm p-5 text-center"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <div className="text-sm font-bold text-primary mb-1">Thank you for your support!</div>
                <p className="text-xs text-white/40">Your generosity keeps sao.ai alive and improving. You're awesome.</p>
                <button
                  onClick={() => setShowThanks(false)}
                  className="mt-3 text-[10px] text-white/25 hover:text-white/50 transition-colors"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-3 gap-3">
            {[
              { amount: '$2', label: 'Coffee', tier: 'coffee' },
              { amount: '$5', label: 'Lunch', tier: 'lunch' },
              { amount: '$10', label: 'Hero', tier: 'hero' },
            ].map((tip, i) => (
              <motion.button
                key={tip.amount}
                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] p-5 backdrop-blur-sm transition-all duration-300 text-center cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={async () => {
                  const { data, error } = await supabase.functions.invoke('create-tip', {
                    body: { tier: tip.tier },
                  });
                  if (data?.url) window.open(data.url, '_blank');
                }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="text-xl font-black bg-gradient-to-b from-primary to-primary/60 bg-clip-text text-transparent mb-0.5">{tip.amount}</div>
                  <div className="text-[10px] text-white/30 font-medium">{tip.label}</div>
                </div>
              </motion.button>
            ))}
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
            <FloatingCardStack scale={0.7} fanStyle="B" />
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
