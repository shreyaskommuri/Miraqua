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
import OnboardingFlow from './OnboardingFlow';
import SidebarNavigation from './SidebarNavigation';

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
    <View style={styles.statHeader}>
      <Ionicons name={icon as any} size={20} color="#3B82F6" />
      <Text style={styles.statLabel}>{label}</Text>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    {subtext && <Text style={styles.statSubtext}>{subtext}</Text>}
    {trend && (
      <View style={styles.trendContainer}>
        <Ionicons 
          name={trend.startsWith('-') ? "trending-down" : "trending-up"} 
          size={12} 
          color={trend.startsWith('-') ? "#EF4444" : "#10B981"} 
        />
        <Text style={[styles.trendText, { color: trend.startsWith('-') ? "#EF4444" : "#10B981" }]}>
          {trend}
        </Text>
      </View>
    )}
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
        <Text style={styles.plotCrop}>{plot.crop}</Text>
        <Text style={styles.plotLocation}>{plot.location}</Text>
      </View>
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(plot.status) }]}>
        <Text style={styles.statusText}>{plot.status.replace('-', ' ').toUpperCase()}</Text>
      </View>
    </View>
    
    <View style={styles.plotStats}>
      <View style={styles.statItem}>
        <Ionicons name="water" size={16} color="#3B82F6" />
        <Text style={styles.statItemText}>{plot.moisture}%</Text>
      </View>
      <View style={styles.statItem}>
        <Ionicons name="thermometer" size={16} color="#F59E0B" />
        <Text style={styles.statItemText}>{plot.temperature}°F</Text>
      </View>
      <View style={styles.statItem}>
        <Ionicons name="sunny" size={16} color="#F59E0B" />
        <Text style={styles.statItemText}>{plot.sunlight}</Text>
      </View>
    </View>
    
    <View style={styles.plotFooter}>
      <View style={styles.wateringInfo}>
        <Ionicons name="time" size={14} color="#6B7280" />
        <Text style={styles.wateringText}>Next: {plot.nextWatering}</Text>
      </View>
      <TouchableOpacity 
        style={[styles.waterButton, plot.status === 'needs-water' && styles.waterButtonActive]} 
        onPress={() => onWaterNow(plot.id)}
      >
        <Ionicons name="play" size={16} color={plot.status === 'needs-water' ? "white" : "#3B82F6"} />
        <Text style={[styles.waterButtonText, plot.status === 'needs-water' && styles.waterButtonTextActive]}>
          Water Now
        </Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy': return '#10B981';
    case 'needs-water': return '#F59E0B';
    case 'attention': return '#EF4444';
    default: return '#6B7280';
  }
};

export default function HomeScreen({ navigation }: any) {
  const [searchText, setSearchText] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [plots, setPlots] = useState(mockPlots);
  const [notifications, setNotifications] = useState(mockNotifications);

  const handleWaterNow = (plotId: number) => {
    Alert.alert('Watering', 'Starting watering cycle...');
    // Simulate watering
    setTimeout(() => {
      Alert.alert('Success', 'Watering completed!');
    }, 2000);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleAddPlot = (newPlot: any) => {
    setPlots(prev => [...prev, { ...newPlot, id: prev.length + 1 }]);
    setShowOnboarding(false);
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
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setShowSidebar(true)}>
          <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="leaf" size={20} color="#10B981" />
          <Text style={styles.headerTitle}>Miraqua</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.onlineStatus}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={20} color="white" />
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
              <Ionicons name="cloudy" size={16} color="#9CA3AF" />
              <Text style={styles.weatherCondition}>Cloudy •</Text>
              <Text style={styles.weatherHumidity}>60% humidity</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search plots, crops, or locations..."
              placeholderTextColor="#9CA3AF"
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
                <Ionicons name="add-circle" size={24} color="#3B82F6" />
              </TouchableOpacity>
            </View>
            
            {plots.map((plot) => (
              <PlotCard
                key={plot.id}
                plot={plot}
                onWaterNow={handleWaterNow}
                onPress={() => handlePlotPress(plot.id)}
              />
            ))}
          </View>

          {/* Notifications Section */}
          <View style={styles.notificationsSection}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {notifications.map((notification) => (
              <TouchableOpacity 
                key={notification.id} 
                style={[styles.notificationCard, !notification.read && styles.unreadNotification]}
                onPress={() => handleMarkAsRead(notification.id)}
              >
                <View style={styles.notificationIcon}>
                  <Ionicons 
                    name={notification.type === 'weather' ? "cloudy" : "water"} 
                    size={20} 
                    color={notification.priority === 'high' ? "#EF4444" : "#3B82F6"} 
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationTime}>{notification.timestamp}</Text>
                </View>
                {!notification.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sidebar Navigation */}
      <SidebarNavigation 
        visible={showSidebar} 
        onClose={() => setShowSidebar(false)} 
        navigation={navigation}
        currentRoute="home"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1F2937',
    paddingTop: 50,
  },
  menuButton: {
    padding: 8,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    marginLeft: 8,
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  onlineText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greetingLeft: {
    flex: 1,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  greetingEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  greetingSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  weatherCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  weatherTemp: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  weatherCondition: {
    fontSize: 12,
    color: '#6B7280',
  },
  weatherHumidity: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    marginLeft: 8,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
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
    color: '#1F2937',
  },
  plotCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  plotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  plotInfo: {
    flex: 1,
  },
  plotName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  plotCrop: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  plotLocation: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  plotStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItemText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#374151',
  },
  plotFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wateringInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wateringText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6B7280',
  },
  waterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  waterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  waterButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  waterButtonTextActive: {
    color: 'white',
  },
  notificationsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  unreadNotification: {
    borderColor: '#3B82F6',
    backgroundColor: '#F0F9FF',
  },
  notificationIcon: {
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    alignSelf: 'center',
  },
}); 