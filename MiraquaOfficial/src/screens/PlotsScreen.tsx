import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Plot {
  id: string;
  name: string;
  crop: string;
  health: number;
  moisture: number;
  size: string;
  lastWatered: string;
  nextWatering: string;
}

const plots: Plot[] = [
  {
    id: '1',
    name: 'Garden Plot 1',
    crop: 'Tomatoes',
    health: 85,
    moisture: 72,
    size: '4x6 ft',
    lastWatered: '2 hours ago',
    nextWatering: 'Tomorrow 8 AM',
  },
  {
    id: '2',
    name: 'Herb Garden',
    crop: 'Basil, Mint, Rosemary',
    health: 92,
    moisture: 68,
    size: '3x4 ft',
    lastWatered: '4 hours ago',
    nextWatering: 'Today 6 PM',
  },
  {
    id: '3',
    name: 'Vegetable Patch',
    crop: 'Lettuce, Carrots',
    health: 78,
    moisture: 45,
    size: '5x8 ft',
    lastWatered: '1 hour ago',
    nextWatering: 'Today 8 PM',
  },
];

const PlotCard = ({ plot }: { plot: Plot }) => (
  <TouchableOpacity style={styles.plotCard}>
    <View style={styles.plotHeader}>
      <View>
        <Text style={styles.plotName}>{plot.name}</Text>
        <Text style={styles.cropText}>{plot.crop}</Text>
      </View>
      <View style={[styles.healthIndicator, { backgroundColor: plot.health > 80 ? '#10b981' : plot.health > 60 ? '#f59e0b' : '#ef4444' }]}>
        <Text style={styles.healthText}>{plot.health}%</Text>
      </View>
    </View>
    
    <View style={styles.plotDetails}>
      <View style={styles.detailRow}>
        <Ionicons name="resize" size={16} color="#6b7280" />
        <Text style={styles.detailText}>{plot.size}</Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="water" size={16} color="#3b82f6" />
        <Text style={styles.detailText}>{plot.moisture}% moisture</Text>
      </View>
    </View>
    
    <View style={styles.wateringInfo}>
      <View style={styles.wateringItem}>
        <Ionicons name="time" size={16} color="#6b7280" />
        <Text style={styles.wateringText}>Last: {plot.lastWatered}</Text>
      </View>
      <View style={styles.wateringItem}>
        <Ionicons name="calendar" size={16} color="#10b981" />
        <Text style={styles.wateringText}>Next: {plot.nextWatering}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function PlotsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Plots</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="leaf" size={24} color="#10b981" />
            <Text style={styles.statNumber}>{plots.length}</Text>
            <Text style={styles.statLabel}>Active Plots</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="water" size={24} color="#3b82f6" />
            <Text style={styles.statNumber}>62%</Text>
            <Text style={styles.statLabel}>Avg Moisture</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color="#f59e0b" />
            <Text style={styles.statNumber}>85%</Text>
            <Text style={styles.statLabel}>Avg Health</Text>
          </View>
        </View>

        {/* Plots List */}
        <View style={styles.plotsSection}>
          <Text style={styles.sectionTitle}>All Plots</Text>
          {plots.map((plot) => (
            <PlotCard key={plot.id} plot={plot} />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="add-circle" size={32} color="#3b82f6" />
              <Text style={styles.actionText}>Add Plot</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="camera" size={32} color="#10b981" />
              <Text style={styles.actionText}>Scan Plant</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="analytics" size={32} color="#f59e0b" />
              <Text style={styles.actionText}>Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="settings" size={32} color="#8b5cf6" />
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    padding: 8,
    borderRadius: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  plotsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  plotCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  plotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  plotName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  cropText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  healthIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  healthText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  plotDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  wateringInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wateringItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  wateringText: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 12,
    color: '#1f2937',
    marginTop: 8,
    fontWeight: '500',
  },
}); 