
import React from 'react';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Progress } from './progress';
import { Droplets, Thermometer, Sun, MapPin, Clock, Play, AlertCircle } from 'lucide-react';
import { MiniMap } from './MiniMap';

interface PlotCardProps {
  plot: {
    id: number;
    name: string;
    crop: string;
    moisture: number;
    temperature: number;
    sunlight: number;
    nextWater: string;
    status: 'optimal' | 'needs-water' | 'overwatered' | 'attention';
    location: string;
    latitude: number;
    longitude: number;
    area?: number;
    lastWatered?: string;
  };
  onWaterNow?: (plotId: number) => void;
  onViewDetails?: (plotId: number) => void;
  showMap?: boolean;
  compact?: boolean;
}

export const PlotCard: React.FC<PlotCardProps> = ({
  plot,
  onWaterNow,
  onViewDetails,
  showMap = true,
  compact = false
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'optimal':
        return {
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: '✅',
          label: 'Optimal'
        };
      case 'needs-water':
        return {
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          icon: '💧',
          label: 'Needs Water'
        };
      case 'overwatered':
        return {
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: '⚠️',
          label: 'Overwatered'
        };
      case 'attention':
        return {
          color: 'bg-orange-100 text-orange-700 border-orange-200',
          icon: '👀',
          label: 'Attention'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: '📊',
          label: 'Unknown'
        };
    }
  };

  const statusConfig = getStatusConfig(plot.status);

  if (compact) {
    return (
      <Card 
        className="border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-150 cursor-pointer hover:scale-[1.02] m-3 p-4"
        onClick={() => onViewDetails?.(plot.id)}
      >
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900 text-base">{plot.name}</h3>
                <Badge className={`text-xs ${statusConfig.color}`}>
                  {statusConfig.icon} {statusConfig.label}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{plot.crop}</p>
              <p className="text-xs text-gray-500 flex items-center mt-1">
                <Clock className="w-3 h-3 mr-1" />
                Next: {plot.nextWater}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{plot.moisture}%</div>
                <div className="text-xs text-gray-500">Moisture</div>
              </div>
              {plot.status === 'needs-water' && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onWaterNow?.(plot.id);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  aria-label="Water Now, 5 minute default"
                >
                  <Play className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-150 cursor-pointer hover:scale-[1.02] m-3 p-4"
      onClick={() => onViewDetails?.(plot.id)}
    >
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{plot.name}</h3>
              <Badge className={`text-xs ${statusConfig.color}`}>
                {statusConfig.icon} {statusConfig.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">{plot.crop}</p>
            <p className="text-xs text-gray-500 flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {plot.location}
            </p>
            {plot.area && (
              <p className="text-xs text-gray-500">{plot.area} sq ft</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-blue-600">{plot.nextWater}</p>
            <p className="text-xs text-gray-500">Next water</p>
            {plot.lastWatered && (
              <p className="text-xs text-gray-400">Last: {plot.lastWatered}</p>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">{plot.moisture}%</span>
            </div>
            <Progress value={plot.moisture} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">Moisture</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">{plot.temperature}°F</span>
            </div>
            <Progress value={(plot.temperature - 50) * 2} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">Temperature</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <Sun className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">{plot.sunlight}%</span>
            </div>
            <Progress value={plot.sunlight} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">Sunlight</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          {showMap && (
            <div className="flex-1 mr-3">
              <MiniMap 
                latitude={plot.latitude}
                longitude={plot.longitude}
                plotName={plot.name}
                showControls={false}
                className="h-16"
              />
            </div>
          )}
          <div className="flex space-x-2">
            {plot.status === 'needs-water' && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onWaterNow?.(plot.id);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                aria-label="Water Now, 5 minute default"
              >
                <Play className="w-4 h-4 mr-1" />
                Water Now
              </Button>
            )}
            {plot.status === 'attention' && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails?.(plot.id);
                }}
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <AlertCircle className="w-4 h-4 mr-1" />
                Check
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
