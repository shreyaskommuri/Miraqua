
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PlotCard from "@/components/PlotCard";
import { Plot } from "@/services/mockDataService";

interface PlotsGridProps {
  plots: Plot[];
  searchQuery: string;
}

export const PlotsGrid: React.FC<PlotsGridProps> = ({ plots, searchQuery }) => {
  const navigate = useNavigate();

  if (plots.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🌱</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {searchQuery ? 'No plots found' : 'No plots yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {searchQuery 
              ? `No plots match "${searchQuery}"`
              : 'Create your first plot to start monitoring your garden'
            }
          </p>
          {!searchQuery && (
            <Button onClick={() => navigate("/app/add-plot")} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Plot
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plots.map(plot => (
        <PlotCard key={plot.id} plot={plot} />
      ))}
    </div>
  );
};
