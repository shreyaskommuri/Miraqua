
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { MYIPADRESS } from '@env';

type Message = {
  sender: 'user' | 'bot';
  text: string;
};

const FarmerChatScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'FarmerChat'>>();
  const { plot } = route.params;
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: `Hi! I'm your Farmer assistant for ${plot.name}. Ask me anything!` }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: Message = { sender: 'user', text: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const res = await fetch(`http://${MYIPADRESS}:5050/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          crop: plot.crop,
          zip: plot.zip_code,
          plotName: plot.name,
          plotId: plot.id
        })
      });

      const json = await res.json();
      const replyText = json.success ? json.reply : `🤖 Error: ${json.error}`;
      const botMessage: Message = { sender: 'bot', text: replyText };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage: Message = {
        sender: 'bot',
        text: '❌ Could not contact assistant. Check your connection or backend server.'
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      keyboardVerticalOffset={80}
    >
      <ScrollView style={styles.chatBox} ref={scrollViewRef}>
        {messages.map((msg, idx) => (
          <View
            key={idx}
            style={msg.sender === 'user' ? styles.userBubble : styles.botBubble}
          >
            <Text style={styles.message}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask about your plot..."
          value={input}
          onChangeText={setInput}
        />
        <Button title="Send" onPress={sendMessage} color="#1aa179" />
      </View>
    </KeyboardAvoidingView>
  );
};

export default FarmerChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0faf5',
    padding: 16,
  },
  chatBox: {
    flex: 1,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#d9f5e7',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '80%',
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0ecf9',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '80%',
  },
  message: {
    fontSize: 15,
    color: '#333',
  },
  inputRow: {
    flexDirection: 'column',
    gap: 10,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
});
