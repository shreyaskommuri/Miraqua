import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SidebarNavigation from './SidebarNavigation';

interface AnomalyAlert {
  id: string;
  type: 'moisture' | 'temperature' | 'water' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  plotId: string;
  plotName: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

export default function AnomalyAlertsScreen({ navigation }: any) {
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAlerts([
        {
          id: '1',
          type: 'moisture',
          severity: 'critical',
          title: 'Low Soil Moisture Detected',
          description: 'Soil moisture levels have dropped below 30% in Plot A. Immediate watering required.',
          timestamp: '2 minutes ago',
          plotId: 'plot-1',
          plotName: 'Plot A - Tomatoes',
          status: 'active'
        },
        {
          id: '2',
          type: 'water',
          severity: 'medium',
          title: 'Unusual Water Consumption',
          description: 'Water usage is 25% higher than normal for this time of day.',
          timestamp: '15 minutes ago',
          plotId: 'plot-2',
          plotName: 'Plot B - Lettuce',
          status: 'active'
        },
        {
          id: '3',
          type: 'system',
          severity: 'low',
          title: 'Weather Alert',
          description: 'Heavy rainfall expected in the next 2 hours. Consider reducing irrigation.',
          timestamp: '1 hour ago',
          plotId: 'all',
          plotName: 'All Plots',
          status: 'active'
        },
        {
          id: '4',
          type: 'moisture',
          severity: 'critical',
          title: 'Sensor Malfunction',
          description: 'Moisture sensor in Plot C is not responding. Manual inspection required.',
          timestamp: '3 hours ago',
          plotId: 'plot-3',
          plotName: 'Plot C - Peppers',
          status: 'resolved'
        },
        {
          id: '5',
          type: 'temperature',
          severity: 'high',
          title: 'Temperature Spike',
          description: 'Temperature has increased by 8°F in the last hour. Monitor plant stress.',
          timestamp: '4 hours ago',
          plotId: 'plot-1',
          plotName: 'Plot A - Tomatoes',
          status: 'active'
        }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to load alerts');
    } finally {
      setIsLoading(false);
    }
  };

  const resolveAlert = (alertId: string) => {
    Alert.alert(
      'Resolve Alert',
      'Mark this alert as resolved?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          onPress: () => {
            setAlerts(prev => prev.map(alert => 
              alert.id === alertId ? { ...alert, status: 'resolved' } : alert
            ));
            Alert.alert('Success', 'Alert marked as resolved');
          }
        }
      ]
    );
  };

  const deleteAlert = (alertId: string) => {
    Alert.alert(
      'Delete Alert',
      'Are you sure you want to delete this alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAlerts(prev => prev.filter(alert => alert.id !== alertId));
            Alert.alert('Success', 'Alert deleted');
          }
        }
      ]
    );
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'moisture': return 'water';
      case 'temperature': return 'thermometer';
      case 'water': return 'water';
      case 'system': return 'cog';
      default: return 'notifications';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (alert.status === 'resolved' && selectedFilter === 'active') return false;
    if (selectedFilter !== 'all' && alert.type !== selectedFilter) return false;
    return true;
  });

  const AlertCard = ({ alert }: { alert: AnomalyAlert }) => (
    <View style={[styles.alertCard, alert.status === 'resolved' && styles.resolvedCard]}>
      <View style={styles.alertHeader}>
        <View style={styles.alertInfo}>
          <View style={[styles.alertIcon, { backgroundColor: getAlertColor(alert.severity) + '20' }]}>
            <Ionicons name={getAlertIcon(alert.type) as any} size={20} color={getAlertColor(alert.severity)} />
          </View>
          <View style={styles.alertDetails}>
            <Text style={styles.alertTitle}>{alert.title}</Text>
            <Text style={styles.alertPlot}>{alert.plotName}</Text>
            <Text style={styles.alertTimestamp}>{alert.timestamp}</Text>
          </View>
        </View>
        <View style={styles.alertSeverity}>
          <View style={[styles.severityBar, { backgroundColor: getSeverityColor(alert.severity) }]} />
          <Text style={styles.severityText}>{alert.severity}</Text>
        </View>
      </View>
      
      <Text style={styles.alertDescription}>{alert.description}</Text>
      
      <View style={styles.alertActions}>
        {alert.status !== 'resolved' && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => resolveAlert(alert.id)}
          >
            <Ionicons name="checkmark" size={16} color="#10B981" />
            <Text style={styles.actionText}>Resolve</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => navigation.navigate('PlotDetails', { plot: { id: alert.plotId, name: alert.plotName } })}
        >
          <Ionicons name="eye" size={16} color="#3B82F6" />
          <Text style={styles.actionText}>View Plot</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteAlert(alert.id)}
        >
          <Ionicons name="trash" size={16} color="#EF4444" />
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Anomaly Alerts</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={styles.loadingCard} />
          ))}
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
          <Text style={styles.logoText}>Miraqua</Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchAlerts}>
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{alerts.filter(a => a.status !== 'resolved').length}</Text>
            <Text style={styles.statLabel}>Active Alerts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length}</Text>
            <Text style={styles.statLabel}>Critical</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{alerts.filter(a => a.status === 'resolved').length}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Filter by type:</Text>
            <View style={styles.filterButtons}>
              {['all', 'moisture', 'temperature', 'water', 'system'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.filterButton, selectedFilter === type && styles.activeFilter]}
                  onPress={() => setSelectedFilter(type as any)}
                >
                  <Text style={[styles.filterText, selectedFilter === type && styles.activeFilterText]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.toggleButton, selectedFilter === 'active' && styles.activeToggle]}
            onPress={() => setSelectedFilter(selectedFilter === 'active' ? 'all' : 'active')}
          >
            <Ionicons name="checkmark-circle" size={16} color={selectedFilter === 'active' ? 'white' : '#6B7280'} />
            <Text style={[styles.toggleText, selectedFilter === 'active' && styles.activeToggleText]}>
              Show Active
            </Text>
          </TouchableOpacity>
        </View>

        {/* Alerts List */}
        <View style={styles.alertsContainer}>
          {filteredAlerts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No alerts found</Text>
              <Text style={styles.emptySubtext}>All systems are running smoothly!</Text>
            </View>
          ) : (
            filteredAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))
          )}
        </View>
      </ScrollView>

      {/* Sidebar Navigation */}
      <SidebarNavigation
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
        navigation={navigation}
        currentRoute="AnomalyAlerts"
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  filtersContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  activeFilter: {
    backgroundColor: '#10B981',
  },
  filterText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
    fontWeight: '600',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  activeToggle: {
    backgroundColor: '#10B981',
  },
  toggleText: {
    fontSize: 12,
    color: 'white',
    marginLeft: 4,
    fontWeight: '500',
  },
  activeToggleText: {
    color: 'white',
    fontWeight: '600',
  },
  alertsContainer: {
    marginBottom: 20,
  },
  alertCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  resolvedCard: {
    opacity: 0.6,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertDetails: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  alertSeverity: {
    alignItems: 'center',
  },
  severityBar: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginBottom: 4,
  },
  severityText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  alertMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertPlot: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  alertTimestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  viewButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  actionText: {
    fontSize: 12,
    color: 'white',
    marginLeft: 4,
    fontWeight: '500',
  },
  deleteText: {
    color: '#FCA5A5',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    padding: 20,
  },
  loadingCard: {
    height: 120,
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
    borderRadius: 8,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
}); 