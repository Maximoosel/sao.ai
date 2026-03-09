import { useState, useEffect } from 'react';
import FloatingOverlay from '@/components/FloatingOverlay';
import SplashScreen from '@/components/SplashScreen';
import OnboardingTooltip from '@/components/OnboardingTooltip';
import { Slider } from '@/components/ui/slider';
import { Settings2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ONBOARDING_KEY = 'swept_onboarding_seen';

const themes = [
  { name: 'Ocean', hsl: '214 100% 50%', preview: ['#0074ff', '#00a2ff', '#005ecb'] },
  { name: 'Violet', hsl: '270 80% 55%', preview: ['#8b3dff', '#a855f7', '#6d28d9'] },
  { name: 'Ember', hsl: '25 95% 53%', preview: ['#f97316', '#fb923c', '#ea580c'] },
  { name: 'Emerald', hsl: '160 84% 39%', preview: ['#10b981', '#34d399', '#059669'] },
];

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem(ONBOARDING_KEY));
  const [showControls, setShowControls] = useState(false);
  const [activeTheme, setActiveTheme] = useState(0);

  // Tuning sliders
  const [bgBlur, setBgBlur] = useState(25);
  const [overlayOpacity, setOverlayOpacity] = useState(15);
  const [splashOpacity, setSplashOpacity] = useState(35);

  // Apply theme to CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--primary', themes[activeTheme].hsl);
    document.documentElement.style.setProperty('--accent', themes[activeTheme].hsl);
    document.documentElement.style.setProperty('--ring', themes[activeTheme].hsl);
  }, [activeTheme]);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent">
      {/* Ambient glow blobs removed for clean transparent desktop overlay */}

      {/* Splash renders as floating glass card */}
      {showSplash && (
        <SplashScreen
          onComplete={() => setShowSplash(false)}
          bgBlur={bgBlur}
          panelOpacity={splashOpacity}
        />
      )}

      {/* Overlay + onboarding after splash */}
      {!showSplash && (
        <>
          <FloatingOverlay bgBlur={bgBlur} panelOpacity={overlayOpacity} />
          {showOnboarding && <OnboardingTooltip onDismiss={dismissOnboarding} />}
        </>
      )}

      {/* Tuning controls toggle */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="fixed bottom-4 right-4 z-[9999] p-2.5 rounded-xl transition-all"
        style={{
          background: 'hsla(0,0%,100%,0.15)',
          backdropFilter: 'blur(20px)',
          border: '0.5px solid rgba(255,255,255,0.2)',
        }}
      >
        <Settings2 size={16} className="text-white/60" />
      </button>

      {/* Tuning panel */}
      {showControls && (
        <div
          className="fixed bottom-14 right-4 z-[9999] w-[260px] rounded-2xl p-4 space-y-4"
          style={{
            background: 'hsla(0,0%,0%,0.6)',
            backdropFilter: 'blur(40px)',
            border: '0.5px solid rgba(255,255,255,0.15)',
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">Appearance</p>
            <div className="flex gap-1.5">
              {themes.map((theme, i) => (
                <button
                  key={theme.name}
                  onClick={() => setActiveTheme(i)}
                  className="relative w-5 h-5 rounded-full overflow-hidden"
                  style={{
                    background: theme.preview[0],
                    border: activeTheme === i ? '1.5px solid rgba(255,255,255,0.6)' : '1px solid rgba(255,255,255,0.15)',
                    boxShadow: activeTheme === i ? `0 0 8px ${theme.preview[0]}50` : 'none',
                  }}
                >
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  >
                    <div className="absolute w-2 h-2 rounded-full top-0 left-0 blur-[2px]" style={{ background: theme.preview[1], opacity: 0.7 }} />
                    <div className="absolute w-1.5 h-1.5 rounded-full bottom-0 right-0 blur-[2px]" style={{ background: theme.preview[2], opacity: 0.6 }} />
                  </motion.div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-white/50 text-[11px] flex justify-between">
              <span>Backdrop Blur</span><span>{bgBlur}px</span>
            </label>
            <Slider value={[bgBlur]} onValueChange={([v]) => setBgBlur(v)} min={0} max={120} step={1} />
          </div>

          <div className="space-y-1.5">
            <label className="text-white/50 text-[11px] flex justify-between">
              <span>Overlay Opacity</span><span>{overlayOpacity}%</span>
            </label>
            <Slider value={[overlayOpacity]} onValueChange={([v]) => setOverlayOpacity(v)} min={5} max={90} step={1} />
          </div>

          <div className="space-y-1.5">
            <label className="text-white/50 text-[11px] flex justify-between">
              <span>Splash Opacity</span><span>{splashOpacity}%</span>
            </label>
            <Slider value={[splashOpacity]} onValueChange={([v]) => setSplashOpacity(v)} min={5} max={90} step={1} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
