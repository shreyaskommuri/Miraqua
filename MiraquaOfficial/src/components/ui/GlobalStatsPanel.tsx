
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DashboardStats {
  totalWaterUsed: number;
  avgMoisture: number;
  nextWateringIn: string;
  activePlots: number;
  waterSavings: number;
  moistureTrend: 'up' | 'down' | 'stable';
}

interface GlobalStatsPanelProps extends DashboardStats {}

export const GlobalStatsPanel: React.FC<GlobalStatsPanelProps> = ({
  totalWaterUsed,
  avgMoisture,
  nextWateringIn,
  activePlots,
  waterSavings,
  moistureTrend
}) => {
  return (
    <View style={styles.globalStatsGrid}>
      <View style={styles.globalStatCard}>
        <View style={styles.globalStatIcon}>
          <Ionicons name="location" size={20} color="#3B82F6" />
        </View>
        <Text style={styles.globalStatValue}>{activePlots}</Text>
        <Text style={styles.globalStatLabel}>Active Plots</Text>
      </View>

      <View style={styles.globalStatCard}>
        <View style={styles.globalStatIcon}>
          <Ionicons name="water" size={20} color="#3B82F6" />
        </View>
        <Text style={styles.globalStatValue}>{totalWaterUsed}L</Text>
        <Text style={styles.globalStatLabel}>Water Used</Text>
        <Text style={styles.globalStatSubtext}>This week</Text>
      </View>

      <View style={styles.globalStatCard}>
        <View style={styles.globalStatIcon}>
          <Ionicons 
            name={moistureTrend === 'up' ? 'trending-up' : 'trending-down'} 
            size={20} 
            color={moistureTrend === 'up' ? '#10B981' : '#F59E0B'} 
          />
        </View>
        <Text style={styles.globalStatValue}>{avgMoisture}%</Text>
        <Text style={styles.globalStatLabel}>Avg Moisture</Text>
        <Text style={styles.globalStatSubtext}>{moistureTrend === 'up' ? '+5%' : '-3%'}</Text>
      </View>

      <View style={styles.globalStatCard}>
        <View style={styles.globalStatIcon}>
          <Ionicons name="time" size={20} color="#8B5CF6" />
        </View>
        <Text style={styles.globalStatValue}>{nextWateringIn}</Text>
        <Text style={styles.globalStatLabel}>Next Watering</Text>
      </View>

      <View style={styles.waterSavingsCard}>
        <View style={styles.waterSavingsContent}>
          <Text style={styles.waterSavingsLabel}>💡 Smart Savings</Text>
          <Text style={styles.waterSavingsValue}>{waterSavings}% water saved</Text>
          <Text style={styles.waterSavingsSubtext}>vs traditional irrigation</Text>
        </View>
        <Text style={styles.waterSavingsIcon}>🌱</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  globalStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  globalStatCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  globalStatIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  globalStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  globalStatLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  globalStatSubtext: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  waterSavingsCard: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  waterSavingsContent: {
    flex: 1,
  },
  waterSavingsLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  waterSavingsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  waterSavingsSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  waterSavingsIcon: {
    fontSize: 32,
  },
});
