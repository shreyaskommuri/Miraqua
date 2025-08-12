
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Zap, Droplets, Settings, RefreshCw, Loader2, AlertTriangle } from "lucide-react";

interface Device {
  id: string;
  name: string;
  type: "valve" | "pump" | "sensor";
  status: "online" | "offline" | "error";
  isActive: boolean;
  battery?: number;
  lastSync?: string;
}

const DeviceControlScreen = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeTab, setActiveTab] = useState("valves");

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDevices([
        {
          id: "valve-1",
          name: "Main Garden Valve",
          type: "valve",
          status: "online",
          isActive: false,
          lastSync: "2 minutes ago"
        },
        {
          id: "valve-2",
          name: "Herb Section Valve",
          type: "valve",
          status: "online",
          isActive: true,
          lastSync: "1 minute ago"
        },
        {
          id: "pump-1",
          name: "Water Pump",
          type: "pump",
          status: "online",
          isActive: true,
          lastSync: "30 seconds ago"
        },
        {
          id: "sensor-1",
          name: "Moisture Sensor #1",
          type: "sensor",
          status: "online",
          isActive: true,
          battery: 85,
          lastSync: "1 minute ago"
        }
      ]);
    } catch (err) {
      setError("Failed to load devices");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDevices();
    setIsRefreshing(false);
  };

  const toggleDevice = async (deviceId: string) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { ...device, isActive: !device.isActive }
        : device
    ));
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      // Error handling without console logging in production
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-100 text-green-700";
      case "offline": return "bg-gray-100 text-gray-700";
      case "error": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const renderDevice = (device: Device) => (
    <Card key={device.id} className="border-0 shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              {device.type === "valve" && <Droplets className="w-5 h-5 text-blue-600" />}
              {device.type === "pump" && <Zap className="w-5 h-5 text-blue-600" />}
              {device.type === "sensor" && <Settings className="w-5 h-5 text-blue-600" />}
            </div>
            <div>
              <h3 className="font-semibold">{device.name}</h3>
              <p className="text-sm text-gray-600">Last sync: {device.lastSync}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(device.status)}>
              {device.status}
            </Badge>
            {device.battery && (
              <Badge variant="outline">
                {device.battery}%
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {device.type === "valve" ? "Water Flow" : 
             device.type === "pump" ? "Pump Status" : 
             "Sensor Active"}
          </span>
          <Switch
            checked={device.isActive}
            onCheckedChange={() => toggleDevice(device.id)}
            disabled={device.status === "offline"}
          />
        </div>

        {device.type === "valve" && device.isActive && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <Label className="text-sm">Duration (minutes)</Label>
            <Input
              type="number"
              placeholder="5"
              className="mt-1 h-8"
              min="1"
              max="60"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-lg font-bold">Device Control</h1>
            </div>
          </div>
        </header>
        
        <div className="p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const valves = devices.filter(d => d.type === "valve");
  const pumps = devices.filter(d => d.type === "pump");
  const sensors = devices.filter(d => d.type === "sensor");

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
                <h1 className="text-lg font-bold">Device Control</h1>
                <p className="text-sm text-gray-600">Manage valves, pumps & sensors</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
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
                <Button variant="outline" size="sm" onClick={fetchDevices} className="mt-2">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-sm -mx-4 px-4 py-2 border-b">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="valves">Valves ({valves.length})</TabsTrigger>
                <TabsTrigger value="pumps">Pumps ({pumps.length})</TabsTrigger>
                <TabsTrigger value="sensors">Sensors ({sensors.length})</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="valves" className="mt-6 space-y-4">
              {valves.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-200 bg-gray-50">
                  <CardContent className="p-8 text-center">
                    <Droplets className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">No valves found</h3>
                    <p className="text-sm text-gray-500 mb-4">Connect your irrigation valves to get started</p>
                    <Button size="sm">Add Valve</Button>
                  </CardContent>
                </Card>
              ) : (
                valves.map(renderDevice)
              )}
            </TabsContent>

            <TabsContent value="pumps" className="mt-6 space-y-4">
              {pumps.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-200 bg-gray-50">
                  <CardContent className="p-8 text-center">
                    <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">No pumps found</h3>
                    <p className="text-sm text-gray-500 mb-4">Connect your water pumps to get started</p>
                    <Button size="sm">Add Pump</Button>
                  </CardContent>
                </Card>
              ) : (
                pumps.map(renderDevice)
              )}
            </TabsContent>

            <TabsContent value="sensors" className="mt-6 space-y-4">
              {sensors.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-200 bg-gray-50">
                  <CardContent className="p-8 text-center">
                    <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">No sensors found</h3>
                    <p className="text-sm text-gray-500 mb-4">Connect your soil sensors to get started</p>
                    <Button size="sm">Add Sensor</Button>
                  </CardContent>
                </Card>
              ) : (
                sensors.map(renderDevice)
              )}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
};

export default DeviceControlScreen;
