import { Shield, ArrowRight } from 'lucide-react';

interface OnboardingModalProps {
  onDismiss: () => void;
}

const OnboardingModal = ({ onDismiss }: OnboardingModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md animate-fade-in-up">
      <div className="glass-panel p-8 max-w-md w-full mx-4 animate-fade-in-up-delay-1">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Shield size={28} className="text-primary" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-foreground text-center mb-2">Full Disk Access Required</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Sweep needs Full Disk Access to scan all your folders and find files to clean up.
        </p>

        <div className="space-y-3 mb-8">
          {[
            'Open System Settings',
            'Go to Privacy & Security',
            'Select Full Disk Access',
            'Enable Sweep',
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <span className="text-sm text-foreground/80">{step}</span>
            </div>
          ))}
        </div>

        <button onClick={onDismiss} className="w-full py-3.5 rounded-2xl font-semibold text-sm bg-primary text-primary-foreground flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:brightness-105">
          I've enabled it <ArrowRight size={16} /> Start Sweeping
        </button>
      </div>
    </div>
  );
};

export default OnboardingModal;
