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
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Assistant</Text>
        <TouchableOpacity onPress={() => setShowChat(true)} style={styles.chatButton}>
          <Ionicons name="chatbubbles" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
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
            <Ionicons name="chatbubbles" size={20} color="#ffffff" />
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
      </View>

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
          <StatusBar barStyle="dark-content" />
          
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <View style={styles.modalHeaderIcon}>
                <Ionicons name="leaf" size={24} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.modalHeaderTitle}>AI Assistant</Text>
                <Text style={styles.modalHeaderSubtitle}>Smart irrigation commands & help</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setShowChat(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
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
                      <View style={[styles.typingDot, { animationDelay: '0s' }]} />
                      <View style={[styles.typingDot, { animationDelay: '0.1s' }]} />
                      <View style={[styles.typingDot, { animationDelay: '0.2s' }]} />
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
                placeholderTextColor="#9ca3af"
                value={inputValue}
                onChangeText={setInputValue}
                multiline
              />
              <TouchableOpacity 
                style={[
                  styles.sendButton,
                  !inputValue.trim() && styles.sendButtonDisabled
                ]}
                onPress={handleSendMessage}
                disabled={!inputValue.trim()}
              >
                <Ionicons name="send" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.quickSuggestions}>
              <TouchableOpacity 
                style={styles.quickSuggestion}
                onPress={() => handleSuggestionClick("Skip watering today")}
              >
                <Ionicons name="calendar" size={12} color="#10b981" />
                <Text style={styles.quickSuggestionText}>Skip watering today</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickSuggestion}
                onPress={() => handleSuggestionClick("Water now")}
              >
                <Ionicons name="water" size={12} color="#3b82f6" />
                <Text style={styles.quickSuggestionText}>Water now</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickSuggestion}
                onPress={() => handleSuggestionClick("Show schedule")}
              >
                <Ionicons name="settings" size={12} color="#f59e0b" />
                <Text style={styles.quickSuggestionText}>Show schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  chatButton: {
    backgroundColor: '#10b981',
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 24,
  },
  welcomeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#6b7280',
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
    color: '#ffffff',
  },
  quickActions: {
    gap: 16,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: '48%',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
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
    color: '#10b981',
  },
  modalHeaderSubtitle: {
    fontSize: 12,
    color: '#10b981',
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
    backgroundColor: '#dbeafe',
  },
  aiAvatar: {
    backgroundColor: '#f0fdf4',
  },
  messageContent: {
    borderRadius: 12,
    padding: 12,
    maxWidth: '85%',
  },
  userContent: {
    backgroundColor: '#3b82f6',
  },
  aiContent: {
    backgroundColor: '#f3f4f6',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#ffffff',
  },
  aiText: {
    color: '#1f2937',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  userTime: {
    color: '#dbeafe',
  },
  aiTime: {
    color: '#6b7280',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  suggestionBadge: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9ca3af',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    padding: 16,
    gap: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    maxHeight: 100,
    textAlignVertical: 'top',
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
    backgroundColor: '#d1d5db',
  },
  quickSuggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  quickSuggestionText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
}); 