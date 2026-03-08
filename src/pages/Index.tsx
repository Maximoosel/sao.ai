import { useState } from 'react';
import FloatingOverlay from '@/components/FloatingOverlay';
import SplashScreen from '@/components/SplashScreen';
import OnboardingTooltip from '@/components/OnboardingTooltip';

const ONBOARDING_KEY = 'sift_onboarding_seen';

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem(ONBOARDING_KEY));

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  };

  // Splash now renders as overlay on top of white bg, not as separate return

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Simulated desktop background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-64 h-40 rounded-xl bg-white/40 border border-white/30 backdrop-blur-sm" />
        <div className="absolute top-32 left-32 w-64 h-40 rounded-xl bg-white/30 border border-white/20 backdrop-blur-sm" />
        <div className="absolute bottom-40 right-40 w-80 h-52 rounded-xl bg-white/35 border border-white/25 backdrop-blur-sm" />
      </div>
      
      {/* Desktop hint text */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <p className="text-xs text-muted-foreground/60">Drag the swept.ai overlay anywhere · 📂 Scan folders · ✨ AI analysis</p>
      </div>
      
      <FloatingOverlay />
      {showOnboarding && <OnboardingTooltip onDismiss={dismissOnboarding} />}
    </div>
  );
};

export default Index;
