
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPlots, Plot } from "@/services/mockDataService";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeStats } from "@/components/home/HomeStats";
import { PlotsGrid } from "@/components/home/PlotsGrid";
import { LoadingScreen } from "@/components/home/LoadingScreen";
import { ErrorScreen } from "@/components/home/ErrorScreen";
import { GlobalStatsPanel } from "@/components/ui/GlobalStatsPanel";


const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [plots, setPlots] = useState<Plot[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const dashboardStats = useDashboardStats(plots);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const plotData = await getPlots();
      setPlots(plotData);
      setRetryCount(0);
    } catch (err) {
      // Error handling without console logging in production
      setError("Failed to load plots");
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchData();
        }, 1000 * (retryCount + 1));
      } else {
        toast({
          title: "Connection Error",
          description: "Unable to load your plots. Please check your connection and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPlots = plots.filter(plot =>
    plot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plot.crop.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRetry = () => {
    setRetryCount(0);
    fetchData();
  };

  if (loading) {
    return <LoadingScreen retryCount={retryCount} />;
  }

  if (error && retryCount >= 3) {
    return <ErrorScreen error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <HomeHeader 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery}
      />

      <div className="p-6 space-y-6 pb-24">
        <GlobalStatsPanel {...dashboardStats} />
        <HomeStats plots={filteredPlots} />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Your Plots ({filteredPlots.length})
          </h2>
          
          <PlotsGrid plots={filteredPlots} searchQuery={searchQuery} />
        </div>
      </div>

      {/* FAB */}
      <div className="fixed bottom-20 lg:bottom-6 right-6 z-40">
        <Button
          onClick={() => navigate("/app/add-plot")}
          className="w-14 h-14 bg-primary hover:bg-primary-dark rounded-full shadow-lg btn-modern animate-scale-in"
          aria-label="Add new plot"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

    </div>
  );
};

export default HomeScreen;
