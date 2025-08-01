import { useState, useEffect, useCallback } from 'react';
import { Plot } from '@/services/mockDataService';

interface RealTimeUpdate {
  type: 'moisture' | 'status' | 'watering' | 'alert';
  plotId: string;
  data: any;
  timestamp: Date;
}

export const useRealTimeUpdates = (plots: Plot[]) => {
  const [updates, setUpdates] = useState<RealTimeUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Simulate WebSocket connection
  const simulateRealTimeUpdates = useCallback(() => {
    if (plots.length === 0) return;

    const interval = setInterval(() => {
      const randomPlot = plots[Math.floor(Math.random() * plots.length)];
      
      // Generate random update
      const updateTypes: RealTimeUpdate['type'][] = ['moisture', 'status', 'watering'];
      const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
      
      let updateData;
      switch (randomType) {
        case 'moisture':
          updateData = {
            currentMoisture: Math.floor(Math.random() * 100),
            previousMoisture: randomPlot.currentMoisture
          };
          break;
        case 'status':
          const statuses = ['healthy', 'needs-attention', 'watering'];
          updateData = {
            newStatus: statuses[Math.floor(Math.random() * statuses.length)],
            previousHealthScore: randomPlot.healthScore
          };
          break;
        case 'watering':
          updateData = {
            action: Math.random() > 0.5 ? 'started' : 'completed',
            duration: Math.floor(Math.random() * 30) + 5
          };
          break;
      }

      const update: RealTimeUpdate = {
        type: randomType,
        plotId: randomPlot.id,
        data: updateData,
        timestamp: new Date()
      };

      setUpdates(prev => [update, ...prev.slice(0, 9)]); // Keep last 10 updates
    }, 5000 + Math.random() * 10000); // Random interval 5-15 seconds

    return interval;
  }, [plots]);

  useEffect(() => {
    setIsConnected(true);
    const interval = simulateRealTimeUpdates();
    
    return () => {
      if (interval) clearInterval(interval);
      setIsConnected(false);
    };
  }, [simulateRealTimeUpdates]);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  const getPlotUpdates = useCallback((plotId: string) => {
    return updates.filter(update => update.plotId === plotId);
  }, [updates]);

  return {
    updates,
    isConnected,
    clearUpdates,
    getPlotUpdates
  };
};