import { Shield, ArrowRight } from 'lucide-react';

interface OnboardingModalProps {
  onDismiss: () => void;
}

const OnboardingModal = ({ onDismiss }: OnboardingModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in-up">
      <div className="glass-panel p-8 max-w-md w-full mx-4 animate-fade-in-up-delay-1">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Shield size={32} className="text-primary" />
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
              <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <span className="text-sm text-secondary-foreground">{step}</span>
            </div>
          ))}
        </div>

        <button onClick={onDismiss} className="w-full sweep-button flex items-center justify-center gap-2 bg-primary hover:bg-primary/90">
          I've enabled it <ArrowRight size={16} />
          <span className="ml-1">Start Sweeping</span>
        </button>
      </div>
    </div>
  );
};

export default OnboardingModal;
