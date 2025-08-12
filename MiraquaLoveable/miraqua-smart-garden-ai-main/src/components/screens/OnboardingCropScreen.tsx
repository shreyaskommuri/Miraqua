import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Search, Leaf, Sparkles, Clock, Droplets } from "lucide-react";

const OnboardingCropScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const plotData = location.state;

  const [plotName, setPlotName] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [customCropName, setCustomCropName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const crops = [
    { 
      id: "tomatoes", 
      name: "Tomatoes", 
      emoji: "🍅", 
      season: "Spring/Summer", 
      difficulty: "Beginner",
      wateringFreq: "Daily",
      benefits: "High yield, easy to grow",
      popular: true
    },
    { 
      id: "lettuce", 
      name: "Lettuce", 
      emoji: "🥬", 
      season: "Spring/Fall", 
      difficulty: "Beginner",
      wateringFreq: "Every 2 days",
      benefits: "Fast growing, low maintenance"
    },
    { 
      id: "herbs", 
      name: "Herbs", 
      emoji: "🌿", 
      season: "Year-round", 
      difficulty: "Beginner",
      wateringFreq: "Every 2-3 days",
      benefits: "Continuous harvest, aromatic",
      popular: true
    },
    { 
      id: "carrots", 
      name: "Carrots", 
      emoji: "🥕", 
      season: "Spring/Fall", 
      difficulty: "Beginner",
      wateringFreq: "Every 2 days",
      benefits: "Root vegetable, stores well"
    },
    { 
      id: "peppers", 
      name: "Peppers", 
      emoji: "🌶️", 
      season: "Summer", 
      difficulty: "Intermediate",
      wateringFreq: "Daily",
      benefits: "Heat-loving, colorful varieties"
    },
    { 
      id: "strawberries", 
      name: "Strawberries", 
      emoji: "🍓", 
      season: "Spring/Summer", 
      difficulty: "Intermediate",
      wateringFreq: "Daily",
      benefits: "Perennial, sweet fruit",
      popular: true
    },
    { 
      id: "broccoli", 
      name: "Broccoli", 
      emoji: "🥦", 
      season: "Spring/Fall", 
      difficulty: "Intermediate",
      wateringFreq: "Daily",
      benefits: "Nutritious, cool-weather crop"
    },
    { 
      id: "beans", 
      name: "Beans", 
      emoji: "🫘", 
      season: "Spring/Summer", 
      difficulty: "Beginner",
      wateringFreq: "Every 2 days",
      benefits: "Nitrogen-fixing, protein-rich"
    },
    { 
      id: "custom", 
      name: "Other/Custom", 
      emoji: "✨", 
      season: "Variable", 
      difficulty: "Variable",
      wateringFreq: "Custom",
      benefits: "Tailored to your needs"
    }
  ];

  // Filter crops based on search
  const filteredCrops = crops.filter(crop => 
    crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crop.difficulty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crop.season.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Popular crops for recommendations
  const popularCrops = crops.filter(crop => crop.popular);

  useEffect(() => {
    if (selectedCrop && selectedCrop !== 'custom') {
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
  }, [selectedCrop]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!plotName.trim()) {
      newErrors.plotName = "Plot name is required";
    } else if (plotName.length < 2) {
      newErrors.plotName = "Plot name must be at least 2 characters";
    }
    
    if (!selectedCrop) {
      newErrors.selectedCrop = "Please select a crop type";
    }
    
    if (selectedCrop === "custom" && !customCropName.trim()) {
      newErrors.customCropName = "Please enter a custom crop name";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      navigate('/onboarding/location', {
        state: { 
          ...plotData, 
          plotName: plotName.trim(),
          selectedCrop,
          customCropName: selectedCrop === 'custom' ? customCropName : '',
          cropDetails: crops.find(crop => crop.id === selectedCrop)
        }
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackNavigation = () => {
    navigate('/welcome');
  };

  const isFormValid = plotName.trim().length >= 2 && selectedCrop && (selectedCrop !== 'custom' || customCropName.trim());

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackNavigation}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-900">Setup Your Plot</h1>
              <p className="text-sm text-gray-500">Step 1 of 4</p>
            </div>
            <div className="w-9"></div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="px-6 pb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full w-1/4 transition-all duration-300"></div>
          </div>
        </div>
      </header>

      <div className="px-6 py-6 space-y-8 pb-32">
        {/* Intro */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Let's set up your garden plot</h2>
          <p className="text-gray-600">Give your plot a name and choose what you're growing for personalized care</p>
        </div>

        {/* Quick Recommendations */}
        {!selectedCrop && (
          <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-accent/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>Popular for beginners</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {popularCrops.map((crop) => (
                  <Button
                    key={crop.id}
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCrop(crop.id)}
                    className="rounded-full border-primary/20 hover:bg-primary/10"
                  >
                    <span className="mr-1">{crop.emoji}</span>
                    {crop.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plot Name */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Plot Name</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="plotName">Give your plot a memorable name</Label>
              <Input
                id="plotName"
                placeholder="e.g., Backyard Garden, Herb Corner, Tomato Paradise"
                value={plotName}
                onChange={(e) => {
                  setPlotName(e.target.value);
                  if (errors.plotName) {
                    setErrors(prev => ({ ...prev, plotName: '' }));
                  }
                }}
                className={`rounded-xl ${errors.plotName ? 'border-red-500' : ''}`}
                maxLength={50}
              />
              {errors.plotName && (
                <p className="text-sm text-red-600">{errors.plotName}</p>
              )}
              <p className="text-xs text-gray-500">{plotName.length}/50 characters</p>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search crops (e.g., tomatoes, beginner, summer)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl border-gray-200 focus:border-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Crop Selection */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Choose your crop</CardTitle>
            <p className="text-sm text-gray-600">
              {filteredCrops.length} crop{filteredCrops.length !== 1 ? 's' : ''} available
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {filteredCrops.map((crop) => (
                <Card
                  key={crop.id}
                  className={`cursor-pointer transition-all duration-300 border-0 shadow-sm ${
                    selectedCrop === crop.id
                      ? "bg-primary/10 ring-2 ring-primary shadow-lg transform scale-[1.02]"
                      : "bg-white hover:shadow-md hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedCrop(crop.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{crop.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{crop.name}</h3>
                          {crop.popular && (
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${crop.difficulty === 'Beginner' ? 'border-success text-success' : 
                                                   crop.difficulty === 'Intermediate' ? 'border-warning text-warning' : 
                                                   'border-destructive text-destructive'}`}
                          >
                            {crop.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                            <Clock className="w-3 h-3 mr-1" />
                            {crop.season}
                          </Badge>
                          <Badge variant="outline" className="text-xs border-cyan-200 text-cyan-700">
                            <Droplets className="w-3 h-3 mr-1" />
                            {crop.wateringFreq}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">{crop.benefits}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Custom Crop Input */}
        {selectedCrop === 'custom' && (
          <Card className="border-0 shadow-sm bg-white animate-fade-in">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Custom Crop</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="customCropName">Enter your crop name</Label>
                <Input
                  id="customCropName"
                  placeholder="e.g., sunflowers, kale, etc."
                  value={customCropName}
                  onChange={(e) => {
                    setCustomCropName(e.target.value);
                    if (errors.customCropName) {
                      setErrors(prev => ({ ...prev, customCropName: '' }));
                    }
                  }}
                  className={`rounded-xl ${errors.customCropName ? 'border-red-500' : ''}`}
                />
                {errors.customCropName && (
                  <p className="text-sm text-red-600">{errors.customCropName}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Smart Preview */}
        {showPreview && selectedCrop !== 'custom' && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 to-accent/5 animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>Smart irrigation preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const crop = crops.find(c => c.id === selectedCrop);
                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-sm font-medium">Watering schedule</span>
                      <span className="text-sm text-primary font-semibold">{crop?.wateringFreq}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-sm font-medium">Best growing season</span>
                      <span className="text-sm text-primary font-semibold">{crop?.season}</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-sm text-gray-600">
                        🎯 <strong>Pro tip:</strong> We'll automatically adjust watering based on weather, soil moisture, and your {crop?.name.toLowerCase()} growth stage.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Next Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6">
        <Button
          onClick={handleNext}
          disabled={!isFormValid || isLoading}
          className={`w-full h-12 font-medium rounded-xl transition-all duration-200 ${
            isFormValid && !isLoading
              ? "bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </div>
          ) : (
            <>
              Next: Choose Location
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingCropScreen;