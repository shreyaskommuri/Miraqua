// screens/FarmerChatScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';

const FarmerChatScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'FarmerChat'>>();
  const { plot } = route.params;
  const [messages, setMessages] = useState([
    `Hi! I'm your Farmer assistant for ${plot.name}. Ask me anything!`
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, input];
    setMessages(newMessages);
    setInput('');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chatBox}>
        {messages.map((msg, idx) => (
          <View key={idx} style={idx % 2 === 0 ? styles.botBubble : styles.userBubble}>
            <Text style={styles.message}>{msg}</Text>
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
    </View>
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
