import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SidebarNavigation from './SidebarNavigation';

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

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

export default function ChatScreen({ navigation }: any) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: Date.now() + Math.random(),
      type: 'ai',
      content: "Hi! I'm your AI irrigation assistant. I can help you optimize watering schedules, diagnose plant issues, and provide expert gardening advice.",
      timestamp: new Date(),
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedPlotId, setSelectedPlotId] = useState<string>("general");
  const [showGardenStatus, setShowGardenStatus] = useState(true);
  const [showPlotSelector, setShowPlotSelector] = useState(false);

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

  const selectedPlot = selectedPlotId === "general" ? null : mockPlots.find(p => p.id.toString() === selectedPlotId);

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

  const handlePlotSelection = (plotId: string) => {
    console.log('Plot selected:', plotId);
    setSelectedPlotId(plotId);
    setShowPlotSelector(false);
    
    // Add a message about the selected plot
    if (plotId !== "general") {
      const plot = mockPlots.find(p => p.id.toString() === plotId);
      if (plot) {
        const plotMessage: Message = {
          id: Date.now() + Math.random(),
          type: 'ai',
          content: `I see you've selected ${plot.name}. This plot is growing ${plot.crop} with ${plot.moisture}% soil moisture, ${plot.temperature}°F temperature, and ${plot.sunlight}% sunlight. The sensor battery is at ${plot.batteryLevel}% and pH is ${plot.soilPh}. How can I help optimize this plot?`,
          timestamp: new Date(),
          suggestions: ["Water now", "Check health", "Adjust settings", "View schedule"]
        };
        setMessages(prev => [...prev, plotMessage]);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now() + Math.random(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      const aiMessage: Message = {
        id: Date.now() + Math.random(),
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    // Handle specific quick actions
    if (lowerInput.includes('water plants') || lowerInput.includes('water now')) {
      return {
        content: "I'll water your plants now. Based on current soil moisture levels, I'm applying 15 minutes of irrigation to all active plots. The system will automatically adjust the duration based on soil conditions and weather data.",
        suggestions: ["Check watering status", "Adjust duration", "Skip next watering"]
      };
    }
    
    if (lowerInput.includes('skip watering')) {
      return {
        content: "I've skipped the next scheduled watering for all plots. The system will resume normal irrigation after this cycle. Your plants will receive water during the following scheduled session.",
        suggestions: ["Resume watering", "Check schedule", "Adjust settings"]
      };
    }
    
    if (lowerInput.includes('plant health') || lowerInput.includes('check health')) {
      return {
        content: "Checking plant health across all plots... Your tomatoes show excellent growth with 85% sunlight absorption. The herb garden needs attention - soil pH is slightly high at 7.2. I recommend adjusting the irrigation schedule for the basil plants.",
        suggestions: ["View detailed report", "Adjust pH", "Optimize lighting"]
      };
    }
    
    if (lowerInput.includes('adjust')) {
      return {
        content: "I can help you adjust various settings. What would you like to modify? I can change watering schedules, adjust soil pH, modify light exposure, or optimize irrigation patterns.",
        suggestions: ["Watering schedule", "Soil pH", "Light settings", "Irrigation patterns"]
      };
    }
    
    if (selectedPlot) {
      if (lowerInput.includes('water')) {
        return {
          content: `Based on ${selectedPlot.name}'s current moisture level of ${selectedPlot.moisture}%, I ${selectedPlot.moisture < 50 ? 'recommend watering soon' : 'suggest waiting until tomorrow'}. The soil pH of ${selectedPlot.soilPh} is ${selectedPlot.soilPh > 7 ? 'slightly alkaline' : selectedPlot.soilPh < 6.5 ? 'slightly acidic' : 'optimal'} for ${selectedPlot.crop}.`,
          suggestions: ["Water now", "Skip watering", "Check schedule"]
        };
      } else if (lowerInput.includes('health') || lowerInput.includes('problem')) {
        return {
          content: `Your ${selectedPlot.name} shows ${selectedPlot.status} status. With ${selectedPlot.sunlight}% sunlight and ${selectedPlot.temperature}°F temperature, conditions are ${selectedPlot.temperature > 80 ? 'quite warm' : selectedPlot.temperature < 60 ? 'cool' : 'good'} for ${selectedPlot.crop}. ${selectedPlot.batteryLevel < 30 ? 'Note: The sensor battery is low and should be replaced soon.' : ''}`,
          suggestions: ["Check sensors", "Adjust settings", "View details"]
        };
      } else if (lowerInput.includes('schedule')) {
        return {
          content: `For ${selectedPlot.name}, the next watering is scheduled for ${selectedPlot.nextWatering}. Based on current moisture (${selectedPlot.moisture}%) and weather conditions, this timing looks ${selectedPlot.moisture > 70 ? 'possibly too frequent - consider extending the interval' : 'appropriate'}.`,
          suggestions: ["Adjust schedule", "Water now", "Skip next"]
        };
      }
    }
    
    if (lowerInput.includes('skip') && lowerInput.includes('tomorrow')) {
      return {
        content: "I'll skip watering tomorrow for your plots. The schedule has been updated and your plants will receive water the following day instead. This adjustment takes into account the current soil moisture and weather forecast.",
        suggestions: ["Undo this change", "Show updated schedule", "Skip for specific plot"]
      };
    }
    
    if (lowerInput.includes('weather') || lowerInput.includes('forecast')) {
      return {
        content: "The weather forecast shows partly cloudy skies with a 20% chance of rain tomorrow. Temperature will range from 68-76°F. Based on this, I recommend proceeding with the current watering schedule as natural precipitation is unlikely.",
        suggestions: ["Adjust for weather", "Show 7-day forecast", "Water now before rain"]
      };
    }
    
    if (lowerInput.includes('increase') || lowerInput.includes('more water')) {
      return {
        content: "I can increase the watering duration by 25% for your selected plots. This will add approximately 2-3 minutes to each watering session. Would you like me to apply this change?",
        suggestions: ["Confirm increase", "Decrease instead", "Set specific duration"]
      };
    }
    
    if (lowerInput.includes('when') && (lowerInput.includes('water') || lowerInput.includes('next'))) {
      return {
        content: "Your next scheduled watering is today at 6:00 AM for the Tomato Garden, and tomorrow at 5:30 AM for the Herb Patch. Both schedules are optimized based on current soil moisture and weather conditions.",
        suggestions: ["Change watering time", "Water now", "View full schedule"]
      };
    }
    
    return {
      content: "I understand you're asking about irrigation management. I can help you skip waterings, adjust schedules, change watering amounts, or provide information about your plots. What specific action would you like me to take?",
      suggestions: [
        "Skip next watering",
        "Show current schedule", 
        "Adjust water amount",
        "Check soil moisture"
      ]
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleQuickAction = (action: string) => {
    // Send the quick action as a user message
    const userMessage: Message = {
      id: Date.now() + Math.random(),
      type: 'user',
      content: action,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response based on the quick action
    setTimeout(() => {
      const aiResponse = generateAIResponse(action);
      const aiMessage: Message = {
        id: Date.now() + Math.random(),
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
          <View style={styles.statusIndicator}>
            <Ionicons name="wifi" size={16} color="#10b981" />
            <Text style={styles.statusText}>Online</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications" size={24} color="white" />
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
            onPress={() => {
              console.log('Plot selector pressed');
              setShowPlotSelector(true);
            }}
            activeOpacity={0.7}
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
                activeOpacity={0.7}
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
                  activeOpacity={0.7}
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

      {/* Messages */}
      <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.messagesContent}>
          {messages.map((message) => (
            <View key={message.id} style={[
              styles.messageContainer,
              message.type === 'user' ? styles.userMessage : styles.aiMessage
            ]}>
              <View style={styles.messageBubble}>
                <View style={styles.messageHeader}>
                  <View style={[
                    styles.messageAvatar,
                    message.type === 'user' ? styles.userAvatar : styles.aiAvatar
                  ]}>
                    <Ionicons 
                      name={message.type === 'user' ? 'person' : 'leaf'} 
                      size={16} 
                      color={message.type === 'user' ? '#3b82f6' : '#10b981'} 
                    />
                  </View>
                  <View style={[
                    styles.messageContent,
                    message.type === 'user' ? styles.userContent : styles.aiContent
                  ]}>
                    <Text style={[
                      styles.messageText,
                      message.type === 'user' ? styles.userText : styles.aiText
                    ]}>
                      {message.content}
                    </Text>
                    <Text style={[
                      styles.messageTime,
                      message.type === 'user' ? styles.userTime : styles.aiTime
                    ]}>
                      {formatTime(message.timestamp)}
                    </Text>
                  </View>
                </View>
                
                {message.suggestions && (
                  <View style={styles.suggestionsContainer}>
                    {message.suggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionBadge}
                        onPress={() => handleSuggestionClick(suggestion)}
                      >
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))}
          
          {isTyping && (
            <View style={styles.typingContainer}>
              <View style={styles.aiAvatar}>
                <Ionicons name="leaf" size={16} color="#10b981" />
              </View>
              <View style={styles.typingBubble}>
                <View style={styles.typingDots}>
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                </View>
              </View>
            </View>
          )}
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
                <Ionicons name="close" size={16} color="rgba(255, 255, 255, 0.7)" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Input Area */}
      <KeyboardAvoidingView 
        style={styles.inputContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.inputButton}>
            <Ionicons name="camera" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputButton}>
            <Ionicons name="mic" size={20} color="#6b7280" />
          </TouchableOpacity>
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder={selectedPlot 
                ? `Ask about your ${selectedPlot.name}...` 
                : "Ask me anything about your garden..."
              }
              placeholderTextColor="rgba(107, 114, 128, 0.7)"
              value={inputValue}
              onChangeText={setInputValue}
              multiline
              maxLength={500}
            />
          </View>
          <TouchableOpacity 
            style={[styles.sendButton, !inputValue.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!inputValue.trim()}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Sidebar Navigation */}
      <SidebarNavigation
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
        navigation={navigation}
        currentRoute="Chat"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111827',
  },
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#111827',
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#10b981',
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
    backgroundColor: '#ef4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  quickActionsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
  },
  quickActionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '500',
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  plotSelectorText: {
    fontSize: 12,
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
    paddingVertical: 6,
    flex: 1,
    minWidth: '22%',
  },
  quickActionText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
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
  messagesContainer: {
    flex: 1,
    backgroundColor: '#111827',
  },
  messagesContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  aiAvatar: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  messageContent: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  userContent: {
    backgroundColor: '#3b82f6',
  },
  aiContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: 'white',
  },
  aiText: {
    color: 'white',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  aiTime: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  suggestionBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  suggestionText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  typingBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  gardenStatusCard: {
    backgroundColor: '#1f2937',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  gardenStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  gardenStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  gardenStatusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gardenStatusInfo: {
    flex: 1,
  },
  gardenStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  gardenStatusSubtitle: {
    fontSize: 12,
    color: '#d1d5db',
  },
  gardenStatusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  closeStatusButton: {
    padding: 4,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    paddingBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  inputButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
    maxHeight: 100,
  },
  textInput: {
    fontSize: 14,
    color: 'white',
    padding: 0,
  },
  sendButton: {
    backgroundColor: '#10b981',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
}); 