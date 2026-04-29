import { Link } from 'react-router-dom';
import { 
  ChefHat, 
  Heart, 
  Users, 
  Calendar, 
  ShoppingCart, 
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from 'lucide-react';

const quickLinks = [
  { name: 'Home', href: '/', icon: null },
  { name: 'Recipes', href: '/recipes', icon: null },
  { name: 'Meal Planner', href: '/meal-planner', icon: null },
  { name: 'Shopping Lists', href: '/shopping-lists', icon: null },
  { name: 'AI Assistant', href: '/ai-assistant', icon: null },
];

const categoryLinks = [
  { name: 'Breakfast', href: '/recipes?category=breakfast' },
  { name: 'Lunch', href: '/recipes?category=lunch' },
  { name: 'Dinner', href: '/recipes?category=dinner' },
  { name: 'Snacks', href: '/recipes?category=snacks' },
  { name: 'Juices', href: '/recipes?category=juices' },
  { name: 'Smoothies', href: '/recipes?category=smoothies' },
];

const supportLinks = [
  { name: 'Help Center', href: '/help' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
  { name: 'Contact Us', href: '/contact' },
];

const socialLinks = [
  { name: 'Facebook', href: '#', icon: Facebook },
  { name: 'Twitter', href: '#', icon: Twitter },
  { name: 'Instagram', href: '#', icon: Instagram },
  { name: 'Youtube', href: '#', icon: Youtube },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-stone-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">NutriGuide</span>
            </Link>
            <p className="text-sm text-stone-400 mb-4 leading-relaxed">
              Your personal meal planning assistant. Discover healthy recipes, 
              plan your meals, and achieve your nutrition goals with AI-powered recommendations.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-9 h-9 bg-stone-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-stone-400 hover:text-emerald-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              {categoryLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-stone-400 hover:text-emerald-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 mb-6">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-stone-400 hover:text-emerald-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <a 
                href="mailto:support@nutriguide.com" 
                className="flex items-center gap-2 text-sm text-stone-400 hover:text-emerald-400 transition-colors"
              >
                <Mail className="w-4 h-4" />
                support@nutriguide.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-stone-500">
              © {currentYear} NutriGuide. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-stone-500">
              <Link to="/privacy" className="hover:text-stone-300 transition-colors">
                Privacy
              </Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-stone-300 transition-colors">
                Terms
              </Link>
              <span>•</span>
              <Link to="/cookies" className="hover:text-stone-300 transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
