import { Check } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const NotificationBanner: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showButton, setShowButton] = useState(false);

  // Handle notification display
  useEffect(() => {
    const handleShowNotification = (e: CustomEvent) => {
      const { message, showButton } = e.detail;
      setMessage(message);
      setIsVisible(true);
      setShowButton(!!showButton);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    const handleHideNotification = () => {
      setIsVisible(false);
    };

    window.addEventListener('showNotification', handleShowNotification as EventListener);
    window.addEventListener('hideNotification', handleHideNotification);

    return () => {
      window.removeEventListener('showNotification', handleShowNotification as EventListener);
      window.removeEventListener('hideNotification', handleHideNotification);
    };
  }, []);

  // Handle update status
  useEffect(() => {
    if (isUpdating) {
      const timer = setTimeout(() => {
        setIsUpdating(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isUpdating]);

  if (!isVisible || !message) return null;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 p-4 transition-all duration-300 ${
        isUpdating ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
      } shadow-lg rounded-b-xl animate-fade-in-down`}
      style={{ 
        transform: isUpdating ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease, opacity 0.3s ease'
      }}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            {isUpdating ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Check className="h-5 w-5 text-white" />
            )}
          </div>
          <div>
            <p className="font-medium">{message}</p>
            {showButton && (
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('hideNotification'))}
                className="mt-1 text-sm text-blue-200 hover:text-white"
              >
                Fechar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;