
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Droplets, Thermometer, Sun, Settings } from "lucide-react";
import InteractiveMap from "@/components/ui/InteractiveMap";
import PresenceIndicator from "@/components/ui/PresenceIndicator";
import { useOfflineData } from "@/hooks/useOfflineData";

const MapOverviewScreen = () => {
  const navigate = useNavigate();
  const [selectedPlot, setSelectedPlot] = useState<any>(null);
  const { isOnline, getPendingActionsCount } = useOfflineData();

  const plots = [
    {
      id: 1,
      name: "Tomato Garden",
      crop: "Tomatoes",
      latitude: 37.7749,
      longitude: -122.4194,
      moisture: 85,
      temperature: 72,
      status: "optimal" as const,
      nextWatering: "2h 15m",
      sensorStatus: "online" as const
    },
    {
      id: 2,
      name: "Herb Corner",
      crop: "Basil & Oregano",
      latitude: 37.7751,
      longitude: -122.4196,
      moisture: 45,
      temperature: 71,
      status: "needs-water" as const,
      nextWatering: "4h 30m",
      sensorStatus: "online" as const
    },
    {
      id: 3,
      name: "Pepper Patch",
      crop: "Bell Peppers",
      latitude: 37.7747,
      longitude: -122.4192,
      moisture: 42,
      temperature: 75,
      status: "attention" as const,
      nextWatering: "Now",
      sensorStatus: "offline" as const
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Scrollable Content */}
      <ScrollArea className="h-screen">
        <div className="pt-0 pb-24 px-4">
          <div className="space-y-4">
            {/* Interactive Map */}
            <InteractiveMap 
              plots={plots}
              onPlotSelect={setSelectedPlot}
              selectedPlot={selectedPlot}
            />

            {/* Selected Plot Details */}
            {selectedPlot && (
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{selectedPlot.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPlot.crop}</p>
                    </div>
                    <Badge className={`text-xs ${
                      selectedPlot.status === 'optimal' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      selectedPlot.status === 'needs-water' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {selectedPlot.status === 'optimal' ? 'Optimal' : 
                       selectedPlot.status === 'needs-water' ? 'Needs Water' : 'Attention'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                      <div className="text-sm font-bold text-blue-900 dark:text-blue-300">{selectedPlot.moisture}%</div>
                      <div className="text-xs text-blue-700 dark:text-blue-400">Moisture</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <Thermometer className="w-5 h-5 text-orange-600 dark:text-orange-400 mx-auto mb-1" />
                      <div className="text-sm font-bold text-orange-900 dark:text-orange-300">{selectedPlot.temperature}°F</div>
                      <div className="text-xs text-orange-700 dark:text-orange-400">Temperature</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Sun className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
                      <div className="text-sm font-bold text-green-900 dark:text-green-300">Good</div>
                      <div className="text-xs text-green-700 dark:text-green-400">Sunlight</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => navigate(`/app/plot/${selectedPlot.id}`)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {/* Water now action */}}
                      className="px-4 text-sm"
                    >
                      Water Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default MapOverviewScreen;
