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

const PrivacyPolicyScreen = ({ navigation }: any) => {
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
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.subtitle}>Last updated: January 2025</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Miraqua Privacy Policy</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
            <Text style={styles.sectionText}>
              We collect information you provide directly to us, such as when you create an account, configure your irrigation settings, or contact us for support.
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• <Text style={styles.bold}>Personal Information:</Text> Name, email address, phone number, and billing information.</Text>
              <Text style={styles.bulletItem}>• <Text style={styles.bold}>Agricultural Data:</Text> Plot locations, crop types, soil conditions, and irrigation schedules.</Text>
              <Text style={styles.bulletItem}>• <Text style={styles.bold}>Sensor Data:</Text> Soil moisture, temperature, humidity, and water flow measurements.</Text>
              <Text style={styles.bulletItem}>• <Text style={styles.bold}>Usage Data:</Text> How you interact with our platform, including features used and time spent.</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
            <Text style={styles.sectionText}>
              We use the information we collect to provide, maintain, and improve our services:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Optimize irrigation schedules using AI algorithms</Text>
              <Text style={styles.bulletItem}>• Provide real-time monitoring and alerts</Text>
              <Text style={styles.bulletItem}>• Generate reports and analytics</Text>
              <Text style={styles.bulletItem}>• Facilitate collaboration features</Text>
              <Text style={styles.bulletItem}>• Provide customer support</Text>
              <Text style={styles.bulletItem}>• Send service notifications and updates</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Data Sharing and Disclosure</Text>
            <Text style={styles.sectionText}>
              We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• With your explicit consent</Text>
              <Text style={styles.bulletItem}>• To service providers who assist in operating our platform</Text>
              <Text style={styles.bulletItem}>• When required by law or to protect our rights</Text>
              <Text style={styles.bulletItem}>• In connection with a business transfer or acquisition</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Data Security</Text>
            <Text style={styles.sectionText}>
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. 
              This includes encryption of data in transit and at rest, regular security audits, and access controls.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Data Retention</Text>
            <Text style={styles.sectionText}>
              We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, 
              and enforce our agreements. Agricultural and sensor data may be retained for longer periods to improve our AI algorithms and provide historical insights.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Your Rights</Text>
            <Text style={styles.sectionText}>
              You have the right to:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Access and update your personal information</Text>
              <Text style={styles.bulletItem}>• Request deletion of your data</Text>
              <Text style={styles.bulletItem}>• Object to or restrict certain processing</Text>
              <Text style={styles.bulletItem}>• Data portability for your agricultural data</Text>
              <Text style={styles.bulletItem}>• Withdraw consent where applicable</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Cookies and Tracking</Text>
            <Text style={styles.sectionText}>
              We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and improve our services. 
              You can control cookie preferences through your browser settings.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Third-Party Services</Text>
            <Text style={styles.sectionText}>
              Our platform may integrate with third-party weather services, mapping providers, and smart home systems. These integrations are subject 
              to the privacy policies of those respective services.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Children's Privacy</Text>
            <Text style={styles.sectionText}>
              Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. 
              If you become aware that a child has provided us with personal information, please contact us.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Changes to This Policy</Text>
            <Text style={styles.sectionText}>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page 
              and updating the "Last updated" date.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Contact Us</Text>
            <Text style={styles.sectionText}>
              If you have any questions about this Privacy Policy, please contact us at privacy@miraqua.com or through our support portal.
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
  bold: {
    fontWeight: '600',
  },
});

export default PrivacyPolicyScreen;
