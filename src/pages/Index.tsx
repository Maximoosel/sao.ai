import { useState } from 'react';
import FloatingOverlay from '@/components/FloatingOverlay';
import SplashScreen from '@/components/SplashScreen';

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-background to-purple-50/40 relative">
      {/* Simulated desktop background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-64 h-40 rounded-xl bg-white/40 border border-white/30 backdrop-blur-sm" />
        <div className="absolute top-32 left-32 w-64 h-40 rounded-xl bg-white/30 border border-white/20 backdrop-blur-sm" />
        <div className="absolute bottom-40 right-40 w-80 h-52 rounded-xl bg-white/35 border border-white/25 backdrop-blur-sm" />
      </div>
      
      {/* Desktop hint text */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <p className="text-xs text-muted-foreground/60">Drag the Sweep overlay anywhere · Click ✦ to scan folders · Click ✨ for AI analysis</p>
      </div>
      
      <FloatingOverlay />
    </div>
  );
};

export default Index;
