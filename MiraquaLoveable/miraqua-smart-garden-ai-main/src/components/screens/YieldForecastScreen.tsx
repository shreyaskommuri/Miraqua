
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  TrendingUp, 
  Leaf,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const YieldForecastScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [forecastData, setForecastData] = useState<any>(null);

  useEffect(() => {
    fetchForecastData();
  }, []);

  const fetchForecastData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setForecastData({
        currentSeason: {
          projectedYield: 45.2,
          harvestDate: '2024-08-15',
          confidence: 87,
          factors: {
            weather: 'Favorable',
            soilHealth: 'Good',
            irrigation: 'Optimal'
          }
        },
        monthlyForecast: [
          { month: 'Jul', yield: 12.5 },
          { month: 'Aug', yield: 18.7 },
          { month: 'Sep', yield: 14.0 },
          { month: 'Oct', yield: 0 }
        ],
        historicalComparison: [
          { year: '2022', yield: 38.5 },
          { year: '2023', yield: 42.1 },
          { year: '2024', yield: 45.2 }
        ],
        optimizationTips: [
          'Increase nitrogen during flowering stage',
          'Monitor soil moisture more frequently',
          'Consider pruning for better air circulation'
        ]
      });
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollArea className="h-[calc(100vh-0px)]">
        <div className="p-4 space-y-6">
          {/* Current Season Overview */}
          <Card className="border-0 shadow-sm bg-green-500 text-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Leaf className="w-5 h-5 text-white" />
                <span>Current Season Forecast</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {forecastData.currentSeason.projectedYield} lbs
                  </div>
                  <div className="text-sm text-green-100">Projected Yield</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {forecastData.currentSeason.harvestDate}
                  </div>
                  <div className="text-sm text-green-100">Est. Harvest Date</div>
                </div>
              </div>
              
              <div className="mb-4">
                <Badge className="bg-white/20 text-white">
                  {forecastData.currentSeason.confidence}% Confidence
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="text-xs text-green-100">Weather</div>
                  <div className="font-medium">
                    {forecastData.currentSeason.factors.weather}
                  </div>
                </div>
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="text-xs text-green-100">Soil Health</div>
                  <div className="font-medium">
                    {forecastData.currentSeason.factors.soilHealth}
                  </div>
                </div>
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="text-xs text-green-100">Irrigation</div>
                  <div className="font-medium">
                    {forecastData.currentSeason.factors.irrigation}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200 rounded-xl">
              <TabsTrigger value="monthly" className="rounded-xl">Monthly Forecast</TabsTrigger>
              <TabsTrigger value="historical" className="rounded-xl">Historical</TabsTrigger>
            </TabsList>
            
            <TabsContent value="monthly">
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span>Monthly Yield Projection</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={forecastData.monthlyForecast}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px'
                        }}
                      />
                      <Bar dataKey="yield" fill="#22c55e" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="historical">
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span>Year-over-Year Comparison</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={forecastData.historicalComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="year" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px'
                        }}
                      />
                      <Line type="monotone" dataKey="yield" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Optimization Tips */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-4">
              <CardTitle>Optimization Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {forecastData.optimizationTips.map((tip: string, index: number) => (
                  <li key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default YieldForecastScreen;
