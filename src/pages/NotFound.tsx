import { Link } from 'react-router-dom';
import { ChefHat, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ChefHat className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
