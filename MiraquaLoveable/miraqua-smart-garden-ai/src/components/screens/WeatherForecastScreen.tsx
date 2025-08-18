
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Cloud, Sun, Thermometer, Droplets, Wind, MapPin, Loader2, AlertTriangle } from "lucide-react";

const WeatherForecastScreen = () => {
  const navigate = useNavigate();
  const { plotId } = useParams();
  const [searchParams] = useSearchParams();
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const latitude = parseFloat(searchParams.get('lat') || '37.7749');
  const longitude = parseFloat(searchParams.get('lon') || '-122.4194');

  useEffect(() => {
    fetchWeatherData();
  }, [latitude, longitude]);

  const fetchWeatherData = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setWeatherData({
        location: "San Francisco, CA",
        current: {
          temperature: 68,
          condition: "Partly Cloudy",
          humidity: 75,
          windSpeed: 12,
          icon: "partly-cloudy"
        },
        forecast: [
          { day: "Today", temperature: 70, condition: "Sunny", icon: "sunny" },
          { day: "Tomorrow", temperature: 65, condition: "Cloudy", icon: "cloudy" },
          { day: "Wed", temperature: 62, condition: "Rain", icon: "rain" },
          { day: "Thu", temperature: 68, condition: "Partly Cloudy", icon: "partly-cloudy" },
          { day: "Fri", temperature: 72, condition: "Sunny", icon: "sunny" }
        ]
      });
    } catch (err) {
      setError("Failed to load weather data");
    } finally {
      setIsLoading(false);
    }
  };

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case "sunny": return <Sun className="w-6 h-6 text-yellow-500" />;
      case "cloudy": return <Cloud className="w-6 h-6 text-gray-500" />;
      case "rain": return <Droplets className="w-6 h-6 text-blue-500" />;
      case "partly-cloudy": return <Cloud className="w-6 h-6 text-gray-400" />;
      default: return <Cloud className="w-6 h-6 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="px-4 py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-lg font-bold">Weather</h1>
            </div>
          </div>
        </header>
        
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Weather Forecast</h1>
              <p className="text-sm text-gray-600">
                {weatherData?.location}
              </p>
            </div>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-4 space-y-6">
          {error && (
            <Card className="border-0 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <p className="text-red-600">{error}</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchWeatherData} className="mt-2">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Current Weather */}
          <Card className="border-0 shadow-sm bg-blue-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold">{weatherData?.current.temperature}°F</h2>
                  <p className="text-blue-100">{weatherData?.current.condition}</p>
                </div>
                <div className="text-white">
                  {getWeatherIcon(weatherData?.current.icon || "")}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Droplets className="w-4 h-4 text-blue-100" />
                  <span className="text-blue-100">{weatherData?.current.humidity}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wind className="w-4 h-4 text-blue-100" />
                  <span className="text-blue-100">{weatherData?.current.windSpeed} mph</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Forecast */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">5-Day Forecast</h2>
            <div className="space-y-3">
              {weatherData?.forecast.map((day, index) => (
                <Card key={index} className="border-0 shadow-sm bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getWeatherIcon(day.icon)}
                        <div>
                          <h3 className="font-semibold text-gray-900">{day.day}</h3>
                          <p className="text-sm text-gray-600">{day.condition}</p>
                        </div>
                      </div>
                      <div className="text-xl font-bold text-gray-900">{day.temperature}°F</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Location Info */}
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 text-gray-900">Location</h3>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600">Latitude: {latitude.toFixed(4)}, Longitude: {longitude.toFixed(4)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default WeatherForecastScreen;
