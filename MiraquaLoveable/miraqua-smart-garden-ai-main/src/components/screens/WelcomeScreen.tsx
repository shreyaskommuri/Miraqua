
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplets, Leaf, Smartphone, Bot, ArrowRight } from "lucide-react";

const WelcomeScreen = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Droplets,
      title: "Smart Watering",
      description: "AI-optimized irrigation based on weather and soil conditions"
    },
    {
      icon: Leaf,
      title: "Plant Health",
      description: "Real-time monitoring with expert insights"
    },
    {
      icon: Smartphone,
      title: "Remote Control",
      description: "Manage your garden from anywhere"
    },
    {
      icon: Bot,
      title: "AI Assistant",
      description: "Get 24/7 expert gardening advice"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          {/* Logo & Title */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Droplets className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to
              <span className="block text-green-600 mt-2">
                Miraqua
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              The smartest way to water your garden. Save water, grow better.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-sm bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 space-y-4">
        <Button
          onClick={() => navigate("/signup")}
          className="w-full h-12 bg-green-500 hover:bg-green-600 text-white text-lg font-medium rounded-xl"
        >
          Get Started - It's Free
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        
        <Button
          onClick={() => navigate("/signin")}
          variant="outline"
          className="w-full h-12 border-gray-300 text-gray-700 rounded-xl"
        >
          I Already Have an Account
        </Button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
