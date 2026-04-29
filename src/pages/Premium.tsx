import { useState } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { api } from '../lib/api.js';
import { 
  Crown, 
  Check, 
  Sparkles, 
  Users, 
  Zap, 
  Shield,
  Loader2,
  X
} from 'lucide-react';

export function Premium() {
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const plans = [
    {
      name: 'Free',
      description: 'Basic meal discovery',
      price: { monthly: 0, yearly: 0 },
      features: [
        'Browse 500+ recipes',
        'Save up to 50 favorites',
        'Join 1 family group',
        'Basic meal planning',
        'Ads supported',
      ],
      notIncluded: [
        'AI meal assistant',
        'Shopping list generation',
        'Nutrition dashboard',
      ],
      cta: 'Current Plan',
      current: !user?.isPremium,
    },
    {
      name: 'Premium',
      description: 'For serious meal planners',
      price: { monthly: 9.99, yearly: 99.99 },
      features: [
        'Unlimited favorites',
        'Unlimited family groups',
        'Advanced meal planning',
        'AI meal assistant (100/mo)',
        'Shopping list generation',
        'Meal history analytics',
        'Nutrition dashboard',
        'No ads',
      ],
      popular: true,
      cta: 'Upgrade Now',
      current: user?.isPremium,
    },
    {
      name: 'Family',
      description: 'Up to 6 members',
      price: { monthly: 59.99, yearly: 599.99 },
      features: [
        'Everything in Premium',
        'Up to 6 family members',
        'Shared meal plans',
        'Collaborative shopping lists',
        'Family nutrition reports',
        'Priority support',
      ],
      cta: 'Choose Family',
      current: false,
    },
  ];

  const handleSubscribe = async (planName: string) => {
    if (planName === 'Free') return;
    
    setIsLoading(true);
    try {
      const successUrl = `${window.location.origin}/premium?success=true`;
      const cancelUrl = `${window.location.origin}/premium?canceled=true`;
      
      const response = await api.createCheckoutSession({
        successUrl,
        cancelUrl,
        couponCode: couponCode || undefined,
      });

      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setCouponError('');
    setCouponSuccess('');
    
    try {
      const response = await api.validateCoupon(couponCode);
      setCouponSuccess(`${response.coupon.discountValue}${response.coupon.discountType === 'PERCENTAGE' ? '%' : '$'} discount applied!`);
    } catch (error: any) {
      setCouponError(error.message || 'Invalid coupon code');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Crown className="w-4 h-4" />
          Upgrade Your Experience
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Unlock the full potential of NutriGuide with our premium features. 
          Start with a 14-day free trial, no credit card required.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-lg flex">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              billingCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Yearly
            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
              Save 33%
            </span>
          </button>
        </div>
      </div>

      {/* Coupon Code */}
      <div className="max-w-md mx-auto mb-12">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={validateCoupon}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            Apply
          </button>
        </div>
        {couponError && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <X className="w-4 h-4" />
            {couponError}
          </p>
        )}
        {couponSuccess && (
          <p className="mt-2 text-sm text-emerald-600 flex items-center gap-1">
            <Check className="w-4 h-4" />
            {couponSuccess}
          </p>
        )}
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl p-8 ${
              plan.popular
                ? 'bg-emerald-600 text-white ring-4 ring-emerald-200 scale-105'
                : 'bg-white border border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-amber-400 text-amber-900 text-sm font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className={`text-xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mt-1 ${plan.popular ? 'text-emerald-100' : 'text-gray-500'}`}>
                {plan.description}
              </p>
            </div>

            <div className="mb-6">
              <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                ${billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly}
              </span>
              <span className={plan.popular ? 'text-emerald-100' : 'text-gray-500'}>
                {plan.price.monthly === 0 ? '' : billingCycle === 'yearly' ? '/year' : '/month'}
              </span>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-emerald-200' : 'text-emerald-600'}`} />
                  <span className={plan.popular ? 'text-white' : 'text-gray-600'}>
                    {feature}
                  </span>
                </li>
              ))}
              {plan.notIncluded?.map((feature) => (
                <li key={feature} className="flex items-start gap-3 opacity-50">
                  <X className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-emerald-300' : 'text-gray-400'}`} />
                  <span className={plan.popular ? 'text-emerald-100' : 'text-gray-400'}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.name)}
              disabled={plan.current || isLoading}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                plan.current
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : plan.popular
                  ? 'bg-white text-emerald-600 hover:bg-gray-100'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : plan.current ? (
                'Current Plan'
              ) : (
                plan.cta
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { icon: Sparkles, title: 'AI Assistant', desc: 'Get personalized meal suggestions powered by AI' },
          { icon: Users, title: 'Family Sharing', desc: 'Collaborate with up to 6 family members' },
          { icon: Zap, title: 'Unlimited Access', desc: 'No limits on favorites or meal plans' },
          { icon: Shield, title: 'Ad-Free', desc: 'Enjoy an uninterrupted experience' },
        ].map((feature) => (
          <div key={feature.title} className="text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <feature.icon className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900">{feature.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: 'Can I cancel my subscription anytime?',
              a: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.',
            },
            {
              q: 'Is there a free trial?',
              a: 'Yes! All paid plans come with a 14-day free trial. No credit card required to start.',
            },
            {
              q: 'Can I switch plans?',
              a: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect on your next billing date.',
            },
            {
              q: 'What payment methods do you accept?',
              a: 'We accept all major credit cards, PayPal, and Apple Pay.',
            },
          ].map((faq) => (
            <div key={faq.q} className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Money Back Guarantee */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-6 py-3 rounded-full">
          <Shield className="w-5 h-5" />
          <span className="font-medium">30-Day Money-Back Guarantee</span>
        </div>
        <p className="text-gray-600 mt-4 max-w-xl mx-auto">
          Not satisfied? Get a full refund within 30 days of your purchase. No questions asked.
        </p>
      </div>
    </div>
  );
}
