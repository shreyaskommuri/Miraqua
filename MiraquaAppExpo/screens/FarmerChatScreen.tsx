// screens/FarmerChatScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { MYIPADRESS, OPENWEATHER_API_KEY } from '@env';

const FarmerChatScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'FarmerChat'>>();
  const { plot } = route.params;

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: `Hi! I'm your Farmer assistant for ${plot.name}. Ask me anything!` },
  ]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const openWeatherKey = OPENWEATHER_API_KEY || '';

      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?zip=${plot.zip_code},US&appid=${openWeatherKey}&units=imperial`
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
        }),
      });

      const data = await res.json();
      console.log('📡 Chat response:', data);

      if (data.success) {
        const botMessage = { sender: 'bot', text: data.reply };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const errorMessage = { sender: 'bot', text: 'Something went wrong. Try again!' };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Error contacting server.' }]);
    }

    setInput('');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chat} contentContainerStyle={{ paddingBottom: 20 }}>
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[styles.bubble, msg.sender === 'user' ? styles.userBubble : styles.botBubble]}
          >
            <Text style={styles.message}>{msg.text}</Text>
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
