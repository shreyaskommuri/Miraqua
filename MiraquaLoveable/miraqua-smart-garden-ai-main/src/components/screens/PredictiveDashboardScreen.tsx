
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  TrendingUp, 
  Droplets, 
  Calendar,
  BarChart3,
  Target,
  Zap,
  RefreshCw,
  Settings
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface PredictiveData {
  date: string;
  currentMoisture: number;
  predictedMoisture: number;
  scheduledWater: number;
  aiOptimizedWater: number;
  temperature: number;
  rainfall: number;
}

const PredictiveDashboardScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeSchedule, setActiveSchedule] = useState<'current' | 'ai-optimized'>('current');
  const [data, setData] = useState<PredictiveData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock 14-day forecast data
        const mockData: PredictiveData[] = [];
        for (let i = 0; i < 14; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          
          mockData.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            currentMoisture: Math.max(20, Math.min(95, 70 + Math.sin(i * 0.5) * 20 + Math.random() * 10)),
            predictedMoisture: Math.max(25, Math.min(90, 75 + Math.sin(i * 0.4) * 15 + Math.random() * 8)),
            scheduledWater: Math.max(0, 15 + Math.sin(i * 0.3) * 5 + Math.random() * 3),
            aiOptimizedWater: Math.max(0, 12 + Math.sin(i * 0.35) * 4 + Math.random() * 2),
            temperature: Math.max(60, Math.min(85, 72 + Math.sin(i * 0.2) * 8 + Math.random() * 4)),
            rainfall: Math.random() > 0.7 ? Math.random() * 0.5 : 0
          });
        }
        
        setData(mockData);
      } catch (error) {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollArea className="h-[calc(100vh-0px)]">
        <div className="p-4 space-y-6">
          {/* Schedule Toggle */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Schedule Comparison</h3>
                <Badge className="bg-green-100 text-green-700">
                  AI saves 23% water
                </Badge>
              </div>
              
              <Tabs value={activeSchedule} onValueChange={(value) => setActiveSchedule(value as 'current' | 'ai-optimized')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="current">Current Schedule</TabsTrigger>
                  <TabsTrigger value="ai-optimized">
                    <Zap className="w-4 h-4 mr-2" />
                    AI Optimized
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* Main Forecast Chart */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Soil Moisture Forecast</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Moisture %', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="currentMoisture" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Current Moisture"
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predictedMoisture" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="AI Predicted"
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Water Usage Comparison */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Droplets className="w-5 h-5 text-blue-600" />
                <span>Water Usage Comparison</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Liters', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey={activeSchedule === 'current' ? 'scheduledWater' : 'aiOptimizedWater'} 
                      fill={activeSchedule === 'current' ? '#3b82f6' : '#10b981'}
                      name={activeSchedule === 'current' ? 'Scheduled Water' : 'AI Optimized Water'}
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Daily Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.slice(0, 6).map((day, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-gray-900">{day.date}</div>
                    <Badge className={
                      day.rainfall > 0 
                        ? "bg-blue-100 text-blue-700" 
                        : "bg-green-100 text-green-700"
                    }>
                      {day.rainfall > 0 ? `${day.rainfall.toFixed(1)}" rain` : 'Clear'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Moisture</span>
                      <span className="font-medium">{day.predictedMoisture.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Water Needed</span>
                      <span className="font-medium text-blue-600">
                        {(activeSchedule === 'current' ? day.scheduledWater : day.aiOptimizedWater).toFixed(1)}L
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Temperature</span>
                      <span className="font-medium">{day.temperature.toFixed(0)}°F</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Insights */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">AI Insights</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Rain expected on {data[3]?.date} - schedule automatically adjusted</li>
                    <li>• Optimal watering window: 6-8 AM for maximum absorption</li>
                    <li>• Soil moisture trending 15% higher than last month</li>
                    <li>• Consider reducing watering frequency during cooler days</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default PredictiveDashboardScreen;
