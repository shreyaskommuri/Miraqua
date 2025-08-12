
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Play, 
  Cloud, 
  Sun, 
  CloudRain, 
  MapPin,
  Clock,
  Droplets,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface DayData {
  plotId: number;
  date: string;
  hourlyWeather: Array<{
    hour: string;
    temp: number;
    icon: string;
    description: string;
  }>;
  scheduledWatering: {
    time: string;
    duration: number;
    volume: number;
  };
}

const SpecificDayScreen = () => {
  const navigate = useNavigate();
  const { plotId, day } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [duration, setDuration] = useState([5]);
  const [watering, setWatering] = useState(false);

  const latitude = parseFloat(searchParams.get('lat') || '37.7749');
  const longitude = parseFloat(searchParams.get('lon') || '-122.4194');
  const date = searchParams.get('date') || day;

  const fetchDayData = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDayData({
        plotId: parseInt(plotId || '1'),
        date: date || 'Today',
        hourlyWeather: [
          { hour: '6 AM', temp: 65, icon: 'sun', description: 'Sunny' },
          { hour: '9 AM', temp: 70, icon: 'sun', description: 'Sunny' },
          { hour: '12 PM', temp: 75, icon: 'cloud', description: 'Partly Cloudy' },
          { hour: '3 PM', temp: 78, icon: 'cloud', description: 'Cloudy' },
          { hour: '6 PM', temp: 72, icon: 'rain', description: 'Light Rain' },
          { hour: '9 PM', temp: 68, icon: 'cloud', description: 'Cloudy' }
        ],
        scheduledWatering: {
          time: '7:00 AM',
          duration: 5,
          volume: 15
        }
      });
    } catch (err) {
      setError("Couldn't load day details");
    } finally {
      setLoading(false);
    }
  };

  const handleWaterNow = async () => {
    setWatering(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Watering started",
        description: `Watering for ${duration[0]} minutes`,
      });
      
      // Refresh data
      fetchDayData();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to start watering. Please try again.",
        variant: "destructive"
      });
    } finally {
      setWatering(false);
    }
  };

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case 'sun': return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'cloud': return <Cloud className="w-6 h-6 text-gray-500" />;
      case 'rain': return <CloudRain className="w-6 h-6 text-blue-500" />;
      default: return <Cloud className="w-6 h-6 text-gray-500" />;
    }
  };

  useEffect(() => {
    fetchDayData();
  }, [plotId, date]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-lg font-bold">Day Details</h1>
            </div>
          </div>
        </header>
        
        <div className="p-4 space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-lg font-bold">Day Details</h1>
            </div>
          </div>
        </header>
        
        <div className="p-4">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-3" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="outline" onClick={fetchDayData}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!dayData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-lg font-bold">Day Details</h1>
            </div>
          </div>
        </header>
        
        <div className="p-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No data</h2>
              <p className="text-gray-600">No watering scheduled for this day.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{dayData.date}</h1>
              <p className="text-sm text-gray-600">Plot {plotId} Schedule</p>
            </div>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-160px)]">
        <div className="px-4 py-4 space-y-6 pb-32">
          {/* Scheduled Watering */}
          <Card className="border-0 shadow-md bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Scheduled Watering</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-900">{dayData.scheduledWatering.time}</div>
                  <div className="text-sm text-blue-700">
                    {dayData.scheduledWatering.duration} min • {dayData.scheduledWatering.volume}L
                  </div>
                </div>
                <Droplets className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          {/* Hourly Weather */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Hourly Weather</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dayData.hourlyWeather.map((hour, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium w-16">{hour.hour}</div>
                      {getWeatherIcon(hour.icon)}
                      <div>
                        <div className="text-sm font-medium">{hour.description}</div>
                        <div className="text-xs text-gray-500">{hour.temp}°F</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Duration Picker */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Manual Watering</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-700">Duration (minutes)</Label>
                  <span className="text-lg font-bold text-blue-600">{duration[0]} min</span>
                </div>
                <Slider
                  value={duration}
                  onValueChange={setDuration}
                  max={30}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 min</span>
                  <span>30 min</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mini Map Preview */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-32 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">
                      {latitude.toFixed(4)}, {longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Sticky Water Now Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <Button
          onClick={handleWaterNow}
          disabled={watering}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          {watering ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Watering...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Water Now ({duration[0]} min)
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SpecificDayScreen;
