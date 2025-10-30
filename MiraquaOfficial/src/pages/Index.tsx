
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { ScrollArea } from '../components/ui/scroll-area';
import ChatInterface from '../components/ChatInterface';
import OnboardingFlow from '../components/OnboardingFlow';

const Index = () => {
  const navigation = useNavigation();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [plots, setPlots] = useState([
    {
      id: 1,
      name: 'Tomato Garden',
      crop: 'Tomatoes',
      location: 'Backyard',
      status: 'healthy',
      moisture: 75,
      temperature: 72,
      sunlight: 85,
      nextWatering: '2h 30m'
    },
    {
      id: 2,
      name: 'Herb Corner',
      crop: 'Basil, Mint',
      location: 'Kitchen Window',
      status: 'needs-water',
      moisture: 35,
      temperature: 68,
      sunlight: 60,
      nextWatering: 'Now'
    }
  ]);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'system',
      title: 'Watering Complete',
      message: 'Tomato Garden has been watered successfully',
      time: '2 minutes ago',
      read: false
    },
    {
      id: 2,
      type: 'system',
      title: 'Low Moisture Alert',
      message: 'Herb Corner needs watering',
      time: '15 minutes ago',
      read: false
    },
    {
      id: 3,
      type: 'system',
      title: 'Weather Update',
      message: 'Rain expected tomorrow - watering paused',
      time: '1 hour ago',
      read: true
    }
  ]);

  const globalStats = {
    totalWaterUsed: 26,
    avgMoisture: 55,
    nextWateringIn: '-21m',
    activePlots: 2,
    waterSavings: 23,
    moistureTrend: 'down' as const
  };

  const handleAddPlot = (plotData: any) => {
    const newPlot = {
      id: plots.length + 1,
      ...plotData,
      status: 'healthy',
      moisture: 75,
      temperature: 72,
      sunlight: 85,
      nextWatering: '2h 30m'
    };
    setPlots([...plots, newPlot]);
    setShowOnboarding(false);
  };

  const handleViewDetails = (plotId: number) => {
    console.log('Navigating to plot details:', plotId);
    navigation.navigate('PlotDetails' as never, { plotId } as never);
  };

  const handleWaterNow = (plotId: number) => {
    // Handle watering logic
    console.log('Watering plot:', plotId);
  };

  const handleMarkAsRead = (notificationId: number) => {
    setNotifications(notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const handleDismissNotification = (notificationId: number) => {
    setNotifications(notifications.filter(notif => notif.id !== notificationId));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning!";
    if (hour < 17) return "Good afternoon!";
    return "Good evening!";
  };

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleAddPlot} onCancel={() => setShowOnboarding(false)} />;
  }

  return (
    <View style={styles.container}>
      {/* Side Navigation Menu */}
      {showSideMenu && (
        <View style={styles.sideMenuOverlay}>
          <TouchableOpacity 
            style={styles.sideMenuBackdrop}
            onPress={() => setShowSideMenu(false)}
            activeOpacity={1}
          />
          <View style={styles.sideMenu}>
            {/* Header */}
            <View style={styles.sideMenuHeader}>
              <View style={styles.sideMenuLogo}>
                <Ionicons name="leaf" size={24} color="#10B981" />
                <Text style={styles.sideMenuTitle}>Miraqua</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowSideMenu(false)}
              >
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Navigation Items */}
            <View style={styles.navItems}>
              <TouchableOpacity 
                style={[styles.navItem, styles.activeNavItem]}
                onPress={() => setShowSideMenu(false)}
              >
                <Ionicons name="home" size={20} color="white" />
                <Text style={styles.activeNavText}>Home</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.navItem}
                onPress={() => {
                  setShowSideMenu(false);
                  // Navigate to AI Analytics
                }}
              >
                <Ionicons name="bar-chart" size={20} color="#374151" />
                <Text style={styles.navText}>AI Analytics</Text>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.navItem}
                onPress={() => {
                  setShowSideMenu(false);
                  // Navigate to Smart Map
                }}
              >
                <Ionicons name="map" size={20} color="#374151" />
                <Text style={styles.navText}>Smart Map</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.navItem}
                onPress={() => {
                  setShowSideMenu(false);
                  setShowChat(true);
                }}
              >
                <Ionicons name="chatbubbles" size={20} color="#374151" />
                <Text style={styles.navText}>AI Assistant</Text>
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>3</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.navItem}
                onPress={() => {
                  setShowSideMenu(false);
                  // Navigate to Community
                }}
              >
                <Ionicons name="people" size={20} color="#374151" />
                <Text style={styles.navText}>Community</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.navItem}
                onPress={() => {
                  setShowSideMenu(false);
                  // Navigate to Marketplace
                }}
              >
                <Ionicons name="storefront" size={20} color="#374151" />
                <Text style={styles.navText}>Marketplace</Text>
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>2</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.navItem}
                onPress={() => {
                  setShowSideMenu(false);
                  navigation.navigate('Account' as never);
                }}
              >
                <Ionicons name="person" size={20} color="#374151" />
                <Text style={styles.navText}>Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => setShowSideMenu(true)}
            >
              <Ionicons name="menu" size={20} color="#374151" />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Ionicons name="leaf" size={20} color="#10B981" />
            </View>
            <Text style={styles.headerTitle}>Miraqua</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.onlineStatus}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
              <Ionicons name="wifi" size={12} color="#10B981" />
            </View>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications" size={20} color="#374151" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollArea style={styles.scrollArea}>
        <View style={styles.content}>
          {/* Greeting Section */}
          <View style={styles.greetingSection}>
            <View style={styles.greetingLeft}>
              <Text style={styles.greetingText}>{getGreeting()}</Text>
              <Text style={styles.greetingEmoji}>👋</Text>
              <Text style={styles.greetingSubtext}>Your gardens are looking great today</Text>
            </View>
            <View style={styles.weatherCard}>
              <Text style={styles.weatherTemp}>63°F</Text>
              <Text style={styles.weatherIcon}>☁️</Text>
              <Text style={styles.weatherDesc}>Cloudy • 60% humidity</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={16} color="#6B7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search plots, crops, or locations..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Water Savings Card */}
          <Card style={styles.waterSavingsCard}>
            <CardContent style={styles.waterSavingsContent}>
              <View style={styles.waterSavingsInfo}>
                <Text style={styles.waterSavingsLabel}>💡 Smart Savings</Text>
                <Text style={styles.waterSavingsValue}>{globalStats.waterSavings}% water saved</Text>
                <Text style={styles.waterSavingsSubtext}>vs traditional irrigation</Text>
              </View>
              <Text style={styles.waterSavingsIcon}>🌱</Text>
            </CardContent>
          </Card>

          {/* Notifications */}
          <View style={styles.notificationsSection}>
            <View style={styles.notificationsHeader}>
              <Text style={styles.notificationsTitle}>Recent Activity</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
              {notifications.slice(0, 3).map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[styles.notificationItem, !notification.read && styles.unreadNotification]}
                  onPress={() => handleMarkAsRead(notification.id)}
                >
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                  </View>
                  {!notification.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsGrid}>
            <Button
              style={styles.actionButton}
              onPress={() => setShowChat(!showChat)}
            >
              <Ionicons name="chatbubbles" size={20} color="white" />
              <Text style={styles.actionButtonText}>AI Chat</Text>
            </Button>
            <Button
              style={styles.actionButton}
              onPress={() => setShowOnboarding(true)}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.actionButtonText}>Add Plot</Text>
            </Button>
          </View>

          {/* My Plots Section */}
          <View style={styles.plotsSection}>
            <View style={styles.plotsHeader}>
              <Text style={styles.plotsTitle}>My Plots</Text>
              <Badge variant="secondary" style={styles.plotsBadge}>
                <Text style={styles.plotsBadgeText}>{plots.length}</Text>
              </Badge>
            </View>

            {plots.length === 0 ? (
              <Card style={styles.emptyCard}>
                <CardContent style={styles.emptyCardContent}>
                  <View style={styles.emptyIcon}>
                    <Ionicons name="water" size={24} color="#9CA3AF" />
                  </View>
                  <Text style={styles.emptyTitle}>No plots yet</Text>
                  <Text style={styles.emptySubtitle}>Add your first plot to get started</Text>
                  <Button
                    size="sm"
                    style={styles.addFirstButton}
                    onPress={() => setShowOnboarding(true)}
                  >
                    <Ionicons name="add" size={16} color="white" />
                    <Text style={styles.addFirstButtonText}>Add Plot</Text>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <View style={styles.plotsList}>
                {plots.map((plot) => (
                  <TouchableOpacity
                    key={plot.id}
                    style={styles.plotCard}
                    onPress={() => handleViewDetails(plot.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.plotCardContent}>
                      <View style={styles.plotHeader}>
                        <View style={styles.plotInfo}>
                          <View style={styles.plotTitleRow}>
                            <Text style={styles.plotName}>{plot.name}</Text>
                            <Badge style={[
                              styles.statusBadge,
                              plot.status === 'healthy' && styles.healthyBadge,
                              plot.status === 'needs-water' && styles.waterBadge,
                              plot.status === 'attention' && styles.attentionBadge,
                            ]}>
                              <Text style={styles.statusText}>
                                {plot.status === 'healthy' ? '✅ Healthy' :
                                 plot.status === 'needs-water' ? '💧 Needs Water' :
                                 '👀 Attention'}
                              </Text>
                            </Badge>
                          </View>
                          <Text style={styles.plotCrop}>{plot.crop}</Text>
                          <View style={styles.plotLocation}>
                            <Ionicons name="location" size={12} color="#6B7280" />
                            <Text style={styles.plotLocationText}>{plot.location}</Text>
                          </View>
                        </View>
                      </View>

                      {/* Metrics */}
                      <View style={styles.metricsGrid}>
                        <View style={styles.metric}>
                          <View style={styles.metricHeader}>
                            <Ionicons name="water" size={16} color="#3B82F6" />
                            <Text style={styles.metricValue}>{plot.moisture}%</Text>
                          </View>
                          <Progress value={plot.moisture} style={styles.metricProgress} />
                          <Text style={styles.metricLabel}>Moisture</Text>
                        </View>
                        <View style={styles.metric}>
                          <View style={styles.metricHeader}>
                            <Ionicons name="thermometer" size={16} color="#F59E0B" />
                            <Text style={styles.metricValue}>{plot.temperature}°F</Text>
                          </View>
                          <Progress value={(plot.temperature - 50) * 2} style={styles.metricProgress} />
                          <Text style={styles.metricLabel}>Temperature</Text>
                        </View>
                        <View style={styles.metric}>
                          <View style={styles.metricHeader}>
                            <Ionicons name="sunny" size={16} color="#F59E0B" />
                            <Text style={styles.metricValue}>{Math.round(plot.sunlight/10)}%</Text>
                          </View>
                          <Progress value={plot.sunlight/10} style={styles.metricProgress} />
                          <Text style={styles.metricLabel}>Sunlight</Text>
                        </View>
                      </View>

                      {/* Actions */}
                      <View style={styles.plotActions}>
                        <View style={styles.wateringInfo}>
                          <Ionicons name="time" size={16} color="#3B82F6" />
                          <Text style={styles.wateringText}>Next: {plot.nextWatering}</Text>
                        </View>
                        {plot.status === 'needs-water' && (
                          <Button
                            size="sm"
                            style={styles.waterNowButton}
                            onPress={() => handleWaterNow(plot.id)}
                          >
                            <Ionicons name="play" size={12} color="white" />
                            <Text style={styles.waterNowText}>Water Now</Text>
                          </Button>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Bottom spacing for safe area */}
          <View style={styles.bottomSpace} />
        </View>
      </ScrollArea>

      {/* Chat Interface */}
      {showChat && (
        <ChatInterface visible={showChat} onClose={() => setShowChat(false)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  sideMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  sideMenuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sideMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 280,
    height: '100%',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sideMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sideMenuLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideMenuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  navItems: {
    paddingTop: 20,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 12,
    marginVertical: 2,
    borderRadius: 8,
  },
  activeNavItem: {
    backgroundColor: '#10B981',
  },
  navText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  activeNavText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
  notificationBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 8,
    marginRight: 12,
  },
  logoContainer: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  onlineText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
    marginRight: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  scrollArea: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  greetingLeft: {
    flex: 1,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  greetingEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  greetingSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  weatherCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  weatherTemp: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  weatherIcon: {
    fontSize: 24,
    marginVertical: 4,
  },
  weatherDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  moistureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moistureTrend: {
    fontSize: 12,
    color: '#F59E0B',
    marginLeft: 4,
  },
  moistureProgress: {
    marginTop: 8,
  },
  waterSavingsCard: {
    marginBottom: 24,
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  waterSavingsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  waterSavingsInfo: {
    flex: 1,
  },
  waterSavingsLabel: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 4,
  },
  waterSavingsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 2,
  },
  waterSavingsSubtext: {
    fontSize: 12,
    color: '#D97706',
  },
  waterSavingsIcon: {
    fontSize: 32,
  },
  notificationsSection: {
    marginBottom: 24,
  },
  notificationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  notificationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  notificationsList: {
    maxHeight: 200,
  },
  notificationItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginLeft: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  plotsSection: {
    marginBottom: 24,
  },
  plotsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  plotsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  plotsBadge: {
    backgroundColor: '#E5E7EB',
  },
  plotsBadgeText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: 'white',
  },
  emptyCardContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  addFirstButton: {
    backgroundColor: '#3B82F6',
  },
  addFirstButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  plotsList: {
    gap: 12,
  },
  plotCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  plotCardContent: {
    padding: 16,
  },
  plotHeader: {
    marginBottom: 16,
  },
  plotInfo: {
    flex: 1,
  },
  plotTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  plotName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  healthyBadge: {
    backgroundColor: '#D1FAE5',
  },
  waterBadge: {
    backgroundColor: '#DBEAFE',
  },
  attentionBadge: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  plotCrop: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  plotLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plotLocationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 4,
  },
  metricProgress: {
    width: '100%',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  plotActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wateringInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wateringText: {
    fontSize: 12,
    color: '#3B82F6',
    marginLeft: 4,
  },
  waterNowButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  waterNowText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  bottomSpace: {
    height: 100,
  },
});

export default Index;
