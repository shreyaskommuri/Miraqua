import React, { useState, useRef, useCallback } from "react";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  disabled?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80,
  disabled = false
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);
  const startY = useRef<number>(0);
  const isAtTop = useRef<boolean>(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    startY.current = e.touches[0].clientY;
    isAtTop.current = window.scrollY === 0;
    setCanPull(isAtTop.current);
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!canPull || disabled || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);
    
    if (distance > 0 && window.scrollY === 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance * 0.5, threshold * 1.5));
    }
  }, [canPull, disabled, isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!canPull || disabled || isRefreshing) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    setCanPull(false);
  }, [canPull, disabled, isRefreshing, pullDistance, threshold, onRefresh]);

  const refreshProgress = Math.min(pullDistance / threshold, 1);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative overflow-hidden"
    >
      {/* Pull indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 bg-primary/10 backdrop-blur-sm z-10"
          style={{ 
            transform: `translateY(${Math.max(0, pullDistance - threshold)}px)`,
            opacity: Math.min(refreshProgress, 1)
          }}
        >
          <RefreshCw 
            className={`w-5 h-5 text-primary ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ 
              transform: `rotate(${refreshProgress * 180}deg)` 
            }}
          />
          <span className="ml-2 text-sm text-primary font-medium">
            {isRefreshing ? 'Refreshing...' : pullDistance >= threshold ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      )}
      
      {/* Content */}
      <div 
        className="pull-refresh"
        style={{ '--pull-distance': `${pullDistance}px` } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  );
};