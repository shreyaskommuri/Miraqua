
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";

const AddPlotScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Small delay for better UX, then redirect
    const timer = setTimeout(() => {
      navigate('/onboarding/crop');
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleBackNavigation = () => {
    navigate('/app/home');
  };

  const handleDirectRedirect = () => {
    navigate('/onboarding/crop');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackNavigation}
              className="hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-bold">Add New Plot</h1>
          </div>
        </div>
      </header>
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
        <Card className="w-full max-w-md border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Setting up your garden plot</h2>
              <p className="text-gray-600">Taking you to our smart setup wizard...</p>
            </div>

            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Preparing onboarding...</span>
            </div>

            <Button
              onClick={handleDirectRedirect}
              variant="outline"
              className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl"
            >
              Continue Manually
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddPlotScreen;
