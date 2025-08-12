
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Bell, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationPreferences {
  watering_reminders: boolean;
  rain_forecast_alerts: boolean;
  low_moisture_alerts: boolean;
}

const NotificationPreferencesScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    watering_reminders: true,
    rain_forecast_alerts: true,
    low_moisture_alerts: true
  });

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
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
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-green-600" />
              <h1 className="text-lg font-bold text-gray-900">Notifications</h1>
            </div>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="p-4 max-w-md mx-auto space-y-6">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Notification Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="watering" className="text-sm font-medium text-gray-900">
                    Watering reminders
                  </Label>
                </div>
                <Switch
                  id="watering"
                  checked={preferences.watering_reminders}
                  onCheckedChange={() => handleToggle('watering_reminders')}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="rain" className="text-sm font-medium text-gray-900">
                    Rain forecast alerts
                  </Label>
                </div>
                <Switch
                  id="rain"
                  checked={preferences.rain_forecast_alerts}
                  onCheckedChange={() => handleToggle('rain_forecast_alerts')}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="moisture" className="text-sm font-medium text-gray-900">
                    Low moisture alerts
                  </Label>
                </div>
                <Switch
                  id="moisture"
                  checked={preferences.low_moisture_alerts}
                  onCheckedChange={() => handleToggle('low_moisture_alerts')}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-12 bg-green-600 hover:bg-green-700"
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
    </div>
  );
};

export default NotificationPreferencesScreen;
