
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Droplets, Thermometer, Sun, Calendar, MessageSquare, Plus, Bell, User, Settings, TrendingUp, MapPin, Clock, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import OnboardingFlow from "@/components/OnboardingFlow";
import PlotCard from "@/components/PlotCard";
import ChatInterface from "@/components/ChatInterface";
import { GlobalStatsPanel } from "@/components/ui/GlobalStatsPanel";
import { NotificationInbox } from "@/components/ui/NotificationInbox";


const Index = () => {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  const [plots, setPlots] = useState([
    {
      id: 1,
      name: "Tomato Garden",
      crop: "Tomatoes",
      moisture: 85,
      temperature: 72,
      sunlight: 850,
      nextWatering: "Today 6:00 AM",
      status: "healthy",
      location: "North Yard",
      latitude: 37.7749,
      longitude: -122.4194,
      area: 25,
      lastWatered: "Yesterday"
    },
    {
      id: 2,
      name: "Herb Patch",
      crop: "Basil & Oregano",
      moisture: 65,
      temperature: 74,
      sunlight: 920,
      nextWatering: "Tomorrow 5:30 AM",
      status: "needs-water",
      location: "Kitchen Window",
      latitude: 37.7751,
      longitude: -122.4196,
      area: 8,
      lastWatered: "2 days ago"
    },
    {
      id: 3,
      name: "Pepper Patch",
      crop: "Bell Peppers",
      moisture: 42,
      temperature: 75,
      sunlight: 92,
      nextWatering: "Now",
      status: "attention",
      location: "South Garden",
      latitude: 37.7747,
      longitude: -122.4192,
      area: 18,
      lastWatered: "3 days ago"
    }
  ]);

  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'weather' as const,
      title: 'Rain Expected',
      message: 'Skipping watering for Tomato Garden due to rain forecast',
      timestamp: '2 hours ago',
      read: false,
      priority: 'medium' as const,
      plotId: 1,
      plotName: 'Tomato Garden'
    },
    {
      id: '2',
      type: 'watering' as const,
      title: 'Watering Complete',
      message: 'Herb Corner watered for 15 minutes',
      timestamp: '1 day ago',
      read: true,
      priority: 'low' as const,
      plotId: 2,
      plotName: 'Herb Corner'
    }
  ]);

  const globalStats = {
    totalWaterUsed: 142,
    avgMoisture: 68,
    nextWateringIn: '2h 15m',
    activePlots: plots.length,
    waterSavings: 23,
    moistureTrend: 'up' as const
  };

  const handleAddPlot = (newPlot: any) => {
    setPlots([...plots, { ...newPlot, id: plots.length + 1 }]);
    setShowOnboarding(false);
  };

  const handleWaterNow = (plotId: number) => {
    // Water plot functionality
    // Update plot status after watering
    setPlots(prev => prev.map(plot => 
      plot.id === plotId 
        ? { ...plot, moisture: Math.min(100, plot.moisture + 20), lastWatered: "Just now" }
        : plot
    ));
  };

  const handleViewDetails = (plotId: number) => {
    navigate(`/app/plot/${plotId}`);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleAddPlot} onCancel={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50">
      {/* Mobile App Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Droplets className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Miraqua</h1>
                <p className="text-xs text-gray-500">Smart Garden</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                <Bell className="w-4 h-4 text-gray-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-8 h-8 p-0"
                onClick={() => navigate('/app/account')}
              >
                <User className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="px-4 py-6 space-y-6">
          {/* Global Stats */}
          <GlobalStatsPanel {...globalStats} />

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Avg Moisture</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">{globalStats.avgMoisture}%</div>
                <Progress value={globalStats.avgMoisture} className="h-1 mt-2" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Thermometer className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">Avg Temp</span>
                </div>
                <div className="text-2xl font-bold text-orange-900">73°F</div>
                <div className="text-xs text-orange-700 mt-1">Perfect</div>
              </CardContent>
            </Card>
          </div>

          {/* Next Watering Card */}
          <Card className="bg-gradient-to-r from-green-500 to-green-600 border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Next Watering</span>
                  </div>
                  <div className="text-xl font-bold">{globalStats.nextWateringIn}</div>
                  <div className="text-sm opacity-90">Tomato Garden</div>
                </div>
                <Button 
                  size="sm" 
                  className="bg-white text-green-600 hover:bg-gray-100"
                  onClick={() => navigate('/app/schedule')}
                >
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <NotificationInbox
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onDismiss={handleDismissNotification}
            onViewPlot={handleViewDetails}
          />

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => setShowChat(!showChat)}
              className="h-14 bg-purple-500 hover:bg-purple-600 text-white flex flex-col items-center justify-center space-y-1"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs">AI Chat</span>
            </Button>
            <Button
              onClick={() => setShowOnboarding(true)}
              className="h-14 bg-blue-500 hover:bg-blue-600 text-white flex flex-col items-center justify-center space-y-1"
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs">Add Plot</span>
            </Button>
          </div>

          {/* My Plots Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">My Plots</h2>
              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                {plots.length}
              </Badge>
            </div>

            {plots.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-200 bg-gray-50">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Droplets className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">No plots yet</h3>
                  <p className="text-sm text-gray-500 mb-4">Add your first plot to get started</p>
                  <Button
                    onClick={() => setShowOnboarding(true)}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Plot
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {plots.map((plot) => (
                  <Card 
                    key={plot.id}
                    className="border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => handleViewDetails(plot.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{plot.name}</h3>
                            <Badge className={`text-xs ${
                              plot.status === 'healthy' ? 'bg-green-100 text-green-700 border-green-200' :
                              plot.status === 'needs-water' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                              'bg-red-100 text-red-700 border-red-200'
                            }`}>
                              {plot.status === 'healthy' ? '✅ Healthy' : 
                               plot.status === 'needs-water' ? '💧 Needs Water' : 
                               '👀 Attention'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{plot.crop}</p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {plot.location}
                          </p>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 mb-1">
                            <Droplets className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium">{plot.moisture}%</span>
                          </div>
                          <Progress value={plot.moisture} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">Moisture</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 mb-1">
                            <Thermometer className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium">{plot.temperature}°F</span>
                          </div>
                          <Progress value={(plot.temperature - 50) * 2} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">Temperature</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 mb-1">
                            <Sun className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium">{Math.round(plot.sunlight/10)}%</span>
                          </div>
                          <Progress value={plot.sunlight/10} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">Sunlight</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Next: {plot.nextWatering}</span>
                        </div>
                        {plot.status === 'needs-water' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWaterNow(plot.id);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Water Now
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Analytics Preview */}
          <Card className="border-0 bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium text-indigo-900">This Week</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-indigo-600 h-auto p-1"
                  onClick={() => navigate('/app/analytics')}
                >
                  View All
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-indigo-900">{globalStats.totalWaterUsed}L</div>
                  <div className="text-xs text-indigo-700">Water Used</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-indigo-900">{globalStats.waterSavings}%</div>
                  <div className="text-xs text-indigo-700">Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-indigo-900">100%</div>
                  <div className="text-xs text-indigo-700">Health</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation Space */}
        <div className="h-20"></div>
      </ScrollArea>

      {/* Chat Interface */}
      {showChat && (
        <ChatInterface onClose={() => setShowChat(false)} />
      )}

    </div>
  );
};

export default Index;
