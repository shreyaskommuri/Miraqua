import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { environment } from '../config/environment';
import { getMockScheduleEntry } from '../utils/mockSchedule';

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
  plantingDate?: string;
  sensors: Array<{
    id: string;
    name: string;
    value: number;
    unit: string;
    status: string;
    lastUpdate: string;
  }>;
}

const localDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

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
  const [showManualMode, setShowManualMode] = useState(false);
  const [realScheduleData, setRealScheduleData] = useState<any>(null);
  const [editingDay, setEditingDay] = useState<{ date: string; day: number; currentLiters: number } | null>(null);
  const [editLiters, setEditLiters] = useState('');

  // Use centralized environment config
  const API_BASE_URL = environment.apiUrl;

  const getScheduleData = () => {
    const today = new Date();
    const todayStr = localDateStr(today);

    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = localDateStr(d);

      if (realScheduleData?.schedule) {
        const schedule = showManualMode
          ? (realScheduleData.og_schedule || realScheduleData.schedule)
          : realScheduleData.schedule;

        const scheduleEntry = schedule.find((entry: any) => {
          if (!entry.date) return false;
          const [month, day, year] = entry.date.split('/');
          const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
          return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` === dateStr;
        });

        const hasWatering = !!scheduleEntry && scheduleEntry.liters > 0;
        return {
          date: dateStr,
          day: d.getDate(),
          dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }),
          isToday: dateStr === todayStr,
          hasWatering,
          volume: hasWatering ? scheduleEntry.liters : 0,
          scheduleEntry: scheduleEntry ?? null,
        };
      }

      // Fallback to mock data
      const mockEntry = getMockScheduleEntry(dateStr);
      return {
        date: dateStr,
        day: d.getDate(),
        dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }),
        isToday: dateStr === todayStr,
        hasWatering: !!mockEntry,
        volume: mockEntry?.liters ?? 0,
        scheduleEntry: null,
      };
    });
  };

  const fetchPlotData = async () => {
    setLoading(true);

    try {
      // Fetch plot details and schedule in parallel
      const [plotResponse, scheduleResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/get_plot_by_id?plot_id=${plotId}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        }),
        fetch(`${API_BASE_URL}/get_plan`, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ plot_id: plotId, use_original: false, force_refresh: false }),
        }),
      ]);

      if (!plotResponse.ok) {
        const errorText = await plotResponse.text();
        throw new Error(`HTTP error! status: ${plotResponse.status}, body: ${errorText}`);
      }

      const [plotData, scheduleData] = await Promise.all([
        plotResponse.json(),
        scheduleResponse.ok ? scheduleResponse.json() : Promise.resolve(null),
      ]);

      if (scheduleData) setRealScheduleData(scheduleData);

      // Build a human-readable location from available fields
      const locationLabel = plotData.location
        || plotData.zip_code
        || (plotData.lat && plotData.lon ? `${plotData.lat.toFixed(3)}, ${plotData.lon.toFixed(3)}` : null)
        || 'Not set';

      // Build sensor cards from flat plot fields when sensors array isn't provided
      const builtSensors = plotData.sensors?.length ? plotData.sensors : [
        {
          id: 'moisture',
          name: 'Soil Moisture',
          value: plotData.moisture ?? 62,
          unit: '%',
          status: 'optimal',
          lastUpdate: '2 min ago',
        },
        {
          id: 'temperature',
          name: 'Temperature',
          value: plotData.temperature ?? 71,
          unit: '°F',
          status: 'optimal',
          lastUpdate: '1 min ago',
        },
        {
          id: 'sunlight',
          name: 'Light',
          value: plotData.sunlight ?? 83,
          unit: '%',
          status: 'optimal',
          lastUpdate: '5 min ago',
        },
        {
          id: 'ph',
          name: 'pH Level',
          value: plotData.phLevel ?? plotData.ph_level ?? 6.8,
          unit: '',
          status: 'optimal',
          lastUpdate: '1 hour ago',
        },
      ];

      const transformedPlot: Plot = {
        id: plotData.id || plotId,
        name: plotData.name,
        crop: plotData.crop,
        variety: plotData.variety || 'Standard',
        moisture: plotData.moisture,
        temperature: plotData.temperature,
        sunlight: plotData.sunlight,
        phLevel: plotData.phLevel ?? plotData.ph_level,
        nextWatering: scheduleData?.schedule?.[0]?.optimal_time || plotData.nextWatering || 'Not scheduled',
        status: plotData.status,
        location: locationLabel,
        lastWatered: plotData.lastWatered || 'Not recorded',
        area: plotData.area,
        healthScore: plotData.healthScore,
        waterSavings: plotData.waterSavings,
        latitude: plotData.latitude || plotData.lat,
        longitude: plotData.longitude || plotData.lon,
        isOnline: plotData.isOnline,
        sensors: builtSensors,
        plantingDate: plotData.planting_date || plotData.plantingDate,
      };

      setPlot(transformedPlot);
      generateAISummary(scheduleData);
      
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

  const generateAISummary = async (scheduleData?: any) => {
    setGeneratingAI(true);
    try {
      const summary = (scheduleData || realScheduleData)?.gem_summary;
      if (summary) {
        setAiSummary(summary);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/get_plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plot_id: plotId, use_original: false, force_refresh: false }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiSummary(data.gem_summary || '');
      }
    } catch (error) {
      console.error('Error generating AI summary:', error);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleWaterNow = () => {
    Alert.alert(
      'Water Now',
      `Start irrigation for ${plot?.name || 'this plot'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            setWatering(true);
            // Optimistic update immediately
            setPlot(prev => prev ? {
              ...prev,
              moisture: Math.min(100, (prev.moisture || 55) + 20),
              lastWatered: 'Just now',
              status: 'healthy' as const,
            } : null);
            Alert.alert('Irrigation started', `Watering ${plot?.name || 'plot'} now.`);
            // Fire backend silently
            try {
              await fetch(`${API_BASE_URL}/water_now`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plot_id: plotId, duration_minutes: 5 }),
              });
            } catch (_) {}
            setWatering(false);
          },
        },
      ]
    );
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
    if (showManualMode) {
      setEditingDay({ date: day.date, day: day.day, currentLiters: day.volume || 0 });
      setEditLiters(day.volume > 0 ? String(day.volume) : '');
    } else {
      navigation.navigate('SpecificDay', { plotId, date: day.date, schedule: day.scheduleEntry ?? null });
    }
  };

  const saveManualDay = async () => {
    if (!editingDay) return;
    const liters = parseFloat(editLiters) || 0;
    const [yr, mo, dy] = editingDay.date.split('-');
    const dateKey = `${mo}/${dy}/${yr.slice(2)}`;

    // Optimistic update — always update UI immediately
    setRealScheduleData((prev: any) => {
      if (!prev) return prev;
      const ogSchedule = prev.og_schedule
        ? prev.og_schedule.map((e: any) => ({ ...e }))
        : (prev.schedule || []).map((e: any) => ({ ...e }));
      const existing = ogSchedule.find((e: any) => e.date === dateKey);
      if (existing) {
        existing.liters = liters;
        existing.note = 'Manual override';
      } else {
        ogSchedule.push({ date: dateKey, day: 'Manual', liters, optimal_time: '06:00', note: 'Manual override' });
      }
      return { ...prev, og_schedule: ogSchedule };
    });
    setEditingDay(null);

    // Persist to backend in the background
    try {
      await fetch(`${API_BASE_URL}/update_manual_day`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plot_id: plotId, date: editingDay.date, liters }),
      });
    } catch (_) {}
  };

  useFocusEffect(useCallback(() => {
    fetchPlotData();
  }, [plotId]));

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={48} color="#1aa179" style={styles.spinningIcon} />
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
            <View style={[styles.onlineIndicator, { backgroundColor: (plot.isOnline !== undefined ? plot.isOnline : true) ? '#1aa179' : '#EF4444' }]}>
              <Ionicons name="wifi" size={8} color="white" />
            </View>
          </View>
          
          <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>{plot.name || 'Unnamed Plot'}</Text>
        <View style={styles.headerSubtitle}>
          <Text style={styles.cropText}>{plot.crop || 'Unknown'} • {plot.variety || 'Standard'}</Text>
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
        {/* Plot Hero Header */}
        <View style={styles.photoCard}>
          <View style={styles.photoGradient}>
            <View style={styles.photoContent}>
              <View style={styles.plotHeroIcon}>
                <Ionicons name="leaf" size={36} color="rgba(255,255,255,0.9)" />
              </View>
              <Text style={styles.photoText}>{plot.name}</Text>
              <Text style={styles.photoSubtext}>{plot.crop}{plot.variety ? ` · ${plot.variety}` : ''}</Text>
            </View>
            <View style={styles.onlinePill}>
              <View style={styles.onlinePillDot} />
              <Text style={styles.onlinePillText}>AI Active</Text>
            </View>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="heart" size={24} color="#EF4444" />
              </View>
              <Text style={styles.statValue}>{plot.healthScore || 84}%</Text>
              <Text style={styles.statLabel}>Health Score</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="calendar" size={24} color="#1aa179" />
              </View>
              <Text style={styles.statValue}>{(() => {
                if (!plot.plantingDate) return '—';
                const ms = Date.now() - new Date(plot.plantingDate).getTime();
                const days = Math.floor(ms / 86400000);
                if (days < 7) return `${days}d`;
                if (days < 60) return `${Math.floor(days / 7)}w`;
                return `${Math.floor(days / 30)}mo`;
              })()}</Text>
              <Text style={styles.statLabel}>Crop Age</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="water" size={24} color="#059669" />
              </View>
              <Text style={styles.statValue}>{plot.waterSavings || 22}%</Text>
              <Text style={styles.statLabel}>Water Saved</Text>
            </View>
          </View>
        </View>

        {/* AI Summary */}
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiTitle}>
              <View style={styles.aiIconBadge}>
                <Ionicons name="sparkles" size={14} color="#a78bfa" />
              </View>
              <Text style={styles.aiTitleText}>AI Insights</Text>
            </View>
            <TouchableOpacity
              style={styles.aiRefreshButton}
              onPress={generateAISummary}
              disabled={generatingAI}
            >
              <Ionicons name="refresh" size={15} color="rgba(255,255,255,0.4)" style={generatingAI ? styles.spinningIcon : undefined} />
            </TouchableOpacity>
          </View>
          <Text style={styles.aiSummary}>
            {aiSummary && !aiSummary.startsWith('Gemini') && !aiSummary.includes('failed') && !aiSummary.includes('RESOURCE') && !aiSummary.includes('UNAVAILABLE')
              ? aiSummary
              : generatingAI
                ? "Generating personalized insights for your plot..."
                : "AI insights are temporarily unavailable. Tap refresh to try again."}
          </Text>
        </View>



        {/* Plot Information */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Plot Information</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Ionicons name="leaf" size={16} color="#1aa179" />
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
              {showManualMode ? 'Tap any day to set your own schedule' : 'Model-generated irrigation plan'}
            </Text>
          </View>
          <View style={styles.scheduleToggleControls}>
            <Text style={[styles.toggleLabel, !showManualMode && styles.activeToggleLabel]}>Optimized</Text>
            <Switch
              value={showManualMode}
              onValueChange={setShowManualMode}
              trackColor={{ false: '#1aa179', true: '#3B82F6' }}
              thumbColor={'white'}
            />
            <Text style={[styles.toggleLabel, showManualMode && styles.activeToggleLabel]}>Manual</Text>
          </View>
        </View>

                  {/* Integrated Calendar Schedule */}
          <View style={styles.calendarCard}>
            <TouchableOpacity
              style={styles.calendarHeader}
              onPress={() => navigation.navigate('Calendar', { plotId })}
            >
              <View style={styles.calendarGradient}>
                <View style={styles.calendarHeaderContent}>
                  <View style={styles.calendarIcon}>
                    <Ionicons name="calendar" size={16} color="white" />
                  </View>
                  <View style={styles.calendarHeaderInfo}>
                    <Text style={styles.calendarTitle}>Next 2 Weeks</Text>
                    <Text style={styles.calendarSubtitle}>
                      {showManualMode ? 'Manual Schedule' : 'Optimized Schedule'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
                </View>
              </View>
            </TouchableOpacity>
            
                        {/* Debug Info - Only show in development */}
            {__DEV__ && false && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugText}>
                  Schedule Data: {realScheduleData ? `${realScheduleData.schedule?.length || 0} entries` : 'None'}
                </Text>
                <Text style={styles.debugText}>
                  Generated Days: {getScheduleData().length} days
                </Text>
                <Text style={styles.debugText}>
                  Watering Days: {getScheduleData().filter(d => d.hasWatering).length} days
                </Text>
              </View>
            )}



            <View style={styles.calendarContent}>
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
                  <Text style={styles.dayOfWeekLabel}>{day.dayOfWeek}</Text>
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
                      {day.volume > 0 && (
                        <Text style={styles.wateringVolume}>{day.volume}L</Text>
                      )}
                    </View>
                  )}
                  {day.isToday && <View style={styles.todayPulse} />}
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
                  <Text style={styles.dayOfWeekLabel}>{day.dayOfWeek}</Text>
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
                      {day.volume > 0 && (
                        <Text style={styles.wateringVolume}>{day.volume}L</Text>
                      )}
                    </View>
                  )}
                  {day.isToday && <View style={styles.todayPulse} />}
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



        {/* Sensor Metrics */}
        <View style={styles.sensorsGrid}>
          {plot.sensors && plot.sensors.map((sensor) => (
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
                  {sensor.name === 'pH Level' && <Ionicons name="analytics" size={20} color="#1aa179" />}
                </View>
                <View style={styles.sensorStatus}>
                  <Text style={styles.sensorStatusText}>{sensor.status}</Text>
                </View>
              </View>
              <Text style={styles.sensorValue}>{sensor.value}{sensor.unit}</Text>
              <Text style={styles.sensorName}>{sensor.name}</Text>
              <View style={styles.sensorFooter}>
                <Ionicons name="time" size={12} color="#6B7280" />
                <Text style={styles.sensorTime}>{sensor.lastUpdate}</Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Sticky Action Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.askMiraquaButton}
          onPress={() => navigation.navigate('Chat', { plotId: plot.id })}
        >
          <Ionicons name="chatbubble" size={20} color="#1aa179" />
          <Text style={styles.askMiraquaText}>Ask Miraqua</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.waterNowBottomButton}
          onPress={handleWaterNow}
          disabled={watering}
        >
          {watering && (
            <Ionicons name="refresh" size={18} color="white" style={styles.spinningIcon} />
          )}
          <Text style={styles.waterNowBottomText}>
            {watering ? 'Watering...' : 'Water Now'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Manual Day Edit Modal */}
      <Modal visible={!!editingDay} transparent animationType="slide" onRequestClose={() => setEditingDay(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setEditingDay(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {editingDay ? (() => {
                const [yr, mo, dy] = editingDay.date.split('-').map(Number);
                return new Date(yr, mo - 1, dy).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
              })() : ''}
            </Text>
            <Text style={styles.modalSub}>Set how many liters to water, or 0 to skip this day.</Text>

            {/* Quick-set buttons */}
            <View style={styles.quickSetRow}>
              {[0, 1, 2, 3, 5, 8].map(v => (
                <TouchableOpacity
                  key={v}
                  style={[styles.quickBtn, editLiters === String(v) && styles.quickBtnActive]}
                  onPress={() => setEditLiters(String(v))}
                >
                  <Text style={[styles.quickBtnText, editLiters === String(v) && styles.quickBtnTextActive]}>
                    {v === 0 ? 'Skip' : `${v}L`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.customInputRow}>
              <TextInput
                style={styles.litersInput}
                value={editLiters}
                onChangeText={setEditLiters}
                keyboardType="decimal-pad"
                placeholder="Custom liters..."
                placeholderTextColor="#6B7280"
                selectTextOnFocus
              />
              <Text style={styles.litersUnit}>L</Text>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={saveManualDay}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    height: 160,
    backgroundColor: 'rgba(26, 161, 121, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 161, 121, 0.2)',
  },
  plotHeroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(26, 161, 121, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(26, 161, 121, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoContent: {
    alignItems: 'center',
  },
  photoText: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.3,
  },
  photoSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  onlinePill: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 161, 121, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(26, 161, 121, 0.35)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  onlinePillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1aa179',
  },
  onlinePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1aa179',
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
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.18)',
    padding: 18,
  },
  aiIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  aiTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.2,
  },
  aiRefreshButton: {
    padding: 6,
  },
  aiSummary: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.82)',
    lineHeight: 22,
    letterSpacing: -0.1,
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
  debugInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
  },
  debugText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginBottom: 4,
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
  sensorName: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500' as const,
    marginTop: 2,
    marginBottom: 4,
  },
  sensorTime: {
    fontSize: 10,
    color: '#6B7280',
    marginLeft: 4,
  },
  waterButton: {
    backgroundColor: '#1aa179',
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
    color: '#1aa179',
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
    backgroundColor: 'rgba(26, 161, 121, 0.12)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 161, 121, 0.2)',
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
  dayOfWeekLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: 2,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: (width - 80) / 7,
    height: 62,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 1,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  todayDay: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 2,
    borderColor: '#1aa179',
    shadowColor: '#1aa179',
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

  todayPulse: {
    position: 'absolute',
    inset: 0,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1aa179',
    opacity: 0.3,
  },
  weekGrid: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  todayText: {
    color: '#1aa179',
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
    borderColor: '#1aa179',
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
  legendWeather: {
    width: 12,
    height: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderRadius: 3,
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: 'rgba(26, 161, 121, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(26, 161, 121, 0.25)',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  askMiraquaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1aa179',
  },
  waterNowBottomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1aa179',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  waterNowBottomText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  modalSub: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  quickSetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  quickBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  quickBtnActive: {
    backgroundColor: 'rgba(26,161,121,0.2)',
    borderColor: '#1aa179',
  },
  quickBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  quickBtnTextActive: {
    color: '#1aa179',
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  litersInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    paddingVertical: 14,
  },
  litersUnit: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#1aa179',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.2,
  },
});

export default PlotDetailsScreen; 