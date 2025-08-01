
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const WeatherForecastScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weather Forecast</Text>
        <Text style={styles.subtitle}>7-day forecast for your garden</Text>
      </View>

      <View style={styles.content}>
        {/* Current Weather */}
        <View style={styles.currentWeatherCard}>
          <View style={styles.currentWeatherHeader}>
            <Ionicons name="partly-sunny" size={48} color="#F59E0B" />
            <View style={styles.currentWeatherInfo}>
              <Text style={styles.currentTemp}>73°F</Text>
              <Text style={styles.currentDesc}>Partly Cloudy</Text>
              <Text style={styles.currentLocation}>San Francisco, CA</Text>
            </View>
          </View>
          <View style={styles.currentWeatherDetails}>
            <View style={styles.weatherDetail}>
              <Ionicons name="water" size={16} color="#3B82F6" />
              <Text style={styles.weatherDetailText}>Humidity: 65%</Text>
            </View>
            <View style={styles.weatherDetail}>
              <Ionicons name="speedometer" size={16} color="#6B7280" />
              <Text style={styles.weatherDetailText}>Pressure: 1013 hPa</Text>
            </View>
            <View style={styles.weatherDetail}>
              <Ionicons name="airplane" size={16} color="#10B981" />
              <Text style={styles.weatherDetailText}>Wind: 8 mph</Text>
            </View>
          </View>
        </View>

        {/* 7-Day Forecast */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7-Day Forecast</Text>
          
          <View style={styles.forecastCard}>
            <View style={styles.forecastDay}>
              <Text style={styles.forecastDate}>Today</Text>
              <Ionicons name="sunny" size={24} color="#F59E0B" />
              <Text style={styles.forecastTemp}>73°</Text>
              <Text style={styles.forecastDesc}>Sunny</Text>
            </View>
            <View style={styles.forecastDay}>
              <Text style={styles.forecastDate}>Tue</Text>
              <Ionicons name="partly-sunny" size={24} color="#F59E0B" />
              <Text style={styles.forecastTemp}>68°</Text>
              <Text style={styles.forecastDesc}>Partly Cloudy</Text>
            </View>
            <View style={styles.forecastDay}>
              <Text style={styles.forecastDate}>Wed</Text>
              <Ionicons name="rainy" size={24} color="#3B82F6" />
              <Text style={styles.forecastTemp}>62°</Text>
              <Text style={styles.forecastDesc}>Rain</Text>
            </View>
            <View style={styles.forecastDay}>
              <Text style={styles.forecastDate}>Thu</Text>
              <Ionicons name="cloudy" size={24} color="#6B7280" />
              <Text style={styles.forecastTemp}>65°</Text>
              <Text style={styles.forecastDesc}>Cloudy</Text>
            </View>
            <View style={styles.forecastDay}>
              <Text style={styles.forecastDate}>Fri</Text>
              <Ionicons name="sunny" size={24} color="#F59E0B" />
              <Text style={styles.forecastTemp}>70°</Text>
              <Text style={styles.forecastDesc}>Sunny</Text>
            </View>
            <View style={styles.forecastDay}>
              <Text style={styles.forecastDate}>Sat</Text>
              <Ionicons name="partly-sunny" size={24} color="#F59E0B" />
              <Text style={styles.forecastTemp}>72°</Text>
              <Text style={styles.forecastDesc}>Partly Cloudy</Text>
            </View>
            <View style={styles.forecastDay}>
              <Text style={styles.forecastDate}>Sun</Text>
              <Ionicons name="sunny" size={24} color="#F59E0B" />
              <Text style={styles.forecastTemp}>75°</Text>
              <Text style={styles.forecastDesc}>Sunny</Text>
            </View>
          </View>
        </View>

        {/* Garden Impact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Garden Impact</Text>
          
          <View style={styles.impactCard}>
            <View style={styles.impactHeader}>
              <Ionicons name="water" size={20} color="#3B82F6" />
              <Text style={styles.impactTitle}>Watering Schedule</Text>
            </View>
            <Text style={styles.impactText}>
              Rain expected Wednesday. Consider skipping scheduled watering on Tuesday.
            </Text>
          </View>

          <View style={styles.impactCard}>
            <View style={styles.impactHeader}>
              <Ionicons name="thermometer" size={20} color="#F59E0B" />
              <Text style={styles.impactTitle}>Temperature Alert</Text>
            </View>
            <Text style={styles.impactText}>
              Temperatures dropping to 62°F on Wednesday. Protect sensitive plants.
            </Text>
          </View>

          <View style={styles.impactCard}>
            <View style={styles.impactHeader}>
              <Ionicons name="leaf" size={20} color="#10B981" />
              <Text style={styles.impactTitle}>Plant Health</Text>
            </View>
            <Text style={styles.impactText}>
              Optimal conditions for growth this week. Plants should thrive.
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
  currentWeatherCard: {
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
  currentWeatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentWeatherInfo: {
    marginLeft: 16,
  },
  currentTemp: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  currentDesc: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  currentLocation: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  currentWeatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherDetailText: {
    fontSize: 12,
    color: '#6B7280',
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
  forecastCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  forecastDay: {
    alignItems: 'center',
    marginBottom: 12,
  },
  forecastDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  forecastTemp: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  forecastDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  impactCard: {
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
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  impactText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default WeatherForecastScreen;
