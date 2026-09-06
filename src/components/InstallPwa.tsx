import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPwa() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      // Only show banner after a few seconds so it's not too aggressive
      setTimeout(() => setShowInstallBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    setShowInstallBanner(false);
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
    }
  };

  if (!showInstallBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50 animate-in slide-in-from-bottom">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-xl shadow-inner">
              B
            </div>
            <div>
              <h3 className="font-bold text-gray-900 leading-tight">Buddhimantra App</h3>
              <p className="text-xs text-gray-500 mt-0.5">Install on your phone for fast access!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleInstall}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Download size={16} />
              Install
            </button>
            <button 
              onClick={() => setShowInstallBanner(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
