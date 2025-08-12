import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, Bot, User, Mic, Camera, Droplets, Thermometer, Sun, MapPin, Leaf, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlotData {
  id: number;
  name: string;
  crop: string;
  moisture: number;
  temperature: number;
  sunlight: number;
  status: string;
  nextWatering: string;
  location: string;
  waterUsage: number;
  sensorStatus: string;
  batteryLevel: number;
  soilPh: number;
  lastWatered: string;
}

const FarmerChatScreen = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [showGardenStatus, setShowGardenStatus] = useState(true);
  const [selectedPlot, setSelectedPlot] = useState<PlotData | null>(null);
  const [selectedPlotId, setSelectedPlotId] = useState<string>("general");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hi! I'm your AI irrigation assistant. I can help you optimize watering schedules, diagnose plant issues, and provide expert gardening advice.",
      time: "now"
    }
  ]);

  // Mock plot data
  const mockPlots: PlotData[] = [
    {
      id: 1,
      name: "Backyard Garden",
      crop: "Tomatoes",
      moisture: 65,
      temperature: 78,
      sunlight: 85,
      status: "healthy",
      nextWatering: "Tomorrow 6:00 AM",
      location: "North Side",
      waterUsage: 120,
      sensorStatus: "online",
      batteryLevel: 78,
      soilPh: 6.8,
      lastWatered: "Yesterday"
    },
    {
      id: 2,
      name: "Herb Garden",
      crop: "Basil",
      moisture: 45,
      temperature: 75,
      sunlight: 70,
      status: "needs attention",
      nextWatering: "Today 4:00 PM",
      location: "Kitchen Window",
      waterUsage: 45,
      sensorStatus: "online",
      batteryLevel: 65,
      soilPh: 7.2,
      lastWatered: "2 days ago"
    }
  ];

  useEffect(() => {
    // Check if we have plot data from navigation
    const plotData = sessionStorage.getItem('selectedPlotForChat');
    if (plotData) {
      const plot = JSON.parse(plotData);
      setSelectedPlot(plot);
      
      // Add initial message about the selected plot
      const plotMessage = {
        id: Date.now(),
        sender: "bot" as const,
        text: `I see you're asking about your ${plot.name}. Here's what I know: It's growing ${plot.crop} with ${plot.moisture}% soil moisture, ${plot.temperature}°F temperature, and ${plot.sunlight}% sunlight. The sensor battery is at ${plot.batteryLevel}% and pH is ${plot.soilPh}. How can I help optimize this plot?`,
        time: "now"
      };
      
      setMessages(prev => [...prev, plotMessage]);
      
      // Clear the session storage
      sessionStorage.removeItem('selectedPlotForChat');
    }
  }, []);

  const quickActions = selectedPlot ? [
    "Water now",
    "Skip watering", 
    "Check health",
    "Adjust"
  ] : [
    "Water plants",
    "Skip watering", 
    "Plant health",
    "Adjust"
  ];

  const handlePlotSelection = (value: string) => {
    setSelectedPlotId(value);
    if (value === "general") {
      setSelectedPlot(null);
    } else {
      const plot = mockPlots.find(p => p.id.toString() === value);
      setSelectedPlot(plot || null);
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: "user" as const,
        text: message,
        time: "now"
      };
      setMessages([...messages, newMessage]);
      setMessage("");
      
      // Simulate AI response with plot context
      setTimeout(() => {
        let botResponse = "I understand your concern. Let me analyze your garden data and provide personalized recommendations.";
        
        if (selectedPlot) {
          if (message.toLowerCase().includes('water')) {
            botResponse = `Based on ${selectedPlot.name}'s current moisture level of ${selectedPlot.moisture}%, I ${selectedPlot.moisture < 50 ? 'recommend watering soon' : 'suggest waiting until tomorrow'}. The soil pH of ${selectedPlot.soilPh} is ${selectedPlot.soilPh > 7 ? 'slightly alkaline' : selectedPlot.soilPh < 6.5 ? 'slightly acidic' : 'optimal'} for ${selectedPlot.crop}.`;
          } else if (message.toLowerCase().includes('health') || message.toLowerCase().includes('problem')) {
            botResponse = `Your ${selectedPlot.name} shows ${selectedPlot.status} status. With ${selectedPlot.sunlight}% sunlight and ${selectedPlot.temperature}°F temperature, conditions are ${selectedPlot.temperature > 80 ? 'quite warm' : selectedPlot.temperature < 60 ? 'cool' : 'good'} for ${selectedPlot.crop}. ${selectedPlot.batteryLevel < 30 ? 'Note: The sensor battery is low and should be replaced soon.' : ''}`;
          } else if (message.toLowerCase().includes('schedule')) {
            botResponse = `For ${selectedPlot.name}, the next watering is scheduled for ${selectedPlot.nextWatering}. Based on current moisture (${selectedPlot.moisture}%) and weather conditions, this timing looks ${selectedPlot.moisture > 70 ? 'possibly too frequent - consider extending the interval' : 'appropriate'}.`;
          }
        }
        
        const aiMessage = {
          id: messages.length + 2,
          sender: "bot" as const,
          text: botResponse,
          time: "now"
        };
        setMessages(prev => [...prev, aiMessage]);
      }, 1000);
    }
  };

  const handleChatWithPlot = (plot: PlotData) => {
    sessionStorage.setItem('selectedPlotForChat', JSON.stringify(plot));
    navigate('/app/chat');
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Quick Actions */}
      <div className="bg-white border-b border-gray-100 p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">Quick actions:</p>
          <Select value={selectedPlotId} onValueChange={handlePlotSelection}>
            <SelectTrigger className="w-44 h-9 text-xs bg-white border-gray-200 hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <SelectValue placeholder="Select plot" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
              <SelectItem value="general" className="hover:bg-gray-50 focus:bg-gray-50">General Question</SelectItem>
              {mockPlots.map((plot) => (
                <SelectItem key={plot.id} value={plot.id.toString()} className="hover:bg-gray-50 focus:bg-gray-50">
                  {plot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setMessage(action)}
              className="text-xs h-9 px-3 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-medium"
            >
              {action}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages - Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[80%] ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                msg.sender === 'user' 
                  ? 'bg-blue-500' 
                  : 'bg-gradient-to-br from-green-500 to-blue-600'
              }`}>
                {msg.sender === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={`px-4 py-3 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}>
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-1 ${
                  msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {msg.time}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Garden Status - Above input area like Lovable */}
      {showGardenStatus && (
        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
          <div className="mb-4">
            <div className="bg-gray-900 text-white rounded-lg p-4 shadow-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1">
                      {selectedPlot ? `${selectedPlot.name} Status` : 'Garden Status'}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {selectedPlot 
                        ? `${selectedPlot.status.charAt(0).toUpperCase() + selectedPlot.status.slice(1)} • Next watering: ${selectedPlot.nextWatering}`
                        : 'All plots monitored • AI optimization active'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-600 text-white border-green-500 px-3 py-1 text-sm font-medium hover:bg-green-700">
                    {selectedPlot?.status === 'healthy' ? 'Optimal' : 'Monitoring'}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-400 hover:text-white p-1 h-6 w-6"
                    onClick={() => setShowGardenStatus(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Input Area */}
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="w-10 h-10 p-0">
              <Camera className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="w-10 h-10 p-0">
              <Mic className="w-4 h-4" />
            </Button>
            <div className="flex-1 flex items-center space-x-2">
              <Input
                placeholder={selectedPlot 
                  ? `Ask about your ${selectedPlot.name}...` 
                  : "Ask me anything about your garden..."
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="h-10"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!message.trim()}
                size="sm"
                className="w-10 h-10 p-0 bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Input Area when garden status is hidden */}
      {!showGardenStatus && (
        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="w-10 h-10 p-0">
              <Camera className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="w-10 h-10 p-0">
              <Mic className="w-4 h-4" />
            </Button>
            <div className="flex-1 flex items-center space-x-2">
              <Input
                placeholder={selectedPlot 
                  ? `Ask about your ${selectedPlot.name}...` 
                  : "Ask me anything about your garden..."
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="h-10"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!message.trim()}
                size="sm"
                className="w-10 h-10 p-0 bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerChatScreen;
