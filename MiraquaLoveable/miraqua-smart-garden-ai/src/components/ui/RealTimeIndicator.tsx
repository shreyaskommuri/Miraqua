import React from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Circle } from "lucide-react";

interface RealTimeIndicatorProps {
  isConnected: boolean;
  lastUpdate?: Date;
  className?: string;
}

export const RealTimeIndicator: React.FC<RealTimeIndicatorProps> = ({ 
  isConnected, 
  lastUpdate,
  className = ""
}) => {
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        {isConnected ? (
          <>
            <Circle className="w-2 h-2 fill-success text-success animate-pulse" />
            <Wifi className="w-3 h-3 text-success" />
          </>
        ) : (
          <>
            <Circle className="w-2 h-2 fill-destructive text-destructive" />
            <WifiOff className="w-3 h-3 text-destructive" />
          </>
        )}
      </div>
      
      <Badge variant={isConnected ? "secondary" : "destructive"} className="text-xs">
        {isConnected ? 'Live' : 'Offline'}
      </Badge>
      
      {lastUpdate && (
        <span className="text-xs text-muted-foreground">
          {getTimeAgo(lastUpdate)}
        </span>
      )}
    </div>
  );
};