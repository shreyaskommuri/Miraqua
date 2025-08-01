
import React from 'react';
import { Card, CardContent } from './card';
import { Progress } from './progress';
import { Droplets, TrendingUp, TrendingDown, Clock, MapPin } from 'lucide-react';

interface GlobalStatsPanelProps {
  totalWaterUsed: number;
  avgMoisture: number;
  nextWateringIn: string;
  activePlots: number;
  waterSavings: number;
  moistureTrend: 'up' | 'down' | 'stable';
}

export const GlobalStatsPanel: React.FC<GlobalStatsPanelProps> = ({
  totalWaterUsed,
  avgMoisture,
  nextWateringIn,
  activePlots,
  waterSavings,
  moistureTrend
}) => {
  const stats = [
    {
      label: 'Active Plots',
      value: activePlots.toString(),
      icon: MapPin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Water Used',
      value: `${totalWaterUsed}L`,
      subtext: 'This week',
      icon: Droplets,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Avg Moisture',
      value: `${avgMoisture}%`,
      icon: moistureTrend === 'up' ? TrendingUp : TrendingDown,
      color: moistureTrend === 'up' ? 'text-green-600' : 'text-orange-600',
      bgColor: moistureTrend === 'up' ? 'bg-green-100' : 'bg-orange-100'
    },
    {
      label: 'Next Watering',
      value: nextWateringIn,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                {stat.label === 'Avg Moisture' && (
                  <div className={`text-xs font-medium ${stat.color}`}>
                    {moistureTrend === 'up' ? '+5%' : '-3%'}
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.subtext || stat.label}</div>
              {stat.label === 'Avg Moisture' && (
                <Progress value={avgMoisture} className="h-2 mt-2" />
              )}
            </CardContent>
          </Card>
        );
      })}
      
      {/* Water Savings Highlight */}
      <Card className="col-span-2 lg:col-span-4 border-0 shadow-lg bg-gradient-to-r from-green-500 to-blue-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90 mb-1">💡 Smart Savings</div>
              <div className="text-2xl font-bold">{waterSavings}% water saved</div>
              <div className="text-sm opacity-90">vs traditional irrigation</div>
            </div>
            <div className="text-4xl opacity-80">🌱</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
