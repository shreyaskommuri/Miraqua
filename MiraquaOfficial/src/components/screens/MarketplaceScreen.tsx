
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MarketplaceScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Marketplace</Text>
        <Text style={styles.subtitle}>Garden supplies and equipment</Text>
      </View>

      <View style={styles.content}>
        {/* Categories */}
        <View style={styles.categoriesGrid}>
          <TouchableOpacity style={styles.categoryCard}>
            <Ionicons name="water" size={24} color="#3B82F6" />
            <Text style={styles.categoryText}>Irrigation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryCard}>
            <Ionicons name="leaf" size={24} color="#10B981" />
            <Text style={styles.categoryText}>Seeds</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryCard}>
            <Ionicons name="hardware-chip" size={24} color="#F59E0B" />
            <Text style={styles.categoryText}>Sensors</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryCard}>
            <Ionicons name="construct" size={24} color="#8B5CF6" />
            <Text style={styles.categoryText}>Tools</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          
          <View style={styles.productCard}>
            <View style={styles.productImage}>
              <Ionicons name="water" size={32} color="#3B82F6" />
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productTitle}>Smart Sprinkler System</Text>
              <Text style={styles.productPrice}>$89.99</Text>
              <Text style={styles.productRating}>⭐⭐⭐⭐⭐ (24 reviews)</Text>
            </View>
          </View>

          <View style={styles.productCard}>
            <View style={styles.productImage}>
              <Ionicons name="hardware-chip" size={32} color="#F59E0B" />
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productTitle}>Soil Moisture Sensor</Text>
              <Text style={styles.productPrice}>$29.99</Text>
              <Text style={styles.productRating}>⭐⭐⭐⭐⭐ (156 reviews)</Text>
            </View>
          </View>

          <View style={styles.productCard}>
            <View style={styles.productImage}>
              <Ionicons name="leaf" size={32} color="#10B981" />
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productTitle}>Organic Tomato Seeds</Text>
              <Text style={styles.productPrice}>$12.99</Text>
              <Text style={styles.productRating}>⭐⭐⭐⭐⭐ (89 reviews)</Text>
            </View>
          </View>
        </View>

        {/* Deals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Deals</Text>
          
          <View style={styles.dealCard}>
            <View style={styles.dealBadge}>
              <Text style={styles.dealText}>20% OFF</Text>
            </View>
            <Text style={styles.dealTitle}>Complete Garden Kit</Text>
            <Text style={styles.dealPrice}>$149.99</Text>
            <Text style={styles.dealOriginalPrice}>$189.99</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 60,
    height: 60,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 2,
  },
  productRating: {
    fontSize: 12,
    color: '#6B7280',
  },
  dealCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dealBadge: {
    backgroundColor: '#EF4444',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  dealText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  dealPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  dealOriginalPrice: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
});

export default MarketplaceScreen;
