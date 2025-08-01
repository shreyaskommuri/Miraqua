import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CalendarSchedule } from "@/components/ui/CalendarSchedule";
import { MiniMap } from "@/components/ui/MiniMap";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ArrowLeft, 
  Settings, 
  Droplets, 
  Thermometer, 
  Sun, 
  MapPin,
  Copy,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Activity,
  Calendar,
  Share2,
  Heart,
  Wifi,
  WifiOff,
  Clock,
  Battery,
  Camera,
  Maximize,
  Bell,
  BellOff,
  Download,
  MessageCircle,
  ChevronDown,
  Plus,
  Minus,
  Sparkles,
  TrendingUp,
  History
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOfflineData } from "@/hooks/useOfflineData";

const PlotDetailsScreen = () => {
  const navigate = useNavigate();
  const { plotId } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { isOnline } = useOfflineData();
  
  const [plotData, setPlotData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [watering, setWatering] = useState(false);
  const [showOriginalSchedule, setShowOriginalSchedule] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showHistoryLog, setShowHistoryLog] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [generatingAI, setGeneratingAI] = useState(false);

  const latitude = parseFloat(searchParams.get('lat') || '37.7749');
  const longitude = parseFloat(searchParams.get('lon') || '-122.4194');

  const fetchPlotData = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Fetching plot data
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockSchedule = [
        {
          date: '2024-07-01',
          dayOfWeek: 'Mon',
          morning: { time: '06:00', duration: 5, volume: 15 },
          hasWatering: true,
          isToday: true
        },
        {
          date: '2024-07-02',
          dayOfWeek: 'Tue',
          afternoon: { time: '14:00', duration: 3, volume: 8 },
          hasWatering: true
        },
        {
          date: '2024-07-03',
          dayOfWeek: 'Wed',
          morning: { time: '06:00', duration: 5, volume: 15 },
          evening: { time: '18:00', duration: 2, volume: 5 },
          hasWatering: true
        },
        {
          date: '2024-07-04',
          dayOfWeek: 'Thu',
          hasWatering: false
        },
        {
          date: '2024-07-05',
          dayOfWeek: 'Fri',
          morning: { time: '06:00', duration: 4, volume: 12 },
          hasWatering: true
        }
      ];

      const mockHistoryLog = [
        { id: 1, date: '2024-07-01 06:00', volume: 15, type: 'AI Scheduled', duration: 5 },
        { id: 2, date: '2024-06-30 14:30', volume: 8, type: 'Manual Override', duration: 3 },
        { id: 3, date: '2024-06-29 06:00', volume: 12, type: 'AI Scheduled', duration: 4 },
        { id: 4, date: '2024-06-28', volume: 0, type: 'Rain Skip', duration: 0 },
      ];

      // Get plot-specific data based on plotId
      const plotsData = {
        '1': {
          name: "Cherry Tomato Garden",
          crop: "Cherry Tomatoes",
          variety: "Sweet 100",
          healthScore: 87,
          area: 25,
          plantingDate: "2024-03-15"
        },
        '2': {
          name: "Herb Garden", 
          crop: "Mixed Herbs",
          variety: "Basil & Rosemary",
          healthScore: 92,
          area: 8,
          plantingDate: "2024-02-20"
        },
        '3': {
          name: "Pepper Patch",
          crop: "Bell Peppers", 
          variety: "California Wonder",
          healthScore: 73,
          area: 18,
          plantingDate: "2024-04-01"
        }
      };

      const currentPlot = plotsData[plotId as keyof typeof plotsData] || plotsData['1'];
      
      setPlotData({
        id: plotId,
        ...currentPlot,
        location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        currentTemp: 72,
        currentMoisture: 68,
        currentSunlight: 85,
        nextWatering: "Tomorrow 6:00 AM",
        schedule: mockSchedule,
        historyLog: mockHistoryLog,
        lastWatered: "2 hours ago",
        isOnline: true,
        waterSavings: 23,
        sensors: [
          { id: 1, name: "Soil Moisture", value: 68, unit: "%", status: "good", lastUpdate: "2 min ago" },
          { id: 2, name: "Temperature", value: 72, unit: "°F", status: "optimal", lastUpdate: "1 min ago" },
          { id: 3, name: "Light", value: 85, unit: "%", status: "good", lastUpdate: "3 min ago" },
          { id: 4, name: "pH Level", value: 6.8, unit: "pH", status: "good", lastUpdate: "5 min ago" }
        ]
      });

      // Plot data loaded successfully
    } catch (err) {
      // Error loading plot data
      setError("Failed to load plot details");
    } finally {
      setLoading(false);
    }
  };

  const generateAISummary = async () => {
    setGeneratingAI(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAiSummary("Your soil moisture will dip below optimal Thursday morning due to sunny conditions. I recommend increasing Wednesday evening watering by 3L to maintain healthy levels. Expected yield looks strong with current care schedule.");
      toast({
        title: "🤖 AI Summary Generated",
        description: "Fresh insights based on your plot conditions",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate AI summary",
        variant: "destructive"
      });
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleWaterNow = async () => {
    setWatering(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "💧 Watering Started",
        description: "Your garden is being watered for 5 minutes",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to start watering",
        variant: "destructive"
      });
    } finally {
      setWatering(false);
    }
  };

  const handleDayClick = (day: any) => {
    navigate(`/app/plot/${plotId}/day/${day.date}?lat=${latitude}&lon=${longitude}`);
  };

  const handleCalendarClick = (date: string) => {
    navigate(`/app/calendar/${plotId}?date=${date}&lat=${latitude}&lon=${longitude}`);
  };

  const copyCoordinates = () => {
    navigator.clipboard.writeText(`${latitude}, ${longitude}`);
    toast({
      title: "📍 Coordinates Copied",
      description: "Location copied to clipboard"
    });
  };

  const sharePlot = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "📤 Plot Shared", 
      description: "Plot link copied to clipboard"
    });
  };

  const exportPDF = () => {
    toast({
      title: "📄 Export Started",
      description: "Your plot report is being generated",
    });
  };

  const adjustWaterVolume = (date: string, adjustment: number) => {
    toast({
      title: adjustment > 0 ? "💧 Volume Increased" : "💧 Volume Decreased",
      description: `Watering adjusted by ${Math.abs(adjustment)}L for ${date}`,
    });
  };

  const getCropAge = () => {
    if (!plotData?.plantingDate) return "";
    const planted = new Date(plotData.plantingDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - planted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    return `${months} months, ${days} days`;
  };

  useEffect(() => {
    fetchPlotData();
    generateAISummary();
  }, [plotId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading plot details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <div className="p-6">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-red-800 dark:text-red-400 mb-4">Something went wrong</h3>
              <p className="text-red-600 dark:text-red-300 mb-6 text-lg">{error}</p>
              <Button onClick={fetchPlotData} size="lg" className="bg-red-600 hover:bg-red-700">
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!plotData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-300">No plot data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="bg-orange-100 dark:bg-orange-900/30 border-b border-orange-200 dark:border-orange-800 px-6 py-2 text-center">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            <WifiOff className="w-4 h-4 inline mr-2" />
            Offline - Last synced: 2 hours ago
          </p>
        </div>
      )}

      {/* Fixed Header - properly positioned below navigation */}
      <header className="fixed top-16 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm lg:ml-64">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/app/home')}
                className="w-9 h-9 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-lg">🌿</span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Wifi className="w-2 h-2 text-white" />
                  </div>
                </div>
                
                <div className="min-w-0 flex-1">
                  <h1 className="text-base font-bold text-gray-900 dark:text-white truncate">{plotData.name}</h1>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{plotData.crop} • {plotData.variety}</p>
                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                      <Heart className="w-2 h-2 mr-1 text-red-500" />
                      {plotData.healthScore}%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={exportPDF} className="w-8 h-8 p-0">
                <Download className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={sharePlot} className="w-8 h-8 p-0">
                <Share2 className="w-3.5 h-3.5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(`/app/plot/${plotId}/settings`)}
                className="w-8 h-8 p-0"
              >
                <Settings className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-128px)] mt-16">
        <div className="p-6 space-y-8 pb-8">
          {/* Enhanced Photo/Map Header */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
            <div className="relative h-64 bg-gradient-to-r from-green-400 to-emerald-500">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-60" />
                  <span className="text-lg font-medium">Tap to add plot photo</span>
                  <p className="text-sm opacity-80 mt-1">Show off your beautiful garden</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-4 right-4 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
            <CardContent className="p-6 bg-gradient-to-br from-white to-gray-50">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{plotData.area}m²</p>
                  <p className="text-sm text-gray-500">Plot Area</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{getCropAge()}</p>
                  <p className="text-sm text-gray-500">Crop Age</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto">
                    <Droplets className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{plotData.waterSavings}%</p>
                  <p className="text-sm text-gray-500">Water Saved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Summary */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="font-semibold">AI Insights</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={generateAISummary}
                  disabled={generatingAI}
                  className="text-white hover:bg-white/20"
                >
                  {generatingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-purple-100 leading-relaxed">
                {aiSummary || "Generating personalized insights for your plot..."}
              </p>
            </CardContent>
          </Card>

          {/* Sensor Status Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {plotData.sensors.map((sensor: any) => (
              <Card key={sensor.id} className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:scale-105 transition-transform cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      sensor.name === 'Soil Moisture' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      sensor.name === 'Temperature' ? 'bg-orange-100 dark:bg-orange-900/30' :
                      sensor.name === 'Light' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      'bg-green-100 dark:bg-green-900/30'
                    }`}>
                      {sensor.name === 'Soil Moisture' && <Droplets className="w-5 h-5 text-blue-600" />}
                      {sensor.name === 'Temperature' && <Thermometer className="w-5 h-5 text-orange-600" />}
                      {sensor.name === 'Light' && <Sun className="w-5 h-5 text-yellow-600" />}
                      {sensor.name === 'pH Level' && <Activity className="w-5 h-5 text-green-600" />}
                    </div>
                    <Badge variant={sensor.status === 'optimal' ? 'default' : 'secondary'} className="text-xs">
                      {sensor.status}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {sensor.value}{sensor.unit}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {sensor.lastUpdate}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Schedule Toggle */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Schedule View</h3>
                  <p className="text-sm text-gray-500">Toggle between AI and original schedule</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm ${!showOriginalSchedule ? 'font-semibold text-green-600' : 'text-gray-500'}`}>
                    AI Plan
                  </span>
                  <Switch 
                    checked={showOriginalSchedule}
                    onCheckedChange={setShowOriginalSchedule}
                  />
                  <span className={`text-sm ${showOriginalSchedule ? 'font-semibold text-blue-600' : 'text-gray-500'}`}>
                    Original
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Updated Calendar Schedule with new props */}
          <CalendarSchedule 
            schedule={plotData.schedule} 
            onDayClick={handleDayClick}
            onCalendarClick={handleCalendarClick}
            showManualControls={true}
            onVolumeAdjust={adjustWaterVolume}
            plotId={plotId}
          />

          {/* Notifications Settings */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {notificationsEnabled ? <Bell className="w-5 h-5 text-green-500" /> : <BellOff className="w-5 h-5 text-gray-400" />}
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Watering reminders</span>
                <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rain forecast alerts</span>
                <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Low moisture alerts</span>
                <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              </div>
            </CardContent>
          </Card>

          {/* Historical Watering Log */}
          <Collapsible open={showHistoryLog} onOpenChange={setShowHistoryLog}>
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <History className="w-5 h-5 text-blue-500" />
                      <span>Watering History</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${showHistoryLog ? 'rotate-180' : ''}`} />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-3">
                  {plotData.historyLog.map((entry: any) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{entry.date}</p>
                        <p className="text-xs text-gray-500">{entry.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">{entry.volume}L</p>
                        <p className="text-xs text-gray-500">{entry.duration}min</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Performance Summary */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2 flex items-center">
                    <TrendingUp className="w-6 h-6 mr-2" />
                    Performance Summary
                  </h3>
                  <p className="text-green-100">Projected water savings vs fixed schedule</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold">{plotData.waterSavings}%</p>
                  <p className="text-green-100">More efficient</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <span>Location & Environment</span>
                </div>
                <Button variant="ghost" size="sm" onClick={copyCoordinates}>
                  <Copy className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MiniMap latitude={latitude} longitude={longitude} plotName={plotData.name} />
            </CardContent>
          </Card>

          {/* Action Buttons - Now positioned under Location & Environment */}
          <div className="flex space-x-4">
            <Button
              variant="outline"
              className="flex-1 h-14 bg-white/90 backdrop-blur-sm border-gray-300 hover:bg-white"
              onClick={() => navigate('/app/chat')}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Ask Miraqua
            </Button>
            <Button
              onClick={handleWaterNow}
              disabled={watering}
              className="flex-1 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-2xl shadow-2xl"
            >
              {watering ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Watering...
                </>
              ) : (
                <>
                  <Droplets className="w-5 h-5 mr-2" />
                  Water Now
                </>
              )}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default PlotDetailsScreen;
