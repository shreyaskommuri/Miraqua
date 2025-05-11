// screens/AccountScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';

const AccountScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleSignOut = () => {
    navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
  };

  const menuItems = [
    { icon: 'calendar-outline', label: 'Smart Schedule' },
    { icon: 'cloudy-outline', label: 'Weather Forecast' },
    { icon: 'notifications-outline', label: 'Notifications' },
    { icon: 'settings-outline', label: 'Settings' },
    { icon: 'help-circle-outline', label: 'Help' },
    { icon: 'information-circle-outline', label: 'About' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={72} color="#1aa179" />
        <Text style={styles.email}>user@example.com</Text>
      </View>

      <View style={styles.menuBox}>
        {menuItems.map((item, idx) => (
          <TouchableOpacity key={idx} style={styles.menuItem}>
            <Ionicons name={item.icon as any} size={22} color="#1aa179" style={{ marginRight: 12 }} />
            <Text style={styles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  email: {
    marginTop: 8,
    fontSize: 16,
    color: '#555',
  },
  menuBox: {
    backgroundColor: '#f8fdfb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  menuLabel: {
    fontSize: 16,
    color: '#333',
  },
  logoutBtn: {
    backgroundColor: '#e74c3c',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 30,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
