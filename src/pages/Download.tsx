import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Apple, Monitor } from 'lucide-react';
import { AbstractShape } from '@/components/SplashScreen';

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
          className="max-w-3xl mx-auto text-center"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 border border-white/[0.08] bg-white/[0.04] rounded-full px-4 py-1.5 mb-8 backdrop-blur-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-medium text-white/50 tracking-wide uppercase">AI-Powered File Intelligence</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-7xl font-black leading-[1.05] tracking-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-foreground">Clean your Mac.</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Intelligently.
            </span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg text-white/35 max-w-lg mx-auto mb-10 leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            Two-pass AI analysis finds forgotten files — old downloads, duplicate screenshots, massive installers — and helps you reclaim gigabytes in seconds.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
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
          </motion.div>
        </motion.div>

        {/* Demo video / App preview */}
        <motion.div
          className="max-w-4xl mx-auto mt-16 relative"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Glow behind video */}
          <div className="absolute -inset-4 bg-primary/[0.08] rounded-[2rem] blur-[60px]" />

          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-2xl shadow-black/40">
            {/* macOS title bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="w-3 h-3 rounded-full bg-[hsl(0,72%,55%)]" />
              <div className="w-3 h-3 rounded-full bg-[hsl(45,90%,55%)]" />
              <div className="w-3 h-3 rounded-full bg-[hsl(120,50%,50%)]" />
              <span className="text-[10px] text-white/20 ml-2 font-medium">sao.ai</span>
            </div>

            {/* Video */}
            <div className="aspect-video bg-background/50">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                src="/videos/splash-effect.mp4"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6">
          {[
            ['10GB+', 'Avg. reclaimed'],
            ['2-pass', 'AI verification'],
            ['100%', 'Local & private'],
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

      {/* Features - minimal, no icons */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-black mb-3">Built different</h2>
            <p className="text-white/30 text-sm max-w-sm mx-auto">A desktop overlay that lives alongside your apps. No windows to switch.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ['AI-Powered Analysis', 'Two-pass AI scoring identifies which files are safe to remove with confidence ratings.'],
              ['Smart Categories', 'Automatically sorts into Big Offenders, Old Files, Screenshots, Downloads & Duplicates.'],
              ['One-Click Sweep', 'Select and sweep junk files to Trash. Undo anytime — nothing is permanently deleted.'],
              ['Privacy First', 'Runs locally on your Mac. Files never leave your machine — only metadata is analyzed.'],
            ].map(([title, desc], i) => (
              <motion.div
                key={title}
                className="group relative p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500"
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

      {/* Mascot scanning section */}
      <section className="py-16 px-6 overflow-hidden">
        <div className="max-w-3xl mx-auto relative">
          <motion.div
            className="flex items-end justify-center gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Lil dude scanning across mock file cards */}
            <div className="relative w-full h-48">
              {/* Ground line */}
              <div className="absolute bottom-6 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
              
              {/* Mock file cards being scanned */}
              {['Doc.pdf', 'IMG_0234.png', 'backup.zip', 'old_project.dmg'].map((name, i) => (
                <motion.div
                  key={name}
                  className="absolute bottom-8 rounded-lg border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm px-3 py-2"
                  style={{ left: `${10 + i * 22}%` }}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 0.5, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <span className="text-[9px] text-white/30 font-medium">{name}</span>
                </motion.div>
              ))}

              {/* Lil dude walking and scanning */}
              <motion.div
                className="absolute bottom-0"
                initial={{ left: '-10%' }}
                whileInView={{ left: '85%' }}
                viewport={{ once: true }}
                transition={{ duration: 4, delay: 0.5, ease: 'linear', repeat: Infinity, repeatDelay: 1 }}
              >
                <AbstractShape size={36} showLimbs limbState="walking" walkDirection={1} />
              </motion.div>
            </div>
          </motion.div>
          <p className="text-center text-[11px] text-white/20 mt-4 font-medium">lil dude scanning your files</p>
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
                ['01', 'Scan', 'Point at any folder — Desktop, Downloads, Documents. It recursively finds all files.'],
                ['02', 'Analyze', 'Two-pass AI scores each file\'s keep-priority with confidence levels.'],
                ['03', 'Sweep', 'Select files to sweep. They go to Trash — undo anytime.'],
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

      {/* Download CTA */}
      <section id="download" className="py-24 px-6">
        <motion.div
          className="max-w-xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-[40px]" />
            <AbstractShape size={44} />
          </div>
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
