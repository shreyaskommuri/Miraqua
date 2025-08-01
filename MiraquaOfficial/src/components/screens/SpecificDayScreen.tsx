
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  AlertTriangle,
  Settings
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
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("07:00");
  const [scheduleDuration, setScheduleDuration] = useState([5]);

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
      
      // Initialize edit state with current values
      setScheduleTime("07:00");
      setScheduleDuration([5]);
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

  const handleScheduleUpdate = async () => {
    try {
      // Convert 24h format to 12h format for display
      const timeObj = new Date(`2000-01-01T${scheduleTime}`);
      const displayTime = timeObj.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });

      // Update the dayData with new schedule
      setDayData(prev => prev ? {
        ...prev,
        scheduledWatering: {
          ...prev.scheduledWatering,
          time: displayTime,
          duration: scheduleDuration[0],
          volume: Math.round(scheduleDuration[0] * 3) // 3L per minute estimate
        }
      } : null);

      setEditingSchedule(false);
      
      toast({
        title: "Schedule updated",
        description: `Watering scheduled for ${displayTime} (${scheduleDuration[0]} min)`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update schedule",
        variant: "destructive",
      });
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
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Scheduled Watering</span>
                </CardTitle>
                <Dialog open={editingSchedule} onOpenChange={setEditingSchedule}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Watering Schedule</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="schedule-time">Time</Label>
                        <Input
                          id="schedule-time"
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label>Duration (minutes)</Label>
                          <span className="text-lg font-bold text-blue-600">{scheduleDuration[0]} min</span>
                        </div>
                        <Slider
                          value={scheduleDuration}
                          onValueChange={setScheduleDuration}
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
                      <div className="flex space-x-2">
                        <Button onClick={handleScheduleUpdate} className="flex-1">
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setEditingSchedule(false)} className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
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

          {/* Manual Watering */}
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

          {/* Water Now Button */}
          <Button
            onClick={handleWaterNow}
            disabled={watering}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl"
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

          {/* Location section removed as requested */}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SpecificDayScreen;
