import React from 'react';
import { Button, Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export const UpdateBanner: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <Card className="fixed top-4 left-1/2 -translate-x-1/2 z-50 shadow-lg" style={{ minWidth: '300px' }}>
      <CardBody className="flex flex-row items-center justify-between gap-3 p-3 bg-primary-50">
        <div className="flex items-center gap-2">
          <Icon icon="lucide:refresh-cw" width={20} className="text-primary" />
          <p className="text-sm font-medium">New update available</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="light" onPress={() => setNeedRefresh(false)}>
            Dismiss
          </Button>
          <Button size="sm" color="primary" onPress={() => updateServiceWorker(true)}>
            Reload
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
