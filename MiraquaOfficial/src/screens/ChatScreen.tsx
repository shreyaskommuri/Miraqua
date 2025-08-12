import React, { useState, useEffect } from 'react';
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: "Hi! I'm your AI irrigation assistant. I can help you optimize watering schedules, diagnose plant issues, and provide expert gardening advice.",
      time: 'now'
    }
  ]);

  // Mock plot data
  const mockPlots: PlotData[] = [
    {
      id: 1,
      name: "Backyard Garden",
      crop: "Tomatoes",
      moisture: 65,
      temperature: 78,
      sunlight: 85,
      status: "healthy",
      nextWatering: "Tomorrow 6:00 AM",
      location: "North Side",
      waterUsage: 120,
      sensorStatus: "online",
      batteryLevel: 78,
      soilPh: 6.8,
      lastWatered: "Yesterday"
    },
    {
      id: 2,
      name: "Herb Garden",
      crop: "Basil",
      moisture: 45,
      temperature: 75,
      sunlight: 70,
      status: "needs attention",
      nextWatering: "Today 4:00 PM",
      location: "Kitchen Window",
      waterUsage: 45,
      sensorStatus: "online",
      batteryLevel: 65,
      soilPh: 7.2,
      lastWatered: "2 days ago"
    }
  ];

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

  const handlePlotSelection = (plotId: string) => {
    setSelectedPlotId(plotId);
    setShowPlotSelector(false);
    
    if (plotId === 'general') {
      setSelectedPlot(null);
    } else {
      const plot = mockPlots.find(p => p.id.toString() === plotId);
      setSelectedPlot(plot || null);
      
      // Add initial message about the selected plot
      if (plot) {
        const plotMessage: Message = {
          id: Date.now(),
          sender: 'bot',
          text: `I see you're asking about your ${plot.name}. Here's what I know: It's growing ${plot.crop} with ${plot.moisture}% soil moisture, ${plot.temperature}°F temperature, and ${plot.sunlight}% sunlight. The sensor battery is at ${plot.batteryLevel}% and pH is ${plot.soilPh}. How can I help optimize this plot?`,
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

  const handleSendMessage = (customMessage?: string) => {
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
      
      // Simulate AI response with plot context
      setTimeout(() => {
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
      }, 1000);
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
              <TouchableOpacity onPress={() => setShowPlotSelector(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
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
              
              {mockPlots.map((plot) => (
                <TouchableOpacity
                  key={plot.id}
                  style={[
                    styles.plotOption,
                    selectedPlotId === plot.id.toString() && styles.selectedPlotOption
                  ]}
                  onPress={() => handlePlotSelection(plot.id.toString())}
                >
                  <View style={styles.plotOptionContent}>
                    <Ionicons name="leaf" size={20} color="#10b981" />
                    <View style={styles.plotOptionText}>
                      <Text style={styles.plotOptionTitle}>{plot.name}</Text>
                      <Text style={styles.plotOptionSubtitle}>
                        {plot.crop} • {plot.moisture}% moisture • {plot.status}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
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
              placeholder={selectedPlot 
                ? `Ask about your ${selectedPlot.name}...` 
                : "Ask me anything about your garden..."
              }
              placeholderTextColor="#9CA3AF"
              value={message}
              onChangeText={setMessage}
              onSubmitEditing={() => handleSendMessage()}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
              onPress={() => handleSendMessage()}
              disabled={!message.trim()}
            >
              <Ionicons name="paper-plane" size={20} color="white" />
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
            placeholder={selectedPlot 
              ? `Ask about your ${selectedPlot.name}...` 
              : "Ask me anything about your garden..."
            }
            placeholderTextColor="#9CA3AF"
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={() => handleSendMessage()}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={() => handleSendMessage()}
            disabled={!message.trim()}
          >
            <Ionicons name="paper-plane" size={20} color="white" />
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