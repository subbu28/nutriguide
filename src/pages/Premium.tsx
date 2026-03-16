import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';
import { loadStripe } from '@stripe/stripe-js';
import { motion } from 'motion/react';
import { 
  Crown, Check, Star, Users, Vote, Heart, Bell, 
  Zap, Shield, ArrowLeft, Loader2, CreditCard
} from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const features = [
  { icon: Users, title: 'Unlimited Family Groups', description: 'Create and join unlimited family groups' },
  { icon: Vote, title: 'Advanced Meal Polls', description: 'Multiple voting rounds and scheduling' },
  { icon: Heart, title: 'Unlimited Favorites', description: 'Save as many meals as you want' },
  { icon: Bell, title: 'Smart Notifications', description: 'Get notified about meal suggestions' },
  { icon: Zap, title: 'AI Meal Recommendations', description: 'Personalized meal suggestions based on preferences' },
  { icon: Shield, title: 'Priority Support', description: '24/7 premium customer support' },
];

export function Premium() {
  const { user } = useAuthStore();
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { subscription, isPremium } = await api.getSubscription();
        setSubscription(subscription);
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchSubscription();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleSubscribe = async () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    setIsProcessing(true);
    try {
      const { url } = await api.createCheckoutSession();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    
    setIsProcessing(true);
    try {
      await api.cancelSubscription();
      const { subscription } = await api.getSubscription();
      setSubscription(subscription);
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">NutriGuide Premium</h1>
          <p className="text-sm text-stone-500">Unlock the full potential of healthy eating</p>
        </div>
      </div>

      {/* Current Status */}
      {user?.isPremium && subscription && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-2 rounded-xl">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Premium Active</h2>
              <p className="text-emerald-100 text-sm">
                {subscription.cancelAtPeriodEnd 
                  ? `Cancels on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                  : `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                }
              </p>
            </div>
          </div>
          {!subscription.cancelAtPeriodEnd && (
            <button
              onClick={handleCancelSubscription}
              disabled={isProcessing}
              className="text-sm text-emerald-100 hover:text-white underline"
            >
              Cancel subscription
            </button>
          )}
        </motion.div>
      )}

      {/* Pricing Card */}
      {!user?.isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-stone-200 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              Most Popular
            </div>
            <h2 className="text-3xl font-bold mb-2">Premium Plan</h2>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold">$9.99</span>
              <span className="text-emerald-100">/month</span>
            </div>
            <p className="text-emerald-100 mt-2">Cancel anytime</p>
          </div>

          <div className="p-8">
            <ul className="space-y-4 mb-8">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="bg-emerald-100 p-1.5 rounded-lg mt-0.5">
                    <feature.icon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-stone-900">{feature.title}</p>
                    <p className="text-sm text-stone-500">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <button
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Subscribe Now
                </>
              )}
            </button>

            <p className="text-xs text-stone-400 text-center mt-4">
              Secure payment powered by Stripe. Cancel anytime.
            </p>
          </div>
        </motion.div>
      )}

      {/* Features Comparison */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-200">
          <h3 className="text-lg font-bold text-stone-900">Compare Plans</h3>
        </div>
        <div className="divide-y divide-stone-100">
          {[
            { feature: 'Meal Discovery', free: true, premium: true },
            { feature: 'Search & Filter', free: true, premium: true },
            { feature: 'Basic Favorites', free: '10 meals', premium: 'Unlimited' },
            { feature: 'Family Groups', free: '1 group', premium: 'Unlimited' },
            { feature: 'Meal Polls', free: '3/month', premium: 'Unlimited' },
            { feature: 'AI Recommendations', free: false, premium: true },
            { feature: 'Priority Support', free: false, premium: true },
            { feature: 'Ad-free Experience', free: false, premium: true },
          ].map((row, idx) => (
            <div key={idx} className="flex items-center p-4">
              <span className="flex-1 text-sm font-medium text-stone-700">{row.feature}</span>
              <div className="w-24 text-center">
                {typeof row.free === 'boolean' ? (
                  row.free ? (
                    <Check className="w-5 h-5 text-emerald-600 mx-auto" />
                  ) : (
                    <span className="text-stone-300">—</span>
                  )
                ) : (
                  <span className="text-xs text-stone-500">{row.free}</span>
                )}
              </div>
              <div className="w-24 text-center">
                {typeof row.premium === 'boolean' ? (
                  row.premium ? (
                    <Check className="w-5 h-5 text-emerald-600 mx-auto" />
                  ) : (
                    <span className="text-stone-300">—</span>
                  )
                ) : (
                  <span className="text-xs font-medium text-emerald-600">{row.premium}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h3 className="text-lg font-bold text-stone-900 mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {[
            { q: 'Can I cancel anytime?', a: 'Yes! You can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.' },
            { q: 'Is my payment secure?', a: 'Absolutely. We use Stripe for payment processing, which is PCI compliant and uses bank-level security.' },
            { q: 'What happens to my data if I cancel?', a: 'Your data is retained for 30 days after cancellation. You can export it anytime before then.' },
          ].map((faq, idx) => (
            <div key={idx}>
              <h4 className="font-medium text-stone-900 mb-1">{faq.q}</h4>
              <p className="text-sm text-stone-500">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
