import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TermsOfServiceScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.backButtonText}>Back to Account</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.subtitle}>Last updated: January 2025</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Miraqua Terms of Service</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.sectionText}>
              By accessing and using Miraqua's smart irrigation platform, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Service Description</Text>
            <Text style={styles.sectionText}>
              Miraqua provides an AI-powered, end-to-end smart irrigation platform that includes:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Plot mapping and zone management</Text>
              <Text style={styles.bulletItem}>• Automated watering schedules based on AI optimization</Text>
              <Text style={styles.bulletItem}>• Real-time sensor monitoring and alerts</Text>
              <Text style={styles.bulletItem}>• Collaboration tools and role management</Text>
              <Text style={styles.bulletItem}>• AI agronomist consultation and plant health scanning</Text>
              <Text style={styles.bulletItem}>• Reporting and analytics features</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. User Accounts</Text>
            <Text style={styles.sectionText}>
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities 
              that occur under your account or password. Miraqua reserves the right to refuse service, terminate accounts, or remove content at our sole discretion.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Device and Hardware</Text>
            <Text style={styles.sectionText}>
              Users are responsible for the proper installation, maintenance, and operation of irrigation hardware and sensors. Miraqua provides 
              software guidance but is not responsible for hardware malfunctions, water damage, or crop loss resulting from device failures.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Data and Privacy</Text>
            <Text style={styles.sectionText}>
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices.
              By using our service, you consent to the collection and use of information as outlined in our Privacy Policy.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
            <Text style={styles.sectionText}>
              Miraqua shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to 
              crop loss, water damage, or loss of profits, arising out of your use of the service.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Service Availability</Text>
            <Text style={styles.sectionText}>
              While we strive to maintain continuous service availability, Miraqua does not guarantee uninterrupted access to the platform. 
              Scheduled maintenance, technical issues, or force majeure events may temporarily affect service availability.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Modifications</Text>
            <Text style={styles.sectionText}>
              Miraqua may revise these terms of service at any time without notice. By using this service, you are agreeing to be bound by the 
              current version of these terms and conditions.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Contact Information</Text>
            <Text style={styles.sectionText}>
              If you have any questions about these Terms of Service, please contact us at legal@miraqua.com.
            </Text>
          </View>
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
    padding: 16,
    paddingTop: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
  },
  bulletList: {
    marginTop: 8,
    marginLeft: 8,
  },
  bulletItem: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
    marginBottom: 4,
  },
});

export default TermsOfServiceScreen;
