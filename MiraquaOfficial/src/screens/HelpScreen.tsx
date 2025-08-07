import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const HelpScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFAQs = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFaqs([
        {
          id: 1,
          question: "How does the AI watering system work?",
          answer: "Our AI system analyzes weather data, soil moisture, plant type, and growth stage to create optimal watering schedules. It automatically adjusts based on rainfall, temperature, and humidity.",
          category: "AI & Automation"
        },
        {
          id: 2,
          question: "Can I manually override the watering schedule?",
          answer: "Yes! You can manually water your plants anytime using the 'Water Now' button. You can also adjust the AI schedule or create custom schedules in the plot settings.",
          category: "Controls"
        },
        {
          id: 3,
          question: "What sensors are compatible with Miraqua?",
          answer: "Miraqua works with most soil moisture sensors, temperature sensors, and weather stations. We support popular brands like Arduino, Raspberry Pi sensors, and commercial agricultural sensors.",
          category: "Hardware"
        },
        {
          id: 4,
          question: "How accurate is the weather forecasting?",
          answer: "We use multiple weather data sources and machine learning to provide highly accurate 7-day forecasts. Our system automatically adjusts watering schedules when rain is predicted.",
          category: "Weather"
        },
        {
          id: 5,
          question: "Can I manage multiple garden plots?",
          answer: "Absolutely! You can add unlimited plots, each with its own crops, settings, and watering schedules. Perfect for managing different areas of your garden or multiple properties.",
          category: "Plot Management"
        }
      ]);
    } catch (err) {
      setError("Help content unavailable");
    } finally {
      setLoading(false);
    }
  };

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@miraqua.com');
  };

  const handleDocumentation = () => {
    Linking.openURL('https://docs.miraqua.com');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSearchBar} />
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={styles.loadingItem} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={32} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchFAQs}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.docsButton} onPress={handleDocumentation}>
            <Text style={styles.docsButtonText}>View Documentation</Text>
          </TouchableOpacity>
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
        <View>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <Text style={styles.headerSubtitle}>Find answers to common questions</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchCard}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.5)" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search help articles..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionCard} onPress={handleContactSupport}>
            <Ionicons name="chatbubble" size={32} color="#3B82F6" />
            <Text style={styles.quickActionTitle}>Contact Support</Text>
            <Text style={styles.quickActionSubtitle}>Get help from our team</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionCard} onPress={handleDocumentation}>
            <Ionicons name="open-outline" size={32} color="#10B981" />
            <Text style={styles.quickActionTitle}>Documentation</Text>
            <Text style={styles.quickActionSubtitle}>Read our full guides</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqCard}>
          <View style={styles.faqHeader}>
            <Ionicons name="help-circle" size={20} color="white" />
            <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          </View>
          
          {filteredFAQs.length === 0 ? (
            <View style={styles.noResults}>
              <Ionicons name="search" size={32} color="rgba(255, 255, 255, 0.5)" />
              <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
              <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery("")}>
                <Text style={styles.clearButtonText}>Clear Search</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.faqList}>
              {filteredFAQs.map((faq) => (
                <View key={faq.id} style={styles.faqItem}>
                  <TouchableOpacity
                    style={styles.faqQuestion}
                    onPress={() => toggleFAQ(faq.id)}
                  >
                    <View style={styles.faqQuestionContent}>
                      <Text style={styles.faqQuestionText}>{faq.question}</Text>
                      <Text style={styles.faqCategory}>{faq.category}</Text>
                    </View>
                    <Ionicons 
                      name={expandedFAQ === faq.id ? "chevron-down" : "chevron-forward"} 
                      size={20} 
                      color="rgba(255, 255, 255, 0.5)" 
                    />
                  </TouchableOpacity>
                  {expandedFAQ === faq.id && (
                    <View style={styles.faqAnswer}>
                      <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Contact Information */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <TouchableOpacity style={styles.contactItem} onPress={handleContactSupport}>
            <Ionicons name="mail" size={16} color="#3B82F6" />
            <Text style={styles.contactText}>support@miraqua.com</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactItem} onPress={handleDocumentation}>
            <Ionicons name="open-outline" size={16} color="#3B82F6" />
            <Text style={styles.contactText}>Documentation</Text>
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
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    padding: 16,
  },
  loadingSearchBar: {
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 16,
  },
  loadingItem: {
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  docsButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  docsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  searchCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  faqCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  noResults: {
    padding: 32,
    alignItems: 'center',
  },
  noResultsText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  clearButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  faqList: {
    padding: 16,
  },
  faqItem: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 12,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestionContent: {
    flex: 1,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    marginBottom: 4,
  },
  faqCategory: {
    fontSize: 12,
    color: '#3B82F6',
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    color: '#3B82F6',
    fontSize: 14,
    marginLeft: 8,
  },
});

export default HelpScreen;
