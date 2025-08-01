
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MapOverviewScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Smart Map</Text>
        <Text style={styles.subtitle}>Overview of your garden plots</Text>
      </View>

      <View style={styles.content}>
        {/* Map Placeholder */}
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={48} color="#9CA3AF" />
            <Text style={styles.mapPlaceholderText}>Interactive Map</Text>
            <Text style={styles.mapPlaceholderSubtext}>Tap to view detailed map</Text>
          </View>
        </View>

        {/* Plot Locations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plot Locations</Text>
          
          <View style={styles.plotLocation}>
            <View style={styles.locationIcon}>
              <Ionicons name="location" size={20} color="#3B82F6" />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>Tomato Garden</Text>
              <Text style={styles.locationAddress}>North Yard</Text>
              <Text style={styles.locationStatus}>✅ Healthy</Text>
            </View>
          </View>

          <View style={styles.plotLocation}>
            <View style={styles.locationIcon}>
              <Ionicons name="location" size={20} color="#F59E0B" />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>Herb Patch</Text>
              <Text style={styles.locationAddress}>Kitchen Window</Text>
              <Text style={styles.locationStatus}>💧 Needs Water</Text>
            </View>
          </View>

          <View style={styles.plotLocation}>
            <View style={styles.locationIcon}>
              <Ionicons name="location" size={20} color="#EF4444" />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>Pepper Patch</Text>
              <Text style={styles.locationAddress}>South Garden</Text>
              <Text style={styles.locationStatus}>👀 Attention</Text>
            </View>
          </View>
        </View>

        {/* Weather Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Local Weather</Text>
          
          <View style={styles.weatherCard}>
            <View style={styles.weatherHeader}>
              <Ionicons name="partly-sunny" size={24} color="#F59E0B" />
              <Text style={styles.weatherTitle}>Current Conditions</Text>
            </View>
            <Text style={styles.weatherTemp}>73°F</Text>
            <Text style={styles.weatherDesc}>Partly Cloudy</Text>
            <Text style={styles.weatherHumidity}>Humidity: 65%</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionButtons}>
            <View style={styles.actionButton}>
              <Ionicons name="add-circle" size={24} color="#3B82F6" />
              <Text style={styles.actionText}>Add Plot</Text>
            </View>
            <View style={styles.actionButton}>
              <Ionicons name="settings" size={24} color="#6B7280" />
              <Text style={styles.actionText}>Settings</Text>
            </View>
            <View style={styles.actionButton}>
              <Ionicons name="analytics" size={24} color="#10B981" />
              <Text style={styles.actionText}>Analytics</Text>
            </View>
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
  mapContainer: {
    marginBottom: 24,
  },
  mapPlaceholder: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  plotLocation: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationIcon: {
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  locationAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  locationStatus: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
  },
  weatherCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  weatherTemp: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  weatherDesc: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  weatherHumidity: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
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

export default MapOverviewScreen;
