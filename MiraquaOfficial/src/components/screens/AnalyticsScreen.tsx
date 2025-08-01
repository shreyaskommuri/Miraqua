
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AnalyticsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Analytics</Text>
        <Text style={styles.subtitle}>Smart insights for your garden</Text>
      </View>

      <View style={styles.content}>
        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="water" size={24} color="#3B82F6" />
            <Text style={styles.statValue}>142L</Text>
            <Text style={styles.statLabel}>Water Used</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color="#10B981" />
            <Text style={styles.statValue}>23%</Text>
            <Text style={styles.statLabel}>Water Saved</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="leaf" size={24} color="#F59E0B" />
            <Text style={styles.statValue}>100%</Text>
            <Text style={styles.statLabel}>Plant Health</Text>
          </View>
        </View>

        {/* Analytics Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          
          <View style={styles.analyticsCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="bar-chart" size={20} color="#3B82F6" />
              <Text style={styles.cardTitle}>Water Usage</Text>
            </View>
            <Text style={styles.cardValue}>142L</Text>
            <Text style={styles.cardSubtitle}>+12% from last week</Text>
          </View>

          <View style={styles.analyticsCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="thermometer" size={20} color="#F59E0B" />
              <Text style={styles.cardTitle}>Temperature</Text>
            </View>
            <Text style={styles.cardValue}>73°F</Text>
            <Text style={styles.cardSubtitle}>Optimal range</Text>
          </View>

          <View style={styles.analyticsCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="sunny" size={20} color="#F59E0B" />
              <Text style={styles.cardTitle}>Sunlight</Text>
            </View>
            <Text style={styles.cardValue}>8.5h</Text>
            <Text style={styles.cardSubtitle}>Daily average</Text>
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          
          <View style={styles.insightCard}>
            <Ionicons name="bulb" size={20} color="#8B5CF6" />
            <Text style={styles.insightTitle}>Watering Optimization</Text>
            <Text style={styles.insightText}>
              Your tomato garden can be watered 30 minutes later to save 15% more water.
            </Text>
          </View>

          <View style={styles.insightCard}>
            <Ionicons name="warning" size={20} color="#F59E0B" />
            <Text style={styles.insightTitle}>Weather Alert</Text>
            <Text style={styles.insightText}>
              Rain expected tomorrow. Consider skipping scheduled watering.
            </Text>
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
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
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
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
  analyticsCard: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  insightCard: {
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
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
    marginTop: 4,
  },
  insightText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default AnalyticsScreen;
