import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Star, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Shield
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { api } from '../lib/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

const getBrandIcon = (brand: string) => {
  const brandLower = brand.toLowerCase();
  switch (brandLower) {
    case 'visa':
      return '💳';
    case 'mastercard':
      return '💳';
    case 'amex':
      return '💳';
    default:
      return '💳';
  }
};

const getBrandColor = (brand: string) => {
  const brandLower = brand.toLowerCase();
  switch (brandLower) {
    case 'visa':
      return 'from-blue-500 to-blue-700';
    case 'mastercard':
      return 'from-red-500 to-orange-500';
    case 'amex':
      return 'from-blue-600 to-blue-800';
    default:
      return 'from-stone-600 to-stone-800';
  }
};

function AddCardForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setAsDefault, setSetAsDefault] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get setup intent
      const { clientSecret } = await api.getSetupIntent();

      // Confirm card setup
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (setupIntent?.payment_method) {
        // Save to our backend
        await api.addPaymentMethod(setupIntent.payment_method as string, setAsDefault);
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add card');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-2xl border border-stone-200 p-6 mb-6"
    >
      <h3 className="text-lg font-bold text-stone-800 mb-4">Add New Card</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#1c1917',
                  '::placeholder': {
                    color: '#a8a29e',
                  },
                },
                invalid: {
                  color: '#ef4444',
                },
              },
            }}
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={setAsDefault}
            onChange={(e) => setSetAsDefault(e.target.checked)}
            className="w-5 h-5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span className="text-stone-600">Set as default payment method</span>
        </label>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-stone-200 text-stone-600 font-medium rounded-xl hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || isLoading}
            className="flex-1 px-4 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Add Card
              </>
            )}
          </button>
        </div>
      </form>

      <div className="flex items-center gap-2 mt-4 text-xs text-stone-400">
        <Shield className="w-4 h-4" />
        Your card details are securely processed by Stripe
      </div>
    </motion.div>
  );
}

function PaymentMethodCard({ 
  method, 
  onSetDefault, 
  onDelete,
  isDeleting 
}: { 
  method: PaymentMethod; 
  onSetDefault: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-br ${getBrandColor(method.brand)}`}
    >
      {method.isDefault && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
          <Star className="w-3 h-3 fill-current" />
          Default
        </div>
      )}

      <div className="flex items-start justify-between mb-8">
        <div className="text-3xl">{getBrandIcon(method.brand)}</div>
        <span className="text-white/70 text-sm font-medium uppercase">{method.brand}</span>
      </div>

      <div className="mb-6">
        <div className="text-2xl font-mono tracking-widest">
          •••• •••• •••• {method.last4}
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs text-white/60 mb-1">Expires</div>
          <div className="font-medium">
            {String(method.expMonth).padStart(2, '0')}/{method.expYear}
          </div>
        </div>

        <div className="flex gap-2">
          {!method.isDefault && (
            <button
              onClick={onSetDefault}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              Set Default
            </button>
          )}
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-1.5 bg-white/20 hover:bg-red-500/80 rounded-lg transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const { paymentMethods } = await api.getPaymentMethods();
      setPaymentMethods(paymentMethods);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.setDefaultPaymentMethod(id);
      setPaymentMethods(methods => 
        methods.map(m => ({ ...m, isDefault: m.id === id }))
      );
      setMessage({ type: 'success', text: 'Default payment method updated' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update default' });
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.deletePaymentMethod(id);
      setPaymentMethods(methods => methods.filter(m => m.id !== id));
      setMessage({ type: 'success', text: 'Payment method removed' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
    loadPaymentMethods();
    setMessage({ type: 'success', text: 'Card added successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Payment Methods</h1>
          <p className="text-stone-500 mt-1">Manage your saved cards</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Card
          </button>
        )}
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              message.type === 'success' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <Elements stripe={stripePromise}>
        <AnimatePresence>
          {showAddForm && (
            <AddCardForm 
              onSuccess={handleAddSuccess}
              onCancel={() => setShowAddForm(false)}
            />
          )}
        </AnimatePresence>
      </Elements>

      {paymentMethods.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
          <CreditCard className="w-16 h-16 mx-auto text-stone-300 mb-4" />
          <h3 className="text-lg font-medium text-stone-600 mb-2">No payment methods</h3>
          <p className="text-stone-400 mb-6">Add a card to get started</p>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Your First Card
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {paymentMethods.map(method => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                onSetDefault={() => handleSetDefault(method.id)}
                onDelete={() => handleDelete(method.id)}
                isDeleting={deletingId === method.id}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="mt-8 p-4 bg-stone-50 rounded-xl border border-stone-100">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-stone-700 mb-1">Secure Payments</h4>
            <p className="text-sm text-stone-500">
              Your payment information is encrypted and securely processed by Stripe. 
              We never store your full card details on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
