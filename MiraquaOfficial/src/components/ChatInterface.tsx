
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal, Alert } from "react-native";

interface ChatInterfaceProps {
  onClose: () => void;
  visible: boolean;
}

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const ChatInterface = ({ onClose, visible }: ChatInterfaceProps) => {
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
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>🤖</Text>
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title}>AI Assistant</Text>
                <Text style={styles.subtitle}>Smart irrigation commands & help</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.messagesContainer}>
            {messages.map((message) => (
              <View key={message.id} style={[
                styles.messageContainer,
                message.type === 'user' ? styles.userMessage : styles.aiMessage
              ]}>
                <View style={[
                  styles.messageBubble,
                  message.type === 'user' ? styles.userBubble : styles.aiBubble
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
            ))}
            
            {isTyping && (
              <View style={styles.typingContainer}>
                <View style={styles.typingBubble}>
                  <View style={styles.typingDots}>
                    <View style={[styles.dot, styles.dot1]} />
                    <View style={[styles.dot, styles.dot2]} />
                    <View style={[styles.dot, styles.dot3]} />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Type a command like 'skip watering tomorrow'..."
                value={inputValue}
                onChangeText={setInputValue}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendButton, !inputValue.trim() && styles.sendButtonDisabled]}
                onPress={handleSendMessage}
                disabled={!inputValue.trim()}
              >
                <Text style={styles.sendButtonText}>➤</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => handleSuggestionClick("Skip watering today")}
              >
                <Text style={styles.quickActionText}>📅 Skip watering today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => handleSuggestionClick("Water now")}
              >
                <Text style={styles.quickActionText}>💧 Water now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => handleSuggestionClick("Show schedule")}
              >
                <Text style={styles.quickActionText}>⚙️ Show schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#065f46',
  },
  subtitle: {
    fontSize: 14,
    color: '#059669',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
  },
  userBubble: {
    backgroundColor: '#3b82f6',
  },
  aiBubble: {
    backgroundColor: '#f3f4f6',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: 'white',
  },
  aiText: {
    color: '#374151',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  aiTime: {
    color: '#9ca3af',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  suggestionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#10b981',
    backgroundColor: 'white',
  },
  suggestionText: {
    fontSize: 12,
    color: '#059669',
  },
  typingContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  typingBubble: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 12,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9ca3af',
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 0.8,
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  sendButtonText: {
    fontSize: 16,
    color: 'white',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  quickAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#10b981',
    backgroundColor: 'white',
  },
  quickActionText: {
    fontSize: 12,
    color: '#059669',
  },
});

export default ChatInterface;
