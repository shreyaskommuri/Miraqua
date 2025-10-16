import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SidebarNavigation from './SidebarNavigation';
import { getPlots } from '../api/plots';
import Constants from 'expo-constants';

interface Plot {
  id: string;
  name: string;
  crop: string;
  status: 'healthy' | 'warning' | 'critical';
  moisture: number;
  temperature: number;
  lastWatered: string;
  lat: number;
  lon: number;
  last_updated?: string;
}

const { width, height } = Dimensions.get('window');

export default function SmartMapScreen({ navigation }: any) {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [mapView, setMapView] = useState<'satellite' | 'terrain' | 'hybrid'>('satellite');
  const [mapLocation, setMapLocation] = useState<{lat: number, lon: number} | null>(null);

  useEffect(() => {
    fetchPlots();
  }, []);

  const fetchPlots = async () => {
    setIsLoading(true);
    try {
      const response = await getPlots();
      if (response.success && response.plots) {
        const realPlots = response.plots.map((plot: any) => ({
          id: plot.id,
          name: plot.name || `Plot ${plot.id.slice(0, 8)}`,
          crop: plot.crop || 'Unknown',
          status: plot.status || 'healthy',
          moisture: plot.moisture || 0,
          temperature: plot.temperature || 0,
          lastWatered: plot.last_watered || 'Unknown',
          lat: plot.lat || 0,
          lon: plot.lon || 0,
          last_updated: plot.last_updated
        }));
        
        setPlots(realPlots);
        
        // Determine map location based on plot logic
        determineMapLocation(realPlots);
      }
    } catch (error) {
      console.error('Error fetching plots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const determineMapLocation = (plots: Plot[]) => {
    if (plots.length === 0) return;
    
    // Filter out plots with invalid coordinates
    const validPlots = plots.filter(plot => plot.lat !== 0 && plot.lon !== 0);
    
    if (validPlots.length === 0) return;
    
    if (validPlots.length === 1) {
      // Single plot - use its location
      setMapLocation({ lat: validPlots[0].lat, lon: validPlots[0].lon });
    } else {
      // Multiple plots - check if they're in the same area or choose oldest
      const locationGroups = groupPlotsByLocation(validPlots);
      
      if (locationGroups.length === 1) {
        // All plots in same area - use that location
        setMapLocation(locationGroups[0].location);
      } else {
        // Multiple locations - choose oldest plot
        const oldestPlot = findOldestPlot(validPlots);
        setMapLocation({ lat: oldestPlot.lat, lon: oldestPlot.lon });
      }
    }
  };

  const groupPlotsByLocation = (plots: Plot[]) => {
    const groups: { location: { lat: number, lon: number }, plots: Plot[] }[] = [];
    const threshold = 0.01; // ~1km threshold for "same area"
    
    plots.forEach(plot => {
      const existingGroup = groups.find(group => 
        Math.abs(group.location.lat - plot.lat) < threshold &&
        Math.abs(group.location.lon - plot.lon) < threshold
      );
      
      if (existingGroup) {
        existingGroup.plots.push(plot);
      } else {
        groups.push({
          location: { lat: plot.lat, lon: plot.lon },
          plots: [plot]
        });
      }
    });
    
    return groups;
  };

  const findOldestPlot = (plots: Plot[]) => {
    return plots.reduce((oldest, current) => {
      if (!oldest.last_updated) return current;
      if (!current.last_updated) return oldest;
      
      const oldestTime = new Date(oldest.last_updated).getTime();
      const currentTime = new Date(current.last_updated).getTime();
      
      return currentTime < oldestTime ? current : oldest;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return 'checkmark-circle';
      case 'warning': return 'warning';
      case 'critical': return 'close-circle';
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

  const PlotCard = ({ plot }: { plot: Plot }) => (
    <TouchableOpacity 
      style={styles.plotCard}
      onPress={() => setSelectedPlot(plot)}
      activeOpacity={0.7}
    >
      <View style={styles.plotHeader}>
        <View style={styles.plotInfo}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(plot.status) }]} />
          <View style={styles.plotDetails}>
            <Text style={styles.plotName}>{plot.name}</Text>
            <Text style={styles.cropType}>{plot.crop}</Text>
            <Text style={styles.lastUpdate}>{plot.lastWatered}</Text>
            <Text style={styles.coordinates}>
              {plot.lat.toFixed(4)}, {plot.lon.toFixed(4)}
            </Text>
          </View>
        </View>
        <View style={styles.plotMetrics}>
          <View style={styles.metric}>
            <Ionicons name="water" size={14} color="#3B82F6" />
            <Text style={styles.metricValue}>{plot.moisture}%</Text>
          </View>
          <View style={styles.metric}>
            <Ionicons name="thermometer" size={14} color="#F59E0B" />
            <Text style={styles.metricValue}>{plot.temperature}°F</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const PlotDetailModal = ({ plot }: { plot: Plot }) => (
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
              <Text style={styles.detailValue}>{plot.crop}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={[styles.detailValue, { color: getStatusColor(plot.status) }]}>
                {plot.status.charAt(0).toUpperCase() + plot.status.slice(1)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Last Update:</Text>
              <Text style={styles.detailValue}>{plot.lastWatered}</Text>
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
                  Lat: {plot.lat.toFixed(4)}
                </Text>
                <Text style={styles.locationText}>
                  Lng: {plot.lon.toFixed(4)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('PlotDetails', { plotId: plot.id })}
            >
              <Ionicons name="eye" size={16} color="#3B82F6" />
              <Text style={styles.actionText}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.controlButton]}
              onPress={() => navigation.navigate('PlotSettings', { plotId: plot.id })}
            >
              <Ionicons name="settings" size={16} color="#10B981" />
              <Text style={styles.actionText}>Settings</Text>
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
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowSidebar(true)} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="leaf" size={20} color="white" />
          </View>
          <Text style={styles.logoText}>SmartMap</Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchPlots}>
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Clean Map View Section */}
        <View style={styles.mapSection}>
          <View style={styles.mapHeader}>
            <Text style={styles.sectionTitle}>Map View</Text>
            <View style={styles.viewButtons}>
              <TouchableOpacity
                style={[styles.viewButton, mapView === 'satellite' && styles.activeViewButton]}
                onPress={() => setMapView('satellite')}
              >
                <Ionicons name="earth" size={16} color={mapView === 'satellite' ? 'white' : 'rgba(255, 255, 255, 0.7)'} />
                <Text style={[styles.viewButtonText, mapView === 'satellite' && styles.activeViewButtonText]}>
                  Satellite
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewButton, mapView === 'terrain' && styles.activeViewButton]}
                onPress={() => setMapView('terrain')}
              >
                <Ionicons name="map" size={16} color={mapView === 'terrain' ? 'white' : 'rgba(255, 255, 255, 0.7)'} />
                <Text style={[styles.viewButtonText, mapView === 'terrain' && styles.activeViewButtonText]}>
                  Terrain
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewButton, mapView === 'hybrid' && styles.activeViewButton]}
                onPress={() => setMapView('hybrid')}
              >
                <Ionicons name="layers" size={16} color={mapView === 'hybrid' ? 'white' : 'rgba(255, 255, 255, 0.7)'} />
                <Text style={[styles.viewButtonText, mapView === 'hybrid' && styles.activeViewButtonText]}>
                  Hybrid
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Enhanced Map Placeholder */}
          <View style={styles.mapContainer}>
            {mapLocation ? (
              <View style={styles.mapPlaceholder}>
                <Ionicons name="map" size={40} color="#6B7280" />
                <Text style={styles.mapPlaceholderText}>Interactive Map</Text>
                <Text style={styles.mapPlaceholderSubtext}>
                  Location: {mapLocation.lat.toFixed(4)}, {mapLocation.lon.toFixed(4)}
                </Text>
                <Text style={styles.mapPlaceholderSubtext}>
                  {plots.length} plot{plots.length !== 1 ? 's' : ''} in view
                </Text>
              </View>
            ) : (
              <View style={styles.mapPlaceholder}>
                <Ionicons name="map" size={40} color="#6B7280" />
                <Text style={styles.mapPlaceholderText}>Interactive Map</Text>
                <Text style={styles.mapPlaceholderSubtext}>No plots with valid coordinates</Text>
              </View>
            )}
          </View>
        </View>

        {/* Plots List */}
        <View style={styles.plotsSection}>
          <Text style={styles.sectionTitle}>Your Plots</Text>
          {plots.map((plot) => (
            <PlotCard key={plot.id} plot={plot} />
          ))}
        </View>

        {/* Legend */}
        <View style={styles.legendSection}>
          <Text style={styles.sectionTitle}>Status Legend</Text>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Healthy</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>Warning</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Critical</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Plot Detail Modal */}
      {selectedPlot && <PlotDetailModal plot={selectedPlot} />}

      {/* Sidebar Navigation */}
      <SidebarNavigation
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
        navigation={navigation}
        currentRoute="SmartMap"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#111827',
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
    paddingHorizontal: 20,
  },
  mapSection: {
    marginBottom: 24,
  },
  mapContainer: {
    height: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  plotCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  plotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
    color: 'white',
    marginBottom: 4,
  },
  cropType: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  lastUpdate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  coordinates: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 2,
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
    color: 'white',
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
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: 'white',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
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
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  sensorGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  sensorCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  sensorLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  sensorValue: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginTop: 2,
  },
  sensorBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  sensorFill: {
    height: '100%',
    borderRadius: 2,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  locationInfo: {
    marginLeft: 12,
  },
  locationText: {
    fontSize: 14,
    color: 'white',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    flex: 1,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 4,
  },
  controlButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  loadingContainer: {
    flex: 1,
    padding: 20,
  },
  loadingCard: {
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 16,
  },
  menuButton: {
    padding: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  viewButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  activeViewButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  viewButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
  activeViewButtonText: {
    color: 'white',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapPlaceholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginTop: 16,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
}); 