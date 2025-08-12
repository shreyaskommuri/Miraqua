
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X, Send, Bot, User, Droplets, Calendar, Settings } from "lucide-react";

interface ChatInterfaceProps {
  onClose: () => void;
}

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const ChatInterface = ({ onClose }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: "Hi! I'm your AI irrigation assistant. I can help you manage your watering schedules, adjust settings, and answer questions about your plots. Try commands like 'skip watering tomorrow' or 'increase water for tomato garden'.",
      timestamp: new Date(),
      suggestions: [
        "Skip watering tomorrow",
        "Show me the weather forecast",
        "Increase water for tomato garden",
        "When should I water next?"
      ]
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      const aiMessage: Message = {
        id: messages.length + 2,
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('skip') && lowerInput.includes('tomorrow')) {
      return {
        content: "I'll skip watering tomorrow for your plots. The schedule has been updated and your plants will receive water the following day instead. This adjustment takes into account the current soil moisture and weather forecast.",
        suggestions: ["Undo this change", "Show updated schedule", "Skip for specific plot"]
      };
    }
    
    if (lowerInput.includes('weather') || lowerInput.includes('forecast')) {
      return {
        content: "The weather forecast shows partly cloudy skies with a 20% chance of rain tomorrow. Temperature will range from 68-76°F. Based on this, I recommend proceeding with the current watering schedule as natural precipitation is unlikely.",
        suggestions: ["Adjust for weather", "Show 7-day forecast", "Water now before rain"]
      };
    }
    
    if (lowerInput.includes('increase') || lowerInput.includes('more water')) {
      return {
        content: "I can increase the watering duration by 25% for your selected plots. This will add approximately 2-3 minutes to each watering session. Would you like me to apply this change?",
        suggestions: ["Confirm increase", "Decrease instead", "Set specific duration"]
      };
    }
    
    if (lowerInput.includes('when') && (lowerInput.includes('water') || lowerInput.includes('next'))) {
      return {
        content: "Your next scheduled watering is today at 6:00 AM for the Tomato Garden, and tomorrow at 5:30 AM for the Herb Patch. Both schedules are optimized based on current soil moisture and weather conditions.",
        suggestions: ["Change watering time", "Water now", "View full schedule"]
      };
    }
    
    return {
      content: "I understand you're asking about irrigation management. I can help you skip waterings, adjust schedules, change watering amounts, or provide information about your plots. What specific action would you like me to take?",
      suggestions: [
        "Skip next watering",
        "Show current schedule", 
        "Adjust water amount",
        "Check soil moisture"
      ]
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[600px] bg-white/95 backdrop-blur-sm border-green-100 flex flex-col">
        <CardHeader className="pb-4 border-b border-green-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-500 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-green-800">AI Assistant</CardTitle>
                <CardDescription className="text-green-600">Smart irrigation commands & help</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user' 
                          ? 'bg-blue-100' 
                          : 'bg-green-100'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Bot className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <div className={`rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                    
                    {message.suggestions && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Badge 
                            key={index}
                            variant="outline"
                            className="cursor-pointer hover:bg-green-50 border-green-200 text-green-700"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-green-100 p-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Type a command like 'skip watering tomorrow'..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 border-green-200 focus:ring-green-500"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge 
                variant="outline"
                className="cursor-pointer hover:bg-green-50 border-green-200 text-green-700"
                onClick={() => handleSuggestionClick("Skip watering today")}
              >
                <Calendar className="w-3 h-3 mr-1" />
                Skip watering today
              </Badge>
              <Badge 
                variant="outline"
                className="cursor-pointer hover:bg-green-50 border-green-200 text-green-700"
                onClick={() => handleSuggestionClick("Water now")}
              >
                <Droplets className="w-3 h-3 mr-1" />
                Water now
              </Badge>
              <Badge 
                variant="outline"
                className="cursor-pointer hover:bg-green-50 border-green-200 text-green-700"
                onClick={() => handleSuggestionClick("Show schedule")}
              >
                <Settings className="w-3 h-3 mr-1" />
                Show schedule
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatInterface;
