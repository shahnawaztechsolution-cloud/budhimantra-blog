import React, { useState, useEffect } from 'react';
import { Mail, X, BellRing } from 'lucide-react';

export default function NewsletterPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    // Check if user already subscribed or closed it
    const hasSeenPopup = localStorage.getItem('buddhimantra_newsletter');
    if (!hasSeenPopup) {
      // Show popup after 10 seconds of reading an article
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Simulate API call to save email
    setTimeout(() => {
      setSubscribed(true);
      localStorage.setItem('buddhimantra_newsletter', 'subscribed');
      
      // Close popup after a delay
      setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    }, 1000);
  };

  const handleClose = () => {
    setShowPopup(false);
    localStorage.setItem('buddhimantra_newsletter', 'closed');
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300 relative">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-1"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BellRing size={32} className="text-blue-600 animate-pulse" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">क्या आप ऐसे वायरल आर्टिकल्स रोज पढ़ना चाहते हैं?</h2>
          <p className="text-gray-600 mb-6">
            अपना ईमेल डालें और हर दिन सबसे रहस्यमयी और ज्ञानवर्धक कहानियां सीधे अपने इनबॉक्स में पाएं।
          </p>

          {subscribed ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 flex items-center justify-center gap-2 font-medium">
              🎉 बधाई हो! आप सब्सक्राइब हो चुके हैं।
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="अपना ईमेल आईडी डालें"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                हाँ, मुझे रोज़ पढ़ना है!
              </button>
            </form>
          )}
          
          <button 
            onClick={handleClose}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline underline-offset-4"
          >
            नहीं, धन्यवाद
          </button>
        </div>
      </div>
    </div>
  );
}
