import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Smartphone, Wifi, Bell } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay (don't interrupt user immediately)
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Check for iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isIOS && !isInStandaloneMode) {
      const dismissed = localStorage.getItem('pwa-ios-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowIOSInstructions(true), 5000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const handleIOSDismiss = () => {
    setShowIOSInstructions(false);
    localStorage.setItem('pwa-ios-dismissed', 'true');
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Standard Install Prompt */}
      <AnimatePresence>
        {showPrompt && deferredPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
          >
            <div className="glass rounded-2xl p-5 shadow-elevated border border-white/20">
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-stone-100 transition-colors"
              >
                <X className="w-4 h-4 text-stone-400" />
              </button>
              
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <Download className="w-7 h-7 text-white" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-stone-800 mb-1">Install NutriGuide</h3>
                  <p className="text-sm text-stone-600 mb-3">
                    Add to your home screen for quick access and offline use!
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                      <Wifi className="w-3 h-3" /> Works offline
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                      <Bell className="w-3 h-3" /> Notifications
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full">
                      <Smartphone className="w-3 h-3" /> Native feel
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleInstall}
                      className="flex-1 px-4 py-2 gradient-primary text-white font-semibold rounded-xl shadow-glow hover:shadow-lg transition-all"
                    >
                      Install App
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="px-4 py-2 text-stone-600 font-medium hover:bg-stone-100 rounded-xl transition-colors"
                    >
                      Later
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Instructions */}
      <AnimatePresence>
        {showIOSInstructions && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-4 left-4 right-4 z-50"
          >
            <div className="glass rounded-2xl p-5 shadow-elevated border border-white/20">
              <button
                onClick={handleIOSDismiss}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-stone-100 transition-colors"
              >
                <X className="w-4 h-4 text-stone-400" />
              </button>
              
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-7 h-7 text-white" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-stone-800 mb-1">Install NutriGuide</h3>
                  <p className="text-sm text-stone-600 mb-3">
                    To install on your iPhone/iPad:
                  </p>
                  
                  <ol className="text-sm text-stone-600 space-y-2 mb-4">
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">1</span>
                      Tap the <span className="font-semibold">Share</span> button <span className="text-lg">⬆️</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">2</span>
                      Scroll and tap <span className="font-semibold">"Add to Home Screen"</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">3</span>
                      Tap <span className="font-semibold">"Add"</span> to install
                    </li>
                  </ol>
                  
                  <button
                    onClick={handleIOSDismiss}
                    className="w-full px-4 py-2 text-stone-600 font-medium hover:bg-stone-100 rounded-xl transition-colors"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
