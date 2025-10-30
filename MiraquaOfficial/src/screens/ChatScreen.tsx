import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import uuid from 'react-native-uuid';

interface PlotData {
  id: number;
  name: string;
  crop: string;
  moisture: number;
  temperature: number;
  sunlight: number;
  status: string;
  nextWatering: string;
  location: string;
  waterUsage: number;
  sensorStatus: string;
  batteryLevel: number;
  soilPh: number;
  lastWatered: string;
}

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  plotId?: string | null;
}

interface ChatScreenProps {
  navigation: any;
  route?: any;
}

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
  const plotIdFromRoute = route?.params?.plotId;
  
  const [message, setMessage] = useState('');
  const [selectedPlot, setSelectedPlot] = useState<PlotData | null>(null);
  const [selectedPlotId, setSelectedPlotId] = useState<string>(plotIdFromRoute || 'general');
  const [showPlotSelector, setShowPlotSelector] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [realPlots, setRealPlots] = useState<any[]>([]);
  const [isLoadingPlots, setIsLoadingPlots] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: "Hi! I'm your AI irrigation assistant. I can help you optimize watering schedules, diagnose plant issues, and provide expert gardening advice.",
      time: 'now',
      plotId: null // General message
    }
  ]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: "Hi! I'm your AI irrigation assistant. I can help you optimize watering schedules, diagnose plant issues, and provide expert gardening advice.",
      time: 'now',
      plotId: null // General message
    }
  ]);

  // Generate a session ID once per chat screen instance
  const chatSessionId = useRef(uuid.v4() as string).current;

  // ScrollView ref for auto-scrolling to bottom
  const scrollViewRef = useRef<ScrollView>(null);

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { supabase } = await import('../utils/supabase');
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Failed to get user:', error);
      }
    };
    getCurrentUser();
  }, []);

  // Load previous chat history for current plot
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!userId) return;

      try {
        console.log(`📚 Loading chat history for user=${userId}, plot=${selectedPlotId}`);
        const response = await fetch('http://localhost:5050/get_chat_log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            plot_id: selectedPlotId === 'general' ? 'general' : selectedPlotId
          })
        });

        if (response.ok) {
          const history = await response.json();
          if (history && history.length > 0) {
            // Convert backend format to frontend format
            const loadedMessages = history.map((msg: any, index: number) => ({
              id: index + 2, // Start after welcome message
              sender: msg.sender,
              text: msg.text,
              time: new Date(msg.timestamp).toLocaleTimeString(),
              plotId: selectedPlotId === 'general' ? null : selectedPlotId
            }));

            // Append loaded messages after welcome message
            setMessages(prev => [...prev, ...loadedMessages]);
            console.log(`✅ Loaded ${loadedMessages.length} previous messages`);
          }
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };

    loadChatHistory();
  }, [userId, selectedPlotId]);

  // Filter messages based on selected plot
  useEffect(() => {
    if (selectedPlotId === 'general') {
      // Show general messages (plotId is null or undefined)
      setFilteredMessages(messages.filter(msg => !msg.plotId));
    } else {
      // Show messages for the specific plot
      setFilteredMessages(messages.filter(msg => msg.plotId === selectedPlotId));
    }
  }, [selectedPlotId, messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [filteredMessages]);

  const quickActions = selectedPlot ? [
    "Water",
    "Skip", 
    "Health",
    "Adjust"
  ] : [
    "Water",
    "Skip", 
    "Health",
    "Adjust"
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  // Fetch real plots from your database
  const fetchRealPlots = async () => {
    setIsLoadingPlots(true);
    try {
      const { getPlots } = await import('../api/plots');
      const result = await getPlots();
      if (result.success && result.plots) {
        setRealPlots(result.plots);
      }
    } catch (error) {
      console.error('❌ Error fetching plots:', error);
    } finally {
      setIsLoadingPlots(false);
    }
  };

  // Load plots when component mounts
  useEffect(() => {
    fetchRealPlots();
  }, []);

  // Auto-select plot when opened from a specific plot
  useEffect(() => {
    if (plotIdFromRoute && plotIdFromRoute !== 'general' && realPlots.length > 0) {
      // Auto-select the plot when opened from plot details
      const realPlot = realPlots.find(p => p.id === plotIdFromRoute);
      if (realPlot) {
        setSelectedPlot({
          id: plotIdFromRoute,
          name: realPlot.name || `Plot ${plotIdFromRoute.slice(0, 8)}`,
          crop: realPlot.crop || "Unknown",
          moisture: realPlot.moisture || 0,
          temperature: realPlot.temperature || 0,
          sunlight: realPlot.sunlight || 0,
          status: realPlot.status || "unknown",
          nextWatering: realPlot.next_watering || "Unknown",
          location: realPlot.location || "Unknown",
          waterUsage: realPlot.water_usage || 0,
          sensorStatus: realPlot.sensor_status || "unknown",
          batteryLevel: realPlot.battery_level || 0,
          soilPh: realPlot.soil_ph || 0,
          lastWatered: realPlot.last_watered || "Unknown"
        });
        
        // Add initial message about the selected plot (only once)
        const hasPlotMessage = messages.some(msg => msg.plotId === plotIdFromRoute && msg.sender === 'bot');
        if (!hasPlotMessage) {
          const plotMessage: Message = {
            id: Date.now(),
            sender: 'bot',
            text: `I see you've selected ${realPlot.name || 'a plot'}. I'll now provide personalized advice based on your actual plot data, weather conditions, and watering history. How can I help optimize this plot?`,
            time: 'now',
            plotId: realPlot.id
          };
          setMessages(prev => [...prev, plotMessage]);
        }
      }
    }
  }, [plotIdFromRoute, realPlots.length, selectedPlotId]);

  const handlePlotSelection = (plotId: string) => {
    // Update the selected plot ID
    setSelectedPlotId(plotId);
    setShowPlotSelector(false);
    
    if (plotId === 'general') {
      setSelectedPlot(null);
      // Check if we already have a general mode message
      const hasGeneralMessage = messages.some(msg => msg.plotId === null && msg.sender === 'bot');
      if (!hasGeneralMessage) {
        // Add a message when switching to general mode
        const generalMessage: Message = {
          id: Date.now(),
          sender: 'bot',
          text: "I'm now in general mode. I can help you with questions about all your plots, general gardening advice, or answer any irrigation-related questions. What would you like to know?",
          time: 'now',
          plotId: null
        };
        setMessages(prev => [...prev, generalMessage]);
      }
    } else {
      // Find the real plot from the fetched plots
      const realPlot = realPlots.find(p => p.id === plotId);
      if (realPlot) {
        setSelectedPlot({
          id: plotId,
          name: realPlot.name || `Plot ${plotId.slice(0, 8)}`,
          crop: realPlot.crop || "Unknown",
          moisture: realPlot.moisture || 0,
          temperature: realPlot.temperature || 0,
          sunlight: realPlot.sunlight || 0,
          status: realPlot.status || "unknown",
          nextWatering: realPlot.next_watering || "Unknown",
          location: realPlot.location || "Unknown",
          waterUsage: realPlot.water_usage || 0,
          sensorStatus: realPlot.sensor_status || "unknown",
          batteryLevel: realPlot.battery_level || 0,
          soilPh: realPlot.soil_ph || 0,
          lastWatered: realPlot.last_watered || "Unknown"
        });
        
        // Check if we already have a message for this plot
        const hasPlotMessage = messages.some(msg => msg.plotId === plotId);
        if (!hasPlotMessage) {
          // Add initial message about the selected plot
          const plotMessage: Message = {
            id: Date.now(),
            sender: 'bot',
            text: `I see you've selected ${realPlot.name || 'a plot'}. I'll now provide personalized advice based on your actual plot data, weather conditions, and watering history. How can I help optimize this plot?`,
            time: 'now',
            plotId: realPlot.id
          };
          setMessages(prev => [...prev, plotMessage]);
        }
      }
    }
  };

  const handleQuickAction = (action: string) => {
    setMessage(action);
    handleSendMessage(action);
  };

  const handleSendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || message;
    if (messageToSend.trim()) {
      const newMessage: Message = {
        id: Date.now(),
        sender: 'user',
        text: messageToSend,
        time: 'now',
        plotId: selectedPlotId === 'general' ? null : selectedPlotId
      };
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      // Set AI processing state
      setIsAIProcessing(true);
      
      // Add typing indicator
      const typingMessage: Message = {
        id: Date.now() + 1,
        sender: 'bot',
        text: '🤖 AI is thinking...',
        time: 'now',
        plotId: selectedPlotId === 'general' ? null : selectedPlotId
      };
      setMessages(prev => [...prev, typingMessage]);
      
      try {
        // Call the real AI backend
        const { environment } = await import('../config/environment');
        const response = await fetch(`${environment.apiUrl}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: messageToSend,
            plotId: selectedPlotId === 'general' ? null : selectedPlotId,
            chat_session_id: chatSessionId,
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Remove typing indicator and add real AI response
          setMessages(prev => prev.filter(msg => msg.text !== '🤖 AI is thinking...'));
          
          const aiMessage: Message = {
            id: Date.now() + 1,
            sender: 'bot',
            text: data.reply || 'I received your message but couldn\'t generate a response. Please try again.',
            time: 'now',
            plotId: selectedPlotId === 'general' ? null : selectedPlotId
          };
          setMessages(prev => [...prev, aiMessage]);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error('❌ AI chat error:', error);
        
        // Remove typing indicator
        setMessages(prev => prev.filter(msg => msg.text !== '🤖 AI is thinking...'));
        
        // Fallback to smart mock response
        let botResponse = "I understand your concern. Let me analyze your garden data and provide personalized recommendations.";
        
        if (selectedPlot) {
          if (messageToSend.toLowerCase().includes('water')) {
            botResponse = `Based on ${selectedPlot.name}'s current moisture level of ${selectedPlot.moisture}%, I ${selectedPlot.moisture < 50 ? 'recommend watering soon' : 'suggest waiting until tomorrow'}. The soil pH of ${selectedPlot.soilPh} is ${selectedPlot.soilPh > 7 ? 'slightly alkaline' : selectedPlot.soilPh < 6.5 ? 'slightly acidic' : 'optimal'} for ${selectedPlot.crop}.`;
          } else if (messageToSend.toLowerCase().includes('health') || messageToSend.toLowerCase().includes('problem')) {
            botResponse = `Your ${selectedPlot.name} shows ${selectedPlot.status} status. With ${selectedPlot.sunlight}% sunlight and ${selectedPlot.temperature}°F temperature, conditions are ${selectedPlot.temperature > 80 ? 'quite warm' : selectedPlot.temperature < 60 ? 'cool' : 'good'} for ${selectedPlot.crop}. ${selectedPlot.batteryLevel < 30 ? 'Note: The sensor battery is low and should be replaced soon.' : ''}`;
          } else if (messageToSend.toLowerCase().includes('schedule')) {
            botResponse = `For ${selectedPlot.name}, the next watering is scheduled for ${selectedPlot.nextWatering}. Based on current moisture (${selectedPlot.moisture}%) and weather conditions, this timing looks ${selectedPlot.moisture > 70 ? 'possibly too frequent - consider extending the interval' : 'appropriate'}.`;
          }
        }
        
        const aiMessage: Message = {
          id: Date.now() + 1,
          sender: 'bot',
          text: botResponse,
          time: 'now',
          plotId: selectedPlotId === 'general' ? null : selectedPlotId
        };
        setMessages(prev => [...prev, aiMessage]);
      } finally {
        setIsAIProcessing(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.menuButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="leaf" size={20} color="white" />
          </View>
          <Text style={styles.logoText}>Miraqua</Text>
        </View>
        
        <View style={styles.headerRight}>
          <View style={styles.onlineStatus}>
            <Ionicons name="wifi" size={16} color="white" />
            <Text style={styles.onlineText}>Online</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={20} color="white" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions Section */}
      <View style={styles.quickActionsSection}>
        <View style={styles.quickActionsHeader}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <TouchableOpacity 
            style={styles.plotSelector}
            onPress={() => setShowPlotSelector(true)}
          >
            <Text style={styles.plotSelectorText}>
              {selectedPlot ? selectedPlot.name : "General Info"}
            </Text>
            <Ionicons name="chevron-down" size={16} color="rgba(255, 255, 255, 0.7)" />
          </TouchableOpacity>
        </View>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickActionButton}
              onPress={() => handleQuickAction(action)}
            >
              <Text style={styles.quickActionText}>{action}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Plot Selector Modal */}
      <Modal
        visible={showPlotSelector}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPlotSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.plotSelectorModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Plot</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity 
                  style={{ marginRight: 16, padding: 8 }}
                  onPress={fetchRealPlots}
                >
                  <Ionicons name="refresh" size={20} color="#10b981" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowPlotSelector(false)}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={styles.plotList}>
              <TouchableOpacity
                style={[
                  styles.plotOption,
                  selectedPlotId === "general" && styles.selectedPlotOption
                ]}
                onPress={() => handlePlotSelection("general")}
              >
                <View style={styles.plotOptionContent}>
                  <Ionicons name="leaf" size={20} color="#10b981" />
                  <View style={styles.plotOptionText}>
                    <Text style={styles.plotOptionTitle}>General Info</Text>
                    <Text style={styles.plotOptionSubtitle}>Ask about all plots</Text>
                  </View>
                </View>
              </TouchableOpacity>
              
              {isLoadingPlots ? (
                <View style={styles.plotOption}>
                  <View style={styles.plotOptionContent}>
                    <Ionicons name="hourglass" size={20} color="#6b7280" />
                    <View style={styles.plotOptionText}>
                      <Text style={styles.plotOptionTitle}>Loading plots...</Text>
                      <Text style={styles.plotOptionSubtitle}>Please wait</Text>
                    </View>
                  </View>
                </View>
              ) : realPlots.length > 0 ? (
                realPlots.map((plot) => (
                  <TouchableOpacity
                    key={plot.id}
                    style={[
                      styles.plotOption,
                      selectedPlotId === plot.id && styles.selectedPlotOption
                    ]}
                    onPress={() => handlePlotSelection(plot.id)}
                  >
                    <View style={styles.plotOptionContent}>
                      <Ionicons name="leaf" size={20} color="#10b981" />
                      <View style={styles.plotOptionText}>
                        <Text style={styles.plotOptionTitle}>{plot.name || `Plot ${plot.id.slice(0, 8)}`}</Text>
                        <Text style={styles.plotOptionSubtitle}>
                          {plot.crop || 'Unknown crop'} • {plot.area || 0}m²
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.plotOption}>
                  <View style={styles.plotOptionContent}>
                    <Ionicons name="alert-circle" size={20} color="#ef4444" />
                    <View style={styles.plotOptionText}>
                      <Text style={styles.plotOptionTitle}>No plots found</Text>
                      <Text style={styles.plotOptionSubtitle}>Create a plot first</Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Messages - Scrollable Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.messagesContainer}>
          {filteredMessages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                msg.sender === 'user' ? styles.userMessageRow : styles.botMessageRow
              ]}
            >
              <View style={styles.messageContent}>
                {msg.sender === 'user' && (
                  <View style={[styles.avatar, styles.userAvatar]}>
                    <Ionicons name="person" size={16} color="white" />
                  </View>
                )}
                <View style={[
                  styles.messageBubble,
                  msg.sender === 'user' ? styles.userBubble : styles.botBubble
                ]}>
                  <Text style={[
                    styles.messageText,
                    msg.sender === 'user' ? styles.userText : styles.botText
                  ]}>
                    {msg.text}
                  </Text>
                  <Text style={[
                    styles.messageTime,
                    msg.sender === 'user' ? styles.userTime : styles.botTime
                  ]}>
                    {msg.time}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Input Area */}
      <View style={styles.standaloneInputArea}>
        <TouchableOpacity style={styles.inputButton}>
          <Ionicons name="camera" size={20} color="#6b7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.inputButton}>
          <Ionicons name="mic" size={20} color="#6b7280" />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder={isAIProcessing 
            ? "AI is thinking..." 
            : selectedPlot 
              ? `Ask about your ${selectedPlot.name}...` 
              : "Ask me anything about your garden..."
          }
          placeholderTextColor="#9CA3AF"
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={() => handleSendMessage()}
          editable={!isAIProcessing}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={() => handleSendMessage()}
          disabled={!message.trim() || isAIProcessing}
        >
          {isAIProcessing ? (
            <Ionicons name="hourglass" size={20} color="white" />
          ) : (
            <Ionicons name="paper-plane" size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Cleaner dark background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingTop: 60,
    backgroundColor: '#1E293B', // Subtle header background
  },
  menuButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  onlineText: {
    fontSize: 13,
    color: '#10B981',
    marginLeft: 6,
    fontWeight: '600',
  },
  notificationButton: {
    position: 'relative',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  quickActionsSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#0F172A',
  },
  quickActionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 0.3,
  },
  plotSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 40,
  },
  plotSelectorText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickActionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 12,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plotSelectorModal: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    width: '85%',
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.3,
  },
  plotList: {
    padding: 24,
  },
  plotOption: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 64,
  },
  selectedPlotOption: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  plotOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  plotOptionText: {
    flex: 1,
  },
  plotOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  plotOptionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 120, // Extra padding to prevent content being cut off by input bar
  },
  messageRow: {
    marginBottom: 16,
  },
  userMessageRow: {
    alignItems: 'flex-end',
  },
  botMessageRow: {
    alignItems: 'flex-start',
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: '90%',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    backgroundColor: '#3B82F6',
  },
  botAvatar: {
    backgroundColor: '#10B981',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    flexShrink: 1,
  },
  userBubble: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 8,
    marginLeft: 8,
  },
  botBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderBottomLeftRadius: 8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    flexShrink: 1,
  },
  userText: {
    color: 'white',
  },
  botText: {
    color: 'white',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  botTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  standaloneInputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 30, // Increased for safe area and to prevent overlap
    backgroundColor: '#1E293B',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    minHeight: 48,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowOpacity: 0,
    elevation: 0,
  },
}); 