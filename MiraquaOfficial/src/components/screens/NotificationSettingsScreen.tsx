
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Bell, Smartphone, Mail, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationSettings {
  quiet_hours_enabled: boolean;
  quiet_start: string;
  quiet_end: string;
  watering_alerts: boolean;
  weather_alerts: boolean;
  device_alerts: boolean;
  chat_replies: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
}

const NotificationSettingsScreen = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    quiet_hours_enabled: false,
    quiet_start: "22:00",
    quiet_end: "07:00",
    watering_alerts: true,
    weather_alerts: true,
    device_alerts: true,
    chat_replies: true,
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false
  });
  const [error, setError] = useState("");
  const { toast } = useToast();

  const fetchSettings = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Settings would be loaded from API
    } catch (err) {
      setError("Failed to load notification settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
      
      // Navigate back to home instead of previous page
      navigate("/app/home");
    } catch (err) {
      setError("Failed to save settings");
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleBack = () => {
    // Navigate back to home instead of -1 to avoid welcome page
    navigate("/app/home");
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-lg font-bold">Notifications</h1>
            </div>
          </div>
        </header>
        
        <div className="p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
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
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-lg font-bold">Notification Settings</h1>
            </div>
          </div>
        </header>
        
        <div className="p-4">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchSettings} className="mt-2">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-bold">Notification Settings</h1>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="p-4 space-y-6">
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-600">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchSettings} className="mt-2">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Delivery Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5" />
                <span>Delivery Methods</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="push">Push Notifications</Label>
                <Switch
                  id="push"
                  checked={settings.push_notifications}
                  onCheckedChange={(checked) => updateSetting('push_notifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email">Email Notifications</Label>
                <Switch
                  id="email"
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="sms">SMS Notifications</Label>
                <Switch
                  id="sms"
                  checked={settings.sms_notifications}
                  onCheckedChange={(checked) => updateSetting('sms_notifications', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Alert Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Alert Types</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="watering">Watering Alerts</Label>
                  <p className="text-sm text-gray-600">Scheduled watering and completion</p>
                </div>
                <Switch
                  id="watering"
                  checked={settings.watering_alerts}
                  onCheckedChange={(checked) => updateSetting('watering_alerts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weather">Weather Alerts</Label>
                  <p className="text-sm text-gray-600">Rain forecasts and weather changes</p>
                </div>
                <Switch
                  id="weather"
                  checked={settings.weather_alerts}
                  onCheckedChange={(checked) => updateSetting('weather_alerts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="device">Device Alerts</Label>
                  <p className="text-sm text-gray-600">Sensor issues and device status</p>
                </div>
                <Switch
                  id="device"
                  checked={settings.device_alerts}
                  onCheckedChange={(checked) => updateSetting('device_alerts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="chat">AI Chat Replies</Label>
                  <p className="text-sm text-gray-600">AI assistant responses</p>
                </div>
                <Switch
                  id="chat"
                  checked={settings.chat_replies}
                  onCheckedChange={(checked) => updateSetting('chat_replies', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quiet Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Quiet Hours</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="quiet">Enable Quiet Hours</Label>
                <Switch
                  id="quiet"
                  checked={settings.quiet_hours_enabled}
                  onCheckedChange={(checked) => updateSetting('quiet_hours_enabled', checked)}
                />
              </div>
              
              {settings.quiet_hours_enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start">Start Time</Label>
                    <input
                      id="start"
                      type="time"
                      value={settings.quiet_start}
                      onChange={(e) => updateSetting('quiet_start', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end">End Time</Label>
                    <input
                      id="end"
                      type="time"
                      value={settings.quiet_end}
                      onChange={(e) => updateSetting('quiet_end', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full h-12"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettingsScreen;
