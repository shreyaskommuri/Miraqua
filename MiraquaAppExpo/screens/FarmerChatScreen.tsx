import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { MYIPADRESS, OPENWEATHER_API_KEY } from '@env';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FarmerChatScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'FarmerChat'>>();
  const { plot } = route.params;
  const chatSessionId = useRef<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<
    { sender: string; text: string; timestamp?: string }[]
  >([]);

  const formatTimestamp = (iso: string) => {
    const msgDate = new Date(iso);
    const now = new Date();

    const isSameDay =
      msgDate.getFullYear() === now.getFullYear() &&
      msgDate.getMonth() === now.getMonth() &&
      msgDate.getDate() === now.getDate();

    if (isSameDay) {
      return msgDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } else {
      return `${msgDate.getMonth() + 1}/${msgDate.getDate()}/${msgDate.getFullYear()}`;
    }
  };

  const loadChatHistory = async () => {
    try {
      const res = await fetch(`http://${MYIPADRESS}:5050/get_chat_log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: plot.user_id,
          plot_id: plot.id,
        }),
      });

      const data = await res.json();
      if (Array.isArray(data)) {
        const formatted = data.map((entry) => ({
          sender: entry.sender,
          text: entry.text,
          timestamp: entry.timestamp,
        }));

        setMessages([
          { sender: 'bot', text: `Hi! I'm your Farmer assistant for ${plot.name}. Ask me anything!` },
          ...formatted,
        ]);
      } else {
        console.error('Failed to load chat log:', data.error);
      }
    } catch (err) {
      console.error('Error fetching chat log:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadOrCreateSessionId = async () => {
        const key = `chat_session_${plot.id}`;
        const existing = await AsyncStorage.getItem(key);
        if (existing) {
          chatSessionId.current = existing;
        } else {
          const newId = uuid.v4() as string;
          chatSessionId.current = newId;
          await AsyncStorage.setItem(key, newId);
        }
        await loadChatHistory();
      };

      loadOrCreateSessionId();
    }, [plot.id])
  );

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionId.current) return;

    const userMessage = {
      sender: 'user',
      text: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?zip=${plot.zip_code},US&appid=${OPENWEATHER_API_KEY}&units=imperial`
      );
      const weatherData = await weatherRes.json();

      const res = await fetch(`http://${MYIPADRESS}:5050/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          crop: plot.crop,
          zip_code: plot.zip_code,
          plotName: plot.name,
          plotId: plot.id,
          plot: plot,
          weather: weatherData,
          chat_session_id: chatSessionId.current,
        }),
      });

      const data = await res.json();

      const botMessage = {
        sender: 'bot',
        text: data.success ? data.reply : 'Something went wrong. Try again!',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Error contacting server.', timestamp: new Date().toISOString() }]);
    }

    setInput('');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.chat}
        contentContainerStyle={{ paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[styles.bubble, msg.sender === 'user' ? styles.userBubble : styles.botBubble]}
          >
            <Text style={styles.message}>{msg.text}</Text>
            {msg.timestamp && (
              <Text style={styles.timestamp}>{formatTimestamp(msg.timestamp)}</Text>
            )}
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your plot..."
        />
        <Button title="Send" onPress={handleSend} />
      </View>
    </View>
  );
};

export default FarmerChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef7ec',
    padding: 16,
  },
  chat: {
    flex: 1,
    marginBottom: 10,
  },
  bubble: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#cce5ff',
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0ecf9',
  },
  message: {
    fontSize: 15,
    color: '#333',
  },
  timestamp: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
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
