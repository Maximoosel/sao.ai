import { useState } from 'react';
import FloatingOverlay from '@/components/FloatingOverlay';
import SplashScreen from '@/components/SplashScreen';
import OnboardingTooltip from '@/components/OnboardingTooltip';

const ONBOARDING_KEY = 'swept_onboarding_seen';

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem(ONBOARDING_KEY));

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Splash renders as a floating glass card on the white bg */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Only show overlay + onboarding after splash */}
      {!showSplash && (
        <>
          <FloatingOverlay />
          {showOnboarding && <OnboardingTooltip onDismiss={dismissOnboarding} />}
        </>
      )}
    </div>
  );
};

export default Index;
