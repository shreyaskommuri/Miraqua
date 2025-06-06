const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#1aa179', textAlign: 'center' },
  error: { color: 'red', textAlign: 'center', marginVertical: 12 },
  calendarBox: { backgroundColor: '#f4faf7', borderRadius: 12, paddingVertical: 12, marginTop: 12 },
  row: { flexDirection: 'row' },
  dayHeader: { width: `${100 / 7}%`, textAlign: 'center', fontWeight: '600', color: '#888', marginBottom: 6, paddingHorizontal: 4 },
  cell: { alignItems: 'center', paddingVertical: 8, minHeight: 60 },
  dateText: { fontSize: 13, color: '#333', fontWeight: '600' },
  tempText: { fontSize: 15, color: '#1aa179', fontWeight: '600', marginTop: 2 },
  descText: { fontSize: 11, color: '#555', marginTop: 2, textAlign: 'center' },
  zipRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'center' },
  zipInput: { borderWidth: 1, borderColor: '#1aa179', borderRadius: 8, padding: 8, width: 120, marginRight: 8, backgroundColor: '#fff', fontSize: 16 },
  zipButton: { backgroundColor: '#1aa179', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  currentTemp: { fontSize: 18, color: '#1aa179', fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  notice: { fontSize: 12, color: '#888', textAlign: 'center', marginBottom: 8, marginHorizontal: 10 },
  calendarRow: { flexDirection: 'row' },
  calendarCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 60,
  },
});

export default WeatherForecastScreen; 