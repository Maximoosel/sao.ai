import { useState } from 'react';
import { FolderOpen, Sparkles, Trash2, X, ArrowRight, Undo2, Copy, Keyboard } from 'lucide-react';

const steps = [
  {
    icon: <FolderOpen size={20} className="text-primary" />,
    title: 'Scan Your Files',
    desc: 'Tap the folder icon to scan a directory. swept.ai reads file sizes, dates, and names to find junk.',
  },
  {
    icon: <Sparkles size={20} className="text-primary" />,
    title: 'AI Keep Priority',
    desc: 'Tap the sparkle icon and AI will score each file\'s importance. Hover any score to see the reasoning.',
  },
  {
    icon: <Copy size={20} className="text-primary" />,
    title: 'Find Duplicates',
    desc: 'Switch to the Duplicates tab to instantly spot files with the same name and size across folders.',
  },
  {
    icon: <Trash2 size={20} className="text-destructive" />,
    title: 'Select & Sweep',
    desc: 'Check files you don\'t need, then hit Sweep. Watch them get absorbed and freed from your disk.',
  },
  {
    icon: <Undo2 size={20} className="text-primary" />,
    title: 'Undo Anytime',
    desc: 'Changed your mind? An undo banner appears for 10 seconds after every sweep. One click to restore.',
  },
  {
    icon: <Keyboard size={20} className="text-primary" />,
    title: 'Power Shortcuts',
    desc: '⌘A to select all, Delete to sweep, ⌘Z to undo. Sort by size, date, or AI priority.',
  },
];

interface OnboardingTooltipProps {
  onDismiss: () => void;
}

const OnboardingTooltip = ({ onDismiss }: OnboardingTooltipProps) => {
  const [step, setStep] = useState(0);
  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className="w-[320px] rounded-2xl overflow-hidden border border-white/15 shadow-2xl"
        style={{ background: 'hsla(0, 0%, 100%, 0.28)', backdropFilter: 'blur(60px) saturate(180%)' }}
      >
        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-primary' : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>

        <div className="px-6 py-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
            {current.icon}
          </div>
          <h3 className="text-base font-bold text-white mb-2">{current.title}</h3>
          <p className="text-sm text-white/60 leading-relaxed">{current.desc}</p>
        </div>

        <div className="px-6 pb-5 flex gap-2">
          <button
            onClick={onDismiss}
            className="flex-1 py-2.5 rounded-xl text-xs font-medium text-white/50 hover:bg-white/5 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={() => step < steps.length - 1 ? setStep(step + 1) : onDismiss()}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:brightness-110 transition-all flex items-center justify-center gap-1"
          >
            {step < steps.length - 1 ? (
              <>Next <ArrowRight size={12} /></>
            ) : (
              'Get Started'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTooltip;
