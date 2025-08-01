
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Mock data service (copied from original)
interface Plot {
  id: string;
  name: string;
  crop: string;
  variety?: string;
  location: string;
  currentTemp: number;
  currentMoisture: number;
  currentSunlight: number;
  healthScore: number;
  nextWatering: string;
  lastWatered: string;
  isOnline: boolean;
  coordinates: {
    lat: number;
    lon: number;
  };
  area: number;
  plantingDate: string;
  expectedHarvest: string;
  soilType: string;
  irrigationMethod: string;
}

interface DashboardStats {
  totalWaterUsed: number;
  avgMoisture: number;
  nextWateringIn: string;
  activePlots: number;
  waterSavings: number;
  moistureTrend: 'up' | 'down' | 'stable';
}

// Mock data (copied from original)
const mockPlots: Plot[] = [
  {
    id: "1",
    name: "Cherry Tomato Garden",
    crop: "Cherry Tomatoes",
    variety: "Sweet 100",
    location: "Backyard Plot A",
    currentTemp: 72,
    currentMoisture: 68,
    currentSunlight: 85,
    healthScore: 87,
    nextWatering: "Tomorrow 6:00 AM",
    lastWatered: "2 hours ago",
    isOnline: true,
    coordinates: { lat: 37.7749, lon: -122.4194 },
    area: 25,
    plantingDate: "2024-03-15",
    expectedHarvest: "2024-07-15",
    soilType: "Loamy",
    irrigationMethod: "Drip"
  },
  {
    id: "2", 
    name: "Herb Garden",
    crop: "Mixed Herbs",
    variety: "Basil & Rosemary",
    location: "Kitchen Window",
    currentTemp: 70,
    currentMoisture: 55,
    currentSunlight: 92,
    healthScore: 92,
    nextWatering: "Today 8:00 PM",
    lastWatered: "6 hours ago",
    isOnline: true,
    coordinates: { lat: 37.7849, lon: -122.4094 },
    area: 8,
    plantingDate: "2024-02-20",
    expectedHarvest: "2024-06-20",
    soilType: "Sandy",
    irrigationMethod: "Sprinkler"
  },
  {
    id: "3",
    name: "Pepper Patch",
    crop: "Bell Peppers",
    variety: "California Wonder",
    location: "Side Garden",
    currentTemp: 75,
    currentMoisture: 42,
    currentSunlight: 78,
    healthScore: 73,
    nextWatering: "In 2 hours",
    lastWatered: "1 day ago",
    isOnline: false,
    coordinates: { lat: 37.7649, lon: -122.4294 },
    area: 18,
    plantingDate: "2024-04-01",
    expectedHarvest: "2024-08-01",
    soilType: "Clay",
    irrigationMethod: "Manual"
  }
];

// API simulation functions (copied from original)
const getPlots = async (): Promise<Plot[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockPlots;
};

const waterPlot = async (plotId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
};

// Dashboard stats hook (copied from original)
const useDashboardStats = (plots: Plot[]): DashboardStats => {
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

    const onlinePlots = plots.filter(p => p.isOnline);
    const totalMoisture = plots.reduce((sum, plot) => sum + plot.currentMoisture, 0);
    const avgMoisture = Math.round(totalMoisture / plots.length);
    
    const totalWaterUsed = plots.reduce((sum, plot) => {
      const areaFactor = plot.area * 0.5;
      return sum + areaFactor;
    }, 0);
    
    const now = new Date();
    const nextWaterings = plots
      .filter(p => p.nextWatering !== 'Manual')
      .map(p => {
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
    
    const baseSavings = 15;
    const automationBonus = onlinePlots.length * 2;
    const healthBonus = Math.floor(avgMoisture / 20);
    const waterSavings = Math.min(45, baseSavings + automationBonus + healthBonus);
    
    const previousAvg = 65;
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

// HomeHeader component (copied from original)
const HomeHeader: React.FC<{ searchQuery: string; onSearchChange: (value: string) => void }> = ({
  searchQuery,
  onSearchChange
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getCurrentWeather = () => {
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour <= 18;
    const baseTemp = isDay ? 70 + Math.sin((hour - 6) * Math.PI / 12) * 8 : 65;
    const temp = Math.round(baseTemp + (Math.random() - 0.5) * 6);
    
    const conditions = isDay 
      ? [
          { condition: "Sunny", icon: "☀️", chance: 0.4 },
          { condition: "Partly Cloudy", icon: "⛅", chance: 0.3 },
          { condition: "Clear", icon: "🌤️", chance: 0.3 }
        ]
      : [
          { condition: "Clear", icon: "🌙", chance: 0.5 },
          { condition: "Cloudy", icon: "☁️", chance: 0.3 },
          { condition: "Cool", icon: "🌃", chance: 0.2 }
        ];
    
    const random = Math.random();
    let selectedCondition = conditions[0];
    let cumulative = 0;
    
    for (const cond of conditions) {
      cumulative += cond.chance;
      if (random <= cumulative) {
        selectedCondition = cond;
        break;
      }
    }
    
    return {
      temperature: temp,
      condition: selectedCondition.condition,
      humidity: Math.round(60 + Math.random() * 20),
      icon: selectedCondition.icon
    };
  };

  const weather = getCurrentWeather();

  return (
    <View style={styles.heroSection}>
      <View style={styles.welcomeHeader}>
        <View style={styles.welcomeInfo}>
          <Text style={styles.greeting}>{getGreeting()}! 👋</Text>
          <Text style={styles.subtitle}>Your gardens are looking great today</Text>
        </View>
        
        <View style={styles.weatherWidget}>
          <Text style={styles.weatherIcon}>{weather.icon}</Text>
          <View style={styles.weatherInfo}>
            <Text style={styles.weatherTemp}>{weather.temperature}°F</Text>
            <Text style={styles.weatherDesc}>{weather.condition} • {weather.humidity}% humidity</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={16} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search plots, crops, or locations..."
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => onSearchChange('')} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>×</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

// HomeStats component (copied from original)
const HomeStats: React.FC<{ plots: Plot[] }> = ({ plots }) => {
  const onlinePlots = plots.filter(p => p.isOnline).length;
  const avgMoisture = plots.length > 0 
    ? Math.round(plots.reduce((sum, p) => sum + p.currentMoisture, 0) / plots.length) 
    : 0;
  const avgHealth = plots.length > 0 
    ? Math.round(plots.reduce((sum, p) => sum + p.healthScore, 0) / plots.length) 
    : 0;

  return (
    <View style={styles.statsGrid}>
      <View style={styles.statCard}>
        <View style={styles.statIconContainer}>
          <Ionicons name="wifi" size={24} color="#10B981" />
        </View>
        <Text style={styles.statValue}>{onlinePlots}</Text>
        <Text style={styles.statLabel}>Online Plots</Text>
        <Text style={styles.statSubtext}>{plots.length - onlinePlots} offline</Text>
      </View>

      <View style={styles.statCard}>
        <View style={styles.statIconContainer}>
          <Ionicons name="water" size={24} color="#3B82F6" />
        </View>
        <Text style={styles.statValue}>{avgMoisture}%</Text>
        <Text style={styles.statLabel}>Avg Moisture</Text>
        <Text style={styles.statSubtext}>
          {avgMoisture >= 70 ? "Excellent" : avgMoisture >= 40 ? "Good" : "Needs attention"}
        </Text>
      </View>

      <View style={styles.statCard}>
        <View style={styles.statIconContainer}>
          <Ionicons name="pulse" size={24} color="#F59E0B" />
        </View>
        <Text style={styles.statValue}>{avgHealth}%</Text>
        <Text style={styles.statLabel}>Avg Health</Text>
        <Text style={styles.statSubtext}>
          {avgHealth >= 80 ? "Thriving" : avgHealth >= 60 ? "Healthy" : "Needs care"}
        </Text>
      </View>
    </View>
  );
};

// GlobalStatsPanel component (copied from original)
const GlobalStatsPanel: React.FC<DashboardStats> = ({
  totalWaterUsed,
  avgMoisture,
  nextWateringIn,
  activePlots,
  waterSavings,
  moistureTrend
}) => {
  return (
    <View style={styles.globalStatsGrid}>
      <View style={styles.globalStatCard}>
        <View style={styles.globalStatIcon}>
          <Ionicons name="location" size={20} color="#3B82F6" />
        </View>
        <Text style={styles.globalStatValue}>{activePlots}</Text>
        <Text style={styles.globalStatLabel}>Active Plots</Text>
      </View>

      <View style={styles.globalStatCard}>
        <View style={styles.globalStatIcon}>
          <Ionicons name="water" size={20} color="#3B82F6" />
        </View>
        <Text style={styles.globalStatValue}>{totalWaterUsed}L</Text>
        <Text style={styles.globalStatLabel}>Water Used</Text>
        <Text style={styles.globalStatSubtext}>This week</Text>
      </View>

      <View style={styles.globalStatCard}>
        <View style={styles.globalStatIcon}>
          <Ionicons 
            name={moistureTrend === 'up' ? 'trending-up' : 'trending-down'} 
            size={20} 
            color={moistureTrend === 'up' ? '#10B981' : '#F59E0B'} 
          />
        </View>
        <Text style={styles.globalStatValue}>{avgMoisture}%</Text>
        <Text style={styles.globalStatLabel}>Avg Moisture</Text>
        <Text style={styles.globalStatSubtext}>{moistureTrend === 'up' ? '+5%' : '-3%'}</Text>
      </View>

      <View style={styles.globalStatCard}>
        <View style={styles.globalStatIcon}>
          <Ionicons name="time" size={20} color="#8B5CF6" />
        </View>
        <Text style={styles.globalStatValue}>{nextWateringIn}</Text>
        <Text style={styles.globalStatLabel}>Next Watering</Text>
      </View>

      <View style={styles.waterSavingsCard}>
        <View style={styles.waterSavingsContent}>
          <Text style={styles.waterSavingsLabel}>💡 Smart Savings</Text>
          <Text style={styles.waterSavingsValue}>{waterSavings}% water saved</Text>
          <Text style={styles.waterSavingsSubtext}>vs traditional irrigation</Text>
        </View>
        <Text style={styles.waterSavingsIcon}>🌱</Text>
      </View>
    </View>
  );
};

// PlotCard component (copied from original)
const PlotCard: React.FC<{ plot: Plot }> = ({ plot }) => {
  const navigation = useNavigation();

  const handleCardClick = () => {
    // @ts-ignore
    navigation.navigate('PlotDetails', { plotId: plot.id });
  };

  const handleWaterNow = async (e: any) => {
    e.stopPropagation();
    try {
      await waterPlot(plot.id);
      Alert.alert("Watering Started", `${plot.name} is now being watered.`);
    } catch (error) {
      Alert.alert("Error", "Failed to start watering. Please try again.");
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getHealthBadgeColor = (score: number) => {
    if (score >= 80) return '#D1FAE5';
    if (score >= 60) return '#FEF3C7';
    return '#FEE2E2';
  };

  return (
    <TouchableOpacity style={styles.plotCard} onPress={handleCardClick}>
      <View style={styles.plotCardContent}>
        <View style={styles.plotHeader}>
          <View style={styles.plotInfo}>
            <View style={styles.plotTitleRow}>
              <Text style={styles.plotName}>{plot.name}</Text>
              <Ionicons 
                name={plot.isOnline ? 'wifi' : 'wifi-outline'} 
                size={16} 
                color={plot.isOnline ? '#10B981' : '#EF4444'} 
              />
            </View>
            <Text style={styles.plotCrop}>
              {plot.crop} {plot.variety && `• ${plot.variety}`}
            </Text>
            <View style={styles.plotLocation}>
              <Ionicons name="location" size={12} color="#6B7280" />
              <Text style={styles.plotLocationText}>{plot.location}</Text>
            </View>
          </View>
          <View style={[styles.healthBadge, { backgroundColor: getHealthBadgeColor(plot.healthScore) }]}>
            <Ionicons name="heart" size={12} color={getHealthColor(plot.healthScore)} />
            <Text style={[styles.healthScore, { color: getHealthColor(plot.healthScore) }]}>
              {plot.healthScore}%
            </Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metric}>
            <View style={styles.metricHeader}>
              <Ionicons name="water" size={16} color="#3B82F6" />
              <Text style={styles.metricValue}>{plot.currentMoisture}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${plot.currentMoisture}%` }]} />
            </View>
            <Text style={styles.metricLabel}>Moisture</Text>
          </View>
          
          <View style={styles.metric}>
            <View style={styles.metricHeader}>
              <Ionicons name="thermometer" size={16} color="#F59E0B" />
              <Text style={styles.metricValue}>{plot.currentTemp}°F</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(plot.currentTemp - 32) * 1.8}%` }]} />
            </View>
            <Text style={styles.metricLabel}>Temperature</Text>
          </View>
          
          <View style={styles.metric}>
            <View style={styles.metricHeader}>
              <Ionicons name="sunny" size={16} color="#F59E0B" />
              <Text style={styles.metricValue}>{plot.currentSunlight}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${plot.currentSunlight}%` }]} />
            </View>
            <Text style={styles.metricLabel}>Sunlight</Text>
          </View>
        </View>

        <View style={styles.wateringInfo}>
          <View style={styles.wateringHeader}>
            <Ionicons name="time" size={16} color="#3B82F6" />
            <Text style={styles.wateringTitle}>Next: {plot.nextWatering}</Text>
          </View>
          <Text style={styles.wateringSubtext}>Last watered: {plot.lastWatered}</Text>
          {plot.currentMoisture < 50 && (
            <TouchableOpacity style={styles.waterButton} onPress={handleWaterNow}>
              <Ionicons name="play" size={12} color="white" />
              <Text style={styles.waterButtonText}>Water</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: plot.isOnline ? '#10B981' : '#EF4444' }]} />
            <Text style={styles.statusText}>{plot.isOnline ? 'Online' : 'Offline'}</Text>
          </View>
          <Text style={[styles.healthText, { color: getHealthColor(plot.healthScore) }]}>
            Health: {plot.healthScore}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// PlotsGrid component (copied from original)
const PlotsGrid: React.FC<{ plots: Plot[]; searchQuery: string }> = ({ plots, searchQuery }) => {
  const navigation = useNavigation();

  if (plots.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyIconText}>🌱</Text>
        </View>
        <Text style={styles.emptyTitle}>
          {searchQuery ? 'No plots found' : 'No plots yet'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {searchQuery 
            ? `No plots match "${searchQuery}"`
            : 'Create your first plot to start monitoring your garden'
          }
        </Text>
        {!searchQuery && (
          <TouchableOpacity 
            style={styles.addFirstButton}
            onPress={() => navigation.navigate('AddPlot' as never)}
          >
            <Ionicons name="add" size={16} color="white" />
            <Text style={styles.addFirstButtonText}>Add Your First Plot</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.plotsGrid}>
      {plots.map(plot => (
        <PlotCard key={plot.id} plot={plot} />
      ))}
    </View>
  );
};

// Main HomeScreen component
const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [plots, setPlots] = useState<Plot[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  const navigation = useNavigation();
  const dashboardStats = useDashboardStats(plots);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");
    
    try {
      const plotData = await getPlots();
      setPlots(plotData);
      setRetryCount(0);
      setLastRefresh(new Date());
      
      if (isRefresh) {
        Alert.alert("Success", "Your plots have been refreshed");
      }
    } catch (err) {
      setError("Failed to load plots");
      if (retryCount < 3 && !isRefresh) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchData();
        }, 1000 * (retryCount + 1));
      } else {
        Alert.alert("Connection Error", "Unable to load your plots. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await fetchData(true);
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
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your plots...</Text>
      </View>
    );
  }

  if (error && retryCount >= 3) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <HomeHeader 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery}
      />

      <View style={styles.content}>
        <GlobalStatsPanel {...dashboardStats} />
        
        <HomeStats plots={filteredPlots} />

        <View style={styles.plotsSection}>
          <View style={styles.plotsHeader}>
            <Text style={styles.plotsTitle}>Your Plots ({filteredPlots.length})</Text>
            <TouchableOpacity onPress={handleRefresh} disabled={isRefreshing}>
              <Ionicons 
                name="refresh" 
                size={20} 
                color="#6B7280" 
                style={isRefreshing ? styles.spinning : undefined}
              />
            </TouchableOpacity>
          </View>
          
          <PlotsGrid plots={filteredPlots} searchQuery={searchQuery} />
        </View>

        <Text style={styles.lastUpdated}>
          Last updated: {lastRefresh.toLocaleTimeString()}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddPlot' as never)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  heroSection: {
    backgroundColor: '#F0F9FF',
    paddingTop: 40,
    paddingBottom: 20,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  welcomeInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  weatherWidget: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherTemp: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  weatherDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  searchContainer: {
    paddingHorizontal: 16,
  },
  searchInputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 40,
    paddingVertical: 12,
    fontSize: 16,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    padding: 16,
  },
  globalStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  globalStatCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  globalStatIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  globalStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  globalStatLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  globalStatSubtext: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  waterSavingsCard: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  waterSavingsContent: {
    flex: 1,
  },
  waterSavingsLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  waterSavingsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  waterSavingsSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  waterSavingsIcon: {
    fontSize: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  plotsSection: {
    marginBottom: 24,
  },
  plotsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  plotsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  spinning: {
    transform: [{ rotate: '360deg' }],
  },
  plotsGrid: {
    gap: 16,
  },
  plotCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  plotCardContent: {
    padding: 16,
  },
  plotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  plotInfo: {
    flex: 1,
  },
  plotTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  plotName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 8,
  },
  plotCrop: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  plotLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plotLocationText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  healthScore: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 4,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  wateringInfo: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  wateringHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  wateringTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginLeft: 8,
  },
  wateringSubtext: {
    fontSize: 12,
    color: '#3B82F6',
    marginBottom: 12,
  },
  waterButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  waterButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
  },
  healthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#F3F4F6',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIconText: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  addFirstButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  lastUpdated: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    width: 56,
    height: 56,
    backgroundColor: '#3B82F6',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default HomeScreen;
