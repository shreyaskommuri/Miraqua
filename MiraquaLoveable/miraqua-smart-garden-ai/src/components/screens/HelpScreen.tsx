
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Search, 
  HelpCircle, 
  ChevronDown, 
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Mail,
  AlertTriangle,
  Loader2
} from "lucide-react";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const HelpScreen = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFAQs = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFaqs([
        {
          id: 1,
          question: "How does the AI watering system work?",
          answer: "Our AI system analyzes weather data, soil moisture, plant type, and growth stage to create optimal watering schedules. It automatically adjusts based on rainfall, temperature, and humidity.",
          category: "AI & Automation"
        },
        {
          id: 2,
          question: "Can I manually override the watering schedule?",
          answer: "Yes! You can manually water your plants anytime using the 'Water Now' button. You can also adjust the AI schedule or create custom schedules in the plot settings.",
          category: "Controls"
        },
        {
          id: 3,
          question: "What sensors are compatible with Miraqua?",
          answer: "Miraqua works with most soil moisture sensors, temperature sensors, and weather stations. We support popular brands like Arduino, Raspberry Pi sensors, and commercial agricultural sensors.",
          category: "Hardware"
        },
        {
          id: 4,
          question: "How accurate is the weather forecasting?",
          answer: "We use multiple weather data sources and machine learning to provide highly accurate 7-day forecasts. Our system automatically adjusts watering schedules when rain is predicted.",
          category: "Weather"
        },
        {
          id: 5,
          question: "Can I manage multiple garden plots?",
          answer: "Absolutely! You can add unlimited plots, each with its own crops, settings, and watering schedules. Perfect for managing different areas of your garden or multiple properties.",
          category: "Plot Management"
        }
      ]);
    } catch (err) {
      setError("Help content unavailable");
    } finally {
      setLoading(false);
    }
  };

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleContactSupport = () => {
    // In a real app, this would open a support chat or email
    window.open('mailto:support@miraqua.com', '_blank');
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-lg font-bold">Help & Support</h1>
            </div>
          </div>
        </header>
        
        <div className="p-4 space-y-4">
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          {Array.from({ length: 5 }).map((_, i) => (
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
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-lg font-bold">Help & Support</h1>
            </div>
          </div>
        </header>
        
        <div className="p-4">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-3" />
              <p className="text-red-600 mb-4">{error}</p>
              <div className="space-y-2">
                <Button variant="outline" onClick={fetchFAQs}>
                  Try Again
                </Button>
                <div className="text-sm text-gray-600">
                  <p>You can also visit our external docs:</p>
                  <a 
                    href="https://docs.miraqua.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center"
                  >
                    Documentation <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
            <div>
              <h1 className="text-lg font-bold text-gray-900">Help & Support</h1>
              <p className="text-sm text-gray-600">Find answers to common questions</p>
            </div>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="px-4 py-4 space-y-6">
          {/* Search Bar */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Card 
              className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={handleContactSupport}
            >
              <CardContent className="p-4 text-center">
                <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Contact Support</h3>
                <p className="text-sm text-gray-600">Get help from our team</p>
              </CardContent>
            </Card>
            
            <Card 
              className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => window.open('https://docs.miraqua.com', '_blank')}
            >
              <CardContent className="p-4 text-center">
                <ExternalLink className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Documentation</h3>
                <p className="text-sm text-gray-600">Read our full guides</p>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5" />
                <span>Frequently Asked Questions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No results found for "{searchQuery}"</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchQuery("")}
                    className="mt-2"
                  >
                    Clear Search
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFAQs.map((faq) => (
                    <div key={faq.id} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleFAQ(faq.id)}
                        className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">{faq.question}</h4>
                          <p className="text-sm text-blue-600 mt-1">{faq.category}</p>
                        </div>
                        {expandedFAQ === faq.id ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      {expandedFAQ === faq.id && (
                        <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-0 shadow-md bg-blue-50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Still need help?</h3>
              <div className="space-y-2">
                <a 
                  href="mailto:support@miraqua.com"
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  <Mail className="w-4 h-4" />
                  <span>support@miraqua.com</span>
                </a>
                <a 
                  href="https://docs.miraqua.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Documentation</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default HelpScreen;
