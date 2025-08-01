
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useOfflineData } from '@/hooks/useOfflineData';

const NetworkStatus: React.FC = () => {
  const { isOnline, getPendingActionsCount } = useOfflineData();
  const [showStatus, setShowStatus] = useState(false);
  const pendingCount = getPendingActionsCount();

  useEffect(() => {
    if (!isOnline || pendingCount > 0) {
      setShowStatus(true);
      const timer = setTimeout(() => {
        if (isOnline && pendingCount === 0) {
          setShowStatus(false);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingCount]);

  if (!showStatus) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className={`border ${isOnline ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardContent className="p-3">
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${isOnline ? 'text-green-800' : 'text-red-800'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
            {pendingCount > 0 && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {pendingCount} pending
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkStatus;
