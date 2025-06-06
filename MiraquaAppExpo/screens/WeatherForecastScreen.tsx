import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const getWeatherIcon = (desc: string) => {
  if (/rain/i.test(desc)) return 'rainy-outline';
  if (/snow/i.test(desc)) return 'snow-outline';
  if (/cloud/i.test(desc)) return 'cloudy-outline';
  if (/sun|clear/i.test(desc)) return 'sunny-outline';
  return 'partly-sunny-outline';
};

const getMonthDays = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getToday = () => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
};

const WeatherForecastScreen = () => {
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [zip, setZip] = useState('');
  const [latLng, setLatLng] = useState<{ latitude: number; longitude: number }>({ latitude: 37.7749, longitude: -122.4194 });
  const [currentTemp, setCurrentTemp] = useState<number | null>(null);

  useEffect(() => {
    fetchWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latLng]);

  const fetchLatLngFromZip = async (zipCode: string) => {
    try {
      const res = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
      if (!res.ok) throw new Error('Invalid zip code');
      const data = await res.json();
      const latitude = parseFloat(data.places[0].latitude);
      const longitude = parseFloat(data.places[0].longitude);
      return { latitude, longitude };
    } catch (err) {
      throw new Error('Invalid zip code');
    }
  };

  const fetchWeather = async () => {
    setLoading(true);
    setError('');
    try {
      // Open-Meteo API: daily temperature and weathercode for the next 7 days, plus current weather
      const today = getToday();
      const startDateObj = new Date(today.year, today.month, today.day);
      const endDateObj = new Date(startDateObj);
      endDateObj.setDate(startDateObj.getDate() + 6); // 7 days including today
      // Clamp end date to API's max allowed date if needed
      const maxApiDate = new Date('2025-06-21');
      if (endDateObj > maxApiDate) endDateObj.setTime(maxApiDate.getTime());
      const start = `${startDateObj.getFullYear()}-${String(startDateObj.getMonth() + 1).padStart(2, '0')}-${String(startDateObj.getDate()).padStart(2, '0')}`;
      const end = `${endDateObj.getFullYear()}-${String(endDateObj.getMonth() + 1).padStart(2, '0')}-${String(endDateObj.getDate()).padStart(2, '0')}`;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latLng.latitude}&longitude=${latLng.longitude}&start_date=${start}&end_date=${end}&daily=temperature_2m_max,temperature_2m_min,weathercode&current_weather=true&temperature_unit=fahrenheit&timezone=auto`;
      console.log('Fetching weather from:', url);
      const res = await fetch(url);
      const data = await res.json();
      console.log('Open-Meteo response:', data);
      if (!data.daily) throw new Error('No forecast data');
      setForecast(
        data.daily.time.map((date: string, i: number) => ({
          date,
          tempMax: data.daily.temperature_2m_max[i],
          tempMin: data.daily.temperature_2m_min[i],
          code: data.daily.weathercode[i],
        }))
      );
      setCurrentTemp(data.current_weather && typeof data.current_weather.temperature === 'number' ? data.current_weather.temperature : null);
    } catch (err: any) {
      setError('Failed to fetch weather data.');
      setCurrentTemp(null);
      console.log('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const onZipSubmit = async () => {
    if (!zip) return;
    setLoading(true);
    setError('');
    try {
      const coords = await fetchLatLngFromZip(zip);
      setLatLng(coords);
      Keyboard.dismiss();
    } catch (err: any) {
      setError('Invalid zip code. Please try again.');
      setLoading(false);
    }
  };

  // Open-Meteo weather codes: https://open-meteo.com/en/docs#api_form
  const codeToDesc = (code: number) => {
    if (code === 0) return 'Sunny';
    if ([1, 2, 3].includes(code)) return 'Cloudy';
    if ([45, 48].includes(code)) return 'Fog';
    if (code === 51) return 'Light Drizzle';
    if (code === 53) return 'Moderate Drizzle';
    if (code === 55) return 'Dense Drizzle';
    if (code === 56) return 'Light Freezing Drizzle';
    if (code === 57) return 'Dense Freezing Drizzle';
    if (code === 61) return 'Slight Rain';
    if (code === 63) return 'Moderate Rain';
    if (code === 65) return 'Heavy Rain';
    if (code === 66) return 'Light Freezing Rain';
    if (code === 67) return 'Heavy Freezing Rain';
    if (code === 71) return 'Slight Snow';
    if (code === 73) return 'Moderate Snow';
    if (code === 75) return 'Heavy Snow';
    if (code === 77) return 'Snow grains';
    if (code === 80) return 'Slight Showers';
    if (code === 81) return 'Moderate Showers';
    if (code === 82) return 'Violent Showers';
    if (code === 85) return 'Slight Snow Showers';
    if (code === 86) return 'Heavy Snow Showers';
    if (code === 95) return 'Thunderstorm';
    if ([96, 99].includes(code)) return 'Thunderstorm with hail';
    return 'Unknown';
  };

  const today = getToday();

  // Build calendar grid: Populate with forecast data sequentially
  const calendar: (null | any)[] = Array(7).fill(null);
  
  // Place the first 7 forecast days directly into the calendar array in order
  forecast.slice(0, 7).forEach((dayData, index) => {
      calendar[index] = dayData;
  });

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDayIndex = new Date(today.year, today.month, today.day).getDay();
  const reorderedDaysOfWeek = [
    ...daysOfWeek.slice(currentDayIndex),
    ...daysOfWeek.slice(0, currentDayIndex),
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Weather Forecast</Text>
      <View style={styles.zipRow}>
        <TextInput
          style={styles.zipInput}
          placeholder="Enter ZIP code"
          value={zip}
          onChangeText={setZip}
          keyboardType="number-pad"
          maxLength={5}
          onSubmitEditing={onZipSubmit}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.zipButton} onPress={onZipSubmit}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Go</Text>
        </TouchableOpacity>
      </View>
      {loading && <ActivityIndicator size="large" color="#1aa179" style={{ marginTop: 20 }} />}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {currentTemp !== null && !loading && !error && (
        <Text style={styles.currentTemp}>Current Temperature: {Math.round(currentTemp)}°F</Text>
      )}
      {!loading && !error && (
        <Text style={styles.notice}>
          Values below are the highest temperature each day will reach.
        </Text>
      )}
      <View style={styles.calendarBox}>
        <View style={styles.row}>
          {reorderedDaysOfWeek.map((d) => (
            <Text key={d} style={styles.dayHeader}>{d}</Text>
          ))}
        </View>
        <View style={styles.calendarRow}>
          {Array.from({ length: 7 }).map((_, i) => {
            const dayData = calendar[i];
            return (
              <View key={i} style={styles.calendarCell}>
                {dayData ? (
                  <>
                    <Text style={styles.dateText}>{parseInt(dayData.date.split('-')[2], 10)}</Text>
                    <Text style={styles.tempText}>{Math.round(dayData.tempMax)}°F</Text>
                    <Ionicons
                      name={getWeatherIcon(codeToDesc(dayData.code)) as any}
                      size={20}
                      color="#1aa179"
                      style={{ marginTop: 2 }}
                    />
                    <Text style={styles.descText}>{codeToDesc(dayData.code)}</Text>
                  </>
                ) : null}
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#1aa179', textAlign: 'center' },
  error: { color: 'red', textAlign: 'center', marginVertical: 12 },
  calendarBox: { backgroundColor: '#f4faf7', borderRadius: 12, paddingVertical: 12, marginTop: 12, marginHorizontal: 16 },
  row: { flexDirection: 'row' },
  dayHeader: { width: `${100 / 7}%`, textAlign: 'center', fontWeight: '600', color: '#888', marginBottom: 6 },
  cell: { alignItems: 'center', paddingVertical: 8, minHeight: 60 },
  dateText: { fontSize: 13, color: '#333', fontWeight: '600' },
  tempText: { fontSize: 15, color: '#1aa179', fontWeight: '600', marginTop: 2 },
  descText: { fontSize: 11, color: '#555', marginTop: 2, textAlign: 'center' },
  zipRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'center' },
  zipInput: { borderWidth: 1, borderColor: '#1aa179', borderRadius: 8, padding: 8, width: 120, marginRight: 8, backgroundColor: '#fff', fontSize: 16 },
  zipButton: { backgroundColor: '#1aa179', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  currentTemp: { fontSize: 18, color: '#1aa179', fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  notice: { fontSize: 12, color: '#888', textAlign: 'center', marginBottom: 8, marginHorizontal: 10 },
  calendarRow: { flexDirection: 'row', width: '100%' },
  calendarCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 60,
  },
});

export default WeatherForecastScreen; 