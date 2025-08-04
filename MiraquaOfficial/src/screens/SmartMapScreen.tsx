import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PlotLocation {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  status: 'active' | 'warning' | 'error' | 'offline';
  moisture: number;
  temperature: number;
  lastUpdate: string;
  cropType: string;
  area: number;
}

const { width, height } = Dimensions.get('window');

export default function SmartMapScreen({ navigation }: any) {
  const [plots, setPlots] = useState<PlotLocation[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<PlotLocation | null>(null);
  const [mapView, setMapView] = useState<'satellite' | 'terrain' | 'hybrid'>('satellite');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlotData();
  }, []);

  const fetchPlotData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPlots([
        {
          id: 'plot-1',
          name: 'Plot A - Tomatoes',
          coordinates: { lat: 37.7749, lng: -122.4194 },
          status: 'active',
          moisture: 68,
          temperature: 72,
          lastUpdate: '2 min ago',
          cropType: 'Tomatoes',
          area: 120
        },
        {
          id: 'plot-2',
          name: 'Plot B - Lettuce',
          coordinates: { lat: 37.7849, lng: -122.4094 },
          status: 'warning',
          moisture: 45,
          temperature: 75,
          lastUpdate: '5 min ago',
          cropType: 'Lettuce',
          area: 80
        },
        {
          id: 'plot-3',
          name: 'Plot C - Peppers',
          coordinates: { lat: 37.7649, lng: -122.4294 },
          status: 'active',
          moisture: 72,
          temperature: 70,
          lastUpdate: '1 min ago',
          cropType: 'Peppers',
          area: 100
        },
        {
          id: 'plot-4',
          name: 'Plot D - Herbs',
          coordinates: { lat: 37.7949, lng: -122.3994 },
          status: 'error',
          moisture: 0,
          temperature: 0,
          lastUpdate: 'Offline',
          cropType: 'Herbs',
          area: 60
        }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to load map data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'error': return '#EF4444';
      case 'offline': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return 'checkmark-circle';
      case 'warning': return 'warning';
      case 'error': return 'close-circle';
      case 'offline': return 'radio-button-off';
      default: return 'help-circle';
    }
  };

  const MockMap = () => (
    <View style={styles.mapContainer}>
      <View style={styles.mapHeader}>
        <Text style={styles.mapTitle}>Garden Overview</Text>
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={[styles.mapButton, mapView === 'satellite' && styles.activeMapButton]}
            onPress={() => setMapView('satellite')}
          >
            <Ionicons name="globe" size={16} color={mapView === 'satellite' ? 'white' : '#6B7280'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mapButton, mapView === 'terrain' && styles.activeMapButton]}
            onPress={() => setMapView('terrain')}
          >
            <Ionicons name="map" size={16} color={mapView === 'terrain' ? 'white' : '#6B7280'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mapButton, mapView === 'hybrid' && styles.activeMapButton]}
            onPress={() => setMapView('hybrid')}
          >
            <Ionicons name="layers" size={16} color={mapView === 'hybrid' ? 'white' : '#6B7280'} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.mapArea}>
        <View style={styles.mapBackground}>
          {plots.map((plot, index) => (
            <TouchableOpacity
              key={plot.id}
              style={[
                styles.plotMarker,
                { 
                  left: 20 + (index * 80) % 280,
                  top: 60 + Math.floor(index / 3) * 80,
                  backgroundColor: getStatusColor(plot.status)
                }
              ]}
              onPress={() => setSelectedPlot(plot)}
            >
              <Ionicons name={getStatusIcon(plot.status) as any} size={16} color="white" />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.mapLegend}>Interactive Plot Markers</Text>
      </View>
    </View>
  );

  const PlotCard = ({ plot }: { plot: PlotLocation }) => (
    <TouchableOpacity 
      style={styles.plotCard}
      onPress={() => setSelectedPlot(plot)}
    >
      <View style={styles.plotHeader}>
        <View style={styles.plotInfo}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(plot.status) }]} />
          <View style={styles.plotDetails}>
            <Text style={styles.plotName}>{plot.name}</Text>
            <Text style={styles.cropType}>{plot.cropType}</Text>
            <Text style={styles.lastUpdate}>{plot.lastUpdate}</Text>
          </View>
        </View>
        <View style={styles.plotMetrics}>
          <View style={styles.metric}>
            <Ionicons name="water" size={16} color="#3B82F6" />
            <Text style={styles.metricValue}>{plot.moisture}%</Text>
          </View>
          <View style={styles.metric}>
            <Ionicons name="thermometer" size={16} color="#F59E0B" />
            <Text style={styles.metricValue}>{plot.temperature}°F</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const PlotDetailModal = ({ plot }: { plot: PlotLocation }) => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Plot Details</Text>
          <TouchableOpacity onPress={() => setSelectedPlot(null)}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalBody}>
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Plot Information</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>{plot.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Crop Type:</Text>
              <Text style={styles.detailValue}>{plot.cropType}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Area:</Text>
              <Text style={styles.detailValue}>{plot.area} sq ft</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={[styles.detailValue, { color: getStatusColor(plot.status) }]}>
                {plot.status.charAt(0).toUpperCase() + plot.status.slice(1)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Last Update:</Text>
              <Text style={styles.detailValue}>{plot.lastUpdate}</Text>
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Sensor Data</Text>
            <View style={styles.sensorGrid}>
              <View style={styles.sensorCard}>
                <Ionicons name="water" size={24} color="#3B82F6" />
                <Text style={styles.sensorLabel}>Moisture</Text>
                <Text style={styles.sensorValue}>{plot.moisture}%</Text>
                <View style={styles.sensorBar}>
                  <View style={[styles.sensorFill, { width: `${plot.moisture}%`, backgroundColor: '#3B82F6' }]} />
                </View>
              </View>
              <View style={styles.sensorCard}>
                <Ionicons name="thermometer" size={24} color="#F59E0B" />
                <Text style={styles.sensorLabel}>Temperature</Text>
                <Text style={styles.sensorValue}>{plot.temperature}°F</Text>
                <View style={styles.sensorBar}>
                  <View style={[styles.sensorFill, { width: `${(plot.temperature - 50) / 30 * 100}%`, backgroundColor: '#F59E0B' }]} />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationCard}>
              <Ionicons name="location" size={20} color="#6B7280" />
              <View style={styles.locationInfo}>
                <Text style={styles.locationText}>
                  Lat: {plot.coordinates.lat.toFixed(4)}
                </Text>
                <Text style={styles.locationText}>
                  Lng: {plot.coordinates.lng.toFixed(4)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('PlotDetails', { plot: { id: plot.id, name: plot.name } })}
            >
              <Ionicons name="eye" size={16} color="#3B82F6" />
              <Text style={styles.actionText}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.controlButton]}
              onPress={() => navigation.navigate('DeviceControl', { plotId: plot.id })}
            >
              <Ionicons name="settings" size={16} color="#10B981" />
              <Text style={styles.actionText}>Controls</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Smart Map</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Smart Map</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchPlotData}>
          <Ionicons name="refresh" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Map View */}
        <MockMap />

        {/* Plot List */}
        <View style={styles.plotsSection}>
          <Text style={styles.sectionTitle}>All Plots</Text>
          {plots.map((plot) => (
            <PlotCard key={plot.id} plot={plot} />
          ))}
        </View>

        {/* Legend */}
        <View style={styles.legendSection}>
          <Text style={styles.sectionTitle}>Status Legend</Text>
          <View style={styles.legendGrid}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Active</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>Warning</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Error</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#6B7280' }]} />
              <Text style={styles.legendText}>Offline</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Plot Detail Modal */}
      {selectedPlot && <PlotDetailModal plot={selectedPlot} />}
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerRight: {
    width: 36,
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  mapContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  mapControls: {
    flexDirection: 'row',
    gap: 8,
  },
  mapButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeMapButton: {
    backgroundColor: '#3B82F6',
  },
  mapArea: {
    height: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  mapBackground: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  plotMarker: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  mapLegend: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  plotsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  plotCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
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
    alignItems: 'center',
  },
  plotInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 4,
  },
  plotDetails: {
    flex: 1,
  },
  plotName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  cropType: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  lastUpdate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  plotMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 2,
  },
  legendSection: {
    marginBottom: 20,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#374151',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  sensorGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  sensorCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  sensorLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
  },
  sensorValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  sensorBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  sensorFill: {
    height: '100%',
    borderRadius: 2,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
  },
  locationInfo: {
    marginLeft: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#374151',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    flex: 1,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 4,
  },
  controlButton: {
    backgroundColor: '#ECFDF5',
  },
  loadingContainer: {
    flex: 1,
    padding: 20,
  },
  loadingCard: {
    height: 300,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
  },
}); 