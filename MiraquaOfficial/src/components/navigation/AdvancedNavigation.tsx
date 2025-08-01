
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Home, 
  BarChart3, 
  Map, 
  MessageSquare, 
  User, 
  Settings,
  Bell,
  Wifi,
  WifiOff,
  Menu,
  X,
  Plus,
  Zap,
  Target,
  Users,
  Shield,
  Store,
  Camera,
  Leaf,
  Sprout
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: number;
  subItems?: NavItem[];
}

const navigationItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, path: '/app/home' },
  { 
    id: 'analytics', 
    label: 'AI Analytics', 
    icon: BarChart3, 
    path: '/app/analytics',
    subItems: [
      { id: 'predictive', label: 'Predictive Dashboard', icon: Target, path: '/app/analytics/predictive' },
      { id: 'anomalies', label: 'Anomaly Alerts', icon: Zap, path: '/app/analytics/anomalies' },
      { id: 'plant-health', label: 'Plant Health Scanner', icon: Camera, path: '/app/analytics/plant-health' },
      { id: 'yield', label: 'Yield Forecast', icon: Leaf, path: '/app/analytics/yield' }
    ]
  },
  { id: 'map', label: 'Smart Map', icon: Map, path: '/app/map' },
  { id: 'chat', label: 'AI Assistant', icon: MessageSquare, path: '/app/chat', badge: 3 },
  { id: 'community', label: 'Community', icon: Users, path: '/app/community' },
  { id: 'marketplace', label: 'Marketplace', icon: Store, path: '/app/marketplace', badge: 2 },
  { id: 'account', label: 'Account', icon: User, path: '/app/account' }
];

const AdvancedNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const renderNavItem = (item: NavItem, isSubItem = false) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems.includes(item.id);

    return (
      <div key={item.id} className={cn("w-full", isSubItem && "ml-4")}>
        <div
          className={cn(
            "flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer group focus-ring",
            active 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "text-foreground hover:bg-accent hover:text-accent-foreground",
            isSubItem && "py-2 text-sm"
          )}
          onClick={() => {
            if (hasSubItems) {
              toggleExpanded(item.id);
            } else {
              handleNavigation(item.path);
            }
          }}
        >
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-1.5 rounded-md transition-all duration-200",
              active 
                ? "bg-primary-foreground/20" 
                : "bg-muted group-hover:bg-background",
              isSubItem && "p-1"
            )}>
              <Icon className={cn(
                "w-4 h-4 transition-colors duration-200",
                active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground",
                isSubItem && "w-3.5 h-3.5"
              )} />
            </div>
            <span className={cn(
              "font-medium transition-colors duration-200",
              active ? "text-primary-foreground" : "text-foreground"
            )}>
              {item.label}
            </span>
            {item.badge && (
              <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {item.badge}
              </Badge>
            )}
          </div>
          {hasSubItems && (
            <div className={cn(
              "transform transition-transform duration-200 text-gray-400",
              isExpanded ? "rotate-90" : "rotate-0"
            )}>
              ▶
            </div>
          )}
        </div>
        
        {hasSubItems && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.subItems!.map(subItem => renderNavItem(subItem, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(true)}
              className="p-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sprout className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">Miraqua</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {isOnline ? (
                <Wifi className="w-3 h-3 text-success" />
              ) : (
                <WifiOff className="w-3 h-3 text-red-500" />
              )}
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
            <Button variant="ghost" size="sm" className="relative p-2" onClick={() => handleNavigation('/app/notifications')}>
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 text-xs rounded-full flex items-center justify-center">
                3
              </Badge>
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:dark:bg-gray-900 lg:dark:border-gray-700 lg:z-40">
        <div className="flex items-center h-16 border-b border-gray-200 dark:border-gray-700 px-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sprout className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Miraqua</span>
          </div>
        </div>
        
        <ScrollArea className="flex-1 px-4 py-4">
          <div className="space-y-1">
            {navigationItems.map(item => renderNavItem(item))}
          </div>
          
          {/* Quick Actions */}
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 px-2">QUICK ACTIONS</div>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start text-left h-auto py-2"
                onClick={() => handleNavigation('/app/add-plot')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Plot
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-left h-auto py-2"
                onClick={() => handleNavigation('/app/analytics/plant-health')}
              >
                <Camera className="w-4 h-4 mr-2" />
                Scan Plants
              </Button>
            </div>
          </div>
        </ScrollArea>
        
        {/* Status Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isOnline ? "bg-success" : "bg-destructive"
              )}></div>
              <span className="text-gray-600 dark:text-gray-400 text-xs">
                {isOnline ? "System Online" : "Offline Mode"}
              </span>
            </div>
            <Shield className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative flex flex-col w-80 max-w-full bg-white dark:bg-gray-900 shadow-xl">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Sprout className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">Miraqua</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1 px-4 py-4">
              <div className="space-y-1">
                {navigationItems.map(item => renderNavItem(item))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </>
  );
};

export default AdvancedNavigation;
