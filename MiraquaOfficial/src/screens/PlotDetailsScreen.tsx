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
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { environment } from '../config/environment';

interface Plot {
  id: string;
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
  const [realScheduleData, setRealScheduleData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Use centralized environment config
  const API_BASE_URL = environment.apiUrl;

  // Generate schedule data based on toggle state and real data
  const getScheduleData = () => {
    const days = [];
    const today = new Date();
    
    // Validate today's date
    if (isNaN(today.getTime()) || today.getTime() <= 0) {
      console.error('❌ Invalid today date, using fallback');
      const fallbackDate = new Date('2024-01-01');
      return Array.from({ length: 14 }, (_, i) => ({
        date: new Date(fallbackDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        day: i + 1,
        dayOfWeek: 'Mon',
        isToday: false,
        hasWatering: false,
        volume: 0,
      }));
    }
    
    // If we have real schedule data, use it
    if (realScheduleData && realScheduleData.schedule) {
      console.log('📅 Using REAL schedule data:', realScheduleData.schedule.length, 'entries');
      console.log('📅 Schedule data structure:', realScheduleData.schedule[0]);
      console.log('📅 Schedule keys:', Object.keys(realScheduleData.schedule[0] || {}));
      
      const schedule = showOriginalSchedule ? 
        (realScheduleData.og_schedule || realScheduleData.schedule) : 
        realScheduleData.schedule;
      
      // Get the date range from the actual schedule data
      // Supabase sends: date (MM/DD/YY), liters, optimal_time, explanation
      const scheduleDates = schedule
        .map((entry: any) => entry.date)
        .filter((dateStr: string) => {
          // Validate date strings before processing
          if (!dateStr || typeof dateStr !== 'string') return false;
          return true; // Accept MM/DD/YY format
        })
        .sort();
      
      console.log('📅 Raw schedule dates from Supabase:', scheduleDates);
      console.log('📅 Schedule entries from Supabase:', schedule);
      
      // Helper: normalize many date formats to YYYY-MM-DD
      const normalize = (d: any) => {
        if (d === null || d === undefined) return null;
        let s = String(d).trim();
        // If ISO-ish already
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.split('T')[0];
        // If MM/DD/YY or MM/DD/YYYY
        if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(s)) {
          const parts = s.split('/');
          let [m, dayPart, y] = parts;
          m = m.padStart(2, '0');
          dayPart = dayPart.padStart(2, '0');
          if (y.length === 2) {
            const yy = parseInt(y, 10);
            y = yy < 50 ? `20${y}` : `19${y}`;
          }
          return `${y}-${m}-${dayPart}`;
        }
        // Fallback: try Date parsing
        const parsed = new Date(s);
        if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
        return null;
      };

      // Helper: extract liters/volume from a schedule entry (supports nested blocks/arrays)
      const extractLiters = (entry: any) => {
        if (!entry) return 0;
        const tryNumber = (v: any) => {
          if (v === null || v === undefined) return 0;
          if (typeof v === 'number') return v;
          const s = String(v).replace(/[^0-9.\-]/g, '');
          const n = parseFloat(s);
          return isNaN(n) ? 0 : n;
        };

        // Common top-level keys
        const candidates = ['liters','liter','l','amount','volume','water_liters','ml'];
        for (const key of candidates) {
          if (entry[key] !== undefined) return tryNumber(entry[key]);
        }

        // Nested blocks (e.g., hourly blocks)
        if (Array.isArray(entry.blocks) && entry.blocks.length > 0) {
          return entry.blocks.reduce((acc: number, b: any) => acc + tryNumber(b.liters ?? b.amount ?? b.volume ?? b.ml), 0);
        }

        // If the entry itself is an array of sub-entries
        if (Array.isArray(entry)) {
          return entry.reduce((acc: number, e: any) => acc + extractLiters(e), 0);
        }

        // Some schedules embed a `schedule` or `daily` array
        if (Array.isArray(entry.schedule) && entry.schedule.length > 0) {
          return entry.schedule.reduce((acc: number, e: any) => acc + extractLiters(e), 0);
        }

        return 0;
      };

      // Always start from today and generate 14 days
      // This ensures we can match schedule entries regardless of their date range
      for (let i = 0; i < 14; i++) {
        try {
          const currentDate = new Date(today);
          currentDate.setDate(today.getDate() + i);
          
          // Validate the calculated date
          if (isNaN(currentDate.getTime()) || currentDate.getTime() <= 0) {
            console.warn(`⚠️ Invalid date calculated for day ${i}, skipping`);
            continue;
          }
          
          const dateStr = currentDate.toISOString().split('T')[0];
          const isToday = dateStr === today.toISOString().split('T')[0];
        
          // Find if this date has watering in the real schedule
          const scheduleEntry = schedule.find((entry: any) => {
            try {
              // Possible date keys
              const entryDateRaw = entry?.date || entry?.date_str || entry?.date_iso || entry?.day_date || entry?.start || entry?.datetime || entry?.timestamp || entry?.day;
              // If the entry is an object with nested arrays (e.g., blocks), it may not have a top-level date - try common nested fields
              let formattedEntryDate = normalize(entryDateRaw);

              // If not found, try to infer from nested sub-entries
              if (!formattedEntryDate && Array.isArray(entry)) {
                for (const sub of entry) {
                  const fd = normalize(sub?.date || sub?.date_str || sub?.date_iso || sub?.day_date || sub?.start || sub?.datetime);
                  if (fd) { formattedEntryDate = fd; break; }
                }
              }

              if (!formattedEntryDate && entry && typeof entry === 'object') {
                if (Array.isArray(entry.schedule)) {
                  for (const sub of entry.schedule) {
                    const fd = normalize(sub?.date || sub?.date_str || sub?.date_iso || sub?.start);
                    if (fd) { formattedEntryDate = fd; break; }
                  }
                }
              }

              if (!formattedEntryDate) {
                console.warn('⚠️ Schedule entry missing/unknown date:', entry);
                return false;
              }

              console.log(`🔍 Comparing Supabase date ${String(entryDateRaw)} (${formattedEntryDate}) with frontend date ${dateStr}`);
              return formattedEntryDate === dateStr;
            } catch (error) {
              console.error('❌ Error parsing schedule date:', error, entry);
              return false;
            }
          });

          // Check if this is a watering day based on extracted liters > 0
          const liters = extractLiters(scheduleEntry);
          const hasWatering = !!scheduleEntry && liters > 0;
          const volume = hasWatering ? liters : 0;
          
          if (hasWatering) {
            console.log(`💧 Day ${i + 1}: Watering scheduled for ${dateStr} - ${volume}L`);
            console.log(`📅 Schedule entry details:`, scheduleEntry);
          } else {
            console.log(`❌ No watering for ${dateStr} - no matching schedule entry found`);
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
        } catch (error) {
          console.error(`❌ Error processing day ${i}:`, error);
          continue;
        }
      }
    } else {
      console.log('⚠️ No real schedule data, using mock data');
      // Fallback to mock data if no real schedule
      for (let i = 0; i < 14; i++) {
        try {
          const currentDate = new Date(today);
          currentDate.setDate(today.getDate() + i);
          
          // Validate the calculated date
          if (isNaN(currentDate.getTime()) || currentDate.getTime() <= 0) {
            console.warn(`⚠️ Invalid mock date calculated for day ${i}, skipping`);
            continue;
          }
          
          const dateStr = currentDate.toISOString().split('T')[0];
          const isToday = i === 0;
        
        if (showOriginalSchedule) {
          // Original schedule - more frequent, less optimized
          // Ensure we have some watering days for demonstration
          const hasWatering = i % 2 === 0 || Math.random() > 0.3; // 70% chance + every other day
          
          days.push({
            date: dateStr,
            day: currentDate.getDate(),
            dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
            isToday,
            hasWatering,
            volume: hasWatering ? Math.floor(Math.random() * 8) + 15 : 0, // 15-23L
          });
        } else {
          // AI optimized schedule - more efficient but still visible
          // Ensure we have some watering days for demonstration
          const hasWatering = i % 3 === 0 || Math.random() > 0.5; // 50% chance + every 3rd day
          
          days.push({
            date: dateStr,
            day: currentDate.getDate(),
            dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
            isToday,
            hasWatering,
            volume: hasWatering ? Math.floor(Math.random() * 8) + 15 : 0, // 15-23L
          });
        }
        } catch (error) {
          console.error(`❌ Error processing mock day ${i}:`, error);
          continue;
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
      const plotResponse = await fetch(`${API_BASE_URL}/get_plot_by_id?plot_id=${plotId}`, {
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
        
        // Debug: Log schedule data structure
        console.log('📅 Full schedule data received:', JSON.stringify(scheduleData, null, 2));
      } else {
        console.warn('⚠️ Schedule fetch failed, continuing without schedule');
      }
      
      // Transform the backend data to match our Plot interface
      // Normalize fields from backend (accept multiple possible key names)
      const toStr = (v: any) => (v === undefined || v === null) ? String(plotId) : String(v);
      const transformedPlot: Plot = {
        id: toStr(plotData.id || plotData.plot_id || plotId),
        name: plotData.name || plotData.plot_name || `Plot ${String(plotId).slice(0, 8)}` ,
        crop: plotData.crop || plotData.crop_type || 'Unknown',
        variety: plotData.variety || plotData.variety_name || "Standard",
        moisture: Number(plotData.moisture ?? plotData.soil_moisture ?? 0),
        temperature: Number(plotData.temperature ?? plotData.temp ?? 0),
        sunlight: Number(plotData.sunlight ?? plotData.light ?? 0),
        phLevel: Number(plotData.phLevel ?? plotData.soil_ph ?? plotData.ph_level ?? 0),
        nextWatering: scheduleData?.schedule?.[0]?.optimal_time || plotData.next_watering || plotData.nextWatering || "Not scheduled",
        status: plotData.status || plotData.plot_status || 'healthy',
        location: plotData.location || plotData.address || 'Unknown',
        lastWatered: plotData.lastWatered || plotData.last_watered || 'Not recorded',
        area: plotData.area ?? plotData.size ?? 0,
        healthScore: Number(plotData.healthScore ?? plotData.health_score ?? 0),
        waterSavings: Number(plotData.waterSavings ?? plotData.water_savings ?? 0),
        latitude: Number(plotData.latitude ?? plotData.lat ?? 0),
        longitude: Number(plotData.longitude ?? plotData.lon ?? plotData.lng ?? 0),
        isOnline: plotData.isOnline ?? plotData.online ?? true,
        sensors: plotData.sensors || plotData.sensor_list || []
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
      // Simplified mock plot if backend fails - avoid numeric id comparisons
      const mockPlot: Plot = {
        id: String(plotId),
        name: `Plot ${String(plotId).slice(0, 8)}`,
        crop: 'Mixed Vegetables',
        variety: 'Standard',
        moisture: 60,
        temperature: 72,
        sunlight: 80,
        phLevel: 6.8,
        nextWatering: 'Tomorrow 6AM',
        status: 'healthy',
        location: 'Backyard',
        lastWatered: 'Yesterday',
        area: 20,
        healthScore: 85,
        waterSavings: 20,
        latitude: 37.7749,
        longitude: -122.4194,
        isOnline: true,
        sensors: [
          { id: 'moisture', name: 'Soil Moisture', value: 60, unit: '%', status: 'optimal', lastUpdate: '2 min ago' },
          { id: 'temperature', name: 'Temperature', value: 72, unit: '°F', status: 'optimal', lastUpdate: '1 min ago' },
          { id: 'sunlight', name: 'Light', value: 80, unit: '%', status: 'optimal', lastUpdate: '5 min ago' },
          { id: 'ph', name: 'pH Level', value: 6.8, unit: '', status: 'optimal', lastUpdate: '1 hour ago' }
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
      // Call the real backend API for AI summary - use the gem_summary from get_plan response
      // Since we already have the schedule data, we can use the gem_summary field
      if (realScheduleData && realScheduleData.gem_summary) {
        setAiSummary(realScheduleData.gem_summary);
        return;
      }
      
      // Fallback: call get_plan to get AI summary
      const response = await fetch(`${API_BASE_URL}/get_plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          plot_id: plotId,
          use_original: false,
          force_refresh: false
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAiSummary(data.gem_summary || data.summary);
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
      const response = await fetch(`${API_BASE_URL}/water_now`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          plot_id: plotId,
          duration_minutes: 5 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update local state with new moisture level
        setPlot(prev => prev ? {
          ...prev,
          moisture: Math.min(100, (prev.moisture || 55) + 20), // Increase moisture by 20%
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
    Alert.alert('Share Plot', 'Share your plot with friends and family', [
      { text: 'Copy Link', onPress: () => Alert.alert('Link Copied!', 'Plot link copied to clipboard') },
      { text: 'Export Data', onPress: handleExport },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleExport = () => {
    Alert.alert('Export Data', 'Export your plot data as CSV or PDF', [
      { text: 'CSV', onPress: () => Alert.alert('Exporting...', 'Plot data exported as CSV') },
      { text: 'PDF Report', onPress: () => Alert.alert('Exporting...', 'Plot report exported as PDF') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handlePhotoPress = () => {
    Alert.alert('Add Plot Photo', 'Choose how to add a photo of your plot', [
      { text: 'Take Photo', onPress: () => Alert.alert('Camera', 'Opening camera...') },
      { text: 'Choose from Library', onPress: () => Alert.alert('Library', 'Opening photo library...') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleStatPress = (statType: string) => {
    let message = '';
    switch(statType) {
      case 'health':
        message = `Your plot health score is ${plot?.healthScore}%. This is based on soil moisture, temperature, pH levels, and growth patterns.`;
        break;
      case 'age':
        message = `Your plot has been growing for 2 months. Track growth milestones and harvest predictions in the calendar.`;
        break;
      case 'water':
        message = `You've saved ${plot?.waterSavings}% water compared to traditional watering methods. That's about ${Math.round((plot?.waterSavings || 0) * 5)} gallons saved!`;
        break;
    }
    Alert.alert('Plot Statistics', message);
  };

  const handleSensorPress = (sensor: any) => {
    Alert.alert(
      sensor.name,
      `Current: ${sensor.value}${sensor.unit}\nStatus: ${sensor.status}\nLast updated: ${sensor.lastUpdate}\n\nTap to view history and trends.`,
      [
        { text: 'View History', onPress: () => navigation.navigate('SensorHistory', { plotId, sensorId: sensor.id }) },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchPlotData(),
      generateAISummary(),
    ]);
    setLastRefresh(new Date());
    setRefreshing(false);
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
            <View style={[styles.onlineIndicator, { backgroundColor: (plot.isOnline !== undefined ? plot.isOnline : true) ? '#10B981' : '#EF4444' }]}>
              <Ionicons name="wifi" size={8} color="white" />
            </View>
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{plot.name || 'Unnamed Plot'}</Text>
            <Text style={styles.headerSubtitle}>{plot.crop || 'Unknown'} • {plot.variety || 'Standard'}</Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerAction} onPress={handleSettings}>
            <Ionicons name="settings-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
      >
        {/* Photo Card */}
        <TouchableOpacity style={styles.photoCard} onPress={handlePhotoPress} activeOpacity={0.8}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.photoGradient}
          >
            <View style={styles.photoContent}>
              <View style={styles.cameraIconWrapper}>
                <Ionicons name="camera-outline" size={48} color="rgba(255, 255, 255, 0.9)" />
              </View>
              <Text style={styles.photoText}>Add Plot Photo</Text>
              <Text style={styles.photoSubtext}>Tap to capture your garden</Text>
            </View>
          </LinearGradient>
          
          <View style={styles.statsGrid}>
            <TouchableOpacity style={styles.statItem} onPress={() => handleStatPress('health')} activeOpacity={0.7}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Ionicons name="heart" size={22} color="#EF4444" />
              </View>
              <Text style={styles.statValue}>{plot.healthScore || 0}%</Text>
              <Text style={styles.statLabel}>Health</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.statItem} onPress={() => handleStatPress('age')} activeOpacity={0.7}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Ionicons name="calendar" size={22} color="#10B981" />
              </View>
              <Text style={styles.statValue}>2mo</Text>
              <Text style={styles.statLabel}>Age</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.statItem} onPress={() => handleStatPress('water')} activeOpacity={0.7}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Ionicons name="water" size={22} color="#3B82F6" />
              </View>
              <Text style={styles.statValue}>{plot.waterSavings || 0}%</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* AI Insights */}
        <View style={styles.aiCard}>
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
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
                activeOpacity={0.7}
              >
                {generatingAI ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="refresh-outline" size={18} color="white" />
                )}
              </TouchableOpacity>
            </View>
            {generatingAI ? (
              <View style={styles.aiLoadingContainer}>
                <ActivityIndicator size="small" color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.aiLoadingText}>Analyzing your plot data...</Text>
              </View>
            ) : (
              <Text style={styles.aiSummary}>
                {aiSummary || "Tap refresh to generate personalized insights for your plot."}
              </Text>
            )}
            {lastRefresh && (
              <Text style={styles.aiLastUpdate}>
                Last updated: {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </LinearGradient>
        </View>

        {/* Sensor Status Grid */}
        <View style={styles.sensorsGrid}>
          {plot.sensors && plot.sensors.length > 0 ? plot.sensors.map((sensor) => (
            <TouchableOpacity 
              key={sensor.id} 
              style={styles.sensorCard}
              onPress={() => handleSensorPress(sensor)}
              activeOpacity={0.7}
            >
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
            </TouchableOpacity>
          )) : (
            <Text style={styles.noSensorsText}>No sensors available</Text>
          )}
        </View>

        {/* Water Now Button */}
        {(plot.status === 'needs-water' || plot.status === 'attention') && (
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
              <Text style={styles.infoValue}>{plot.crop || 'Unknown'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="location" size={16} color="#6B7280" />
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{plot.location || 'Unknown'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="resize" size={16} color="#6B7280" />
              <Text style={styles.infoLabel}>Area</Text>
              <Text style={styles.infoValue}>{plot.area || 0} sq ft</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time" size={16} color="#6B7280" />
              <Text style={styles.infoLabel}>Last Watered</Text>
              <Text style={styles.infoValue}>{plot.lastWatered || 'Not recorded'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="calendar" size={16} color="#6B7280" />
              <Text style={styles.infoLabel}>Next Watering</Text>
              <Text style={styles.infoValue}>{plot.nextWatering || 'Not scheduled'}</Text>
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
        </View>

                  {/* Integrated Calendar Schedule */}
          <View style={styles.calendarCard}>
            <TouchableOpacity 
              style={styles.calendarHeader}
              onPress={() => navigation.navigate('Calendar', { plotId })}
            >
              <LinearGradient
                colors={['#10B981', '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.calendarGradient}
              >
                <View style={styles.calendarHeaderContent}>
                  <View style={styles.calendarIcon}>
                    <Ionicons name="calendar" size={20} color="white" />
                  </View>
                  <View style={styles.calendarHeaderInfo}>
                    <Text style={styles.calendarTitle}>Next 2 Weeks</Text>
                    <Text style={styles.calendarSubtitle}>
                      {showOriginalSchedule ? 'Original Schedule' : 'AI Optimized'}
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
                  
                  {/* Watering Information */}
                  {day.hasWatering && (
                    <View style={styles.wateringIndicator}>
                      <Ionicons name="water" size={10} color="#3B82F6" />
                      {day.volume > 0 && (
                        <Text style={styles.wateringVolume}>{day.volume}L</Text>
                      )}
                    </View>
                  )}
                  
                  {/* Today Indicator */}
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
                  
                  {/* Watering Information */}
                  {day.hasWatering && (
                    <View style={styles.wateringIndicator}>
                      <Ionicons name="water" size={10} color="#3B82F6" />
                      {day.volume > 0 && (
                        <Text style={styles.wateringVolume}>{day.volume}L</Text>
                      )}
                    </View>
                  )}
                  
                  {/* Today Indicator */}
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
            onPress={() => navigation.navigate('Chat', { plotId: plot.id })}
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
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
    fontSize: 36,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#111827',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    padding: 10,
  },
  photoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  photoGradient: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoContent: {
    alignItems: 'center',
  },
  photoText: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
    marginTop: 12,
  },
  photoSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  aiCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  aiGradient: {
    padding: 24,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  aiTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  aiRefreshButton: {
    padding: 6,
  },
  aiSummary: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 22,
  },
  aiLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiLoadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  aiLastUpdate: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 12,
    fontStyle: 'italic',
  },
  cameraIconWrapper: {
    marginBottom: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sensorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  noSensorsText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  weatherCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  weatherContent: {
    gap: 12,
  },
  weatherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 8,
    flex: 1,
  },
  weatherValue: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  wateringInfo: {
    alignItems: 'center',
    marginTop: 4,
  },
  wateringVolume: {
    fontSize: 10,
    color: '#3B82F6',
    marginTop: 2,
    fontWeight: '600',
  },
  weatherIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 2,
  },
  forecastCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  forecastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  forecastTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  forecastContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  forecastDay: {
    alignItems: 'center',
    flex: 1,
  },
  forecastDayName: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  forecastIcon: {
    marginBottom: 4,
  },
  forecastTemp: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    marginTop: 2,
  },
  simpleForecastCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  simpleForecastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  simpleForecastTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  simpleForecastContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  simpleForecastDay: {
    alignItems: 'center',
    flex: 1,
  },
  simpleForecastDayName: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  sensorCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sensorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 12,
  },
  sensorIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  blueIcon: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  orangeIcon: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  yellowIcon: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  greenIcon: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  sensorStatus: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  sensorStatusText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#10B981',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sensorValue: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    paddingHorizontal: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  sensorFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sensorTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: 4,
    fontWeight: '500',
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
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: 'white',
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  infoList: {
    gap: 14,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 12,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  scheduleToggleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  scheduleToggleHeader: {
    marginBottom: 18,
  },
  scheduleToggleSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 6,
    lineHeight: 18,
  },
  scheduleToggleControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  activeToggleLabel: {
    color: '#10B981',
    fontWeight: '700',
  },
  calendarCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  calendarHeader: {
    overflow: 'hidden',
  },
  calendarGradient: {
    padding: 20,
  },
  calendarHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  calendarHeaderInfo: {
    flex: 1,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.3,
  },
  calendarSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 3,
    fontWeight: '500',
  },
  calendarContent: {
    padding: 20,
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calendarDay: {
    width: (width - 88) / 7,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 2,
  },
  todayDay: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 2,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  scheduledDay: {
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
    marginBottom: 2,
  },
  wateringIndicator: {
    alignItems: 'center',
    marginTop: 2,
  },
  wateringVolume: {
    fontSize: 9,
    color: '#3B82F6',
    marginTop: 2,
    fontWeight: '700',
  },
  todayPulse: {
    position: 'absolute',
    inset: 0,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#10B981',
    opacity: 0.3,
  },
  weekGrid: {
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  todayText: {
    color: '#10B981',
    fontWeight: '800',
  },
  scheduledText: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  legendCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  legendContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendToday: {
    width: 14,
    height: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 4,
    marginRight: 6,
  },
  legendScheduled: {
    width: 14,
    height: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 4,
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendAvailable: {
    width: 14,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  askMiraquaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  askMiraquaText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.3,
  },
  waterNowBottomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  waterNowBottomText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.3,
  },
  spinningIcon: {
    transform: [{ rotate: '360deg' }],
  },
});

export default PlotDetailsScreen; 