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
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Overlay + onboarding after splash */}
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
