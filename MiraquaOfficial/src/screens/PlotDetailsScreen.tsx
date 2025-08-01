import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  area?: number;
  latitude?: number;
  longitude?: number;
}

interface PlotDetailsScreenProps {
  route: any;
  navigation: any;
}

const PlotDetailsScreen = ({ route, navigation }: PlotDetailsScreenProps) => {
  const { plotId } = route.params;
  const [plot, setPlot] = useState<Plot>({
    id: plotId,
    name: "Tomato Garden",
    crop: "Tomatoes",
    moisture: 85,
    temperature: 72,
    sunlight: 850,
    nextWatering: "Today 6:00 AM",
    status: "healthy",
    location: "North Yard",
    lastWatered: "Yesterday",
    area: 25,
    latitude: 37.7749,
    longitude: -122.4194,
  });

  const handleWaterNow = () => {
    setPlot(prev => ({
      ...prev,
      moisture: Math.min(100, prev.moisture + 20),
      lastWatered: "Just now",
      status: 'healthy' as const,
    }));
    Alert.alert('Success', 'Plot watered successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#10b981';
      case 'needs-water':
        return '#f59e0b';
      case 'attention':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'checkmark-circle';
      case 'needs-water':
        return 'water';
      case 'attention':
        return 'warning';
      default:
        return 'help-circle';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#6b7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{plot.name}</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={[styles.statusIcon, { backgroundColor: getStatusColor(plot.status) + '20' }]}>
                <Ionicons name={getStatusIcon(plot.status) as any} size={24} color={getStatusColor(plot.status)} />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>
                  {plot.status === 'healthy' ? 'Healthy' : 
                   plot.status === 'needs-water' ? 'Needs Water' : 
                   'Needs Attention'}
                </Text>
                <Text style={styles.statusSubtitle}>
                  {plot.status === 'healthy' ? 'All systems normal' : 
                   plot.status === 'needs-water' ? 'Soil moisture is low' : 
                   'Check plot conditions'}
                </Text>
              </View>
            </View>
            {plot.status === 'needs-water' && (
              <TouchableOpacity style={styles.waterNowButton} onPress={handleWaterNow}>
                <Ionicons name="play" size={20} color="#ffffff" />
                <Text style={styles.waterNowText}>Water Now</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="water" size={20} color="#3b82f6" />
              </View>
              <Text style={styles.statValue}>{plot.moisture}%</Text>
              <Text style={styles.statLabel}>Moisture</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${plot.moisture}%` }]} />
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="thermometer" size={20} color="#f59e0b" />
              </View>
              <Text style={styles.statValue}>{plot.temperature}°F</Text>
              <Text style={styles.statLabel}>Temperature</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(plot.temperature - 50) * 2}%` }]} />
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="sunny" size={20} color="#f59e0b" />
              </View>
              <Text style={styles.statValue}>{Math.round(plot.sunlight/10)}%</Text>
              <Text style={styles.statLabel}>Sunlight</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${plot.sunlight/10}%` }]} />
              </View>
            </View>
          </View>

          {/* Plot Information */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Plot Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoLabel}>
                  <Ionicons name="leaf" size={16} color="#6b7280" />
                  <Text style={styles.infoLabelText}>Crop Type</Text>
                </View>
                <Text style={styles.infoValue}>{plot.crop}</Text>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoLabel}>
                  <Ionicons name="location" size={16} color="#6b7280" />
                  <Text style={styles.infoLabelText}>Location</Text>
                </View>
                <Text style={styles.infoValue}>{plot.location}</Text>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoLabel}>
                  <Ionicons name="resize" size={16} color="#6b7280" />
                  <Text style={styles.infoLabelText}>Area</Text>
                </View>
                <Text style={styles.infoValue}>{plot.area || 'N/A'} sq ft</Text>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoLabel}>
                  <Ionicons name="time" size={16} color="#6b7280" />
                  <Text style={styles.infoLabelText}>Last Watered</Text>
                </View>
                <Text style={styles.infoValue}>{plot.lastWatered}</Text>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoLabel}>
                  <Ionicons name="calendar" size={16} color="#6b7280" />
                  <Text style={styles.infoLabelText}>Next Watering</Text>
                </View>
                <Text style={styles.infoValue}>{plot.nextWatering}</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={styles.actionButton}>
                <View style={styles.actionIcon}>
                  <Ionicons name="calendar" size={20} color="#3b82f6" />
                </View>
                <Text style={styles.actionText}>Schedule</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <View style={styles.actionIcon}>
                  <Ionicons name="analytics" size={20} color="#8b5cf6" />
                </View>
                <Text style={styles.actionText}>Analytics</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <View style={styles.actionIcon}>
                  <Ionicons name="settings" size={20} color="#f59e0b" />
                </View>
                <Text style={styles.actionText}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <View style={styles.actionIcon}>
                  <Ionicons name="map" size={20} color="#10b981" />
                </View>
                <Text style={styles.actionText}>Location</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="water" size={16} color="#3b82f6" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Watering completed</Text>
                  <Text style={styles.activityTime}>2 hours ago</Text>
                </View>
              </View>
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="partly-sunny" size={16} color="#f59e0b" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Weather alert</Text>
                  <Text style={styles.activityTime}>1 day ago</Text>
                </View>
              </View>
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Health check passed</Text>
                  <Text style={styles.activityTime}>3 days ago</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  moreButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  waterNowButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  waterNowText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
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
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  infoSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabelText: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  actionsSection: {
    gap: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
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
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  activitySection: {
    gap: 12,
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  activityTime: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
});

export default PlotDetailsScreen; 