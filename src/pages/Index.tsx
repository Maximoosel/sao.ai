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
  { name: 'Rose', hsl: '340 82% 55%', preview: ['#f43f6e', '#fb7199', '#e11d56'] },
];

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem(ONBOARDING_KEY));
  const [showControls, setShowControls] = useState(false);

  // Tuning sliders
  const [bgBlur, setBgBlur] = useState(60);
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  const [splashOpacity, setSplashOpacity] = useState(35);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  };

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 40%, #24243e 100%)' }}>
      {/* Ambient glow blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(120,80,255,0.5) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(255,100,180,0.4) 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(60,200,255,0.4) 0%, transparent 70%)' }} />
      </div>

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
          <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">Appearance</p>

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
