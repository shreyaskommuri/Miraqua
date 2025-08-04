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

interface AnomalyAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  plotId: string;
  plotName: string;
  timestamp: string;
  isResolved: boolean;
  severity: number;
}

export default function AnomalyAlertsScreen({ navigation }: any) {
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [showResolved, setShowResolved] = useState(false);

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
          type: 'critical',
          title: 'Low Soil Moisture Detected',
          description: 'Soil moisture levels have dropped below 30% in Plot A. Immediate watering required.',
          plotId: 'plot-1',
          plotName: 'Plot A - Tomatoes',
          timestamp: '2 minutes ago',
          isResolved: false,
          severity: 9
        },
        {
          id: '2',
          type: 'warning',
          title: 'Unusual Water Consumption',
          description: 'Water usage is 25% higher than normal for this time of day.',
          plotId: 'plot-2',
          plotName: 'Plot B - Lettuce',
          timestamp: '15 minutes ago',
          isResolved: false,
          severity: 6
        },
        {
          id: '3',
          type: 'info',
          title: 'Weather Alert',
          description: 'Heavy rainfall expected in the next 2 hours. Consider reducing irrigation.',
          plotId: 'all',
          plotName: 'All Plots',
          timestamp: '1 hour ago',
          isResolved: false,
          severity: 3
        },
        {
          id: '4',
          type: 'critical',
          title: 'Sensor Malfunction',
          description: 'Moisture sensor in Plot C is not responding. Manual inspection required.',
          plotId: 'plot-3',
          plotName: 'Plot C - Peppers',
          timestamp: '3 hours ago',
          isResolved: true,
          severity: 8
        },
        {
          id: '5',
          type: 'warning',
          title: 'Temperature Spike',
          description: 'Temperature has increased by 8°F in the last hour. Monitor plant stress.',
          plotId: 'plot-1',
          plotName: 'Plot A - Tomatoes',
          timestamp: '4 hours ago',
          isResolved: false,
          severity: 5
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
              alert.id === alertId ? { ...alert, isResolved: true } : alert
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
      case 'critical': return 'warning';
      case 'warning': return 'alert-circle';
      case 'info': return 'information-circle';
      default: return 'notifications';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return '#EF4444';
      case 'warning': return '#F59E0B';
      case 'info': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return '#EF4444';
    if (severity >= 5) return '#F59E0B';
    return '#3B82F6';
  };

  const filteredAlerts = alerts.filter(alert => {
    if (!showResolved && alert.isResolved) return false;
    if (filter !== 'all' && alert.type !== filter) return false;
    return true;
  });

  const AlertCard = ({ alert }: { alert: AnomalyAlert }) => (
    <View style={[styles.alertCard, alert.isResolved && styles.resolvedCard]}>
      <View style={styles.alertHeader}>
        <View style={styles.alertInfo}>
          <View style={[styles.alertIcon, { backgroundColor: getAlertColor(alert.type) + '20' }]}>
            <Ionicons name={getAlertIcon(alert.type) as any} size={20} color={getAlertColor(alert.type)} />
          </View>
          <View style={styles.alertDetails}>
            <Text style={styles.alertTitle}>{alert.title}</Text>
            <Text style={styles.alertPlot}>{alert.plotName}</Text>
            <Text style={styles.alertTime}>{alert.timestamp}</Text>
          </View>
        </View>
        <View style={styles.alertSeverity}>
          <View style={[styles.severityBar, { backgroundColor: getSeverityColor(alert.severity) }]} />
          <Text style={styles.severityText}>{alert.severity}/10</Text>
        </View>
      </View>
      
      <Text style={styles.alertDescription}>{alert.description}</Text>
      
      <View style={styles.alertActions}>
        {!alert.isResolved && (
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
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Anomaly Alerts</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchAlerts}>
          <Ionicons name="refresh" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{alerts.filter(a => !a.isResolved).length}</Text>
            <Text style={styles.statLabel}>Active Alerts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{alerts.filter(a => a.type === 'critical' && !a.isResolved).length}</Text>
            <Text style={styles.statLabel}>Critical</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{alerts.filter(a => a.isResolved).length}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Filter by type:</Text>
            <View style={styles.filterButtons}>
              {['all', 'critical', 'warning', 'info'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.filterButton, filter === type && styles.activeFilter]}
                  onPress={() => setFilter(type as any)}
                >
                  <Text style={[styles.filterText, filter === type && styles.activeFilterText]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.toggleButton, showResolved && styles.activeToggle]}
            onPress={() => setShowResolved(!showResolved)}
          >
            <Ionicons name="checkmark-circle" size={16} color={showResolved ? 'white' : '#6B7280'} />
            <Text style={[styles.toggleText, showResolved && styles.activeToggleText]}>
              Show Resolved
            </Text>
          </TouchableOpacity>
        </View>

        {/* Alerts List */}
        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>
            {filteredAlerts.length} Alert{filteredAlerts.length !== 1 ? 's' : ''}
          </Text>
          {filteredAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
          {filteredAlerts.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              <Text style={styles.emptyText}>No alerts found</Text>
              <Text style={styles.emptySubtext}>All systems are running smoothly!</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  filtersContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
  },
  activeFilter: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  filterText: {
    fontSize: 12,
    color: '#374151',
  },
  activeFilterText: {
    color: 'white',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    alignSelf: 'flex-start',
  },
  activeToggle: {
    backgroundColor: '#10B981',
  },
  toggleText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 6,
  },
  activeToggleText: {
    color: 'white',
  },
  alertsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  alertCard: {
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
  resolvedCard: {
    opacity: 0.6,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  alertInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
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
    color: '#1F2937',
    marginBottom: 4,
  },
  alertPlot: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  alertSeverity: {
    alignItems: 'center',
  },
  severityBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginBottom: 4,
  },
  severityText: {
    fontSize: 10,
    color: '#6B7280',
  },
  alertDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 4,
  },
  viewButton: {
    backgroundColor: '#EFF6FF',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  deleteText: {
    color: '#EF4444',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    padding: 20,
  },
  loadingCard: {
    height: 120,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 16,
  },
}); 