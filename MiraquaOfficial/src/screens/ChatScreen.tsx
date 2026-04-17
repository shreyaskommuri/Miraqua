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
      text: "Hi! I'm Miraqua. I manage your irrigation automatically — but you're always in control. Ask me to adjust schedules, explain any decision, or give you a forecast.",
      time: 'now',
      plotId: null // General message
    }
  ]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: "Hi! I'm Miraqua. I manage your irrigation automatically — but you're always in control. Ask me to adjust schedules, explain any decision, or give you a forecast.",
      time: 'now',
      plotId: null // General message
    }
  ]);

  const chatSessionId = useRef(uuid.v4() as string).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(timer);
  }, [filteredMessages]);

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
          text: "I'm now in general mode. Ask me about any of your plots, upcoming schedules, or irrigation decisions. What would you like to know?",
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
            current_date: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })(),
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
        let botResponse = "I understand. Let me analyze your plot data and provide personalized recommendations.";
        
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.botAvatarSmall}>
            <Ionicons name="leaf" size={14} color="white" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Miraqua AI</Text>
            {selectedPlot && (
              <Text style={styles.headerSubtitle}>{selectedPlot.name} · {selectedPlot.crop}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.plotSelectorBtn} onPress={() => setShowPlotSelector(true)}>
          <Text style={styles.plotSelectorBtnText} numberOfLines={1}>
            {selectedPlot ? selectedPlot.name : 'All Plots'}
          </Text>
          <Ionicons name="chevron-down" size={13} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>

      {/* Context banner when navigated from a plot */}
      {selectedPlot && plotIdFromRoute && (
        <View style={styles.contextBanner}>
          <View style={styles.contextBannerDot} />
          <Text style={styles.contextBannerText}>
            Talking about <Text style={styles.contextBannerPlot}>{selectedPlot.name}</Text> — {selectedPlot.crop}
          </Text>
        </View>
      )}

      {/* Quick Action Chips */}
      <View style={styles.quickActionsSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
          {[
            { label: 'Water today?', icon: 'water-outline' },
            { label: 'Skip day', icon: 'calendar-outline' },
            { label: 'Health check', icon: 'leaf-outline' },
            { label: 'This week', icon: 'stats-chart-outline' },
            { label: 'Adjust schedule', icon: 'settings-outline' },
          ].map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickActionChip}
              onPress={() => handleQuickAction(action.label)}
            >
              <Ionicons name={action.icon as any} size={13} color="#1aa179" />
              <Text style={styles.quickActionChipText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
                  <Ionicons name="refresh" size={20} color="#1aa179" />
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
                  <Ionicons name="leaf" size={20} color="#1aa179" />
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
                      <Ionicons name="leaf" size={20} color="#1aa179" />
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

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.messagesContainer}>
          {filteredMessages.map((msg) => {
            const isTyping = msg.text === '🤖 AI is thinking...';
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  msg.sender === 'user' ? styles.userMessageRow : styles.botMessageRow,
                ]}
              >
                {msg.sender === 'bot' && (
                  <View style={styles.botAvatarMsg}>
                    <Ionicons name="leaf" size={12} color="white" />
                  </View>
                )}
                <View style={[
                  styles.messageBubble,
                  msg.sender === 'user' ? styles.userBubble : styles.botBubble,
                  isTyping && styles.typingBubble,
                ]}>
                  <Text style={[styles.messageText, msg.sender === 'user' ? styles.userText : styles.botText]}>
                    {isTyping ? '● ● ●' : msg.text}
                  </Text>
                  {!isTyping && (
                    <Text style={[styles.messageTime, msg.sender === 'user' ? styles.userTime : styles.botTime]}>
                      {msg.time}
                    </Text>
                  )}
                </View>
                {msg.sender === 'user' && (
                  <View style={styles.userAvatarMsg}>
                    <Ionicons name="person" size={12} color="white" />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Input */}
      <View style={styles.inputArea}>
        <TextInput
          style={styles.textInput}
          placeholder={
            isAIProcessing
              ? 'Miraqua is thinking...'
              : selectedPlot
              ? `Ask about ${selectedPlot.name}...`
              : 'Ask Miraqua anything...'
          }
          placeholderTextColor="#6B7280"
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={() => handleSendMessage()}
          editable={!isAIProcessing}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, (!message.trim() || isAIProcessing) && styles.sendButtonDisabled]}
          onPress={() => handleSendMessage()}
          disabled={!message.trim() || isAIProcessing}
        >
          <Ionicons name="paper-plane" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  botAvatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1aa179',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  plotSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.11)',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 7,
    maxWidth: 130,
  },
  plotSelectorBtnText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    flexShrink: 1,
  },
  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(26,161,121,0.07)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26,161,121,0.14)',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  contextBannerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1aa179',
  },
  contextBannerText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  contextBannerPlot: {
    color: '#1aa179',
    fontWeight: '600',
  },
  quickActionsSection: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  quickActionsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  quickActionChipText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  chatArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 12,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  botMessageRow: {
    justifyContent: 'flex-start',
  },
  botAvatarMsg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1aa179',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    flexShrink: 0,
  },
  userAvatarMsg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    flexShrink: 0,
  },
  messageBubble: {
    maxWidth: '74%',
    padding: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#1aa179',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderBottomLeftRadius: 4,
  },
  typingBubble: {
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  userText: {
    color: 'white',
  },
  botText: {
    color: 'rgba(255,255,255,0.9)',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 6,
  },
  userTime: {
    color: 'rgba(255,255,255,0.6)',
  },
  botTime: {
    color: 'rgba(255,255,255,0.35)',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    gap: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    color: 'white',
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1aa179',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.12)',
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
    backgroundColor: 'rgba(26, 161, 121, 0.12)',
    borderWidth: 2,
    borderColor: '#1aa179',
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
}); 