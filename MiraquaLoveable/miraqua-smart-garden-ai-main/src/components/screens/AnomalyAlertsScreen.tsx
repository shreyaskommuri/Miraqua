
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  AlertTriangle, 
  Zap, 
  Droplets,
  Thermometer,
  Wifi,
  Battery,
  Check,
  X,
  Clock,
  Filter
} from "lucide-react";

interface Anomaly {
  id: string;
  type: 'leak' | 'sensor_dropout' | 'temperature_spike' | 'low_battery' | 'connectivity';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  plotId?: string;
  plotName?: string;
  acknowledged: boolean;
  resolved: boolean;
}

const AnomalyAlertsScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'unresolved'>('all');

  useEffect(() => {
    const fetchAnomalies = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockAnomalies: Anomaly[] = [
          {
            id: '1',
            type: 'leak',
            severity: 'critical',
            title: 'Water Leak Detected',
            description: 'Unusual water flow rate detected in Zone A. Flow rate is 3x higher than expected.',
            timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            plotId: '1',
            plotName: 'Tomato Garden',
            acknowledged: false,
            resolved: false
          },
          {
            id: '2',
            type: 'sensor_dropout',
            severity: 'warning',
            title: 'Soil Sensor Offline',
            description: 'Moisture sensor in Plot 2 has not reported data for 45 minutes.',
            timestamp: new Date(Date.now() - 45 * 60 * 1000),
            plotId: '2',
            plotName: 'Herb Garden',
            acknowledged: true,
            resolved: false
          },
          {
            id: '3',
            type: 'temperature_spike',
            severity: 'warning',
            title: 'Temperature Anomaly',
            description: 'Soil temperature rose to 95°F, 18° above normal for this time of day.',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            plotId: '3',
            plotName: 'Pepper Patch',
            acknowledged: true,
            resolved: true
          },
          {
            id: '4',
            type: 'low_battery',
            severity: 'info',
            title: 'Low Battery Warning',
            description: 'Sensor battery level at 15%. Replace within 7 days.',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            plotId: '1',
            plotName: 'Tomato Garden',
            acknowledged: false,
            resolved: false
          },
          {
            id: '5',
            type: 'connectivity',
            severity: 'warning',
            title: 'Gateway Connection Lost',
            description: 'LoRa gateway has been offline for 15 minutes. Sensors may not report data.',
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
            acknowledged: false,
            resolved: false
          }
        ];
        
        setAnomalies(mockAnomalies);
      } catch (error) {
        // Error handling without console logging in production
      } finally {
        setLoading(false);
      }
    };

    fetchAnomalies();
  }, []);

  const handleAcknowledge = (anomalyId: string) => {
    setAnomalies(prev => 
      prev.map(anomaly => 
        anomaly.id === anomalyId 
          ? { ...anomaly, acknowledged: true }
          : anomaly
      )
    );
  };

  const handleResolve = (anomalyId: string) => {
    setAnomalies(prev => 
      prev.map(anomaly => 
        anomaly.id === anomalyId 
          ? { ...anomaly, resolved: true, acknowledged: true }
          : anomaly
      )
    );
  };

  const getIcon = (type: Anomaly['type']) => {
    switch (type) {
      case 'leak': return Droplets;
      case 'sensor_dropout': return Wifi;
      case 'temperature_spike': return Thermometer;
      case 'low_battery': return Battery;
      case 'connectivity': return Zap;
      default: return AlertTriangle;
    }
  };

  const getSeverityColor = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredAnomalies = anomalies.filter(anomaly => {
    switch (filter) {
      case 'critical': return anomaly.severity === 'critical';
      case 'warning': return anomaly.severity === 'warning';
      case 'unresolved': return !anomaly.resolved;
      default: return true;
    }
  });

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex space-x-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'critical', label: 'Critical' },
            { key: 'warning', label: 'Warning' },
            { key: 'unresolved', label: 'Unresolved' }
          ].map(tab => (
            <Button
              key={tab.key}
              variant={filter === tab.key ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter(tab.key as any)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="p-4 space-y-4">
          {filteredAnomalies.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">All Clear!</h2>
                <p className="text-gray-600">No anomalies detected in your system.</p>
              </CardContent>
            </Card>
          ) : (
            filteredAnomalies.map((anomaly) => {
              const Icon = getIcon(anomaly.type);
              
              return (
                <Card 
                  key={anomaly.id} 
                  className={`bg-white rounded-2xl shadow-sm border-0 transition-all duration-200 hover:shadow-md ${
                    anomaly.resolved ? 'opacity-60' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        anomaly.severity === 'critical' ? 'bg-red-100' :
                        anomaly.severity === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          anomaly.severity === 'critical' ? 'text-red-600' :
                          anomaly.severity === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0 overflow-hidden">
                        {/* Header with title and badge */}
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">{anomaly.title}</h3>
                            {anomaly.plotName && (
                              <p className="text-sm text-gray-600 truncate">{anomaly.plotName}</p>
                            )}
                          </div>
                          <Badge 
                            className={`flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full border-0 ${
                              anomaly.severity === 'critical' ? 'bg-red-100 text-red-700' :
                              anomaly.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' : 
                              'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {anomaly.severity}
                          </Badge>
                        </div>
                        
                        {/* Description */}
                        <p className="text-gray-700 mb-3 text-sm leading-relaxed break-words">{anomaly.description}</p>
                        
                        {/* Footer with time and actions */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center space-x-1 text-xs text-gray-500 flex-shrink-0">
                            <Clock className="w-3 h-3" />
                            <span>{getTimeAgo(anomaly.timestamp)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            {!anomaly.acknowledged && !anomaly.resolved && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAcknowledge(anomaly.id)}
                                className="h-7 px-2 text-xs border-gray-300 hover:bg-gray-50"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Acknowledge
                              </Button>
                            )}
                            {anomaly.acknowledged && !anomaly.resolved && (
                              <Button
                                size="sm"
                                onClick={() => handleResolve(anomaly.id)}
                                className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Mark Resolved
                              </Button>
                            )}
                            {anomaly.plotId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/app/plot/${anomaly.plotId}`)}
                                className="h-7 px-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                              >
                                View Plot
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AnomalyAlertsScreen;
