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
}

interface ChatScreenProps {
  navigation: any;
}

export default function ChatScreen({ navigation }: ChatScreenProps) {
  const [message, setMessage] = useState('');
  const [showGardenStatus, setShowGardenStatus] = useState(true);
  const [selectedPlot, setSelectedPlot] = useState<PlotData | null>(null);
  const [selectedPlotId, setSelectedPlotId] = useState<string>('general');
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
      time: 'now'
    }
  ]);

  // Generate a session ID once per chat screen instance
  const chatSessionId = useRef(uuid.v4() as string).current;

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

  const quickActions = selectedPlot ? [
    "Water now",
    "Skip watering", 
    "Check health",
    "Adjust"
  ] : [
    "Water plants",
    "Skip watering", 
    "Plant health",
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

  const handlePlotSelection = (plotId: string) => {
    setSelectedPlotId(plotId);
    setShowPlotSelector(false);
    
    if (plotId === 'general') {
      setSelectedPlot(null);
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
        
        // Add initial message about the selected plot
        const plotMessage: Message = {
          id: Date.now(),
          sender: 'bot',
          text: `I see you've selected ${realPlot.name || 'a plot'}. I'll now provide personalized advice based on your actual plot data, weather conditions, and watering history. How can I help optimize this plot?`,
          time: 'now'
        };
        setMessages(prev => [...prev, plotMessage]);
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
        time: 'now'
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
        time: 'now'
      };
      setMessages(prev => [...prev, typingMessage]);
      
      try {
        // Call the real AI backend
        const response = await fetch('http://localhost:5050/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: messageToSend,
            plotId: selectedPlotId === 'general' ? 'default' : selectedPlotId,
            chat_session_id: chatSessionId,
            userId: userId
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
            time: 'now'
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
          time: 'now'
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
          <Ionicons name="menu" size={24} color="white" />
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
          <Text style={styles.quickActionsTitle}>Quick actions:</Text>
          <TouchableOpacity 
            style={styles.plotSelector}
            onPress={() => setShowPlotSelector(true)}
          >
            <Text style={styles.plotSelectorText}>
              {selectedPlot ? selectedPlot.name : "General Question"}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#6b7280" />
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
                    <Text style={styles.plotOptionTitle}>General Question</Text>
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
      <ScrollView style={styles.chatArea} showsVerticalScrollIndicator={false}>
        <View style={styles.messagesContainer}>
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                msg.sender === 'user' ? styles.userMessageRow : styles.botMessageRow
              ]}
            >
              <View style={styles.messageContent}>
                <View style={[
                  styles.avatar,
                  msg.sender === 'user' ? styles.userAvatar : styles.botAvatar
                ]}>
                  <Ionicons 
                    name={msg.sender === 'user' ? 'person' : 'leaf'} 
                    size={16} 
                    color="white" 
                  />
                </View>
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

      {/* Garden Status Card */}
      {showGardenStatus && (
        <View style={styles.gardenStatusCard}>
          <View style={styles.gardenStatusContent}>
            <View style={styles.gardenStatusLeft}>
              <View style={styles.gardenStatusIcon}>
                <Ionicons name="water" size={20} color="white" />
              </View>
              <View style={styles.gardenStatusInfo}>
                <Text style={styles.gardenStatusTitle}>
                  {selectedPlot ? `${selectedPlot.name} Status` : 'Garden Status'}
                </Text>
                <Text style={styles.gardenStatusSubtitle}>
                  {selectedPlot 
                    ? `${selectedPlot.status.charAt(0).toUpperCase() + selectedPlot.status.slice(1)} • Next watering: ${selectedPlot.nextWatering}`
                    : 'All plots monitored • AI optimization active'
                  }
                </Text>
              </View>
            </View>
            <View style={styles.gardenStatusRight}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>
                  {selectedPlot?.status === 'healthy' ? 'Optimal' : 'Monitoring'}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.closeStatusButton}
                onPress={() => setShowGardenStatus(false)}
              >
                <Ionicons name="close" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Input Area */}
          <View style={styles.inputArea}>
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
      )}
      
      {/* Input Area when garden status is hidden */}
      {!showGardenStatus && (
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
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#374151',
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
    borderRadius: 8,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  onlineText: {
    fontSize: 12,
    color: 'white',
    marginLeft: 4,
    fontWeight: '500',
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  quickActionsSection: {
    padding: 12,
    backgroundColor: '#1F2937',
  },
  quickActionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  plotSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minHeight: 28,
  },
  plotSelectorText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: '45%',
    alignItems: 'center',
  },
  quickActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plotSelectorModal: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
    borderWidth: 1,
    borderColor: '#374151',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  plotList: {
    padding: 16,
  },
  plotOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    minHeight: 56,
  },
  selectedPlotOption: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  plotOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  plotOptionText: {
    flex: 1,
  },
  plotOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    marginBottom: 2,
  },
  plotOptionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#111827',
  },
  messagesContainer: {
    padding: 20,
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
    maxWidth: '80%',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  userAvatar: {
    backgroundColor: '#3b82f6',
  },
  botAvatar: {
    backgroundColor: '#10b981',
  },
  messageBubble: {
    padding: 16,
    borderRadius: 20,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: '#3b82f6',
  },
  botBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
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
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  botTime: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  gardenStatusCard: {
    backgroundColor: '#1F2937',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  gardenStatusContent: {
    padding: 16,
  },
  gardenStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  gardenStatusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  gardenStatusInfo: {
    flex: 1,
  },
  gardenStatusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  gardenStatusSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  gardenStatusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  closeStatusButton: {
    padding: 8,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  standaloneInputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1F2937',
    gap: 12,
  },
  inputButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    color: 'white',
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
}); 