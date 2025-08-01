
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './card';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { MapPin, Navigation, Search, Crosshair } from 'lucide-react';

interface LocationPickerProps {
  initialLat?: number;
  initialLon?: number;
  onChange: (coords: { lat: number; lon: number }) => void;
  className?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLat = 37.7749,
  initialLon = -122.4194,
  onChange,
  className = ''
}) => {
  const [lat, setLat] = useState(initialLat);
  const [lon, setLon] = useState(initialLon);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: initialLat, lon: initialLon });
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onChange({ lat, lon });
  }, [lat, lon, onChange]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = Number(position.coords.latitude.toFixed(6));
        const newLon = Number(position.coords.longitude.toFixed(6));
        setLat(newLat);
        setLon(newLon);
        setMapCenter({ lat: newLat, lon: newLon });
        setIsLoadingLocation(false);
      },
      () => setIsLoadingLocation(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Simple coordinate conversion for demo (in production, use proper map library)
    const newLat = Number((mapCenter.lat + (0.01 * (rect.height / 2 - y) / 50)).toFixed(6));
    const newLon = Number((mapCenter.lon + (0.01 * (x - rect.width / 2) / 50)).toFixed(6));
    
    setLat(newLat);
    setLon(newLon);
  };

  const validateCoordinates = () => {
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Interactive Map */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div 
            ref={mapRef}
            className="relative w-full h-64 bg-gradient-to-br from-blue-100 to-green-100 cursor-crosshair"
            onClick={handleMapClick}
          >
            {/* Map placeholder with grid */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="absolute w-full h-px bg-gray-300" style={{ top: `${i * 12.5}%` }} />
              ))}
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="absolute h-full w-px bg-gray-300" style={{ left: `${i * 12.5}%` }} />
              ))}
            </div>
            
            {/* Marker */}
            <div 
              className="absolute transform -translate-x-1/2 -translate-y-full z-10"
              style={{ 
                left: '50%', 
                top: '50%'
              }}
            >
              <MapPin className="w-8 h-8 text-red-500 drop-shadow-lg" />
            </div>
            
            {/* Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Crosshair className="w-6 h-6 text-gray-400" />
            </div>
            
            {/* Coordinates overlay */}
            <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
              {lat.toFixed(4)}, {lon.toFixed(4)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Input */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            value={lat}
            onChange={(e) => setLat(Number(e.target.value))}
            min={-90}
            max={90}
            step={0.000001}
            className={!validateCoordinates() ? 'border-red-500' : ''}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            value={lon}
            onChange={(e) => setLon(Number(e.target.value))}
            min={-180}
            max={180}
            step={0.000001}
            className={!validateCoordinates() ? 'border-red-500' : ''}
          />
        </div>
      </div>

      {/* Current Location Button */}
      <Button
        onClick={getCurrentLocation}
        disabled={isLoadingLocation}
        variant="outline"
        className="w-full"
      >
        <Navigation className="w-4 h-4 mr-2" />
        {isLoadingLocation ? 'Getting Location...' : 'Use Current Location'}
      </Button>

      {!validateCoordinates() && (
        <p className="text-sm text-red-600">Please enter valid coordinates</p>
      )}
    </div>
  );
};
