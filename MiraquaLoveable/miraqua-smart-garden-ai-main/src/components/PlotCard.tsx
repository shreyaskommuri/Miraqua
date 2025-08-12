
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Droplets, 
  Thermometer, 
  Sun, 
  MapPin, 
  Clock, 
  Play,
  Wifi,
  WifiOff,
  Heart,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Plot, waterPlot } from '@/services/mockDataService';
import { useToast } from '@/hooks/use-toast';

interface PlotCardProps {
  plot: Plot;
}

const PlotCard: React.FC<PlotCardProps> = ({ plot }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCardClick = () => {
    navigate(`/app/plot/${plot.id}`);
  };

  const handleWaterNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await waterPlot(plot.id);
      toast({
        title: "Watering Started",
        description: `${plot.name} is now being watered.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start watering. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/app/plot/${plot.id}/settings`);
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getHealthBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
    return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
  };

  return (
    <Card 
      className="glass border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 animate-fade-in-up"
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plot.name}</h3>
              <div className="relative">
                {plot.isOnline ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleSettings}
              >
                <Settings className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              {plot.crop} {plot.variety && `• ${plot.variety}`}
            </p>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <MapPin className="w-3 h-3 mr-1" />
              {plot.location}
            </div>
          </div>
          <Badge className={`${getHealthBadgeColor(plot.healthScore)} text-xs`}>
            <Heart className="w-3 h-3 mr-1" />
            {plot.healthScore}%
          </Badge>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {plot.currentMoisture}%
              </span>
            </div>
            <Progress value={plot.currentMoisture} className="h-2 mb-1" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Moisture</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {plot.currentTemp}°F
              </span>
            </div>
            <Progress value={(plot.currentTemp - 32) * 1.8} className="h-2 mb-1" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Temperature</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <Sun className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {plot.currentSunlight}%
              </span>
            </div>
            <Progress value={plot.currentSunlight} className="h-2 mb-1" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Sunlight</p>
          </div>
        </div>

        {/* Next Watering Info */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                <Clock className="w-4 h-4" />
                <span>Next: {plot.nextWatering}</span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Last watered: {plot.lastWatered}
              </p>
            </div>
            {plot.currentMoisture < 50 && (
              <Button
                size="sm"
                onClick={handleWaterNow}
                className="bg-blue-600 hover:bg-blue-700 text-white btn-modern"
              >
                <Play className="w-3 h-3 mr-1" />
                Water
              </Button>
            )}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${plot.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-gray-600 dark:text-gray-300">
              {plot.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className={`font-medium ${getHealthColor(plot.healthScore)}`}>
            Health: {plot.healthScore}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlotCard;
