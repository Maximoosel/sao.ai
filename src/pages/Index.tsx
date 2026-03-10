import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import FloatingOverlay from '@/components/FloatingOverlay';
import SplashScreen from '@/components/SplashScreen';
import OnboardingTooltip from '@/components/OnboardingTooltip';
import Paywall from '@/components/Paywall';

const ONBOARDING_KEY = 'sao_onboarding_seen';

const themes = [
  { name: 'Ocean', hsl: '214 100% 50%', preview: ['#0074ff', '#00a2ff', '#005ecb'] },
];

const Index = () => {
  const { user, loading, hasAccess, subscription } = useAuth();
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem(ONBOARDING_KEY));

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', themes[0].hsl);
    document.documentElement.style.setProperty('--accent', themes[0].hsl);
    document.documentElement.style.setProperty('--ring', themes[0].hsl);
  }, []);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  };

  // After splash, redirect to auth if not logged in
  const handleSplashComplete = () => {
    setShowSplash(false);
    if (!loading && !user) {
      navigate('/auth');
    }
  };

  // Show paywall if logged in but trial expired and not subscribed
  const showPaywall = user && !loading && !hasAccess;

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent">
      {showSplash && (
        <SplashScreen
          onComplete={handleSplashComplete}
          bgBlur={25}
          panelOpacity={95}
        />
      )}

      {!showSplash && user && (
        <>
          <FloatingOverlay bgBlur={25} panelOpacity={15} />
          {showOnboarding && hasAccess && <OnboardingTooltip onDismiss={dismissOnboarding} />}
          {showPaywall && <Paywall />}
        </>
      )}
    </div>
  );
};

export default Index;
