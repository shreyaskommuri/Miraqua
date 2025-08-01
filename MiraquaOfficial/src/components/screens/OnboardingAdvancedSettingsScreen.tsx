
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, ArrowRight, Settings, Droplets, Thermometer, Sparkles, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

const OnboardingAdvancedSettingsScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const plotData = location.state;
  const [plantedDate, setPlantedDate] = useState<Date>(new Date());
  const [plantedAge, setPlantedAge] = useState(0); // Age in months when planted
  const [soilPH, setSoilPH] = useState([6.5]);
  const [soilType, setSoilType] = useState("");
  const [showImpact, setShowImpact] = useState(false);

  const soilTypes = [
    { 
      id: "clay", 
      name: "Clay", 
      drainage: "Poor", 
      retention: "High",
      description: "Rich in nutrients, retains moisture well",
      waterAdjust: "+30% frequency"
    },
    { 
      id: "sandy", 
      name: "Sandy", 
      drainage: "Excellent", 
      retention: "Low",
      description: "Drains quickly, needs frequent watering",
      waterAdjust: "+50% frequency"
    },
    { 
      id: "loam", 
      name: "Loam", 
      drainage: "Good", 
      retention: "Medium",
      description: "Perfect balance of drainage and retention",
      waterAdjust: "Standard schedule",
      recommended: true
    },
    { 
      id: "silt", 
      name: "Silt", 
      drainage: "Fair", 
      retention: "High",
      description: "Fine particles, compacts easily",
      waterAdjust: "+20% frequency"
    }
  ];

  useEffect(() => {
    if (plantedDate.toDateString() !== new Date().toDateString() || plantedAge !== 0 || soilPH[0] !== 6.5 || soilType) {
      setShowImpact(true);
    }
  }, [plantedDate, plantedAge, soilPH, soilType]);

  const handleContinue = () => {
    navigate("/onboarding/complete", {
      state: { 
        ...plotData, 
        plantedDate: plantedDate.toISOString().split('T')[0],
        plantedAge,
        soilPH: soilPH[0], 
        soilType,
        isAdvancedSetup: true 
      }
    });
  };

  const handleSkip = () => {
    navigate("/onboarding/complete", {
      state: { ...plotData, isAdvancedSetup: false }
    });
  };

  const getDrainageColor = (drainage: string) => {
    switch (drainage) {
      case "Excellent": return "bg-green-100 text-green-700";
      case "Good": return "bg-blue-100 text-blue-700";
      case "Fair": return "bg-yellow-100 text-yellow-700";
      case "Poor": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-900">Advanced Settings</h1>
              <p className="text-sm text-gray-500">Step 3 of 3 (Optional)</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSkip}
              className="text-purple-600"
            >
              Skip
            </Button>
          </div>
        </div>
      </header>

      <div className="px-6 py-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm text-gray-600">100%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full w-full transition-all duration-300"></div>
          </div>
        </div>

        {/* Intro */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Fine-tune Your Garden</h2>
          <p className="text-gray-600">Precision settings for maximum efficiency (optional but recommended)</p>
        </div>

        {/* Crop Age */}
        <Card className="border-0 shadow-sm bg-white mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Leaf className="w-5 h-5 text-green-600" />
              <span>Crop Age & Growth</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>When was it planted?</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-xl",
                        !plantedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {plantedDate ? format(plantedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={plantedDate}
                      onSelect={(date) => date && setPlantedDate(date)}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Age when planted (months)</Label>
                <input
                  type="number"
                  value={plantedAge}
                  onChange={(e) => setPlantedAge(parseInt(e.target.value) || 0)}
                  min="0"
                  max="12"
                  placeholder="0 (seedling)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="p-3 bg-primary/5 rounded-lg">
              <p className="text-sm text-gray-600">
                💡 <strong>Smart root depth:</strong> We'll automatically calculate optimal root depth based on crop age and type for precision watering.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Soil pH */}
        <Card className="border-0 shadow-sm bg-white mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Thermometer className="w-5 h-5 text-orange-600" />
              <span>Soil pH</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-gray-700">pH Level</Label>
                <Badge variant="outline">{soilPH[0]}</Badge>
              </div>
              <Slider
                value={soilPH}
                onValueChange={setSoilPH}
                max={8}
                min={5}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Acidic (5.0)</span>
                <span>Neutral (7.0)</span>
                <span>Alkaline (8.0)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Soil Type */}
        <Card className="border-0 shadow-sm bg-white mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Soil Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {soilTypes.map((soil) => (
                <Card
                  key={soil.id}
                  className={`cursor-pointer transition-all duration-300 border-0 shadow-sm ${
                    soilType === soil.id
                      ? "bg-primary/10 ring-2 ring-primary transform scale-[1.02]"
                      : "bg-white hover:shadow-md hover:bg-gray-50"
                  }`}
                  onClick={() => setSoilType(soil.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{soil.name}</h3>
                      {soil.recommended && (
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{soil.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`text-xs ${getDrainageColor(soil.drainage)}`}>
                        {soil.drainage} drainage
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {soil.retention} retention
                      </Badge>
                      <Badge variant="outline" className="text-xs border-primary/20 text-primary">
                        {soil.waterAdjust}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Smart Impact Preview */}
        {showImpact && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 to-accent/5 animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>Precision irrigation impact</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm font-medium">Water efficiency</span>
                  <span className="text-sm text-primary font-semibold">+25% more efficient</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm font-medium">Plant health</span>
                  <span className="text-sm text-success font-semibold">Optimal growth</span>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-600">
                    🎯 <strong>Smart adjustment:</strong> Your custom settings will reduce water waste by 25% while maximizing plant health.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleContinue}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Leaf className="w-4 h-4 mr-2" />
            Complete Setup
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          <Button
            onClick={handleSkip}
            variant="outline"
            className="w-full h-10 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
          >
            Use Smart Defaults Instead
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingAdvancedSettingsScreen;
