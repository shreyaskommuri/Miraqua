import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PlotDetailsScreen = () => {
  const handleWaterNow = () => {
    Alert.alert('Success', 'Plot watered successfully!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tomato Garden</Text>
        <Text style={styles.subtitle}>North Yard • 25 sq ft</Text>
      </View>

      <View style={styles.content}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>✅ Healthy</Text>
            </View>
            <Text style={styles.statusTime}>Last updated: 2 minutes ago</Text>
          </View>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Ionicons name="water" size={24} color="#3B82F6" />
            <Text style={styles.metricValue}>85%</Text>
            <Text style={styles.metricLabel}>Moisture</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="thermometer" size={24} color="#F59E0B" />
            <Text style={styles.metricValue}>72°F</Text>
            <Text style={styles.metricLabel}>Temperature</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="sunny" size={24} color="#F59E0B" />
            <Text style={styles.metricValue}>85%</Text>
            <Text style={styles.metricLabel}>Sunlight</Text>
          </View>
        </View>

        {/* Next Watering */}
        <View style={styles.wateringCard}>
          <View style={styles.wateringHeader}>
            <Ionicons name="time" size={20} color="#10B981" />
            <Text style={styles.wateringTitle}>Next Watering</Text>
          </View>
          <Text style={styles.wateringTime}>Today 6:00 AM</Text>
          <Text style={styles.wateringSubtitle}>In 2 hours 15 minutes</Text>
          <TouchableOpacity style={styles.waterButton} onPress={handleWaterNow}>
            <Ionicons name="play" size={16} color="white" />
            <Text style={styles.waterButtonText}>Water Now</Text>
          </TouchableOpacity>
        </View>

        {/* History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Ionicons name="water" size={16} color="#3B82F6" />
              <Text style={styles.activityTitle}>Watering Completed</Text>
              <Text style={styles.activityTime}>Yesterday 6:00 AM</Text>
            </View>
            <Text style={styles.activityDesc}>15 minutes • 2.5L used</Text>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Ionicons name="leaf" size={16} color="#10B981" />
              <Text style={styles.activityTitle}>Health Check</Text>
              <Text style={styles.activityTime}>2 days ago</Text>
            </View>
            <Text style={styles.activityDesc}>All systems optimal</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="settings" size={20} color="#6B7280" />
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="analytics" size={20} color="#3B82F6" />
              <Text style={styles.actionText}>Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="calendar" size={20} color="#10B981" />
              <Text style={styles.actionText}>Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
  },
  statusTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
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
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  wateringCard: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  wateringHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  wateringTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  wateringTime: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  wateringSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginBottom: 12,
  },
  waterButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  waterButtonText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginLeft: 8,
  },
  activityTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  activityDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
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
  actionText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default PlotDetailsScreen;
