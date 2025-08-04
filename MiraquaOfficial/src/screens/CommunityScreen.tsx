import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CommunityPost {
  id: string;
  author: string;
  authorAvatar: string;
  title: string;
  content: string;
  category: 'question' | 'tip' | 'success' | 'general';
  likes: number;
  comments: number;
  timestamp: string;
  isLiked: boolean;
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
          authorAvatar: 'https://via.placeholder.com/40/10B981/FFFFFF?text=SJ',
          title: 'Best practices for tomato growing in dry climates?',
          content: 'I\'m having trouble with my tomatoes in this hot weather. Any tips for maintaining soil moisture without overwatering?',
          category: 'question',
          likes: 12,
          comments: 8,
          timestamp: '2 hours ago',
          isLiked: false
        },
        {
          id: '2',
          author: 'Mike Chen',
          authorAvatar: 'https://via.placeholder.com/40/3B82F6/FFFFFF?text=MC',
          title: 'Success story: 40% water savings with smart irrigation',
          content: 'After implementing the AI recommendations, I\'ve seen a significant reduction in water usage while maintaining crop health. Highly recommend!',
          category: 'success',
          likes: 24,
          comments: 15,
          timestamp: '1 day ago',
          isLiked: true
        },
        {
          id: '3',
          author: 'Emma Davis',
          authorAvatar: 'https://via.placeholder.com/40/F59E0B/FFFFFF?text=ED',
          title: 'Organic pest control methods that actually work',
          content: 'Here are the methods I\'ve found most effective: neem oil for aphids, diatomaceous earth for slugs, and companion planting with marigolds.',
          category: 'tip',
          likes: 18,
          comments: 12,
          timestamp: '3 days ago',
          isLiked: false
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
        ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
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
      authorAvatar: 'https://via.placeholder.com/40/8B5CF6/FFFFFF?text=YO',
      title: 'New Post',
      content: newPostText,
      category: 'general',
      likes: 0,
      comments: 0,
      timestamp: 'Just now',
      isLiked: false
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
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{post.author.split(' ').map(n => n[0]).join('')}</Text>
          </View>
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>{post.author}</Text>
            <Text style={styles.postTime}>{post.timestamp}</Text>
          </View>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(post.category) + '20' }]}>
          <Ionicons name={getCategoryIcon(post.category) as any} size={12} color={getCategoryColor(post.category)} />
          <Text style={[styles.categoryText, { color: getCategoryColor(post.category) }]}>
            {post.category}
          </Text>
        </View>
      </View>

      <Text style={styles.postTitle}>{post.title}</Text>
      <Text style={styles.postContent} numberOfLines={3}>
        {post.content}
      </Text>

      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => likePost(post.id)}
        >
          <Ionicons 
            name={post.isLiked ? 'heart' : 'heart-outline'} 
            size={16} 
            color={post.isLiked ? '#EF4444' : '#6B7280'} 
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
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{post.author.split(' ').map(n => n[0]).join('')}</Text>
              </View>
              <View style={styles.authorDetails}>
                <Text style={styles.authorName}>{post.author}</Text>
                <Text style={styles.postTime}>{post.timestamp}</Text>
              </View>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(post.category) + '20' }]}>
              <Ionicons name={getCategoryIcon(post.category) as any} size={12} color={getCategoryColor(post.category)} />
              <Text style={[styles.categoryText, { color: getCategoryColor(post.category) }]}>
                {post.category}
              </Text>
            </View>
          </View>

          <Text style={styles.modalPostTitle}>{post.title}</Text>
          <Text style={styles.modalPostContent}>{post.content}</Text>

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => likePost(post.id)}
            >
              <Ionicons 
                name={post.isLiked ? 'heart' : 'heart-outline'} 
                size={16} 
                color={post.isLiked ? '#EF4444' : '#6B7280'} 
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
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchCommunityData}>
          <Ionicons name="refresh" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Create Post */}
        <View style={styles.createPostSection}>
          <View style={styles.createPostCard}>
            <TextInput
              style={styles.postInput}
              placeholder="Share your farming experience, ask questions, or share tips..."
              value={newPostText}
              onChangeText={setNewPostText}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity
              style={[styles.createButton, newPostText.trim().length === 0 && styles.createButtonDisabled]}
              onPress={createPost}
              disabled={newPostText.trim().length === 0}
            >
              <Ionicons name="send" size={16} color="white" />
              <Text style={styles.createButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
              Community Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'events' && styles.activeTab]}
            onPress={() => setActiveTab('events')}
          >
            <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
              Events
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content based on active tab */}
        {activeTab === 'posts' && (
          <View style={styles.postsSection}>
            <Text style={styles.sectionTitle}>Recent Posts</Text>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </View>
        )}

        {activeTab === 'events' && (
          <View style={styles.eventsSection}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Post Detail Modal */}
      {selectedPost && <PostDetailModal post={selectedPost} />}
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
  headerRight: {
    width: 36,
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
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
    color: '#1F2937',
    marginBottom: 2,
  },
  postTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalBody: {
    padding: 20,
  },
  modalPostTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  modalPostContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    height: 120,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 16,
  },
}); 