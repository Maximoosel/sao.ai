import { useState, useEffect } from 'react';
import FloatingOverlay from '@/components/FloatingOverlay';
import SplashScreen from '@/components/SplashScreen';
import OnboardingTooltip from '@/components/OnboardingTooltip';

const ONBOARDING_KEY = 'swept_onboarding_seen';

const themes = [
  { name: 'Ocean', hsl: '214 100% 50%', preview: ['#0074ff', '#00a2ff', '#005ecb'] },
];

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem(ONBOARDING_KEY));

  // Apply theme to CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--primary', themes[0].hsl);
    document.documentElement.style.setProperty('--accent', themes[0].hsl);
    document.documentElement.style.setProperty('--ring', themes[0].hsl);
  }, []);

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
          bgBlur={25}
          panelOpacity={95}
        />
      )}

      {/* Overlay + onboarding after splash */}
      {!showSplash && (
        <>
          <FloatingOverlay bgBlur={25} panelOpacity={15} />
          {showOnboarding && <OnboardingTooltip onDismiss={dismissOnboarding} />}
        </>
      )}
    </div>
  );
};

export default Index;
