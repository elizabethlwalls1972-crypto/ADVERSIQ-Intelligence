import React, { useEffect, useState } from 'react';
import { Download, Apple, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const AppInstallButton: React.FC = () => {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setPromptEvent(null);
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
      setIsInstalled(true);
    }
    setPromptEvent(null);
  };

  if (isInstalled) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 text-sm font-semibold cursor-default"
      >
        <Download className="w-4 h-4" />
        App Installed
      </button>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {promptEvent && (
        <button
          onClick={handleInstallClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <Download className="w-4 h-4" />
          Install App
        </button>
      )}
      
      <a
        href="https://apps.apple.com"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-sm font-semibold transition-colors"
        title="Download from Apple App Store"
      >
        <Apple className="w-4 h-4" />
        iOS
      </a>
      
      <a
        href="https://play.google.com/store"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-sm font-semibold transition-colors"
        title="Download from Google Play Store"
      >
        <Smartphone className="w-4 h-4" />
        Android
      </a>
    </div>
  );
};

export default AppInstallButton;
