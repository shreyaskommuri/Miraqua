import { useState, useEffect } from 'react';
import { Plot } from '@/services/mockDataService';

export interface DashboardStats {
  totalWaterUsed: number;
  avgMoisture: number;
  nextWateringIn: string;
  activePlots: number;
  waterSavings: number;
  moistureTrend: 'up' | 'down' | 'stable';
}

export const useDashboardStats = (plots: Plot[]): DashboardStats => {
  const [stats, setStats] = useState<DashboardStats>({
    totalWaterUsed: 0,
    avgMoisture: 0,
    nextWateringIn: 'No schedules',
    activePlots: 0,
    waterSavings: 0,
    moistureTrend: 'stable'
  });

  useEffect(() => {
    if (plots.length === 0) return;

    // Calculate real stats from plots data
    const onlinePlots = plots.filter(p => p.isOnline);
    const totalMoisture = plots.reduce((sum, plot) => sum + plot.currentMoisture, 0);
    const avgMoisture = Math.round(totalMoisture / plots.length);
    
    // Calculate total water used based on plot areas and watering history
    const totalWaterUsed = plots.reduce((sum, plot) => {
      // Estimate based on plot area and last watering
      const areaFactor = plot.area * 0.5; // liters per sq meter
      return sum + areaFactor;
    }, 0);
    
    // Find next watering time
    const now = new Date();
    const nextWaterings = plots
      .filter(p => p.nextWatering !== 'Manual')
      .map(p => {
        // Parse next watering time
        if (p.nextWatering.includes('Tomorrow')) {
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(6, 0, 0, 0);
          return tomorrow;
        } else if (p.nextWatering.includes('Today')) {
          const today = new Date(now);
          today.setHours(20, 0, 0, 0);
          return today;
        } else if (p.nextWatering.includes('hours')) {
          const hours = parseInt(p.nextWatering.match(/(\d+)\s*hours?/)?.[1] || '2');
          const future = new Date(now);
          future.setHours(future.getHours() + hours);
          return future;
        }
        return null;
      })
      .filter(Boolean) as Date[];
    
    const nextWatering = nextWaterings.length > 0 
      ? nextWaterings.reduce((earliest, current) => current < earliest ? current : earliest)
      : null;
    
    let nextWateringText = 'No schedules';
    if (nextWatering) {
      const diffMs = nextWatering.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diffHours < 1) {
        nextWateringText = `${diffMins}m`;
      } else if (diffHours < 24) {
        nextWateringText = `${diffHours}h ${diffMins}m`;
      } else {
        nextWateringText = nextWatering.toLocaleDateString();
      }
    }
    
    // Calculate water savings (based on smart vs traditional irrigation)
    const baseSavings = 15; // Base 15% savings
    const automationBonus = onlinePlots.length * 2; // 2% per automated plot
    const healthBonus = Math.floor(avgMoisture / 20); // Bonus for healthy plots
    const waterSavings = Math.min(45, baseSavings + automationBonus + healthBonus);
    
    // Determine moisture trend
    const previousAvg = 65; // This would come from historical data
    const moistureTrend: 'up' | 'down' | 'stable' = 
      avgMoisture > previousAvg + 3 ? 'up' :
      avgMoisture < previousAvg - 3 ? 'down' : 'stable';

    setStats({
      totalWaterUsed: Math.round(totalWaterUsed),
      avgMoisture,
      nextWateringIn: nextWateringText,
      activePlots: onlinePlots.length,
      waterSavings,
      moistureTrend
    });
  }, [plots]);

  return stats;
};