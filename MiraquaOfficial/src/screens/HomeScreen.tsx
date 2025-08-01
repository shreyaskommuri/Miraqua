import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OnboardingFlow from '../components/OnboardingFlow';
import ChatInterface from '../components/ChatInterface';

interface Plot {
  id: number;
  name: string;
  crop: string;
  moisture: number;
  temperature: number;
  sunlight: number;
  nextWatering: string;
  status: 'healthy' | 'needs-water' | 'attention';
  location: string;
  lastWatered: string;
}

interface Notification {
  id: string;
  type: 'weather' | 'watering';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  plotId: number;
  plotName: string;
}

const mockPlots: Plot[] = [
  {
    id: 1,
    name: "Tomato Garden",
    crop: "Tomatoes",
    moisture: 85,
    temperature: 72,
    sunlight: 850,
    nextWatering: "Today 6:00 AM",
    status: "healthy",
    location: "North Yard",
    lastWatered: "Yesterday"
  },
  {
    id: 2,
    name: "Herb Patch",
    crop: "Basil & Oregano",
    moisture: 65,
    temperature: 74,
    sunlight: 920,
    nextWatering: "Tomorrow 5:30 AM",
    status: "needs-water",
    location: "Kitchen Window",
    lastWatered: "2 days ago"
  }
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'weather',
    title: 'Rain Expected',
    message: 'Skipping watering for Tomato Garden due to rain forecast',
    timestamp: '2 hours ago',
    read: false,
    priority: 'medium',
    plotId: 1,
    plotName: 'Tomato Garden'
  },
  {
    id: '2',
    type: 'watering',
    title: 'Watering Complete',
    message: 'Herb Corner watered for 15 minutes',
    timestamp: '1 day ago',
    read: false,
    priority: 'low',
    plotId: 2,
    plotName: 'Herb Corner'
  },
  {
    id: '3',
    type: 'weather',
    title: 'Temperature Alert',
    message: 'High temperature detected in Pepper Patch',
    timestamp: '3 hours ago',
    read: false,
    priority: 'high',
    plotId: 3,
    plotName: 'Pepper Patch'
  }
];

const StatCard = ({ icon, value, label, subtext, trend, progress }: {
  icon: string;
  value: string;
  label: string;
  subtext?: string;
  trend?: string;
  progress?: number;
}) => (
  <View style={styles.statCard}>
    <View style={styles.statCardHeader}>
      <View style={styles.statIconContainer}>
        <Ionicons name={icon as any} size={20} color="#3b82f6" />
      </View>
      {trend && <Text style={styles.statTrend}>{trend}</Text>}
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    {subtext && <Text style={styles.statSubtext}>{subtext}</Text>}
    {progress !== undefined && (
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    )}
  </View>
);

const PlotCard = ({ plot, onWaterNow, onPress }: { plot: Plot; onWaterNow: (id: number) => void; onPress: () => void }) => (
  <TouchableOpacity style={styles.plotCard} onPress={onPress}>
    <View style={styles.plotHeader}>
      <View style={styles.plotInfo}>
        <Text style={styles.plotName}>{plot.name}</Text>
        <View style={[
          styles.statusBadge,
          plot.status === 'healthy' ? styles.healthyBadge :
          plot.status === 'needs-water' ? styles.waterBadge :
          styles.attentionBadge
        ]}>
          <Text style={styles.statusText}>
            {plot.status === 'healthy' ? '✅ Healthy' : 
             plot.status === 'needs-water' ? '💧 Needs Water' : 
             '👀 Attention'}
          </Text>
        </View>
      </View>
    </View>
    
    <Text style={styles.cropText}>{plot.crop}</Text>
    <View style={styles.locationContainer}>
      <Ionicons name="location" size={12} color="#6b7280" />
      <Text style={styles.locationText}>{plot.location}</Text>
    </View>

    {/* Metrics */}
    <View style={styles.metricsContainer}>
      <View style={styles.metricItem}>
        <View style={styles.metricHeader}>
          <Ionicons name="water" size={16} color="#3b82f6" />
          <Text style={styles.metricValue}>{plot.moisture}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${plot.moisture}%` }]} />
        </View>
        <Text style={styles.metricLabel}>Moisture</Text>
      </View>
      
      <View style={styles.metricItem}>
        <View style={styles.metricHeader}>
          <Ionicons name="thermometer" size={16} color="#f59e0b" />
          <Text style={styles.metricValue}>{plot.temperature}°F</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(plot.temperature - 50) * 2}%` }]} />
        </View>
        <Text style={styles.metricLabel}>Temperature</Text>
      </View>
      
      <View style={styles.metricItem}>
        <View style={styles.metricHeader}>
          <Ionicons name="sunny" size={16} color="#f59e0b" />
          <Text style={styles.metricValue}>{Math.round(plot.sunlight/10)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${plot.sunlight/10}%` }]} />
        </View>
        <Text style={styles.metricLabel}>Sunlight</Text>
      </View>
    </View>

    {/* Actions */}
    <View style={styles.plotActions}>
      <View style={styles.wateringInfo}>
        <Ionicons name="time" size={16} color="#6b7280" />
        <Text style={styles.wateringText}>Next: {plot.nextWatering}</Text>
      </View>
      {plot.status === 'needs-water' && (
        <TouchableOpacity 
          style={styles.waterButton}
          onPress={(e) => {
            e.stopPropagation();
            onWaterNow(plot.id);
          }}
        >
          <Ionicons name="play" size={16} color="#ffffff" />
          <Text style={styles.waterButtonText}>Water Now</Text>
        </TouchableOpacity>
      )}
    </View>
  </TouchableOpacity>
);

export default function HomeScreen({ navigation }: any) {
  const [plots, setPlots] = useState<Plot[]>(mockPlots);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleWaterNow = (plotId: number) => {
    setPlots(prev => prev.map(plot => 
      plot.id === plotId 
        ? { ...plot, moisture: Math.min(100, plot.moisture + 20), lastWatered: "Just now", status: 'healthy' as const }
        : plot
    ));
    Alert.alert('Success', 'Plot watered successfully!');
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleAddPlot = (newPlot: any) => {
    const plot: Plot = {
      id: plots.length + 1,
      name: newPlot.name,
      crop: newPlot.crop,
      moisture: 75,
      temperature: 72,
      sunlight: 800,
      nextWatering: "Tomorrow 8:00 AM",
      status: "healthy",
      location: newPlot.location || "Garden",
      lastWatered: "Not yet"
    };
    setPlots([...plots, plot]);
    setShowOnboarding(false);
    Alert.alert('Success', 'New plot added successfully!');
  };

  const handlePlotPress = (plotId: number) => {
    if (navigation) {
      navigation.navigate('PlotDetails', { plotId });
    }
  };

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleAddPlot} onCancel={() => setShowOnboarding(false)} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#6b7280" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="leaf" size={20} color="#10b981" />
          <Text style={styles.headerTitle}>Miraqua</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.onlineStatus}>
            <Ionicons name="wifi" size={12} color="#10b981" />
            <Text style={styles.onlineText}>Online</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={20} color="#6b7280" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Greeting Section */}
          <View style={styles.greetingSection}>
            <View style={styles.greetingLeft}>
              <Text style={styles.greetingText}>Good evening!</Text>
              <Text style={styles.greetingEmoji}>👋</Text>
              <Text style={styles.greetingSubtext}>Your gardens are looking great today</Text>
            </View>
            <View style={styles.weatherCard}>
              <Text style={styles.weatherTemp}>63°F</Text>
              <Ionicons name="cloudy" size={16} color="#9ca3af" />
              <Text style={styles.weatherCondition}>Cloudy •</Text>
              <Text style={styles.weatherHumidity}>60% humidity</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search plots, crops, or locations..."
              placeholderTextColor="#9ca3af"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* Quick Statistics Cards */}
          <View style={styles.statsGrid}>
            <StatCard
              icon="location"
              value="2"
              label="Active Plots"
            />
            <StatCard
              icon="water"
              value="26L"
              label="Water Usage"
              subtext="This week"
            />
            <StatCard
              icon="trending-down"
              value="55%"
              label="Avg Moisture"
              trend="-3%"
              progress={55}
            />
            <StatCard
              icon="time"
              value="-21m"
              label="Next Watering"
            />
          </View>

          {/* My Plots Section */}
          <View style={styles.plotsSection}>
            <View style={styles.plotsHeader}>
              <Text style={styles.plotsTitle}>My Plots</Text>
              <TouchableOpacity onPress={() => setShowOnboarding(true)}>
                <Ionicons name="add" size={20} color="#3b82f6" />
              </TouchableOpacity>
            </View>

            {plots.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="water" size={32} color="#9ca3af" />
                </View>
                <Text style={styles.emptyTitle}>No plots yet</Text>
                <Text style={styles.emptySubtitle}>Add your first plot to get started</Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => setShowOnboarding(true)}
                >
                  <Ionicons name="add" size={16} color="#ffffff" />
                  <Text style={styles.emptyButtonText}>Add Plot</Text>
                </TouchableOpacity>
              </View>
            ) : (
              plots.map((plot) => (
                <PlotCard 
                  key={plot.id} 
                  plot={plot} 
                  onWaterNow={handleWaterNow}
                  onPress={() => handlePlotPress(plot.id)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Chat Interface */}
      {showChat && (
        <ChatInterface onClose={() => setShowChat(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuButton: {
    padding: 4,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  onlineText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingLeft: {
    flex: 1,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  greetingEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  greetingSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  weatherCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherTemp: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  weatherCondition: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  weatherHumidity: {
    fontSize: 12,
    color: '#6b7280',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTrend: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  statSubtext: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  plotsSection: {
    gap: 16,
  },
  plotsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plotsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  plotCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  plotHeader: {
    marginBottom: 12,
  },
  plotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  plotName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  healthyBadge: {
    backgroundColor: '#dcfce7',
  },
  waterBadge: {
    backgroundColor: '#fef3c7',
  },
  attentionBadge: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  cropText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginLeft: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  plotActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wateringInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wateringText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  waterButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  waterButtonText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
}); 