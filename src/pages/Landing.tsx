import { Link } from 'react-router-dom';
import { ChefHat, Sparkles, Users, Calendar, Shield, Zap } from 'lucide-react';

export function Landing() {
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Recommendations',
      description: 'Get personalized meal suggestions based on your dietary preferences and goals.',
    },
    {
      icon: Users,
      title: 'Family Collaboration',
      description: 'Vote on meals, share recipes, and plan together with your family.',
    },
    {
      icon: Calendar,
      title: 'Smart Meal Planning',
      description: 'Create weekly meal plans with automatic shopping list generation.',
    },
    {
      icon: Shield,
      title: 'Nutrition Tracking',
      description: 'Log meals and track your nutrition intake with detailed analytics.',
    },
    {
      icon: Zap,
      title: 'Quick Recipes',
      description: 'Find recipes that match your available time and ingredients.',
    },
    {
      icon: ChefHat,
      title: 'Recipe Discovery',
      description: 'Explore thousands of recipes from around the world.',
    },
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        'Browse 500+ recipes',
        'Save up to 50 favorites',
        'Join 1 family group',
        'Basic meal planning',
        'Basic nutrition tracking',
      ],
      cta: 'Get Started',
      href: '/register',
      popular: false,
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: '/month',
      description: 'For serious meal planners',
      features: [
        'Unlimited favorites',
        'Unlimited family groups',
        'Advanced meal planning',
        'AI meal assistant (100/mo)',
        'Shopping list generation',
        'Nutrition dashboard',
        'No ads',
      ],
      cta: 'Start Free Trial',
      href: '/register',
      popular: true,
    },
    {
      name: 'Family',
      price: '$14.99',
      period: '/month',
      description: 'For households',
      features: [
        'Everything in Premium',
        'Up to 6 family members',
        'Shared meal plans',
        'Collaborative shopping',
        'Family nutrition reports',
        'Priority support',
      ],
      cta: 'Choose Family',
      href: '/register',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">NutriGuide</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Healthy Meals Made{' '}
              <span className="text-emerald-600">Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover delicious recipes, plan your meals, and track your nutrition with AI-powered recommendations. Perfect for individuals and families.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-colors"
              >
                Start Free Trial
              </Link>
              <a
                href="#features"
                className="bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-colors"
              >
                Learn More
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-500">14-day free trial • No credit card required</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-emerald-600">500+</div>
              <div className="text-gray-600 mt-1">Curated Recipes</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-600">50K+</div>
              <div className="text-gray-600 mt-1">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-600">1M+</div>
              <div className="text-gray-600 mt-1">Meals Planned</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-600">4.9</div>
              <div className="text-gray-600 mt-1">App Store Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              NutriGuide combines powerful features to help you eat healthier, save time, and enjoy cooking.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your needs. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 ${
                  plan.popular
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-200'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <span className="inline-block bg-emerald-500 text-white text-sm font-medium px-3 py-1 rounded-full mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.popular ? 'text-emerald-100' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className={plan.popular ? 'text-emerald-100' : 'text-gray-500'}>{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <svg
                        className={`w-5 h-5 ${plan.popular ? 'text-emerald-200' : 'text-emerald-600'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={plan.popular ? 'text-white' : 'text-gray-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.href}
                  className={`block text-center py-3 rounded-xl font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-white text-emerald-600 hover:bg-gray-100'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Meal Planning?
          </h2>
          <p className="text-gray-600 mb-8">
            Join thousands of families who are eating healthier and saving time with NutriGuide.
          </p>
          <Link
            to="/register"
            className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-colors inline-block"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">NutriGuide</span>
            </div>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <a href="mailto:support@nutriguide.app" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            © 2026 NutriGuide. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
