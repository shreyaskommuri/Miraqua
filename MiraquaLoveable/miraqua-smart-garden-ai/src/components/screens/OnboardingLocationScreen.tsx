import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, MapPin, Crosshair, Sparkles, Sun, Cloud, Droplets } from "lucide-react";

const OnboardingLocationScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [latitude, setLatitude] = useState<number>(37.7749);
  const [longitude, setLongitude] = useState<number>(-122.4194);
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationPreview, setLocationPreview] = useState<any>(null);

  const plotData = location.state;

  const handleUseMyLocation = async () => {
    setIsLoading(true);
    setError("");
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setIsLoading(false);
      },
      (error) => {
        setError("Unable to access your location. Please enter coordinates manually.");
        setIsLoading(false);
      }
    );
  };

  const handleNext = () => {
    navigate('/onboarding/settings', {
      state: { ...plotData, latitude, longitude, address }
    });
  };

  const isValid = latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;

  // Generate smart location preview
  useEffect(() => {
    if (isValid) {
      // Mock weather/climate data based on coordinates
      const climateZone = getClimateZone(latitude);
      const season = getCurrentSeason();
      setLocationPreview({
        zone: climateZone,
        season,
        avgTemp: getAvgTemp(latitude),
        rainfall: getRainfall(latitude),
        growingSeason: getGrowingSeason(latitude)
      });
    }
  }, [latitude, longitude]);

  const getClimateZone = (lat: number) => {
    if (lat > 66.5) return "Arctic";
    if (lat > 35) return "Temperate";
    if (lat > 23.5) return "Subtropical"; 
    if (lat > -23.5) return "Tropical";
    if (lat > -35) return "Subtropical";
    return "Temperate";
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "Spring";
    if (month >= 5 && month <= 7) return "Summer";
    if (month >= 8 && month <= 10) return "Fall";
    return "Winter";
  };

  const getAvgTemp = (lat: number) => {
    const absLat = Math.abs(lat);
    if (absLat > 60) return "32-50°F";
    if (absLat > 40) return "50-70°F";
    if (absLat > 20) return "65-85°F";
    return "75-95°F";
  };

  const getRainfall = (lat: number) => {
    const absLat = Math.abs(lat);
    if (absLat > 50) return "20-40 inches/year";
    if (absLat > 30) return "30-50 inches/year";
    return "40-80 inches/year";
  };

  const getGrowingSeason = (lat: number) => {
    const absLat = Math.abs(lat);
    if (absLat > 50) return "4-6 months";
    if (absLat > 35) return "6-8 months";
    return "8-12 months";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-900">Plot Location</h1>
              <p className="text-sm text-gray-500">Step 2 of 4</p>
            </div>
            <div className="w-9"></div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="px-6 pb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full w-2/4 transition-all duration-300"></div>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="px-6 py-6 space-y-8 pb-32">
          {/* Intro */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Where is your plot located?</h2>
            <p className="text-gray-600">We'll use this to get hyper-local weather data and create the perfect irrigation schedule</p>
          </div>

          {error && (
            <Card className="border-0 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Map Preview */}
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-0">
              <div className="relative w-full h-64 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {latitude.toFixed(4)}, {longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Controls */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-4">
              <CardTitle>Set Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                onClick={handleUseMyLocation}
                disabled={isLoading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Crosshair className="w-4 h-4 mr-2" />
                {isLoading ? "Getting Location..." : "📍 Use My Current Location"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or enter manually</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                    placeholder="37.7749"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                    placeholder="-122.4194"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Input
                  id="address"
                  placeholder="e.g., 123 Garden St, San Francisco, CA"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          {/* Smart Location Preview */}
          {locationPreview && (
            <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 to-accent/5 animate-fade-in">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span>Location insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 p-3 bg-white rounded-lg">
                    <Sun className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-xs text-gray-500">Climate</p>
                      <p className="text-sm font-semibold">{locationPreview.zone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-white rounded-lg">
                    <Cloud className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Season</p>
                      <p className="text-sm font-semibold">{locationPreview.season}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-white rounded-lg">
                    <Droplets className="w-4 h-4 text-cyan-500" />
                    <div>
                      <p className="text-xs text-gray-500">Avg rainfall</p>
                      <p className="text-sm font-semibold">{locationPreview.rainfall}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-white rounded-lg">
                    <Sparkles className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-500">Growing season</p>
                      <p className="text-sm font-semibold">{locationPreview.growingSeason}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-600">
                    🎯 <strong>Perfect!</strong> This location has a {locationPreview.zone.toLowerCase()} climate ideal for {locationPreview.season.toLowerCase()} planting.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Next Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6">
        <Button
          onClick={handleNext}
          disabled={!isValid}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl disabled:bg-gray-300 shadow-lg disabled:shadow-none transition-all duration-200"
        >
          Next: Advanced Settings
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingLocationScreen;