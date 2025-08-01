
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wifi, Droplets, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { Plot } from "@/services/mockDataService";

interface HomeStatsProps {
  plots: Plot[];
}

export const HomeStats: React.FC<HomeStatsProps> = ({ plots }) => {
  const onlinePlots = plots.filter(p => p.isOnline).length;
  const avgMoisture = plots.length > 0 
    ? Math.round(plots.reduce((sum, p) => sum + p.currentMoisture, 0) / plots.length) 
    : 0;
  const avgHealth = plots.length > 0 
    ? Math.round(plots.reduce((sum, p) => sum + p.healthScore, 0) / plots.length) 
    : 0;

  const getMoistureStatus = (moisture: number) => {
    if (moisture >= 70) return { color: "text-green-600", bg: "bg-green-50", border: "border-green-200", trend: TrendingUp };
    if (moisture >= 40) return { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", trend: TrendingUp };
    return { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", trend: TrendingDown };
  };

  const getHealthStatus = (health: number) => {
    if (health >= 80) return { color: "text-green-600", bg: "bg-green-50", border: "border-green-200", trend: TrendingUp };
    if (health >= 60) return { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", trend: TrendingUp };
    return { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", trend: TrendingDown };
  };

  const moistureStatus = getMoistureStatus(avgMoisture);
  const healthStatus = getHealthStatus(avgHealth);

  return (
    <div className="grid grid-cols-3 gap-4 animate-fade-in">
      {/* Online Plots */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:shadow-xl transition-all duration-300 hover-scale">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
              <Wifi className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
            {onlinePlots}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            Online Plots
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {plots.length - onlinePlots} offline
          </div>
        </CardContent>
      </Card>

      {/* Average Moisture */}
      <Card className={`border-0 shadow-lg ${moistureStatus.bg} dark:from-blue-900/20 dark:to-blue-900/20 hover:shadow-xl transition-all duration-300 hover-scale ${moistureStatus.border}`}>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
              <Droplets className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className={`text-3xl font-bold ${moistureStatus.color} mb-1 flex items-center justify-center space-x-2`}>
            <span>{avgMoisture}%</span>
            <moistureStatus.trend className="w-5 h-5" />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            Avg Moisture
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {avgMoisture >= 70 ? "Excellent" : avgMoisture >= 40 ? "Good" : "Needs attention"}
          </div>
        </CardContent>
      </Card>

      {/* Average Health */}
      <Card className={`border-0 shadow-lg ${healthStatus.bg} dark:from-orange-900/20 dark:to-orange-900/20 hover:shadow-xl transition-all duration-300 hover-scale ${healthStatus.border}`}>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className={`text-3xl font-bold ${healthStatus.color} mb-1 flex items-center justify-center space-x-2`}>
            <span>{avgHealth}%</span>
            <healthStatus.trend className="w-5 h-5" />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            Avg Health
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {avgHealth >= 80 ? "Thriving" : avgHealth >= 60 ? "Healthy" : "Needs care"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
