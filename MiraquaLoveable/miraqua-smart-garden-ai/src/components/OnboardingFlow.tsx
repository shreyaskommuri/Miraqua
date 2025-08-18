
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Droplets, Calendar, MapPin, Settings, Check, Sparkles, Navigation, Map } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface OnboardingFlowProps {
  onComplete: (plotData: any) => void;
  onCancel: () => void;
}

const OnboardingFlow = ({ onComplete, onCancel }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [locationMethod, setLocationMethod] = useState<'coordinates' | 'current'>('coordinates');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  
  const [plotData, setPlotData] = useState({
    name: "",
    crop: "",
    area: "",
    areaUnit: "sq ft",
    plantingDate: "",
    latitude: "",
    longitude: "",
    flexType: "daily"
  });

  const steps = [
    {
      title: "Welcome to Miraqua",
      description: "Let's set up your smart irrigation system",
      icon: Sparkles
    },
    {
      title: "Plot Details",
      description: "Tell us about your garden",
      icon: Settings
    },
    {
      title: "Location Setup",
      description: "Configure your precise location",
      icon: MapPin
    },
    {
      title: "All Ready!",
      description: "Your smart irrigation is configured",
      icon: Check
    }
  ];

  const cropOptions = [
    "Tomatoes", "Lettuce", "Carrots", "Peppers", "Herbs", "Strawberries",
    "Cucumbers", "Beans", "Squash", "Corn", "Other"
  ];

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    setIsLoadingLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lon = position.coords.longitude.toFixed(6);
        setPlotData(prev => ({ ...prev, latitude: lat, longitude: lon }));
        setIsLoadingLocation(false);
      },
      (error) => {
        setLocationError("Unable to get your location. Please enter coordinates manually.");
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const validateCoordinates = () => {
    const lat = parseFloat(plotData.latitude);
    const lon = parseFloat(plotData.longitude);
    
    if (isNaN(lat) || isNaN(lon)) {
      return false;
    }
    
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      const newPlot = {
        ...plotData,
        latitude: parseFloat(plotData.latitude),
        longitude: parseFloat(plotData.longitude),
        moisture: Math.floor(Math.random() * 40) + 60,
        temperature: Math.floor(Math.random() * 10) + 68,
        sunlight: Math.floor(Math.random() * 200) + 800,
        nextWatering: "Tomorrow 6:00 AM",
        status: "healthy"
      };
      onComplete(newPlot);
      toast({
        title: "Plot Added Successfully!",
        description: "Your AI irrigation system is now monitoring your plot.",
      });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return plotData.name && plotData.crop && plotData.area && plotData.plantingDate;
      case 2:
        return validateCoordinates();
      case 3:
        return true;
      default:
        return false;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white border-0 shadow-lg">
        <CardHeader className="text-center pb-6 pt-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-sm">
              <CurrentIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-900">{steps[currentStep].title}</CardTitle>
          <CardDescription className="text-gray-500 text-base">{steps[currentStep].description}</CardDescription>
          <div className="mt-6">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-400 mt-2">Step {currentStep + 1} of {steps.length}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          {currentStep === 0 && (
            <div className="text-center space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Droplets className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Smart Watering</h4>
                  <p className="text-sm text-gray-600">AI-optimized schedules</p>
                </div>
                <div className="p-6 bg-green-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Weather Smart</h4>
                  <p className="text-sm text-gray-600">Real-time integration</p>
                </div>
                <div className="p-6 bg-purple-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Settings className="w-5 h-5 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Easy Control</h4>
                  <p className="text-sm text-gray-600">Natural commands</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="plotName" className="text-sm font-medium text-gray-700">Plot Name</Label>
                <Input
                  id="plotName"
                  placeholder="e.g., Tomato Garden"
                  value={plotData.name}
                  onChange={(e) => setPlotData({ ...plotData, name: e.target.value })}
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="crop" className="text-sm font-medium text-gray-700">Crop Type</Label>
                <Select value={plotData.crop} onValueChange={(value) => setPlotData({ ...plotData, crop: value })}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select a crop type" />
                  </SelectTrigger>
                  <SelectContent>
                    {cropOptions.map((crop) => (
                      <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area" className="text-sm font-medium text-gray-700">Area</Label>
                  <Input
                    id="area"
                    type="number"
                    placeholder="100"
                    value={plotData.area}
                    onChange={(e) => setPlotData({ ...plotData, area: e.target.value })}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-sm font-medium text-gray-700">Unit</Label>
                  <Select value={plotData.areaUnit} onValueChange={(value) => setPlotData({ ...plotData, areaUnit: value })}>
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sq ft">Square Feet</SelectItem>
                      <SelectItem value="sq m">Square Meters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plantingDate" className="text-sm font-medium text-gray-700">Planting Date</Label>
                <Input
                  id="plantingDate"
                  type="date"
                  value={plotData.plantingDate}
                  onChange={(e) => setPlotData({ ...plotData, plantingDate: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <Tabs value={locationMethod} onValueChange={(value) => setLocationMethod(value as 'coordinates' | 'current')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="coordinates" className="flex items-center space-x-2">
                    <Map className="w-4 h-4" />
                    <span>Enter Coordinates</span>
                  </TabsTrigger>
                  <TabsTrigger value="current" className="flex items-center space-x-2">
                    <Navigation className="w-4 h-4" />
                    <span>Use Current Location</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="coordinates" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude" className="text-sm font-medium text-gray-700">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        placeholder="37.7749"
                        value={plotData.latitude}
                        onChange={(e) => setPlotData({ ...plotData, latitude: e.target.value })}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        min={-90}
                        max={90}
                        step={0.000001}
                      />
                      <p className="text-xs text-gray-500">Range: -90 to 90</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude" className="text-sm font-medium text-gray-700">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        placeholder="-122.4194"
                        value={plotData.longitude}
                        onChange={(e) => setPlotData({ ...plotData, longitude: e.target.value })}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        min={-180}
                        max={180}
                        step={0.000001}
                      />
                      <p className="text-xs text-gray-500">Range: -180 to 180</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="current" className="space-y-4 mt-4">
                  <div className="text-center">
                    <Button
                      onClick={getCurrentLocation}
                      disabled={isLoadingLocation}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isLoadingLocation ? (
                        "Getting your location..."
                      ) : (
                        <>
                          <Navigation className="w-4 h-4 mr-2" />
                          Get Current Location
                        </>
                      )}
                    </Button>
                    
                    {locationError && (
                      <p className="text-sm text-red-600 mt-2">{locationError}</p>
                    )}
                    
                    {plotData.latitude && plotData.longitude && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Location found:</strong><br />
                          Lat: {plotData.latitude}, Lon: {plotData.longitude}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {validateCoordinates() && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-blue-900">Valid Coordinates</h4>
                        <p className="text-sm text-blue-700">
                          Lat: {parseFloat(plotData.latitude).toFixed(4)}, Lon: {parseFloat(plotData.longitude).toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Watering Flexibility</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Card 
                    className={`cursor-pointer transition-all border-2 ${plotData.flexType === 'daily' ? 'border-blue-200 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setPlotData({ ...plotData, flexType: 'daily' })}
                  >
                    <CardContent className="p-4 text-center">
                      <h4 className="font-medium text-gray-900 mb-1">Daily</h4>
                      <p className="text-sm text-gray-600">Water every day as needed</p>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer transition-all border-2 ${plotData.flexType === 'flexible' ? 'border-blue-200 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setPlotData({ ...plotData, flexType: 'flexible' })}
                  >
                    <CardContent className="p-4 text-center">
                      <h4 className="font-medium text-gray-900 mb-1">Flexible</h4>
                      <p className="text-sm text-gray-600">Skip days when possible</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Perfect!</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Your plot "{plotData.name}" is ready for AI-powered irrigation at coordinates{' '}
                  {plotData.latitude && plotData.longitude && (
                    <span className="font-medium">
                      {parseFloat(plotData.latitude).toFixed(4)}, {parseFloat(plotData.longitude).toFixed(4)}
                    </span>
                  )}. 
                  The system will analyze weather and soil conditions automatically.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl">
                <h4 className="font-medium text-gray-900 mb-3">What's next:</h4>
                <ul className="text-sm text-gray-600 space-y-2 text-left max-w-sm mx-auto">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                    Monitor real-time metrics
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                    View 7-day schedule
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                    Chat with AI assistant
                  </li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={currentStep === 0 ? onCancel : handlePrev}
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {currentStep === 0 ? "Cancel" : "Back"}
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300"
            >
              {currentStep === steps.length - 1 ? "Complete Setup" : "Continue"}
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlow;
