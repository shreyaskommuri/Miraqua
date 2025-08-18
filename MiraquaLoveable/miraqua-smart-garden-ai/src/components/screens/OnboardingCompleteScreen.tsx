
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Edit, MapPin, Leaf, Settings, ArrowRight } from "lucide-react";

const OnboardingCompleteScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const plotData = location.state || {};

  const handleGoToDashboard = () => {
    navigate('/home');
  };

  const handleEdit = (step: string) => {
    switch (step) {
      case 'crop':
        navigate('/onboarding/crop');
        break;
      case 'location':
        navigate('/onboarding/location');
        break;
      case 'settings':
        navigate('/onboarding/settings');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-900">Setup Complete!</h1>
            <p className="text-sm text-gray-500">Step 4 of 4</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="px-6 pb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full w-full transition-all duration-300"></div>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="px-6 py-6 space-y-8 pb-32">
          {/* Success Header */}
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Your plot is ready!</h2>
            <p className="text-gray-600 text-lg">We've created an optimized watering schedule for your garden</p>
          </div>

          {/* Summary Cards */}
          <div className="space-y-4">
            {/* Plot Details */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Leaf className="w-5 h-5 text-green-600" />
                    <span>Plot Details</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('crop')}
                    className="text-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{plotData.plotName || "My Garden"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Crop:</span>
                    <Badge className="bg-green-100 text-green-800 capitalize">
                      {plotData.cropType || "tomatoes"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span>Location</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('location')}
                    className="text-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Coordinates:</span>
                    <span className="font-mono">
                      {(plotData.latitude || 37.7749).toFixed(4)}, {(plotData.longitude || -122.4194).toFixed(4)}
                    </span>
                  </div>
                  {plotData.address && (
                    <div>
                      <span className="text-gray-600 text-sm">Address:</span>
                      <p className="text-sm mt-1">{plotData.address}</p>
                    </div>
                  )}
                  
                  {/* Mini Map Preview */}
                  <div className="relative w-full h-32 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl mt-3">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Settings */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-purple-600" />
                    <span>Settings</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('settings')}
                    className="text-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Soil Type:</span>
                    <span className="font-medium capitalize">{plotData.soilType || "loam"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Planted:</span>
                    <span className="font-medium">{plotData.plantedDate || "Today"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age when planted:</span>
                    <span className="font-medium">{plotData.plantedAge || 0} months</span>
                  </div>
                  {plotData.soilPH && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Soil pH:</span>
                      <span className="font-medium">{plotData.soilPH}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Next Steps */}
          <Card className="border-0 shadow-sm bg-green-50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">What's Next?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>AI watering schedule created</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Weather monitoring enabled</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Ready to start growing!</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Go to Dashboard Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6">
        <Button
          onClick={handleGoToDashboard}
          className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl"
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingCompleteScreen;
