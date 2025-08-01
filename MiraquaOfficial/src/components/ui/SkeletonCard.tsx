import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface SkeletonCardProps {
  showHeader?: boolean;
  lines?: number;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  showHeader = true, 
  lines = 3,
  className = ""
}) => {
  return (
    <Card className={`animate-fade-in ${className}`}>
      {showHeader && (
        <CardHeader className="space-y-2">
          <div className="skeleton-text h-4 w-3/4"></div>
          <div className="skeleton-text h-3 w-1/2"></div>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={`skeleton-text h-3 ${
            i === lines - 1 ? 'w-2/3' : 'w-full'
          }`}></div>
        ))}
        <div className="flex space-x-2 pt-2">
          <div className="skeleton-text h-8 w-16 rounded-full"></div>
          <div className="skeleton-text h-8 w-16 rounded-full"></div>
        </div>
      </CardContent>
    </Card>
  );
};