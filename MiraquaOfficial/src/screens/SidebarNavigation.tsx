import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SidebarNavigationProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
  currentRoute?: string;
}

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  badge?: number;
  hasSubmenu?: boolean;
  route?: string;
}

const menuItems: MenuItem[] = [
  { id: 'home', title: 'Home', icon: 'home', route: 'Home' },
  { id: 'analytics', title: 'AI Analytics', icon: 'bar-chart', hasSubmenu: true },
  { id: 'predictive', title: 'Predictive Dashboard', icon: 'target', route: 'PredictiveDashboard' },
  { id: 'alerts', title: 'Anomaly Alerts', icon: 'flash', route: 'AnomalyAlerts' },
  { id: 'scanner', title: 'Plant Health Scanner', icon: 'camera', route: 'PlantHealthScanner' },
  { id: 'forecast', title: 'Yield Forecast', icon: 'leaf', route: 'YieldForecast' },
  { id: 'map', title: 'Smart Map', icon: 'map', route: 'SmartMap' },
  { id: 'assistant', title: 'AI Assistant', icon: 'chatbubble', badge: 3, route: 'Chat' },
  { id: 'community', title: 'Community', icon: 'people', route: 'Community' },
  { id: 'marketplace', title: 'Marketplace', icon: 'business', badge: 2, route: 'Marketplace' },
  { id: 'account', title: 'Account', icon: 'person', route: 'Account' },
];

const SidebarNavigation = ({ visible, onClose, navigation, currentRoute = 'home' }: SidebarNavigationProps) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const handleMenuItemPress = (item: MenuItem) => {
    if (item.hasSubmenu) {
      setExpandedItem(expandedItem === item.id ? null : item.id);
    } else if (item.route) {
      navigation.navigate(item.route);
      onClose();
    }
  };

  const renderMenuItem = (item: MenuItem) => {
    const isActive = currentRoute === item.id;
    const isExpanded = expandedItem === item.id;

    return (
      <View key={item.id}>
        <TouchableOpacity
          style={[styles.menuItem, isActive && styles.activeMenuItem]}
          onPress={() => handleMenuItemPress(item)}
        >
          <View style={styles.menuItemContent}>
            <Ionicons 
              name={item.icon as any} 
              size={20} 
              color={isActive ? '#10B981' : 'white'} 
            />
            <Text style={[styles.menuItemText, isActive && styles.activeMenuItemText]}>
              {item.title}
            </Text>
            {item.hasSubmenu && (
              <Ionicons 
                name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                size={16} 
                color={isActive ? '#10B981' : 'white'} 
              />
            )}
          </View>
          {item.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        {item.hasSubmenu && isExpanded && (
          <View style={styles.submenu}>
            <TouchableOpacity 
              style={styles.submenuItem}
              onPress={() => {
                navigation.navigate('Analytics');
                onClose();
              }}
            >
              <Text style={styles.submenuText}>Overview</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.submenuItem}
              onPress={() => {
                navigation.navigate('Reports');
                onClose();
              }}
            >
              <Text style={styles.submenuText}>Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.submenuItem}
              onPress={() => {
                navigation.navigate('ExportReports');
                onClose();
              }}
            >
              <Text style={styles.submenuText}>Export</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sidebar}>
          <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="leaf" size={24} color="#10B981" />
              <Text style={styles.logoText}>Miraqua</Text>
            </View>
            <View style={styles.statusContainer}>
              <View style={styles.onlineIndicator}>
                <Ionicons name="wifi" size={12} color="#10B981" />
                <Text style={styles.onlineText}>Online</Text>
              </View>
              <TouchableOpacity style={styles.settingsButton}>
                <Ionicons name="settings" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Menu Items */}
          <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
            {menuItems.map(renderMenuItem)}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.signOutButton}
              onPress={() => {
                navigation.navigate('SignIn');
                onClose();
              }}
            >
              <Ionicons name="log-out" size={20} color="#EF4444" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Overlay to close sidebar */}
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  overlayTouchable: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    width: 280,
    backgroundColor: '#1F2937',
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    marginLeft: 12,
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlineText: {
    marginLeft: 4,
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  settingsButton: {
    padding: 4,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
  },
  activeMenuItem: {
    backgroundColor: '#10B981',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
    flex: 1,
  },
  activeMenuItemText: {
    color: 'white',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  submenu: {
    marginLeft: 20,
    marginTop: 4,
  },
  submenuItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 2,
    borderRadius: 6,
  },
  submenuText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  signOutText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
});

export default SidebarNavigation; 