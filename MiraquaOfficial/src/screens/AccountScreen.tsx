import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SidebarNavigation from './SidebarNavigation';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  memberSince: string;
  totalPlots: number;
  waterSaved: number;
  plan: string;
  timezone: string;
}

export default function AccountScreen({ navigation }: any) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    avatar: '',
    memberSince: 'March 2024',
    totalPlots: 3,
    waterSaved: 245,
    plan: 'Premium',
    timezone: 'America/New_York'
  });

  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoWatering, setAutoWatering] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const [language, setLanguage] = useState('English');

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!profile.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!profile.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setIsDirty(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original values
    setProfile({
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      avatar: '',
      memberSince: 'March 2024',
      totalPlots: 3,
      waterSaved: 245,
      plan: 'Premium',
      timezone: 'America/New_York'
    });
    setErrors({});
    setIsDirty(false);
    setIsEditing(false);
  };

  const handleAvatarChange = () => {
    setShowAvatarModal(true);
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setIsDirty(true);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setIsDirty(true);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setIsDirty(true);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => navigation.navigate('SignIn') }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure? This action cannot be undone. This will permanently delete your account and remove all your data from our servers.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Account', style: 'destructive', onPress: () => navigation.navigate('SignIn') }
      ]
    );
  };

  const handleQuickAction = (action: string) => {
    // Navigate to appropriate screen based on action
    switch (action) {
      case 'notifications':
        navigation.navigate('NotificationSettings');
        break;
      case 'subscription':
        navigation.navigate('Subscription');
        break;
      case 'help':
        navigation.navigate('Help');
        break;
      case 'terms':
        navigation.navigate('TermsOfService');
        break;
      case 'privacy':
        navigation.navigate('PrivacyPolicy');
        break;
      case 'analytics':
        navigation.navigate('Analytics');
        break;
      case 'reports':
        navigation.navigate('Reports');
        break;
      case 'community':
        navigation.navigate('Community');
        break;
      case 'marketplace':
        navigation.navigate('Marketplace');
        break;
      case 'plots':
        navigation.navigate('Plots');
        break;
      case 'weather':
        navigation.navigate('Weather');
        break;
      case 'smartmap':
        navigation.navigate('SmartMap');
        break;
      case 'predictive':
        navigation.navigate('PredictiveDashboard');
        break;
      case 'alerts':
        navigation.navigate('AnomalyAlerts');
        break;
      case 'scanner':
        navigation.navigate('PlantHealthScanner');
        break;
      case 'yield':
        navigation.navigate('YieldForecast');
        break;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowSidebar(true)} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Account Settings</Text>
          <Text style={styles.headerSubtitle}>Manage your profile and preferences</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.themeToggle}
          onPress={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')}
        >
          <Ionicons 
            name={theme === 'dark' ? 'sunny' : 'moon'} 
            size={20} 
            color="white" 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color="white" />
            <Text style={styles.sectionTitle}>Profile Information</Text>
          </View>
          <View style={styles.profileCard}>
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={32} color="white" />
              </View>
              <TouchableOpacity style={styles.changePhotoButton} onPress={handleAvatarChange}>
                <Ionicons name="camera" size={16} color="white" />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Profile Form */}
            <View style={styles.formSection}>
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Full Name</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.formInput, errors.name && styles.inputError]}
                    value={profile.name}
                    onChangeText={(value) => handleProfileChange('name', value)}
                    placeholder="Enter your full name"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    maxLength={50}
                  />
                ) : (
                  <Text style={styles.formValue}>{profile.name}</Text>
                )}
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Email Address</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.formInput, errors.email && styles.inputError]}
                    value={profile.email}
                    onChangeText={(value) => handleProfileChange('email', value)}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    keyboardType="email-address"
                  />
                ) : (
                  <Text style={styles.formValue}>{profile.email}</Text>
                )}
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* Edit Button */}
              {!isEditing && (
                <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                  <Ionicons name="create" size={16} color="white" />
                  <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
              )}

              {/* Member Since */}
              <View style={styles.memberSinceCard}>
                <Text style={styles.memberSinceLabel}>Member since</Text>
                <Text style={styles.memberSinceValue}>{profile.memberSince}</Text>
              </View>

              {/* Stats */}
              <View style={styles.statsSection}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{profile.totalPlots}</Text>
                  <Text style={styles.statLabel}>Active Plots</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{profile.waterSaved}L</Text>
                  <Text style={styles.statLabel}>Water Saved</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield" size={20} color="white" />
            <Text style={styles.sectionTitle}>Security</Text>
          </View>
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="key" size={20} color="white" />
                <Text style={styles.settingText}>Two-Factor Authentication</Text>
              </View>
              <Switch
                value={twoFactorAuth}
                onValueChange={setTwoFactorAuth}
                trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#10B981' }}
                thumbColor={twoFactorAuth ? 'white' : 'rgba(255, 255, 255, 0.5)'}
              />
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings" size={20} color="white" />
            <Text style={styles.sectionTitle}>Preferences</Text>
          </View>
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications" size={20} color="white" />
                <Text style={styles.settingText}>Push Notifications</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#10B981' }}
                thumbColor={notifications ? 'white' : 'rgba(255, 255, 255, 0.5)'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="moon" size={20} color="white" />
                <Text style={styles.settingText}>Dark Mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#10B981' }}
                thumbColor={darkMode ? 'white' : 'rgba(255, 255, 255, 0.5)'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="water" size={20} color="white" />
                <Text style={styles.settingText}>Auto Watering</Text>
              </View>
              <Switch
                value={autoWatering}
                onValueChange={setAutoWatering}
                trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#10B981' }}
                thumbColor={autoWatering ? 'white' : 'rgba(255, 255, 255, 0.5)'}
              />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={20} color="white" />
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.actionsCard}>
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => handleQuickAction('notifications')}
            >
              <Ionicons name="notifications" size={20} color="white" />
              <View style={styles.actionContent}>
                <Text style={styles.actionText}>Notification Settings</Text>
                <Text style={styles.actionSubtext}>Manage alerts and reminders</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => handleQuickAction('subscription')}
            >
              <Ionicons name="card" size={20} color="white" />
              <View style={styles.actionContent}>
                <Text style={styles.actionText}>Manage Subscription</Text>
                <Text style={styles.actionSubtext}>Current plan: {profile.plan}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => handleQuickAction('analytics')}
            >
              <Ionicons name="analytics" size={20} color="white" />
              <View style={styles.actionContent}>
                <Text style={styles.actionText}>Analytics</Text>
                <Text style={styles.actionSubtext}>View detailed analytics</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => handleQuickAction('reports')}
            >
              <Ionicons name="document-text" size={20} color="white" />
              <View style={styles.actionContent}>
                <Text style={styles.actionText}>Reports</Text>
                <Text style={styles.actionSubtext}>Generate and view reports</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => handleQuickAction('community')}
            >
              <Ionicons name="people" size={20} color="white" />
              <View style={styles.actionContent}>
                <Text style={styles.actionText}>Community</Text>
                <Text style={styles.actionSubtext}>Connect with other gardeners</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => handleQuickAction('marketplace')}
            >
              <Ionicons name="storefront" size={20} color="white" />
              <View style={styles.actionContent}>
                <Text style={styles.actionText}>Marketplace</Text>
                <Text style={styles.actionSubtext}>Browse products and services</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => handleQuickAction('help')}
            >
              <Ionicons name="help-circle" size={20} color="white" />
              <View style={styles.actionContent}>
                <Text style={styles.actionText}>Help & Support</Text>
                <Text style={styles.actionSubtext}>FAQs, contact support</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={20} color="white" />
            <Text style={styles.sectionTitle}>Legal</Text>
          </View>
          <View style={styles.actionsCard}>
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => handleQuickAction('terms')}
            >
              <Ionicons name="document-text" size={20} color="white" />
              <Text style={styles.actionText}>Terms of Service</Text>
              <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => handleQuickAction('privacy')}
            >
              <Ionicons name="shield-checkmark" size={20} color="white" />
              <Text style={styles.actionText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning" size={20} color="#EF4444" />
            <Text style={[styles.sectionTitle, styles.dangerText]}>Danger Zone</Text>
          </View>
          <View style={styles.dangerCard}>
            <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteAccount}>
              <Ionicons name="trash" size={20} color="#EF4444" />
              <Text style={styles.dangerText}>Delete Account</Text>
              <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Action Buttons */}
      {isDirty && (
        <View style={styles.stickyFooter}>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="reload" size={16} color="white" style={styles.spinningIcon} />
                  <Text style={styles.saveButtonText}>Saving...</Text>
                </View>
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Sign Out Button */}
      <View style={styles.signOutContainer}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out" size={20} color="white" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar Change Modal */}
      <Modal
        visible={showAvatarModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Profile Photo</Text>
            <TouchableOpacity style={styles.modalOption}>
              <Ionicons name="camera" size={20} color="white" />
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption}>
              <Ionicons name="images" size={20} color="white" />
              <Text style={styles.modalOptionText}>Choose from Library</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalCancel}
              onPress={() => setShowAvatarModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sidebar Navigation */}
      <SidebarNavigation
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
        navigation={navigation}
        currentRoute="Account"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#111827',
  },
  menuButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  themeToggle: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  changePhotoText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  formSection: {
    gap: 16,
  },
  formRow: {
    gap: 8,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  formValue: {
    fontSize: 16,
    color: 'white',
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
  },
  memberSinceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
  },
  memberSinceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  memberSinceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  statsSection: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  settingsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: 'white',
  },
  actionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  actionSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  dangerCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  dangerText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
    flex: 1,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spinningIcon: {
    transform: [{ rotate: '360deg' }],
  },
  signOutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  modalOptionText: {
    fontSize: 16,
    color: 'white',
  },
  modalCancel: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    marginTop: 10,
  },
  editButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
      },
  }); 