
import React from 'react';
import { Card, CardContent } from './card';
import { MapPin, ExternalLink } from 'lucide-react';
import { Button } from './button';

interface MiniMapProps {
  latitude: number;
  longitude: number;
  plotName?: string;
  className?: string;
  showControls?: boolean;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  latitude,
  longitude,
  plotName,
  className = '',
  showControls = true
}) => {
  const openInMaps = () => {
    const url = `https://maps.google.com/?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const copyCoordinates = async () => {
    const coords = `${latitude}, ${longitude}`;
    try {
      await navigator.clipboard.writeText(coords);
    } catch (err) {
      // Error copying coordinates
    }
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <div className="relative w-full h-32 bg-gradient-to-br from-blue-50 to-green-50">
          {/* Map placeholder */}
          <div className="absolute inset-0 opacity-30">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="absolute w-full h-px bg-gray-300" style={{ top: `${i * 25}%` }} />
            ))}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="absolute h-full w-px bg-gray-300" style={{ left: `${i * 25}%` }} />
            ))}
          </div>
          
          {/* Marker */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <MapPin className="w-6 h-6 text-red-500 drop-shadow-lg" />
          </div>
          
          {/* Coordinates */}
          <div className="absolute bottom-1 left-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs">
            {latitude.toFixed(3)}, {longitude.toFixed(3)}
          </div>

          {plotName && (
            <div className="absolute top-1 left-1 bg-white/90 px-2 py-1 rounded text-xs font-medium">
              {plotName}
            </div>
          )}

          {showControls && (
            <div className="absolute top-1 right-1 flex space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={copyCoordinates}
                className="w-6 h-6 p-0 bg-white/80 hover:bg-white"
              >
                📋
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={openInMaps}
                className="w-6 h-6 p-0 bg-white/80 hover:bg-white"
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
