
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface RealTimeUpdate {
  type: 'sensor_data' | 'watering_status' | 'weather_alert' | 'schedule_change';
  plotId?: string;
  data: any;
  timestamp: Date;
}

interface RealTimeContextType {
  isConnected: boolean;
  updates: RealTimeUpdate[];
  sendMessage: (message: any) => void;
  clearUpdates: () => void;
}

const RealTimeContext = createContext<RealTimeContextType | null>(null);

interface RealTimeProviderProps {
  children: ReactNode;
}

export const RealTimeProvider: React.FC<RealTimeProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [updates, setUpdates] = useState<RealTimeUpdate[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // In production, this would connect to your WebSocket server
    // For demo purposes, we'll simulate with a mock connection
    const mockWs = {
      send: (data: string) => {/* Mock WS send */},
      close: () => {/* Mock WS closed */},
      readyState: WebSocket.OPEN
    };

    setWs(mockWs as any);
    setIsConnected(true);

    // Simulate real-time updates
    const simulateUpdates = () => {
      const updateTypes = ['sensor_data', 'watering_status', 'weather_alert', 'schedule_change'] as const;
      
      const mockUpdates = [
        {
          type: 'sensor_data' as const,
          plotId: '1',
          data: { moisture: Math.floor(Math.random() * 40) + 40, temperature: Math.floor(Math.random() * 10) + 70 },
          timestamp: new Date()
        },
        {
          type: 'watering_status' as const,
          plotId: '2',
          data: { status: 'started', duration: 15, estimatedEnd: new Date(Date.now() + 15 * 60000) },
          timestamp: new Date()
        },
        {
          type: 'weather_alert' as const,
          data: { type: 'rain_incoming', message: 'Rain expected in 2 hours - adjusting schedule' },
          timestamp: new Date()
        },
        {
          type: 'schedule_change' as const,
          plotId: '3',
          data: { change: 'skipped', reason: 'High soil moisture detected' },
          timestamp: new Date()
        }
      ];

      let updateIndex = 0;
      const interval = setInterval(() => {
        if (updateIndex < mockUpdates.length) {
          setUpdates(prev => [mockUpdates[updateIndex], ...prev.slice(0, 9)]); // Keep last 10 updates
          updateIndex++;
        } else {
          clearInterval(interval);
        }
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    };

    const cleanup = simulateUpdates();
    
    return () => {
      cleanup();
      if (mockWs) {
        mockWs.close();
      }
    };
  }, []);

  const sendMessage = (message: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  };

  const clearUpdates = () => {
    setUpdates([]);
  };

  const value: RealTimeContextType = {
    isConnected,
    updates,
    sendMessage,
    clearUpdates
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};

// Component to display real-time updates
interface RealTimeIndicatorProps {
  className?: string;
}

export const RealTimeIndicator: React.FC<RealTimeIndicatorProps> = ({ className = '' }) => {
  const { isConnected, updates } = useRealTime();
  const latestUpdate = updates[0];

  if (!isConnected) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="text-xs text-red-600">Offline</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span className="text-xs text-green-600">Live</span>
      {latestUpdate && (
        <span className="text-xs text-gray-500">
          {latestUpdate.type.replace('_', ' ')} {Math.floor((Date.now() - latestUpdate.timestamp.getTime()) / 1000)}s ago
        </span>
      )}
    </div>
  );
};

// Hook for plot-specific updates
export const usePlotUpdates = (plotId: string) => {
  const { updates } = useRealTime();
  
  const plotUpdates = updates.filter(update => update.plotId === plotId);
  const latestSensorData = plotUpdates.find(update => update.type === 'sensor_data')?.data;
  const wateringStatus = plotUpdates.find(update => update.type === 'watering_status')?.data;
  
  return {
    sensorData: latestSensorData,
    wateringStatus,
    allUpdates: plotUpdates
  };
};
