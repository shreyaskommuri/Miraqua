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

interface WeatherData {
  location: string;
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  };
  forecast: Array<{
    day: string;
    temperature: number;
    condition: string;
    icon: string;
  }>;
}

export default function WeatherScreen({ navigation }: any) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Get coordinates from user's plots
      let lat = 37.7749;
      let lon = -122.4194;
      let locationLabel = 'Your Location';

      try {
        const { getPlots } = await import('../api/plots');
        const result = await getPlots();
        const plots = result.plots || [];
        const plotWithCoords = plots.find(p => p.lat && p.lon);
        if (plotWithCoords) {
          lat = plotWithCoords.lat!;
          lon = plotWithCoords.lon!;
        } else if (plots.length > 0 && plots[0].zip_code) {
          const zipRes = await fetch(`https://api.zippopotam.us/us/${plots[0].zip_code}`);
          if (zipRes.ok) {
            const zipData = await zipRes.json();
            lat = parseFloat(zipData.places[0].latitude);
            lon = parseFloat(zipData.places[0].longitude);
            locationLabel = `${zipData.places[0]['place name']}, ${zipData.places[0]['state abbreviation']}`;
          }
        }
      } catch (_) {}

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current_weather=true&hourly=relativehumidity_2m,windspeed_10m` +
        `&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum` +
        `&temperature_unit=fahrenheit&timezone=auto&forecast_days=6`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather API error');
      const data = await res.json();

      const codeToCondition = (code: number): { condition: string; icon: string } => {
        if (code === 0) return { condition: 'Clear', icon: 'sunny' };
        if (code <= 3) return { condition: 'Partly Cloudy', icon: 'partly-cloudy' };
        if (code <= 48) return { condition: 'Foggy', icon: 'cloudy' };
        if (code <= 67) return { condition: 'Rainy', icon: 'rain' };
        if (code <= 77) return { condition: 'Snowy', icon: 'cloudy' };
        if (code <= 82) return { condition: 'Rain Showers', icon: 'rain' };
        return { condition: 'Thunderstorms', icon: 'rain' };
      };

      const currentCode = data.current_weather.weathercode;
      const currentCondition = codeToCondition(currentCode);
      // humidity from first hourly slot
      const humidity = data.hourly?.relativehumidity_2m?.[0] ?? 70;
      const windSpeed = Math.round(data.current_weather.windspeed * 0.621371); // km/h → mph

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const forecast = (data.daily.time as string[]).slice(0, 5).map((dateStr: string, i: number) => {
        const d = new Date(dateStr + 'T12:00:00');
        const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[d.getDay()];
        const { condition, icon } = codeToCondition(data.daily.weathercode[i]);
        const high = Math.round(data.daily.temperature_2m_max[i]);
        return { day: label, temperature: high, condition, icon };
      });

      setWeatherData({
        location: locationLabel,
        current: {
          temperature: Math.round(data.current_weather.temperature),
          condition: currentCondition.condition,
          humidity,
          windSpeed,
          icon: currentCondition.icon,
        },
        forecast,
      });
    } catch (err) {
      setError('Failed to load weather data');
    } finally {
      setIsLoading(false);
    }
  };

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case "sunny": return <Ionicons name="sunny" size={24} color="#f59e0b" />;
      case "cloudy": return <Ionicons name="cloudy" size={24} color="#6b7280" />;
      case "rain": return <Ionicons name="rainy" size={24} color="#3b82f6" />;
      case "partly-cloudy": return <Ionicons name="partly-sunny" size={24} color="#9ca3af" />;
      default: return <Ionicons name="cloudy" size={24} color="#6b7280" />;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Weather</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          {Array.from({ length: 5 }).map((_, i) => (
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
          <Ionicons name="arrow-back" size={20} color="#6b7280" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Weather Forecast</Text>
          <Text style={styles.headerSubtitle}>{weatherData?.location}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {error && (
            <View style={styles.errorCard}>
              <View style={styles.errorContent}>
                <Ionicons name="warning" size={20} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
              <TouchableOpacity style={styles.retryButton} onPress={fetchWeatherData}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Current Weather */}
          <View style={styles.currentWeatherCard}>
            <View style={styles.currentWeatherHeader}>
              <View style={styles.currentWeatherInfo}>
                <Text style={styles.currentTemp}>{weatherData?.current.temperature}°F</Text>
                <Text style={styles.currentCondition}>{weatherData?.current.condition}</Text>
              </View>
              <View style={styles.currentWeatherIcon}>
                {getWeatherIcon(weatherData?.current.icon || "")}
              </View>
            </View>
            
            <View style={styles.currentWeatherDetails}>
              <View style={styles.weatherDetail}>
                <Ionicons name="water" size={16} color="#dbeafe" />
                <Text style={styles.weatherDetailText}>{weatherData?.current.humidity}%</Text>
              </View>
              <View style={styles.weatherDetail}>
                <Ionicons name="airplane" size={16} color="#dbeafe" />
                <Text style={styles.weatherDetailText}>{weatherData?.current.windSpeed} mph</Text>
              </View>
            </View>
          </View>

          {/* Forecast */}
          <View style={styles.forecastSection}>
            <Text style={styles.forecastTitle}>5-Day Forecast</Text>
            <View style={styles.forecastContainer}>
              {weatherData?.forecast.map((day, index) => (
                <View key={index} style={styles.forecastCard}>
                  <View style={styles.forecastContent}>
                    <View style={styles.forecastLeft}>
                      {getWeatherIcon(day.icon)}
                      <View style={styles.forecastInfo}>
                        <Text style={styles.forecastDay}>{day.day}</Text>
                        <Text style={styles.forecastCondition}>{day.condition}</Text>
                      </View>
                    </View>
                    <Text style={styles.forecastTemp}>{day.temperature}°F</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Location Info */}
          <View style={styles.locationCard}>
            <Text style={styles.locationTitle}>Location</Text>
            <View style={styles.locationContent}>
              <Ionicons name="location" size={16} color="#3b82f6" />
              <Text style={styles.locationText}>Latitude: 37.7749, Longitude: -122.4194</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  loadingContainer: {
    padding: 16,
    gap: 16,
  },
  loadingCard: {
    height: 96,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  errorCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginLeft: 8,
  },
  retryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
  },
  currentWeatherCard: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 24,
  },
  currentWeatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentWeatherInfo: {
    flex: 1,
  },
  currentTemp: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  currentCondition: {
    fontSize: 16,
    color: '#dbeafe',
  },
  currentWeatherIcon: {
    alignItems: 'center',
  },
  currentWeatherDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weatherDetailText: {
    fontSize: 14,
    color: '#dbeafe',
  },
  forecastSection: {
    gap: 16,
  },
  forecastTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  forecastContainer: {
    gap: 12,
  },
  forecastCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  forecastContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forecastLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  forecastInfo: {
    gap: 2,
  },
  forecastDay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  forecastCondition: {
    fontSize: 14,
    color: '#6b7280',
  },
  forecastTemp: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  locationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#6b7280',
  },
}); 