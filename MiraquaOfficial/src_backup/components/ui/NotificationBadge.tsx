import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  className?: string;
  showZero?: boolean;
  maxCount?: number;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count, 
  className,
  showZero = false,
  maxCount = 99
}) => {
  if (count === 0 && !showZero) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <Badge 
      variant="destructive" 
      className={cn(
        "notification-badge min-w-[1.5rem] h-6 flex items-center justify-center px-1 text-xs font-medium",
        count > 0 && "animate-bounce-subtle",
        className
      )}
    >
      {displayCount}
    </Badge>
  );
};