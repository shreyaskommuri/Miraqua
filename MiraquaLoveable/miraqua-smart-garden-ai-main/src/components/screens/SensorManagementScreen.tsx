
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Settings, Battery, Wifi, RefreshCw, Plus, AlertTriangle, Loader2 } from "lucide-react";

interface Sensor {
  id: string;
  name: string;
  type: "moisture" | "temperature" | "ph" | "light";
  plotId: string;
  plotName: string;
  status: "online" | "offline" | "low-battery" | "error";
  battery: number;
  lastReading: {
    value: number;
    unit: string;
    timestamp: string;
  };
  calibrationDate: string;
}

const SensorManagementScreen = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSensors();
  }, []);

  const fetchSensors = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSensors([
        {
          id: "sensor-1",
          name: "Moisture Sensor #1",
          type: "moisture",
          plotId: "plot-1",
          plotName: "Tomato Garden",
          status: "online",
          battery: 85,
          lastReading: {
            value: 65,
            unit: "%",
            timestamp: "2 minutes ago"
          },
          calibrationDate: "2024-11-15"
        },
        {
          id: "sensor-2",
          name: "Temperature Sensor #1",
          type: "temperature",
          plotId: "plot-2",
          plotName: "Herb Corner",
          status: "online",
          battery: 92,
          lastReading: {
            value: 72,
            unit: "°F",
            timestamp: "1 minute ago"
          },
          calibrationDate: "2024-11-20"
        },
        {
          id: "sensor-3",
          name: "pH Sensor #1",
          type: "ph",
          plotId: "plot-3",
          plotName: "Pepper Patch",
          status: "low-battery",
          battery: 15,
          lastReading: {
            value: 6.8,
            unit: "pH",
            timestamp: "5 minutes ago"
          },
          calibrationDate: "2024-10-30"
        }
      ]);
    } catch (err) {
      setError("Failed to load sensors");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSensors();
    setIsRefreshing(false);
  };

  const handleCalibrate = (sensorId: string) => {
    // Sensor calibration functionality
    // Navigate to calibration wizard
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-100 text-green-700";
      case "offline": return "bg-gray-100 text-gray-700";
      case "low-battery": return "bg-yellow-100 text-yellow-700";
      case "error": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case "moisture": return "💧";
      case "temperature": return "🌡️";
      case "ph": return "⚗️";
      case "light": return "☀️";
      default: return "📊";
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return "text-green-600";
    if (battery > 20) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-lg font-bold">Sensors</h1>
            </div>
          </div>
        </header>
        
        <div className="p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-bold">Sensor Management</h1>
                <p className="text-sm text-gray-600">{sensors.length} sensors connected</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-4 space-y-6">
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <p className="text-red-600">{error}</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchSensors} className="mt-2">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-900">
                  {sensors.filter(s => s.status === "online").length}
                </div>
                <div className="text-sm text-green-700">Online</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-900">
                  {sensors.filter(s => s.status === "low-battery").length}
                </div>
                <div className="text-sm text-yellow-700">Low Battery</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-red-50 to-red-100">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-900">
                  {sensors.filter(s => s.status === "offline" || s.status === "error").length}
                </div>
                <div className="text-sm text-red-700">Offline</div>
              </CardContent>
            </Card>
          </div>

          {/* Sensors List */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold">All Sensors</h2>
            
            {sensors.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-200 bg-gray-50">
                <CardContent className="p-8 text-center">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">No sensors found</h3>
                  <p className="text-sm text-gray-500 mb-4">Connect your first sensor to get started</p>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Sensor
                  </Button>
                </CardContent>
              </Card>
            ) : (
              sensors.map((sensor) => (
                <Card key={sensor.id} className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                          {getSensorIcon(sensor.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{sensor.name}</h3>
                          <p className="text-sm text-gray-600">{sensor.plotName}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getStatusColor(sensor.status)}>
                              {sensor.status.replace("-", " ")}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <Battery className={`w-3 h-3 ${getBatteryColor(sensor.battery)}`} />
                              <span className={`text-xs ${getBatteryColor(sensor.battery)}`}>
                                {sensor.battery}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCalibrate(sensor.id)}
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Calibrate
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">Latest Reading</p>
                          <p className="font-semibold">
                            {sensor.lastReading.value}{sensor.lastReading.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {sensor.lastReading.timestamp}
                          </p>
                          <Wifi className="w-4 h-4 text-green-600 ml-auto" />
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        Last calibrated: {sensor.calibrationDate}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SensorManagementScreen;
