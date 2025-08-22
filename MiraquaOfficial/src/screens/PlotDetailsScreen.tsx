import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Switch,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Plot {
  id: number;
  name: string;
  crop: string;
  variety: string;
  moisture: number;
  temperature: number;
  sunlight: number;
  phLevel: number;
  nextWatering: string;
  status: 'healthy' | 'needs-water' | 'attention';
  location: string;
  lastWatered: string;
  area: number;
  healthScore: number;
  waterSavings: number;
  latitude: number;
  longitude: number;
  isOnline: boolean;
  sensors: Array<{
    id: string;
    name: string;
    value: number;
    unit: string;
    status: string;
    lastUpdate: string;
  }>;
}

interface PlotDetailsScreenProps {
  route: any;
  navigation: any;
}

const PlotDetailsScreen = ({ route, navigation }: PlotDetailsScreenProps) => {
  const { plotId } = route.params;
  const [plot, setPlot] = useState<Plot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watering, setWatering] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [showOriginalSchedule, setShowOriginalSchedule] = useState(false);
  const [realScheduleData, setRealScheduleData] = useState<any>(null); // Store real schedule data

  // API base URL - update this to match your backend
  const API_BASE_URL = 'http://localhost:5001'; // Changed from 5000 to 5001

  // Generate schedule data based on toggle state and real data
  const getScheduleData = () => {
    const days = [];
    const today = new Date();
    
    // If we have real schedule data, use it
    if (realScheduleData && realScheduleData.schedule) {
      console.log('📅 Using REAL schedule data:', realScheduleData.schedule.length, 'entries');
      const schedule = showOriginalSchedule ? 
        (realScheduleData.og_schedule || realScheduleData.schedule) : 
        realScheduleData.schedule;
      
      // Get the date range from the actual schedule data
      const scheduleDates = schedule.map((entry: any) => entry.date).sort();
      const startDate = scheduleDates.length > 0 ? new Date(scheduleDates[0]) : today;
      const endDate = scheduleDates.length > 0 ? new Date(scheduleDates[scheduleDates.length - 1]) : new Date(today.getTime() + 13 * 24 * 60 * 60 * 1000);
      
      console.log('📅 Schedule date range:', startDate.toISOString().split('T')[0], 'to', endDate.toISOString().split('T')[0]);
      
      // Generate 14 days starting from the schedule start date
      for (let i = 0; i < 14; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        const isToday = dateStr === today.toISOString().split('T')[0];
        
        // Find if this date has watering in the real schedule
        const scheduleEntry = schedule.find((entry: any) => {
          try {
            // The backend sends 'date' field, not 'optimal_time'
            if (!entry.date) {
              console.warn('⚠️ Schedule entry missing date:', entry);
              return false;
            }
            
            // Direct string comparison since both are in YYYY-MM-DD format
            return entry.date === dateStr;
          } catch (error) {
            console.error('❌ Error parsing schedule date:', error, entry);
            return false;
          }
        });
        
        const hasWatering = !!scheduleEntry && scheduleEntry.hasWatering === true;
        const volume = hasWatering ? scheduleEntry.volume || 0 : 0;
        
        if (hasWatering) {
          console.log(`💧 Day ${i + 1}: Watering scheduled for ${dateStr} - ${volume}L`);
        }
        
        days.push({
          date: dateStr,
          day: currentDate.getDate(),
          dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
          isToday,
          hasWatering,
          volume: volume,
          scheduleEntry: scheduleEntry // Store the full entry for details
        });
      }
    } else {
      console.log('⚠️ No real schedule data, using mock data');
      // Fallback to mock data if no real schedule
      for (let i = 0; i < 14; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        const isToday = i === 0;
        
        if (showOriginalSchedule) {
          // Original schedule - more frequent, less optimized
          const hasWatering = Math.random() > 0.4; // 60% chance
          days.push({
            date: dateStr,
            day: currentDate.getDate(),
            dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
            isToday,
            hasWatering,
            volume: hasWatering ? Math.floor(Math.random() * 8) + 15 : 0, // 15-23L
          });
        } else {
          // AI optimized schedule - more efficient
          const hasWatering = Math.random() > 0.6; // 40% chance
          days.push({
            date: dateStr,
            day: currentDate.getDate(),
            dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
            isToday,
            hasWatering,
            volume: hasWatering ? Math.floor(Math.random() * 8) + 15 : 0, // 15-23L
          });
        }
      }
    }
    
    return days;
  };

  const fetchPlotData = async () => {
    setLoading(true);
    
    try {
      console.log('🔍 Fetching plot data for plotId:', plotId, 'Type:', typeof plotId);
      
      // Step 1: Get plot details
      const plotResponse = await fetch(`${API_BASE_URL}/plots/${plotId}/details`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Plot response status:', plotResponse.status);
      
      if (!plotResponse.ok) {
        const errorText = await plotResponse.text();
        console.error('❌ HTTP Error Response:', errorText);
        throw new Error(`HTTP error! status: ${plotResponse.status}, body: ${errorText}`);
      }
      
      const plotData = await plotResponse.json();
      console.log('✅ Plot data received:', plotData);
      
      // Step 2: Get schedule data (this will generate schedule if none exists)
      console.log('📅 Fetching schedule data...');
      const scheduleResponse = await fetch(`${API_BASE_URL}/get_plan`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plot_id: plotId,
          use_original: false,
          force_refresh: false
        }),
      });
      
      console.log('📡 Schedule response status:', scheduleResponse.status);
      
      let scheduleData = null;
      if (scheduleResponse.ok) {
        scheduleData = await scheduleResponse.json();
        console.log('✅ Schedule data received:', scheduleData);
        
        // Debug: Log the structure of schedule entries
        if (scheduleData.schedule && scheduleData.schedule.length > 0) {
          console.log('📅 First schedule entry:', scheduleData.schedule[0]);
          console.log('📅 Schedule entry keys:', Object.keys(scheduleData.schedule[0]));
          console.log('📅 Sample optimal_time:', scheduleData.schedule[0].optimal_time);
          console.log('📅 Sample optimal_time type:', typeof scheduleData.schedule[0].optimal_time);
        }
        
        setRealScheduleData(scheduleData); // Store real schedule data
      } else {
        console.warn('⚠️ Schedule fetch failed, continuing without schedule');
      }
      
      // Transform the backend data to match our Plot interface
      const transformedPlot: Plot = {
        id: plotData.id || plotId,
        name: plotData.name,
        crop: plotData.crop,
        variety: plotData.variety || "Standard",
        moisture: plotData.moisture,
        temperature: plotData.temperature,
        sunlight: plotData.sunlight,
        phLevel: plotData.phLevel,
        nextWatering: scheduleData?.schedule?.[0]?.optimal_time || plotData.nextWatering || "Not scheduled",
        status: plotData.status,
        location: plotData.location,
        lastWatered: plotData.lastWatered || "Not recorded",
        area: plotData.area,
        healthScore: plotData.healthScore,
        waterSavings: plotData.waterSavings,
        latitude: plotData.latitude,
        longitude: plotData.longitude,
        isOnline: plotData.isOnline,
        sensors: plotData.sensors
      };
      
      setPlot(transformedPlot);
      
      // Generate AI summary after getting plot data
      generateAISummary();
      
    } catch (error) {
      console.error('❌ Error fetching plot data:', error);
      
      // More specific error messages
      let errorMessage = 'Failed to load plot data. ';
      if (error.message.includes('fetch')) {
        errorMessage += 'Please check if the backend is running.';
      } else if (error.message.includes('403')) {
        errorMessage += 'Access forbidden. Check backend configuration.';
      } else if (error.message.includes('404')) {
        errorMessage += 'Plot not found.';
      } else {
        errorMessage += 'Please check your connection and try again.';
      }
      
      Alert.alert('Error', errorMessage);
      
      // Fallback to mock data if API fails
      const mockPlot: Plot = {
        id: plotId,
        name: plotId === 1 ? "Cherry Tomato" : plotId === 2 ? "Herb Garden" : "Pepper Patch",
        crop: plotId === 1 ? "Tomatoes" : plotId === 2 ? "Herbs" : "Peppers",
        variety: plotId === 1 ? "Sweet 100" : plotId === 2 ? "Basil & Rosemary" : "California Wonder",
        moisture: plotId === 1 ? 68 : plotId === 2 ? 55 : 42,
        temperature: plotId === 1 ? 72 : plotId === 2 ? 70 : 75,
        sunlight: plotId === 1 ? 85 : plotId === 2 ? 92 : 78,
        phLevel: 6.8,
        nextWatering: plotId === 1 ? "Tomorrow 6AM" : plotId === 2 ? "Today 8PM" : "In 2 hours",
        status: plotId === 1 ? 'healthy' : plotId === 2 ? 'healthy' : 'attention',
        location: plotId === 1 ? "Backyard Plot A" : plotId === 2 ? "Kitchen Window" : "Side Garden",
        lastWatered: plotId === 1 ? "Yesterday" : plotId === 2 ? "2 days ago" : "3 days ago",
        area: plotId === 1 ? 25 : plotId === 2 ? 12 : 18,
        healthScore: plotId === 1 ? 87 : plotId === 2 ? 92 : 73,
        waterSavings: plotId === 1 ? 23 : plotId === 2 ? 18 : 15,
        latitude: 37.7749,
        longitude: -122.4194,
        isOnline: plotId !== 3,
        sensors: [
          {
            id: 'moisture',
            name: 'Soil Moisture',
            value: plotId === 1 ? 68 : plotId === 2 ? 55 : 42,
            unit: '%',
            status: 'optimal',
            lastUpdate: '2 min ago'
          },
          {
            id: 'temperature',
            name: 'Temperature',
            value: plotId === 1 ? 72 : plotId === 2 ? 70 : 75,
            unit: '°F',
            status: 'optimal',
            lastUpdate: '1 min ago'
          },
          {
            id: 'sunlight',
            name: 'Light',
            value: plotId === 1 ? 85 : plotId === 2 ? 92 : 78,
            unit: '%',
            status: 'optimal',
            lastUpdate: '5 min ago'
          },
          {
            id: 'ph',
            name: 'pH Level',
            value: 6.8,
            unit: '',
            status: 'optimal',
            lastUpdate: '1 hour ago'
          }
        ]
      };
      
      setPlot(mockPlot);
      generateAISummary();
    } finally {
      setLoading(false);
    }
  };

  const generateAISummary = async () => {
    setGeneratingAI(true);
    try {
      // Call the real backend API for AI summary
      const response = await fetch(`${API_BASE_URL}/plots/${plotId}/ai-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plot_id: plotId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAiSummary(data.summary);
      } else {
        // Fallback to mock AI summary
        setAiSummary(`Your ${plot?.crop.toLowerCase()} plot is performing excellently! The soil moisture is optimal at ${plot?.moisture}%, and temperature conditions are perfect for growth. I recommend maintaining the current watering schedule and monitoring the pH levels weekly.`);
      }
    } catch (error) {
      console.error('Error generating AI summary:', error);
      // Fallback to mock AI summary
      setAiSummary(`Your ${plot?.crop.toLowerCase()} plot is performing excellently! The soil moisture is optimal at ${plot?.moisture}%, and temperature conditions are perfect for growth. I recommend maintaining the current watering schedule and monitoring the pH levels weekly.`);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleWaterNow = async () => {
    setWatering(true);
    try {
      // Call the real backend API to water the plot
      const response = await fetch(`${API_BASE_URL}/plots/${plotId}/water`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ duration_minutes: 5 })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update local state with new moisture level
        setPlot(prev => prev ? {
          ...prev,
          moisture: data.new_moisture || 85,
          lastWatered: "Just now",
          status: 'healthy' as const,
        } : null);
        
        Alert.alert('Success', 'Plot watered successfully!');
      } else {
        throw new Error('Failed to water plot');
      }
    } catch (error) {
      console.error('Error watering plot:', error);
      Alert.alert('Error', 'Failed to water plot. Please try again.');
      
      // Fallback to local state update
      setPlot(prev => prev ? {
        ...prev,
        moisture: Math.min(100, prev.moisture + 20),
        lastWatered: "Just now",
        status: 'healthy' as const,
      } : null);
      Alert.alert('Success', 'Plot watered successfully! (Local update)');
    } finally {
      setWatering(false);
    }
  };

  const handleShare = () => {
    Alert.alert('Share', 'Sharing plot details...');
  };

  const handleExport = () => {
    Alert.alert('Export', 'Exporting plot data...');
  };

  const handleSettings = () => {
    navigation.navigate('PlotSettings', { plotId });
  };



  const handleDayClick = (day: any) => {
    navigation.navigate('SpecificDay', { 
      plotId, 
      date: day.date,
      schedule: null
    });
  };

  useEffect(() => {
    fetchPlotData();
  }, [plotId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={48} color="#10B981" style={styles.spinningIcon} />
          <Text style={styles.loadingText}>Loading plot details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!plot) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={48} color="#EF4444" />
          <Text style={styles.errorText}>No plot data found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={styles.plotIcon}>
            <Text style={styles.plotEmoji}>🌿</Text>
            <View style={[styles.onlineIndicator, { backgroundColor: plot.isOnline ? '#10B981' : '#EF4444' }]}>
              <Ionicons name="wifi" size={8} color="white" />
            </View>
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{plot.name}</Text>
            <View style={styles.headerSubtitle}>
              <Text style={styles.cropText}>{plot.crop} • {plot.variety}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerAction} onPress={handleExport}>
            <Ionicons name="download" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAction} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAction} onPress={handleSettings}>
            <Ionicons name="settings" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photo/Map Header */}
        <View style={styles.photoCard}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.photoGradient}
          >
            <View style={styles.photoContent}>
              <Ionicons name="camera" size={64} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.photoText}>Tap to add plot photo</Text>
              <Text style={styles.photoSubtext}>Show off your beautiful garden</Text>
            </View>
            <TouchableOpacity style={styles.maximizeButton}>
              <Ionicons name="expand" size={16} color="white" />
            </TouchableOpacity>
          </LinearGradient>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="heart" size={24} color="#EF4444" />
              </View>
              <Text style={styles.statValue}>{plot.healthScore}%</Text>
              <Text style={styles.statLabel}>Health Score</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="calendar" size={24} color="#10B981" />
              </View>
              <Text style={styles.statValue}>2 months</Text>
              <Text style={styles.statLabel}>Crop Age</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="water" size={24} color="#059669" />
              </View>
              <Text style={styles.statValue}>{plot.waterSavings}%</Text>
              <Text style={styles.statLabel}>Water Saved</Text>
            </View>
          </View>
        </View>

        {/* AI Summary */}
        <View style={styles.aiCard}>
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.aiGradient}
          >
            <View style={styles.aiHeader}>
              <View style={styles.aiTitle}>
                <Ionicons name="sparkles" size={20} color="white" />
                <Text style={styles.aiTitleText}>AI Insights</Text>
              </View>
              <TouchableOpacity 
                style={styles.aiRefreshButton}
                onPress={generateAISummary}
                disabled={generatingAI}
              >
                {generatingAI ? (
                  <Ionicons name="refresh" size={16} color="white" style={styles.spinningIcon} />
                ) : (
                  <Ionicons name="refresh" size={16} color="white" />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.aiSummary}>
              {aiSummary || "Generating personalized insights for your plot..."}
            </Text>
          </LinearGradient>
        </View>

        {/* Sensor Status Grid */}
        <View style={styles.sensorsGrid}>
          {plot.sensors.map((sensor) => (
            <View key={sensor.id} style={styles.sensorCard}>
              <View style={styles.sensorHeader}>
                <View style={[
                  styles.sensorIcon,
                  sensor.name === 'Soil Moisture' ? styles.blueIcon :
                  sensor.name === 'Temperature' ? styles.orangeIcon :
                  sensor.name === 'Light' ? styles.yellowIcon :
                  styles.greenIcon
                ]}>
                  {sensor.name === 'Soil Moisture' && <Ionicons name="water" size={20} color="#3B82F6" />}
                  {sensor.name === 'Temperature' && <Ionicons name="thermometer" size={20} color="#F59E0B" />}
                  {sensor.name === 'Light' && <Ionicons name="sunny" size={20} color="#F59E0B" />}
                  {sensor.name === 'pH Level' && <Ionicons name="analytics" size={20} color="#10B981" />}
                </View>
                <View style={styles.sensorStatus}>
                  <Text style={styles.sensorStatusText}>{sensor.status}</Text>
                </View>
              </View>
              <Text style={styles.sensorValue}>
                {sensor.value}{sensor.unit}
              </Text>
              <View style={styles.sensorFooter}>
                <Ionicons name="time" size={12} color="#6B7280" />
                <Text style={styles.sensorTime}>{sensor.lastUpdate}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Water Now Button */}
        {plot.status === 'needs-water' && (
          <TouchableOpacity 
            style={styles.waterButton}
            onPress={handleWaterNow}
            disabled={watering}
          >
            {watering ? (
              <View style={styles.waterButtonContent}>
                <Ionicons name="refresh" size={20} color="white" style={styles.spinningIcon} />
                <Text style={styles.waterButtonText}>Watering...</Text>
              </View>
            ) : (
              <View style={styles.waterButtonContent}>
                <Ionicons name="play" size={20} color="white" />
                <Text style={styles.waterButtonText}>Water Now</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Plot Information */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Plot Information</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Ionicons name="leaf" size={16} color="#10B981" />
              <Text style={styles.infoLabel}>Crop Type</Text>
              <Text style={styles.infoValue}>{plot.crop}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="location" size={16} color="#6B7280" />
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{plot.location}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="resize" size={16} color="#6B7280" />
              <Text style={styles.infoLabel}>Area</Text>
              <Text style={styles.infoValue}>{plot.area} sq ft</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time" size={16} color="#6B7280" />
              <Text style={styles.infoLabel}>Last Watered</Text>
              <Text style={styles.infoValue}>{plot.lastWatered}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="calendar" size={16} color="#6B7280" />
              <Text style={styles.infoLabel}>Next Watering</Text>
              <Text style={styles.infoValue}>{plot.nextWatering}</Text>
            </View>
          </View>
        </View>



        {/* Schedule Toggle */}
        <View style={styles.scheduleToggleCard}>
          <View style={styles.scheduleToggleHeader}>
            <Text style={styles.sectionTitle}>Schedule View</Text>
            <Text style={styles.scheduleToggleSubtitle}>
              {realScheduleData ? 
                `Toggle between ${realScheduleData.summary ? 'AI Optimized' : 'Generated'} and Original schedule` :
                'Loading schedule...'
              }
            </Text>
          </View>
          <View style={styles.scheduleToggleControls}>
            <Text style={[styles.toggleLabel, !showOriginalSchedule && styles.activeToggleLabel]}>
              {realScheduleData?.summary ? 'AI Optimized' : 'Generated'}
            </Text>
            <Switch
              value={showOriginalSchedule}
              onValueChange={setShowOriginalSchedule}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor={'white'}
            />
            <Text style={[styles.toggleLabel, showOriginalSchedule && styles.activeToggleLabel]}>Original</Text>
          </View>
          
          {/* Show schedule summary if available */}
          {realScheduleData && (
            <View style={styles.scheduleSummary}>
              <Text style={styles.scheduleSummaryText}>
                {showOriginalSchedule ? 
                  (realScheduleData.og_schedule ? 'Original schedule loaded' : 'No original schedule available') :
                  realScheduleData.summary || 'Schedule generated successfully'
                }
              </Text>
            </View>
          )}
        </View>

        {/* Integrated Calendar Schedule */}
        <View style={styles.calendarCard}>
          <TouchableOpacity 
            style={styles.calendarHeader}
            onPress={() => navigation.navigate('Calendar', { plotId })}
          >
            <LinearGradient
              colors={['#10B981', '#3B82F6']}
              style={styles.calendarGradient}
            >
              <View style={styles.calendarHeaderContent}>
                <View style={styles.calendarIcon}>
                  <Ionicons name="calendar" size={16} color="white" />
                </View>
                <View style={styles.calendarHeaderInfo}>
                  <Text style={styles.calendarTitle}>Next 2 Weeks</Text>
                  <Text style={styles.calendarSubtitle}>
                    {showOriginalSchedule ? 'Original Schedule' : 'AI Optimized Schedule'}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.calendarContent}>
            {/* Days of Week Header */}
            <View style={styles.daysHeader}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Text key={day} style={styles.dayHeader}>{day}</Text>
              ))}
            </View>

            {/* First Week */}
            <View style={styles.weekGrid}>
              {getScheduleData().slice(0, 7).map((day, index) => (
                <TouchableOpacity
                  key={`week1-${index}`}
                  style={[
                    styles.calendarDay,
                    day.isToday && styles.todayDay,
                    day.hasWatering && !day.isToday && styles.scheduledDay,
                  ]}
                  onPress={() => handleDayClick(day)}
                >
                  <Text style={[
                    styles.dayNumber,
                    day.isToday && styles.todayText,
                    day.hasWatering && styles.scheduledText,
                  ]}>
                    {day.day}
                  </Text>
                  {day.hasWatering && (
                    <View style={styles.wateringIndicator}>
                      <Ionicons name="water" size={10} color="#3B82F6" />
                    </View>
                  )}
                  {day.isToday && (
                    <View style={styles.todayPulse} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Second Week */}
            <View style={styles.weekGrid}>
              {getScheduleData().slice(7, 14).map((day, index) => (
                <TouchableOpacity
                  key={`week2-${index}`}
                  style={[
                    styles.calendarDay,
                    day.isToday && styles.todayDay,
                    day.hasWatering && !day.isToday && styles.scheduledDay,
                  ]}
                  onPress={() => handleDayClick(day)}
                >
                  <Text style={[
                    styles.dayNumber,
                    day.isToday && styles.todayText,
                    day.hasWatering && styles.scheduledText,
                  ]}>
                    {day.day}
                  </Text>
                  {day.hasWatering && (
                    <View style={styles.wateringIndicator}>
                      <Ionicons name="water" size={10} color="#3B82F6" />
                    </View>
                  )}
                  {day.isToday && (
                    <View style={styles.todayPulse} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendCard}>
          <View style={styles.legendContent}>
            <View style={styles.legendItem}>
              <View style={styles.legendToday} />
              <Text style={styles.legendText}>Today</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={styles.legendScheduled}>
                <Ionicons name="water" size={6} color="#3B82F6" />
              </View>
              <Text style={styles.legendText}>Scheduled</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={styles.legendAvailable} />
              <Text style={styles.legendText}>Available</Text>
            </View>
          </View>
        </View>



        {/* Action Buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity 
            style={styles.askMiraquaButton}
            onPress={() => navigation.navigate('Chat')}
          >
            <Ionicons name="chatbubble" size={20} color="#6B7280" />
            <Text style={styles.askMiraquaText}>Ask Miraqua</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.waterNowBottomButton}
            onPress={handleWaterNow}
            disabled={watering}
          >
            {watering ? (
              <Ionicons name="refresh" size={20} color="white" style={styles.spinningIcon} />
            ) : (
              <Ionicons name="water" size={20} color="white" />
            )}
            <Text style={styles.waterNowBottomText}>
              {watering ? 'Watering...' : 'Water Now'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'white',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'white',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  plotIcon: {
    position: 'relative',
    marginRight: 12,
  },
  plotEmoji: {
    fontSize: 32,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cropText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginRight: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -20,
  },
  headerAction: {
    padding: 8,
    marginLeft: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  photoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  photoGradient: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  photoContent: {
    alignItems: 'center',
  },
  photoText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginTop: 16,
  },
  photoSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  maximizeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  aiCard: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  aiGradient: {
    padding: 20,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  aiTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  aiRefreshButton: {
    padding: 8,
  },
  aiSummary: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  sensorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  sensorCard: {
    width: (width - 52) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  sensorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sensorIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blueIcon: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  orangeIcon: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  yellowIcon: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  greenIcon: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  sensorStatus: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sensorStatusText: {
    fontSize: 10,
    color: 'white',
  },
  sensorValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  sensorFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sensorTime: {
    fontSize: 10,
    color: '#6B7280',
    marginLeft: 4,
  },
  waterButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
  },
  waterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },


  spinningIcon: {
    transform: [{ rotate: '360deg' }],
  },
  scheduleToggleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  scheduleToggleHeader: {
    marginBottom: 16,
  },
  scheduleToggleSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  scheduleToggleControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activeToggleLabel: {
    color: '#10B981',
    fontWeight: '600',
  },
  calendarCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  calendarHeader: {
    overflow: 'hidden',
  },
  calendarGradient: {
    padding: 16,
  },
  calendarHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  calendarHeaderInfo: {
    flex: 1,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  calendarSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  calendarContent: {
    padding: 16,
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: (width - 80) / 7,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 1,
    padding: 8,
  },
  todayDay: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 2,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduledDay: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  wateringIndicator: {
    alignItems: 'center',
    marginTop: 2,
  },
  wateringVolume: {
    fontSize: 8,
    color: '#3B82F6',
    fontWeight: '500',
    marginTop: 1,
  },
  todayPulse: {
    position: 'absolute',
    inset: 0,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#10B981',
    opacity: 0.3,
  },
  weekGrid: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  todayText: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  scheduledText: {
    color: 'white',
    fontWeight: '500',
  },
  legendCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  legendContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendToday: {
    width: 12,
    height: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 3,
    marginRight: 4,
  },
  legendScheduled: {
    width: 12,
    height: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 3,
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendAvailable: {
    width: 12,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  bottomButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: '#111827',
  },
  askMiraquaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  askMiraquaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  waterNowBottomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  waterNowBottomText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  scheduleSummary: {
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  scheduleSummaryText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default PlotDetailsScreen; 