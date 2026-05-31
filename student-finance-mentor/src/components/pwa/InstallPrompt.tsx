import React, { useEffect, useState } from 'react';
import { Button, Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  if (!showPrompt) return null;

  return (
    <Card className="fixed bottom-4 right-4 z-50 shadow-lg" style={{ maxWidth: '300px' }}>
      <CardBody className="flex flex-row items-center gap-3 p-3">
        <Icon icon="lucide:download" width={24} className="text-primary" />
        <div className="flex-1">
          <p className="text-sm font-semibold">Install App</p>
          <p className="text-tiny text-foreground-500">Install for offline access</p>
        </div>
        <div className="flex gap-2">
           <Button size="sm" variant="light" isIconOnly onPress={() => setShowPrompt(false)}>
             <Icon icon="lucide:x" width={16} />
           </Button>
           <Button size="sm" color="primary" onPress={handleInstallClick}>
             Install
           </Button>
        </div>
      </CardBody>
    </Card>
  );
};
