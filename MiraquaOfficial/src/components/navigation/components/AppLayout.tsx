
import React from "react";
import AdvancedNavigation from "@/components/navigation/AdvancedNavigation";
import NetworkStatus from "@/components/ui/NetworkStatus";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => (
  <div className="flex h-screen bg-background">
    <AdvancedNavigation />
    <div className="flex-1 overflow-hidden lg:ml-64">
      <NetworkStatus />
      <div className="h-full overflow-y-auto pt-16 lg:pt-0">
        {children}
      </div>
    </div>
  </div>
);
