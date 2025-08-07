import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  isCurrent: boolean;
  isPopular?: boolean;
}

const SubscriptionScreen = ({ navigation }: any) => {
  const [loading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string>('premium');

  const fetchSubscriptionData = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPlans([
        {
          id: 'free',
          name: 'Free',
          price: '$0',
          period: 'month',
          features: [
            'Up to 2 garden plots',
            'Basic watering schedules',
            'Weather integration',
            'Email support'
          ],
          isCurrent: false
        },
        {
          id: 'premium',
          name: 'Premium',
          price: '$9.99',
          period: 'month',
          features: [
            'Unlimited garden plots',
            'AI-powered optimization',
            'Advanced analytics',
            'Priority support',
            'Custom watering schedules',
            'Plant health monitoring'
          ],
          isCurrent: true,
          isPopular: true
        },
        {
          id: 'pro',
          name: 'Pro',
          price: '$19.99',
          period: 'month',
          features: [
            'Everything in Premium',
            'Commercial use',
            'API access',
            'Dedicated support',
            'Advanced reporting',
            'Team collaboration'
          ],
          isCurrent: false
        }
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanChange = (planId: string) => {
    Alert.alert(
      'Change Plan',
      `Are you sure you want to switch to the ${plans.find(p => p.id === planId)?.name} plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            setCurrentPlan(planId);
            Alert.alert('Success', 'Your subscription has been updated!');
          }
        }
      ]
    );
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        { 
          text: 'Cancel Subscription', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Subscription Cancelled', 'Your subscription will be cancelled at the end of the current billing period.');
          }
        }
      ]
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscription</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={styles.loadingItem} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Subscription</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Plan Status */}
        <View style={styles.currentPlanCard}>
          <View style={styles.currentPlanHeader}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.currentPlanTitle}>Current Plan</Text>
          </View>
          <Text style={styles.currentPlanName}>
            {plans.find(p => p.id === currentPlan)?.name} Plan
          </Text>
          <Text style={styles.currentPlanPrice}>
            {plans.find(p => p.id === currentPlan)?.price}/{plans.find(p => p.id === currentPlan)?.period}
          </Text>
          <Text style={styles.currentPlanStatus}>Active until March 15, 2025</Text>
        </View>

        {/* Available Plans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Plans</Text>
          {plans.map((plan) => (
            <View key={plan.id} style={[styles.planCard, plan.isPopular && styles.popularPlan]}>
              {plan.isPopular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>Most Popular</Text>
                </View>
              )}
              
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPrice}>{plan.price}/{plan.period}</Text>
              </View>
              
              <View style={styles.planFeatures}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Ionicons name="checkmark" size={16} color="#10B981" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity
                style={[
                  styles.planButton,
                  plan.isCurrent ? styles.currentPlanButton : styles.changePlanButton
                ]}
                onPress={() => handlePlanChange(plan.id)}
                disabled={plan.isCurrent}
              >
                <Text style={[
                  styles.planButtonText,
                  plan.isCurrent ? styles.currentPlanButtonText : styles.changePlanButtonText
                ]}>
                  {plan.isCurrent ? 'Current Plan' : 'Select Plan'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Billing Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing Information</Text>
          <View style={styles.billingCard}>
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Payment Method</Text>
              <Text style={styles.billingValue}>•••• •••• •••• 4242</Text>
            </View>
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Next Billing Date</Text>
              <Text style={styles.billingValue}>March 15, 2025</Text>
            </View>
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Billing Cycle</Text>
              <Text style={styles.billingValue}>Monthly</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Update Payment', 'Navigate to payment update')}>
            <Ionicons name="card" size={20} color="white" />
            <Text style={styles.actionButtonText}>Update Payment Method</Text>
            <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.5)" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Billing History', 'Navigate to billing history')}>
            <Ionicons name="document-text" size={20} color="white" />
            <Text style={styles.actionButtonText}>View Billing History</Text>
            <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.5)" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Download Invoice', 'Download invoice')}>
            <Ionicons name="download" size={20} color="white" />
            <Text style={styles.actionButtonText}>Download Invoice</Text>
            <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.5)" />
          </TouchableOpacity>
        </View>

        {/* Cancel Subscription */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSubscription}>
            <Ionicons name="close-circle" size={20} color="#EF4444" />
            <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    padding: 16,
  },
  loadingItem: {
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 16,
  },
  currentPlanCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  currentPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentPlanTitle: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 8,
  },
  currentPlanName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  currentPlanPrice: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 8,
  },
  currentPlanStatus: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
  },
  popularPlan: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
  },
  planFeatures: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
  planButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  currentPlanButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  changePlanButton: {
    backgroundColor: '#10B981',
  },
  planButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  currentPlanButtonText: {
    color: '#10B981',
  },
  changePlanButtonText: {
    color: 'white',
  },
  billingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  billingLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  billingValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    marginLeft: 12,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 12,
  },
});

export default SubscriptionScreen;
