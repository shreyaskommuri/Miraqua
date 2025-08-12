
import React, { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Droplets, Thermometer, Sun, Wifi, WifiOff } from 'lucide-react';

interface PlotMarker {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status: 'optimal' | 'needs-water' | 'attention';
  moisture: number;
  temperature: number;
  sensorStatus: 'online' | 'offline';
}

interface InteractiveMapProps {
  plots: PlotMarker[];
  onPlotSelect: (plot: PlotMarker) => void;
  selectedPlot?: PlotMarker | null;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ plots, onPlotSelect, selectedPlot }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 });
  const [zoom, setZoom] = useState(13);

  // Simulate interactive map behavior without external dependencies
  const handleMarkerClick = (plot: PlotMarker, event: React.MouseEvent) => {
    event.stopPropagation();
    onPlotSelect(plot);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-500';
      case 'needs-water': return 'bg-yellow-500';
      case 'attention': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const calculatePosition = (plot: PlotMarker, index: number) => {
    // Convert lat/lng to pixel positions (simplified)
    const centerLat = 37.7749;
    const centerLng = -122.4194;
    
    const latDiff = (plot.latitude - centerLat) * 1000;
    const lngDiff = (plot.longitude - centerLng) * 1000;
    
    return {
      left: `${50 + lngDiff}%`,
      top: `${50 - latDiff}%`
    };
  };

  return (
    <div className="relative">
      <Card className="border-0 shadow-lg bg-white overflow-hidden">
        <CardContent className="p-0">
          <div 
            ref={mapRef}
            className="relative w-full h-96 bg-gradient-to-br from-green-100 via-blue-50 to-green-200"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 20%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                linear-gradient(135deg, #f0fdf4 0%, #dbeafe 100%)
              `
            }}
          >
            {/* Satellite imagery overlay effect */}
            <div className="absolute inset-0 opacity-30">
              <div className="w-full h-full bg-gradient-to-br from-emerald-200/40 via-transparent to-blue-200/40"></div>
              {/* Grid pattern to simulate satellite imagery */}
              <div className="absolute inset-0">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={`h-${i}`} className="absolute w-full h-px bg-green-300/20" style={{ top: `${i * 5}%` }} />
                ))}
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={`v-${i}`} className="absolute h-full w-px bg-green-300/20" style={{ left: `${i * 5}%` }} />
                ))}
              </div>
            </div>

            {/* Plot markers */}
            {plots.map((plot, index) => {
              const position = calculatePosition(plot, index);
              const isSelected = selectedPlot?.id === plot.id;
              
              return (
                <div
                  key={plot.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                  style={position}
                  onClick={(e) => handleMarkerClick(plot, e)}
                >
                  <div className="relative">
                    {/* Pulse animation for selected plot */}
                    {isSelected && (
                      <div className="absolute inset-0 animate-ping">
                        <div className={`w-8 h-8 rounded-full ${getStatusColor(plot.status)} opacity-75`}></div>
                      </div>
                    )}
                    
                    {/* Main marker */}
                    <div className={`
                      w-8 h-8 rounded-full border-3 border-white shadow-lg transition-all duration-200
                      ${getStatusColor(plot.status)}
                      ${isSelected ? 'scale-125' : 'group-hover:scale-110'}
                    `}>
                      <MapPin className="w-4 h-4 text-white m-0.5" />
                    </div>

                    {/* Status indicator */}
                    <div className="absolute -top-1 -right-1">
                      {plot.sensorStatus === 'online' ? (
                        <Wifi className="w-3 h-3 text-green-600 bg-white rounded-full p-0.5" />
                      ) : (
                        <WifiOff className="w-3 h-3 text-red-600 bg-white rounded-full p-0.5" />
                      )}
                    </div>

                    {/* Hover tooltip */}
                    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <div className="bg-black/90 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap">
                        <div className="font-semibold">{plot.name}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="flex items-center">
                            <Droplets className="w-3 h-3 mr-1" />
                            {plot.moisture}%
                          </span>
                          <span className="flex items-center">
                            <Thermometer className="w-3 h-3 mr-1" />
                            {plot.temperature}°F
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Map controls */}
            <div className="absolute top-4 right-4 space-y-2 z-20">
              <Button 
                size="sm" 
                variant="outline" 
                className="w-10 h-10 p-0 bg-white/90 hover:bg-white text-gray-700 shadow-lg"
                onClick={() => setZoom(prev => Math.min(prev + 1, 18))}
              >
                +
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-10 h-10 p-0 bg-white/90 hover:bg-white text-gray-700 shadow-lg"
                onClick={() => setZoom(prev => Math.max(prev - 1, 1))}
              >
                −
              </Button>
            </div>

            {/* Scale indicator */}
            <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded text-xs font-mono">
              Zoom: {zoom}x
            </div>

            {/* Compass */}
            <div className="absolute top-4 left-4 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
              <div className="text-xs font-bold text-gray-700">N</div>
              <div className="absolute top-1 w-px h-3 bg-red-500 left-1/2 transform -translate-x-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map legend */}
      <Card className="mt-4 border-0 shadow-md bg-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 mb-2">Map Legend</h3>
            <Badge variant="outline" className="text-xs">
              {plots.length} plots
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm">Optimal</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Needs Water</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm">Attention</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveMap;
