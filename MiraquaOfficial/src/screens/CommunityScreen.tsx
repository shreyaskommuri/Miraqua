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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SidebarNavigation from './SidebarNavigation';

interface CommunityPost {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  tags: string[];
  type: 'question' | 'tip' | 'achievement' | 'general';
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  attendees: number;
  maxAttendees: number;
  isRegistered: boolean;
}

export default function CommunityScreen({ navigation }: any) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'events'>('posts');
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [newPostText, setNewPostText] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPosts([
        {
          id: '1',
          author: 'Sarah Johnson',
          avatar: 'https://via.placeholder.com/40/10B981/FFFFFF?text=SJ',
          content: 'I\'m having trouble with my tomatoes in this hot weather. Any tips for maintaining soil moisture without overwatering?',
          timestamp: '2 hours ago',
          likes: 12,
          comments: 8,
          tags: ['tomatoes', 'dry climate', 'soil moisture'],
          type: 'question'
        },
        {
          id: '2',
          author: 'Mike Chen',
          avatar: 'https://via.placeholder.com/40/3B82F6/FFFFFF?text=MC',
          content: 'After implementing the AI recommendations, I\'ve seen a significant reduction in water usage while maintaining crop health. Highly recommend!',
          timestamp: '1 day ago',
          likes: 24,
          comments: 15,
          tags: ['AI', 'water savings', 'smart irrigation'],
          type: 'achievement'
        },
        {
          id: '3',
          author: 'Emma Davis',
          avatar: 'https://via.placeholder.com/40/F59E0B/FFFFFF?text=ED',
          content: 'Here are the methods I\'ve found most effective: neem oil for aphids, diatomaceous earth for slugs, and companion planting with marigolds.',
          timestamp: '3 days ago',
          likes: 18,
          comments: 12,
          tags: ['pest control', 'organic', 'neem oil'],
          type: 'tip'
        }
      ]);

      setEvents([
        {
          id: '1',
          title: 'Smart Farming Workshop',
          description: 'Learn about the latest IoT sensors and AI-powered irrigation systems',
          date: 'Dec 15, 2024',
          time: '2:00 PM',
          attendees: 45,
          maxAttendees: 50,
          isRegistered: true
        },
        {
          id: '2',
          title: 'Organic Certification Seminar',
          description: 'Everything you need to know about getting organic certification',
          date: 'Dec 20, 2024',
          time: '10:00 AM',
          attendees: 28,
          maxAttendees: 40,
          isRegistered: false
        },
        {
          id: '3',
          title: 'Local Farmers Market',
          description: 'Connect with local farmers and share your produce',
          date: 'Dec 22, 2024',
          time: '9:00 AM',
          attendees: 15,
          maxAttendees: 30,
          isRegistered: false
        }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to load community data');
    } finally {
      setIsLoading(false);
    }
  };

  const likePost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1, isLiked: true }
        : post
    ));
  };

  const registerForEvent = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { 
            ...event, 
            attendees: event.isRegistered ? event.attendees - 1 : event.attendees + 1,
            isRegistered: !event.isRegistered 
          }
        : event
    ));
  };

  const createPost = () => {
    if (newPostText.trim().length === 0) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    const newPost: CommunityPost = {
      id: Date.now().toString(),
      author: 'You',
      avatar: 'https://via.placeholder.com/40/8B5CF6/FFFFFF?text=YO',
      content: newPostText,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      tags: [],
      type: 'general'
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostText('');
    Alert.alert('Success', 'Post created successfully!');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'question': return '#3B82F6';
      case 'tip': return '#10B981';
      case 'success': return '#F59E0B';
      case 'general': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'question': return 'help-circle';
      case 'tip': return 'bulb';
      case 'success': return 'checkmark-circle';
      case 'general': return 'chatbubble';
      default: return 'chatbubble';
    }
  };

  const PostCard = ({ post }: { post: CommunityPost }) => (
    <TouchableOpacity 
      style={styles.postCard}
      onPress={() => setSelectedPost(post)}
    >
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.authorAvatar}>
            <Text style={styles.avatarText}>{post.author.split(' ').map(n => n[0]).join('')}</Text>
          </View>
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>{post.author}</Text>
            <Text style={styles.postTimestamp}>{post.timestamp}</Text>
          </View>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(post.type) + '20' }]}>
          <Ionicons name={getCategoryIcon(post.type) as any} size={12} color={getCategoryColor(post.type)} />
          <Text style={[styles.categoryText, { color: getCategoryColor(post.type) }]}>
            {post.type}
          </Text>
        </View>
      </View>

      <Text style={styles.postTitle}>{post.content}</Text>
      <View style={styles.postTags}>
        {post.tags.map((tag, index) => (
          <View key={index} style={styles.tagBadge}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => likePost(post.id)}
        >
          <Ionicons 
            name="heart" 
            size={16} 
            color="#EF4444" 
          />
          <Text style={styles.actionText}>{post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={16} color="#6B7280" />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={16} color="#6B7280" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const EventCard = ({ event }: { event: CommunityEvent }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDescription}>{event.description}</Text>
          <View style={styles.eventMeta}>
            <Ionicons name="calendar" size={14} color="#6B7280" />
            <Text style={styles.eventDate}>{event.date} at {event.time}</Text>
          </View>
          <View style={styles.eventMeta}>
            <Ionicons name="people" size={14} color="#6B7280" />
            <Text style={styles.eventAttendees}>
              {event.attendees}/{event.maxAttendees} attendees
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.registerButton, event.isRegistered && styles.registeredButton]}
          onPress={() => registerForEvent(event.id)}
        >
          <Text style={[styles.registerText, event.isRegistered && styles.registeredText]}>
            {event.isRegistered ? 'Registered' : 'Register'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const PostDetailModal = ({ post }: { post: CommunityPost }) => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Post Details</Text>
          <TouchableOpacity onPress={() => setSelectedPost(null)}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalBody}>
          <View style={styles.postHeader}>
            <View style={styles.authorInfo}>
              <View style={styles.authorAvatar}>
                <Text style={styles.avatarText}>{post.author.split(' ').map(n => n[0]).join('')}</Text>
              </View>
              <View style={styles.authorDetails}>
                <Text style={styles.authorName}>{post.author}</Text>
                <Text style={styles.postTimestamp}>{post.timestamp}</Text>
              </View>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(post.type) + '20' }]}>
              <Ionicons name={getCategoryIcon(post.type) as any} size={12} color={getCategoryColor(post.type)} />
              <Text style={[styles.categoryText, { color: getCategoryColor(post.type) }]}>
                {post.type}
              </Text>
            </View>
          </View>

          <Text style={styles.modalPostTitle}>{post.content}</Text>
          <View style={styles.postTags}>
            {post.tags.map((tag, index) => (
              <View key={index} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => likePost(post.id)}
            >
              <Ionicons 
                name="heart" 
                size={16} 
                color="#EF4444" 
              />
              <Text style={styles.actionText}>{post.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={16} color="#6B7280" />
              <Text style={styles.actionText}>{post.comments}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={16} color="#6B7280" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>Comments</Text>
            <Text style={styles.noComments}>No comments yet. Be the first to comment!</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Community</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={styles.loadingCard} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowSidebar(true)} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="leaf" size={20} color="white" />
          </View>
          <Text style={styles.logoText}>Miraqua</Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchCommunityData}>
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search community posts..."
              placeholderTextColor="#6B7280"
              value={newPostText}
              onChangeText={setNewPostText}
            />
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['all', 'question', 'tip', 'achievement', 'general'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterButton, activeTab === filter && styles.activeFilterButton]}
                onPress={() => setActiveTab(filter as 'posts' | 'events')}
              >
                <Text style={[styles.filterText, activeTab === filter && styles.activeFilterText]}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* New Post */}
        <View style={styles.newPostContainer}>
          <TextInput
            style={styles.newPostInput}
            placeholder="Share something with the community..."
            placeholderTextColor="#6B7280"
            value={newPostText}
            onChangeText={setNewPostText}
            multiline
          />
          <TouchableOpacity
            style={[styles.postButton, !newPostText.trim() && styles.postButtonDisabled]}
            onPress={createPost}
            disabled={!newPostText.trim()}
          >
            <Ionicons name="send" size={16} color="white" />
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>

        {/* Posts */}
        <View style={styles.postsContainer}>
          {activeTab === 'posts' && (
            <>
              <Text style={styles.sectionTitle}>Recent Posts</Text>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
              {posts.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="people" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyText}>No posts found</Text>
                  <Text style={styles.emptySubtext}>Be the first to share something!</Text>
                </View>
              )}
            </>
          )}

          {activeTab === 'events' && (
            <>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
              {events.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyText}>No events found</Text>
                  <Text style={styles.emptySubtext}>Check back later for upcoming events!</Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Post Detail Modal */}
      {selectedPost && <PostDetailModal post={selectedPost} />}

      {/* Sidebar Navigation */}
      <SidebarNavigation
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
        navigation={navigation}
        currentRoute="Community"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#111827',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  createPostSection: {
    marginBottom: 24,
  },
  createPostCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  createButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#10B981',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: 'white',
  },
  postsSection: {
    marginBottom: 20,
  },
  eventsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  postCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  postTimestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    marginBottom: 8,
    lineHeight: 22,
  },
  postContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  postTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tagBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
  eventCard: {
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
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 20,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  eventAttendees: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  registerButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  registeredButton: {
    backgroundColor: '#F3F4F6',
  },
  registerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  registeredText: {
    color: '#6B7280',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  modalBody: {
    padding: 20,
  },
  modalPostTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
    lineHeight: 24,
  },
  modalPostContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    flex: 1,
    justifyContent: 'center',
  },
  modalActionText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 4,
  },
  commentsSection: {
    marginTop: 16,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  noComments: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    padding: 20,
  },
  loadingCard: {
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 16,
  },
  menuButton: {
    padding: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: 'white',
    marginLeft: 12,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  activeFilterButton: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activeFilterText: {
    color: 'white',
  },
  newPostContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  newPostInput: {
    fontSize: 14,
    color: 'white',
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  postButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  postButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  postsContainer: {
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 5,
  },
}); 