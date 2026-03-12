import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Shield, Zap, Clock } from 'lucide-react';
import { toast } from 'sonner';

const Paywall = () => {
  const { user, subscription, signOut, scansUsed } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to open portal');
    } finally {
      setLoading(false);
    }
  };

  // If subscribed, show manage button
  if (subscription.subscribed) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/[0.05] backdrop-blur-xl p-6 text-center">
        <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold mb-2">
          <Shield size={14} />
          sao.ai Pro — Purchased
        </div>
        <p className="text-xs text-white/30 mb-4">
          Unlimited access — thank you for your support!
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={signOut} variant="ghost" className="rounded-xl text-white/30 text-xs">
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  // Show paywall — free scans used up
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[hsl(235,24%,12%)] p-8 text-center"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <div className="inline-flex items-center gap-2 border border-primary/20 bg-primary/[0.08] rounded-full px-4 py-1.5 mb-6">
          <Zap size={12} className="text-primary" />
          <span className="text-[11px] font-semibold text-primary uppercase tracking-wide">
            {scansUsed} of 1 free scan used
          </span>
        </div>

        <h2 className="text-2xl font-black text-foreground mb-2">
          Unlock sao.ai Pro
        </h2>
        <p className="text-sm text-white/30 mb-8 max-w-xs mx-auto">
          You've used your free scan. Purchase once for unlimited AI-powered scanning and cleaning — forever.
        </p>

        <div className="space-y-3 mb-8 text-left">
          {[
            'Unlimited folder scans',
            'AI-powered file analysis',
            'One-click sweep to clean',
            'Priority support',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-3 text-sm text-white/50">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              {feature}
            </div>
          ))}
        </div>

        <Button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:brightness-110 shadow-lg shadow-primary/20 mb-3"
        >
          {loading ? 'Loading...' : 'Buy Now — $3.99 one-time'}
        </Button>

        <div className="flex items-center justify-center gap-1.5 text-white/20 text-[11px]">
          <Shield size={10} />
          <span>One-time purchase, unlimited forever</span>
        </div>

        {user && (
          <button onClick={signOut} className="text-xs text-white/20 hover:text-white/40 mt-4 transition-colors">
            Sign out
          </button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Paywall;
