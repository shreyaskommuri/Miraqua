
import React from "react";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

interface LoadingScreenProps {
  retryCount: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ retryCount }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header skeleton */}
      <div className="px-6 pt-8 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton-text h-8 w-48"></div>
            <div className="skeleton-text h-5 w-64"></div>
          </div>
          <div className="skeleton-text h-20 w-24 rounded-2xl"></div>
        </div>
        <div className="skeleton-text h-10 w-full rounded-xl"></div>
      </div>

      {/* Stats skeleton */}
      <div className="px-6 pb-6">
        <div className="skeleton-text h-24 w-full rounded-2xl mb-6"></div>
        
        {/* Grid skeleton */}
        <div className="space-y-4">
          <div className="skeleton-text h-6 w-32"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Loading gardens... {retryCount > 0 && `(${retryCount}/3)`}
          </span>
        </div>
      </div>
    </div>
  );
};
