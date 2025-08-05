import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
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

export default function ChatScreen({ navigation }: any) {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: "Hi! I'm your AI irrigation assistant. I can help you manage your watering schedules, adjust settings, and answer questions about your plots. Try commands like 'skip watering tomorrow' or 'increase water for tomato garden'.",
      timestamp: new Date(),
      suggestions: [
        "Skip watering tomorrow",
        "Show me the weather forecast",
        "Increase water for tomato garden",
        "When should I water next?"
      ]
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
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
        id: messages.length + 2,
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
          <TouchableOpacity onPress={() => setShowChat(true)} style={styles.chatButton}>
            <Ionicons name="chatbubbles" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeIcon}>
            <Ionicons name="leaf" size={32} color="#10b981" />
          </View>
          <Text style={styles.welcomeTitle}>AI Garden Assistant</Text>
          <Text style={styles.welcomeSubtitle}>
            Get help with watering schedules, plot management, and garden optimization
          </Text>
          <TouchableOpacity 
            style={styles.startChatButton}
            onPress={() => setShowChat(true)}
          >
            <Ionicons name="chatbubbles" size={20} color="white" />
            <Text style={styles.startChatText}>Start Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Quick Commands</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => handleSuggestionClick("Skip watering today")}
            >
              <Ionicons name="calendar" size={20} color="#10b981" />
              <Text style={styles.quickActionText}>Skip watering today</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => handleSuggestionClick("Water now")}
            >
              <Ionicons name="water" size={20} color="#3b82f6" />
              <Text style={styles.quickActionText}>Water now</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => handleSuggestionClick("Show schedule")}
            >
              <Ionicons name="settings" size={20} color="#f59e0b" />
              <Text style={styles.quickActionText}>Show schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => handleSuggestionClick("Weather forecast")}
            >
              <Ionicons name="partly-sunny" size={20} color="#8b5cf6" />
              <Text style={styles.quickActionText}>Weather forecast</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Chat Modal */}
      <Modal
        visible={showChat}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <StatusBar barStyle="light-content" />
          
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <View style={styles.modalHeaderIcon}>
                <Ionicons name="leaf" size={24} color="white" />
              </View>
              <View>
                <Text style={styles.modalHeaderTitle}>AI Assistant</Text>
                <Text style={styles.modalHeaderSubtitle}>Smart irrigation commands & help</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setShowChat(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="rgba(255, 255, 255, 0.7)" />
            </TouchableOpacity>
          </View>

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

          {/* Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Type a command like 'skip watering tomorrow'..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={inputValue}
                onChangeText={setInputValue}
                multiline
                maxLength={500}
              />
              <TouchableOpacity 
                style={[styles.sendButton, !inputValue.trim() && styles.sendButtonDisabled]}
                onPress={handleSendMessage}
                disabled={!inputValue.trim()}
              >
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Sidebar Navigation */}
      <SidebarNavigation
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
        navigation={navigation}
        currentRoute="Chat"
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
  },
  chatButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  welcomeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  startChatButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  startChatText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  quickActions: {
    gap: 16,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: '48%',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#111827',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#111827',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  modalHeaderSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  closeButton: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 16,
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
    borderRadius: 12,
    padding: 12,
  },
  userContent: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
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
    color: 'rgba(255, 255, 255, 0.5)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  suggestionText: {
    fontSize: 12,
    color: 'white',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  typingBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
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
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#111827',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: 'white',
    maxHeight: 100,
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