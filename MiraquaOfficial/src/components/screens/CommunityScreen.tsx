
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CommunityScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <Text style={styles.subtitle}>Connect with fellow gardeners</Text>
      </View>

      <View style={styles.content}>
        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color="#3B82F6" />
            <Text style={styles.statValue}>1,247</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="chatbubbles" size={24} color="#10B981" />
            <Text style={styles.statValue}>89</Text>
            <Text style={styles.statLabel}>Discussions</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="leaf" size={24} color="#F59E0B" />
            <Text style={styles.statValue}>342</Text>
            <Text style={styles.statLabel}>Tips Shared</Text>
          </View>
        </View>

        {/* Recent Discussions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Discussions</Text>
          
          <View style={styles.discussionCard}>
            <View style={styles.discussionHeader}>
              <Ionicons name="person-circle" size={32} color="#6B7280" />
              <View style={styles.discussionInfo}>
                <Text style={styles.discussionAuthor}>Sarah Johnson</Text>
                <Text style={styles.discussionTime}>2 hours ago</Text>
              </View>
            </View>
            <Text style={styles.discussionTitle}>Best organic pest control methods?</Text>
            <Text style={styles.discussionPreview}>
              Looking for natural ways to keep pests away from my tomatoes. Any recommendations?
            </Text>
            <View style={styles.discussionStats}>
              <View style={styles.statItem}>
                <Ionicons name="chatbubble" size={16} color="#6B7280" />
                <Text style={styles.statText}>12 replies</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="heart" size={16} color="#EF4444" />
                <Text style={styles.statText}>8 likes</Text>
              </View>
            </View>
          </View>

          <View style={styles.discussionCard}>
            <View style={styles.discussionHeader}>
              <Ionicons name="person-circle" size={32} color="#6B7280" />
              <View style={styles.discussionInfo}>
                <Text style={styles.discussionAuthor}>Mike Chen</Text>
                <Text style={styles.discussionTime}>5 hours ago</Text>
              </View>
            </View>
            <Text style={styles.discussionTitle}>Watering schedule for herbs</Text>
            <Text style={styles.discussionPreview}>
              Just started growing basil and rosemary. How often should I water them?
            </Text>
            <View style={styles.discussionStats}>
              <View style={styles.statItem}>
                <Ionicons name="chatbubble" size={16} color="#6B7280" />
                <Text style={styles.statText}>6 replies</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="heart" size={16} color="#EF4444" />
                <Text style={styles.statText}>4 likes</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="add-circle" size={24} color="#3B82F6" />
              <Text style={styles.actionText}>Start Discussion</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="search" size={24} color="#10B981" />
              <Text style={styles.actionText}>Search Topics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="people" size={24} color="#F59E0B" />
              <Text style={styles.actionText}>Find Members</Text>
            </TouchableOpacity>
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
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
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
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
  discussionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  discussionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  discussionInfo: {
    marginLeft: 12,
  },
  discussionAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  discussionTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  discussionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  discussionPreview: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  discussionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
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
  actionText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default CommunityScreen;
