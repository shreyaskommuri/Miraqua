// screens/Step3Location.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface Props {
  data: {
    lat: number | null;
    lon: number | null;
    zip: string;
  };
  onNext: (updates: { lat: number; lon: number; zip: string }) => void;
  onBack: (updates?: { lat: number | null; lon: number | null; zip: string }) => void;
  onPickLocation: () => void;
}

const Step3Location: React.FC<Props> = ({ data, onNext, onBack, onPickLocation }) => {
  const [lat, setLat] = useState<number | null>(data.lat);
  const [lon, setLon] = useState<number | null>(data.lon);
  const [zip, setZip] = useState(data.zip || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLat(data.lat);
    setLon(data.lon);
    setZip(data.zip || '');
  }, [data.lat, data.lon, data.zip]);

  useEffect(() => {
    if (lat && lon && !zip) {
      fetchZipCode(lat, lon);
    }
  }, [lat, lon]);

  const fetchZipCode = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      const data = await res.json();
      const postalCode = data?.postcode || '';
      setZip(postalCode);
    } catch (error) {
      console.error('ZIP fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (lat && lon && zip) {
      onNext({ lat, lon, zip });
    }
  };

  const handleBack = () => {
    onBack({ lat, lon, zip });
  };

  const valid = lat !== null && lon !== null && zip !== '';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Location</Text>
      <Button
        title={lat && lon ? `📍 Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}` : 'Pick Location on Map'}
        onPress={onPickLocation}
      />

      {loading ? (
        <Text style={styles.zip}>📫 Detecting ZIP...</Text>
      ) : zip ? (
        <Text style={styles.zip}>📫 Auto ZIP: {zip}</Text>
      ) : null}

      <View style={styles.controls}>
        <Button title="Back" onPress={handleBack} />
        <Button title="Next" onPress={handleNext} disabled={!valid} />
      </View>
    </View>
  );
};

export default Step3Location;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  zip: {
    fontSize: 16,
    marginTop: 8,
  },
  controls: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
