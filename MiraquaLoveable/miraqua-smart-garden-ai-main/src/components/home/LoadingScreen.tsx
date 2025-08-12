
import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  retryCount: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ retryCount }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Loading your gardens...</h3>
          <p className="text-gray-600 dark:text-gray-300">Please wait while we fetch your plot data</p>
          {retryCount > 0 && (
            <p className="text-sm text-yellow-600">Retrying... ({retryCount}/3)</p>
          )}
        </div>
      </div>
    </div>
  );
};
