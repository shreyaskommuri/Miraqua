
import { useState, useEffect } from 'react';

interface OfflineAction {
  id: string;
  type: 'watering' | 'observation' | 'photo' | 'settings';
  plotId: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

export const useOfflineData = () => {
  const [offlineActions, setOfflineActions] = useState<OfflineAction[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Load offline actions from localStorage
    const stored = localStorage.getItem('miraqua-offline-actions');
    if (stored) {
      setOfflineActions(JSON.parse(stored));
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineActions();
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addOfflineAction = (action: Omit<OfflineAction, 'id' | 'timestamp' | 'synced'>) => {
    const newAction: OfflineAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: Date.now(),
      synced: false
    };

    const updated = [...offlineActions, newAction];
    setOfflineActions(updated);
    localStorage.setItem('miraqua-offline-actions', JSON.stringify(updated));

    // Try to sync immediately if online
    if (isOnline) {
      syncOfflineActions();
    }
  };

  const syncOfflineActions = async () => {
    const unsyncedActions = offlineActions.filter(action => !action.synced);
    
    for (const action of unsyncedActions) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Mark as synced
        action.synced = true;
        // Synced offline action
      } catch (error) {
        // Failed to sync action
      }
    }

    // Update localStorage
    const updated = offlineActions.map(action => 
      unsyncedActions.find(ua => ua.id === action.id) 
        ? { ...action, synced: true } 
        : action
    );
    
    setOfflineActions(updated);
    localStorage.setItem('miraqua-offline-actions', JSON.stringify(updated));
  };

  const getPendingActionsCount = () => {
    return offlineActions.filter(action => !action.synced).length;
  };

  return {
    isOnline,
    offlineActions,
    addOfflineAction,
    syncOfflineActions,
    getPendingActionsCount
  };
};
