import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  category: string;
  description: string;
  inStock: boolean;
  bestseller: boolean;
  savings?: number;
  features: string[];
  image?: string;
}

export default function MarketplaceScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setTimeout(() => {
      setProducts([
        {
          id: 1,
          name: 'Smart Moisture Sensor Pro',
          price: 89.99,
          originalPrice: 119.99,
          rating: 4.8,
          reviews: 324,
          category: 'sensors',
          description: 'AI-powered soil monitoring with 14-day battery',
          inStock: true,
          bestseller: true,
          savings: 25,
          features: ['Real-time monitoring', 'Weather integration', 'Mobile alerts']
        },
        {
          id: 2,
          name: 'Precision Drip Kit',
          price: 189.99,
          originalPrice: 229.99,
          rating: 4.9,
          reviews: 189,
          category: 'irrigation',
          description: 'Complete smart irrigation system',
          inStock: true,
          bestseller: true,
          savings: 17,
          features: ['Auto-scheduling', 'Water optimization', 'Zone control']
        },
        {
          id: 3,
          name: 'pH & Nutrient Analyzer',
          price: 149.99,
          rating: 4.6,
          reviews: 156,
          category: 'testing',
          description: 'Professional soil testing solution',
          inStock: true,
          bestseller: false,
          features: ['NPK analysis', 'pH monitoring', 'Growth recommendations']
        },
        {
          id: 4,
          name: 'Weather Station Elite',
          price: 299.99,
          originalPrice: 349.99,
          rating: 4.7,
          reviews: 267,
          category: 'monitoring',
          description: 'Hyper-local weather forecasting',
          inStock: true,
          bestseller: true,
          savings: 14,
          features: ['Micro-climate data', 'Predictive analytics', 'API integration']
        },
        {
          id: 5,
          name: 'Smart Valve Controller',
          price: 79.99,
          rating: 4.5,
          reviews: 98,
          category: 'irrigation',
          description: 'Automated valve control system',
          inStock: true,
          bestseller: false,
          features: ['Remote control', 'Schedule management', 'Leak detection']
        },
        {
          id: 6,
          name: 'Soil Temperature Probe',
          price: 45.99,
          rating: 4.4,
          reviews: 203,
          category: 'sensors',
          description: 'Accurate soil temperature monitoring',
          inStock: true,
          bestseller: false,
          features: ['High precision', 'Long battery life', 'Easy installation']
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  const addToCart = (product: Product) => {
    setCart(prev => [...prev, product]);
    Alert.alert('Added to Cart', `${product.name} has been added to your cart!`);
  };

  const getFilteredProducts = () => {
    let filtered = products;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const categories = [
    { id: 'all', name: 'All', icon: 'grid' },
    { id: 'sensors', name: 'Sensors', icon: 'thermometer' },
    { id: 'irrigation', name: 'Irrigation', icon: 'water' },
    { id: 'testing', name: 'Testing', icon: 'flask' },
    { id: 'monitoring', name: 'Monitoring', icon: 'eye' },
  ];

  const renderProductCard = (product: Product) => (
    <View key={product.id} style={styles.productCard}>
      <View style={styles.productHeader}>
        {product.bestseller && (
          <View style={styles.bestsellerBadge}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.bestsellerText}>Bestseller</Text>
          </View>
        )}
        {product.savings && (
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>-{product.savings}%</Text>
          </View>
        )}
      </View>
      
      <View style={styles.productImage}>
        <Ionicons name="cube" size={48} color="#6B7280" />
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productDescription}>{product.description}</Text>
        
        <View style={styles.ratingContainer}>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map(star => (
              <Ionicons
                key={star}
                name={star <= Math.floor(product.rating) ? "star" : "star-outline"}
                size={12}
                color="#F59E0B"
              />
            ))}
          </View>
          <Text style={styles.ratingText}>{product.rating}</Text>
          <Text style={styles.reviewsText}>({product.reviews})</Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${product.price}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>${product.originalPrice}</Text>
          )}
        </View>
        
        <View style={styles.featuresContainer}>
          {product.features.slice(0, 2).map((feature, index) => (
            <View key={index} style={styles.featureTag}>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity 
          style={[styles.addToCartButton, !product.inStock && styles.disabledButton]}
          onPress={() => addToCart(product)}
          disabled={!product.inStock}
        >
          <Ionicons name="cart" size={16} color="white" />
          <Text style={styles.addToCartText}>
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Marketplace</Text>
          <TouchableOpacity style={styles.cartButton}>
            <Ionicons name="cart" size={20} color="#6B7280" />
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cart.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={styles.loadingCard} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Marketplace</Text>
        <TouchableOpacity style={styles.cartButton}>
          <Ionicons name="cart" size={20} color="#6B7280" />
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryButton, selectedCategory === category.id && styles.activeCategoryButton]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons 
                name={category.icon as any} 
                size={16} 
                color={selectedCategory === category.id ? '#10B981' : '#6B7280'} 
              />
              <Text style={[styles.categoryText, selectedCategory === category.id && styles.activeCategoryText]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products Grid */}
        <View style={styles.productsGrid}>
          {getFilteredProducts().map(renderProductCard)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeCategoryButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: 'white',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bestsellerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bestsellerText: {
    marginLeft: 2,
    fontSize: 10,
    color: '#F59E0B',
    fontWeight: '600',
  },
  savingsBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  savingsText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  productImage: {
    width: '100%',
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 2,
  },
  reviewsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  featureTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 4,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 10,
    color: '#6B7280',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  addToCartText: {
    marginLeft: 4,
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    padding: 20,
  },
  loadingCard: {
    height: 200,
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    marginBottom: 16,
  },
}); 