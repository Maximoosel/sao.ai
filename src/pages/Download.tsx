import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Shield, Zap, Brain, Trash2, ArrowRight, Apple, Monitor } from 'lucide-react';
import { AbstractShape } from '@/components/SplashScreen';
import appIcon from '@/assets/app-icon.png';

const features = [
  {
    icon: <Brain className="text-primary" size={24} />,
    title: 'AI-Powered Analysis',
    description: 'Two-pass AI scoring identifies which files are safe to remove with confidence ratings.',
  },
  {
    icon: <Zap className="text-yellow-400" size={24} />,
    title: 'Smart Categories',
    description: 'Automatically sorts files into Big Offenders, Old Files, Screenshots, Downloads & Duplicates.',
  },
  {
    icon: <Trash2 className="text-red-400" size={24} />,
    title: 'One-Click Sweep',
    description: 'Select and sweep junk files to Trash. Undo anytime — nothing is permanently deleted.',
  },
  {
    icon: <Shield className="text-emerald-400" size={24} />,
    title: 'Privacy First',
    description: 'Runs locally on your Mac. Files never leave your machine — only metadata is analyzed.',
  },
];

const DownloadPage = () => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[hsl(235,24%,10%)] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[hsl(235,24%,10%)]/80 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AbstractShape size={28} />
            <span className="text-lg font-bold tracking-tight">sao.ai</span>
          </div>
          <a
            href="#download"
            className="bg-primary text-primary-foreground px-5 py-2 rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
          >
            Download
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-xs font-medium text-primary">Smart File Intelligence</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-6">
              Clean your Mac.
              <br />
              <span className="text-primary">Intelligently.</span>
            </h1>
            <p className="text-lg text-white/50 max-w-md mb-8 leading-relaxed">
              sao.ai uses two-pass AI analysis to find files you forgot about — old downloads, duplicate screenshots, massive installers — and helps you reclaim gigabytes in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <a
                href="#download"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-2xl text-base font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20"
              >
                <Apple size={18} />
                Download for macOS
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-7 py-3.5 rounded-2xl text-base font-medium text-white/70 hover:bg-white/10 transition-all"
              >
                Learn more
                <ArrowRight size={16} />
              </a>
            </div>
          </motion.div>

          {/* App preview */}
          <motion.div
            className="flex-1 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative mx-auto w-72 h-72">
              {/* Glow */}
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-[80px]" />
              <img
                src={appIcon}
                alt="sao.ai app icon"
                className="relative w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-3 gap-8 text-center">
          {[
            ['10GB+', 'Avg. space reclaimed'],
            ['2-pass', 'AI verification'],
            ['100%', 'Local & private'],
          ].map(([value, label]) => (
            <div key={label}>
              <div className="text-3xl font-black text-primary">{value}</div>
              <div className="text-sm text-white/40 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black mb-4">Built for your workflow</h2>
            <p className="text-white/40 max-w-md mx-auto">
              A desktop overlay that lives alongside your apps — scan, analyze, and sweep without switching windows.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-default"
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-16">Three steps to a cleaner Mac</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Scan a folder', desc: 'Point sao.ai at any folder — Desktop, Downloads, Documents. It recursively finds all files.' },
              { step: '02', title: 'AI analyzes', desc: 'Two-pass AI scoring rates each file\'s keep-priority with confidence levels. Low-confidence files get flagged.' },
              { step: '03', title: 'Sweep & free space', desc: 'Select files to sweep. They go to your Trash — nothing is permanently deleted. Undo anytime.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-5xl font-black text-primary/20 mb-4">{item.step}</div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section id="download" className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <AbstractShape size={48} />
            <h2 className="text-4xl font-black mt-6 mb-4">Ready to reclaim your space?</h2>
            <p className="text-white/40 mb-8 max-w-md mx-auto">
              Download sao.ai and start cleaning in under 30 seconds. Free to use.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2.5 bg-primary text-primary-foreground px-8 py-4 rounded-2xl text-lg font-bold hover:brightness-110 transition-all shadow-xl shadow-primary/25"
              >
                <Apple size={22} />
                Download for macOS
              </a>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-white/30">
              <span className="flex items-center gap-1"><Monitor size={12} /> macOS 12+</span>
              <span>·</span>
              <span>Universal (Intel + Apple Silicon)</span>
              <span>·</span>
              <span>v1.0.0</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-white/30">
          <div className="flex items-center gap-2">
            <AbstractShape size={16} />
            <span>sao.ai</span>
          </div>
          <span>© {new Date().getFullYear()} sao.ai. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default DownloadPage;