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
  { id: 'map', title: 'Smart Map', icon: 'map', route: 'SmartMap' },
  { id: 'assistant', title: 'AI Assistant', icon: 'chatbubble', badge: 3, route: 'Chat' },
  { id: 'community', title: 'Community', icon: 'people', route: 'Community' },
  { id: 'marketplace', title: 'Marketplace', icon: 'business', badge: 2, route: 'Marketplace' },
  { id: 'account', title: 'Account', icon: 'person', route: 'Account' },
];

const SidebarNavigation = ({ visible, onClose, navigation, currentRoute }: SidebarNavigationProps) => {
  const [expandedItem, setExpandedItem] = useState<string | null>('analytics');

  const handleMenuItemPress = (item: MenuItem) => {
    if (item.hasSubmenu) {
      setExpandedItem(expandedItem === item.id ? null : item.id);
    } else if (item.route) {
      navigation.navigate(item.route);
      onClose();
    }
  };

  const renderMenuItem = (item: MenuItem) => {
    // Check if this item should be highlighted based on current route
    const isHighlighted = item.id === 'analytics' && 
      (currentRoute === 'PredictiveDashboard' || currentRoute === 'AnomalyAlerts' || currentRoute === 'PlantHealthScanner' || currentRoute === 'YieldForecast');
    const isActive = currentRoute === item.id;
    const isExpanded = expandedItem === item.id;

    return (
      <View key={item.id}>
        <TouchableOpacity
          style={[
            styles.menuItem, 
            isHighlighted && styles.highlightedMenuItem,
            isActive && !isHighlighted && styles.activeMenuItem
          ]}
          onPress={() => handleMenuItemPress(item)}
        >
          <View style={styles.menuItemContent}>
            <Ionicons 
              name={item.icon as any} 
              size={18} 
              color={isHighlighted ? '#1A1E26' : isActive ? '#1A1E26' : 'white'} 
            />
            <Text style={[
              styles.menuItemText, 
              isHighlighted && styles.highlightedMenuItemText,
              isActive && !isHighlighted && styles.activeMenuItemText
            ]}>
              {item.title}
            </Text>
            {item.hasSubmenu && (
              <Ionicons 
                name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                size={14} 
                color={isHighlighted ? '#1A1E26' : isActive ? '#1A1E26' : 'white'} 
                style={styles.caretIcon}
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
                navigation.navigate('PredictiveDashboard');
                onClose();
              }}
            >
              <Ionicons name="analytics" size={14} color="white" style={styles.submenuIcon} />
              <Text style={styles.submenuText}>Predictive Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.submenuItem}
              onPress={() => {
                navigation.navigate('AnomalyAlerts');
                onClose();
              }}
            >
              <Ionicons name="flash" size={14} color="white" style={styles.submenuIcon} />
              <Text style={styles.submenuText}>Anomaly Alerts</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.submenuItem}
              onPress={() => {
                navigation.navigate('PlantHealthScanner');
                onClose();
              }}
            >
              <Ionicons name="camera" size={14} color="white" style={styles.submenuIcon} />
              <Text style={styles.submenuText}>Plant Health Scanner</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.submenuItem}
              onPress={() => {
                navigation.navigate('YieldForecast');
                onClose();
              }}
            >
              <Ionicons name="leaf" size={14} color="white" style={styles.submenuIcon} />
              <Text style={styles.submenuText}>Yield Forecast</Text>
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
          <StatusBar barStyle="light-content" backgroundColor="#1A1E26" />
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Ionicons name="leaf" size={16} color="white" />
              </View>
              <Text style={styles.logoText}>Miraqua</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
            {menuItems.map(renderMenuItem)}
          </ScrollView>
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
    width: 260,
    backgroundColor: '#1A1E26',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  closeButton: {
    padding: 4,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 6,
    marginVertical: 1,
    borderRadius: 6,
  },
  activeMenuItem: {
    backgroundColor: '#50B887',
  },
  highlightedMenuItem: {
    backgroundColor: '#50B887',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    marginLeft: 10,
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
    flex: 1,
  },
  activeMenuItemText: {
    color: '#1A1E26',
    fontWeight: '600',
  },
  highlightedMenuItemText: {
    color: '#1A1E26',
    fontWeight: '600',
  },
  caretIcon: {
    marginLeft: 6,
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  submenu: {
    marginLeft: 16,
    marginTop: 2,
  },
  submenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginVertical: 1,
    borderRadius: 4,
  },
  submenuText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
    marginLeft: 8,
  },
  submenuIcon: {
    marginRight: 8,
  },
});

export default SidebarNavigation; 