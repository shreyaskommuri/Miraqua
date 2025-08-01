
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { NotificationBadge } from "@/components/ui/NotificationBadge";
import {
  Bell,
  BarChart3,
  Settings,
  Search,
  Wifi,
  WifiOff
} from "lucide-react";

interface HomeHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  searchQuery,
  onSearchChange
}) => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notifications] = useState(3); // Mock notification count

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getCurrentWeather = () => {
    // Dynamic weather based on time and randomization for demo
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour <= 18;
    const baseTemp = isDay ? 70 + Math.sin((hour - 6) * Math.PI / 12) * 8 : 65;
    const temp = Math.round(baseTemp + (Math.random() - 0.5) * 6);
    
    const conditions = isDay 
      ? [
          { condition: "Sunny", icon: "☀️", chance: 0.4 },
          { condition: "Partly Cloudy", icon: "⛅", chance: 0.3 },
          { condition: "Clear", icon: "🌤️", chance: 0.3 }
        ]
      : [
          { condition: "Clear", icon: "🌙", chance: 0.5 },
          { condition: "Cloudy", icon: "☁️", chance: 0.3 },
          { condition: "Cool", icon: "🌃", chance: 0.2 }
        ];
    
    const random = Math.random();
    let selectedCondition = conditions[0];
    let cumulative = 0;
    
    for (const cond of conditions) {
      cumulative += cond.chance;
      if (random <= cumulative) {
        selectedCondition = cond;
        break;
      }
    }
    
    return {
      temperature: temp,
      condition: selectedCondition.condition,
      humidity: Math.round(60 + Math.random() * 20),
      icon: selectedCondition.icon
    };
  };

  const weather = getCurrentWeather();

  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        
        {/* Welcome Header */}
        <div className="px-6 pt-8 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {getGreeting()}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Your gardens are looking great today
              </p>
            </div>
            
            {/* Weather Widget */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20 glass hover-lift animate-slide-in-left">
              <div className="flex items-center space-x-3">
                <span className="text-2xl animate-bounce-subtle">{weather.icon}</span>
                <div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {weather.temperature}°F
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {weather.condition} • {weather.humidity}% humidity
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search */}
        <div className="px-6 pb-6">
          <div className="relative animate-fade-in">
            <Input
              type="text"
              placeholder="Search plots, crops, or locations..."
              className="pl-10 pr-4 rounded-xl mobile-text focus-ring glass"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted rounded-full"
              >
                ×
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
