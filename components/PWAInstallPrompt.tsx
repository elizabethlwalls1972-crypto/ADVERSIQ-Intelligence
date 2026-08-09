import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const AppInstallPrompt: React.FC = () => {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setPromptEvent(null);
      setIsDismissed(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!promptEvent) {
      return;
    }
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === 'accepted') {
      setIsDismissed(true);
    }
    setPromptEvent(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (isInstalled || isDismissed || !promptEvent) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-stone-900 to-stone-800 border-t border-stone-700 px-4 py-3 md:py-2">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
        <div className="flex items-start md:items-center gap-3 flex-1">
          <Download className="w-4 h-4 md:w-5 md:h-5 text-stone-300 flex-shrink-0 mt-0.5 md:mt-0" />
          <div className="flex flex-col gap-0.5">
            <p className="text-xs md:text-sm font-semibold text-stone-200">Install BW Nexus AI</p>
            <p className="text-xs text-stone-400">Get the full consultant experience from your home screen.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleInstallClick}
            className="flex-1 md:flex-none inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs md:text-sm font-semibold text-white transition-colors"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="inline-flex items-center justify-center p-2 hover:bg-stone-700 rounded-lg transition-colors text-stone-400 hover:text-stone-200"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppInstallPrompt;
