import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  plotId?: string | null;
  isWelcome?: boolean;
  scheduleUpdated?: boolean;
}

interface ChatScreenProps {
  navigation: any;
  route?: any;
}

const SUGGESTIONS = [
  { label: 'Water today?', icon: 'water-outline' },
  { label: 'Skip a day', icon: 'close-circle-outline' },
  { label: 'Health check', icon: 'leaf-outline' },
  { label: 'This week', icon: 'calendar-outline' },
  { label: 'Adjust schedule', icon: 'settings-outline' },
];

function TypingIndicator() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600 - i * 150),
        ])
      )
    );
    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
  }, []);

  return (
    <View style={styles.typingRow}>
      <View style={styles.botDot} />
      <View style={styles.typingBubble}>
        {dots.map((dot, i) => (
          <Animated.View
            key={i}
            style={[styles.typingDot, { opacity: dot, transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }] }]}
          />
        ))}
      </View>
    </View>
  );
}

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
  const plotIdFromRoute = route?.params?.plotId;
  const contextDateFromRoute = route?.params?.contextDate as string | undefined;
  const contextScheduleFromRoute = route?.params?.contextSchedule as { liters: number; optimal_time: string } | null | undefined;

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [realPlots, setRealPlots] = useState<any[]>([]);
  const [plotsLoading, setPlotsLoading] = useState(true);
  const [selectedPlotId, setSelectedPlotId] = useState<string>(plotIdFromRoute ? String(plotIdFromRoute) : 'general');
  const [selectedPlot, setSelectedPlot] = useState<any>(null);
  const [showPlotSelector, setShowPlotSelector] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [contextDate, setContextDate] = useState<string | null>(contextDateFromRoute ?? null);
  const [contextSchedule, setContextSchedule] = useState<{ liters: number; optimal_time: string } | null>(contextScheduleFromRoute ?? null);

  const scrollRef = useRef<ScrollView>(null);
  const historyLoaded = useRef<Set<string>>(new Set());
  const inputRef = useRef<TextInput>(null);

  const getSessionId = (id: string) => id === 'general' ? 'general' : `plot_${id}`;

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  // Init: get user, fetch plots
  useEffect(() => {
    const init = async () => {
      try {
        const { supabase } = await import('../utils/supabase');
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) setUserId(user.id);
      } catch (_) {}

      try {
        const { getPlots } = await import('../api/plots');
        const res = await getPlots();
        if (res.success) setRealPlots(res.plots || []);
      } catch (_) {} finally {
        setPlotsLoading(false);
      }
    };
    init();
  }, []);

  // Set initial welcome message once we know the state
  useEffect(() => {
    if (plotsLoading) return;

    if (!plotIdFromRoute) {
      // General mode
      if (realPlots.length === 0) {
        setMessages([{ id: 1, sender: 'bot', text: "You don't have any plots set up yet. Head to the home screen to add your first plot, then come back to chat about it.", plotId: null, isWelcome: true }]);
      } else {
        setMessages([{ id: 1, sender: 'bot', text: "Ask me about any of your plots — schedules, skips, crop health, or upcoming conditions.", plotId: null, isWelcome: true }]);
      }
      return;
    }

    const plot = realPlots.find(p => String(p.id) === String(plotIdFromRoute));
    if (!plot) {
      setMessages([{ id: 1, sender: 'bot', text: "Couldn't find that plot. It may have been removed.", plotId: null, isWelcome: true }]);
      return;
    }

    setSelectedPlot(plot);
    const cropName = (plot.crop || 'your crop').toLowerCase();
    let welcomeText: string;
    if (contextDateFromRoute) {
      const [yr, mo, dy] = contextDateFromRoute.split('-').map(Number);
      const label = new Date(yr, mo - 1, dy).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      const hasWater = contextScheduleFromRoute && contextScheduleFromRoute.liters > 0;
      welcomeText = hasWater
        ? `What would you like to change about ${label}? It's currently scheduled for ${contextScheduleFromRoute!.liters}L at ${contextScheduleFromRoute!.optimal_time}.`
        : `${label} is a skip day. Want to add irrigation or ask about the surrounding schedule?`;
    } else {
      welcomeText = `What's up! Ask me anything about **${plot.name}** — schedule adjustments, skips, ${cropName} health, or what's coming up this week.`;
    }

    setMessages([{ id: 1, sender: 'bot', text: welcomeText, plotId: String(plot.id), isWelcome: true }]);
  }, [plotsLoading, plotIdFromRoute, realPlots.length]);

  // Load chat history once userId + plotId are known
  useEffect(() => {
    if (!userId || !plotIdFromRoute) return;
    const key = String(plotIdFromRoute);
    if (historyLoaded.current.has(key)) return;
    historyLoaded.current.add(key);
    loadHistory(key, userId);
  }, [userId, plotIdFromRoute]);

  const loadHistory = async (plotId: string, uid: string) => {
    try {
      const { environment } = await import('../config/environment');
      const res = await fetch(`${environment.apiUrl}/get_chat_log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: uid, plot_id: plotId, chat_session_id: getSessionId(plotId) }),
      });
      if (!res.ok) return;
      const history: { sender: string; text: string }[] = await res.json();
      if (!Array.isArray(history) || !history.length) return;
      const loaded: Message[] = history.map((h, i) => ({
        id: Date.now() + i,
        sender: h.sender === 'user' ? 'user' : 'bot',
        text: h.text || '',
        plotId,
      }));
      setMessages(prev => {
        // Only inject if we're still on the same plot (don't pollute after a switch)
        const stillRelevant = prev.some(m => m.plotId === plotId || (m.isWelcome && m.plotId === plotId));
        if (!stillRelevant && prev.some(m => m.plotId && m.plotId !== plotId)) return prev;
        const withoutWelcome = prev.filter(m => !m.isWelcome);
        return [...loaded, ...withoutWelcome];
      });
    } catch (_) {}
  };

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || isTyping) return;

    // If tapping a suggestion in general mode with no plot selected, prompt to pick one
    if (selectedPlotId === 'general' && text && realPlots.length > 0) {
      setShowPlotSelector(true);
      return;
    }

    setInput('');

    const plotCtx = selectedPlotId === 'general' ? null : String(selectedPlotId);
    const userMsg: Message = { id: Date.now(), sender: 'user', text: msg, plotId: plotCtx };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const { environment } = await import('../config/environment');
      const prompt = contextDate
        ? `[Context: the user is looking at ${contextDate}${contextSchedule ? `, currently ${contextSchedule.liters}L at ${contextSchedule.optimal_time}` : ', a skip day'}] ${msg}`
        : msg;

      const res = await fetch(`${environment.apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          plotId: plotCtx,
          chat_session_id: getSessionId(selectedPlotId),
          current_date: new Date().toISOString().split('T')[0],
        }),
      });

      const data = res.ok ? await res.json() : null;
      const reply = data?.reply || "Sorry, I couldn't reach the server. Try again in a moment.";
      setMessages(prev => [...prev, {
        id: Date.now(), sender: 'bot', text: reply, plotId: plotCtx,
        scheduleUpdated: data?.schedule_updated === true,
      }]);
      setContextDate(null);
      setContextSchedule(null);
    } catch (_) {
      setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: "Couldn't connect to the server. Check your network and try again.", plotId: plotCtx }]);
    } finally {
      setIsTyping(false);
    }
  };

  const switchPlot = (plotId: string) => {
    setShowPlotSelector(false);
    setSelectedPlotId(plotId);
    setContextDate(null);
    setContextSchedule(null);

    if (plotId === 'general') {
      setSelectedPlot(null);
      setMessages([{ id: Date.now(), sender: 'bot', text: "Ask me about any of your plots — schedules, skips, health, or upcoming conditions.", plotId: null, isWelcome: true }]);
    } else {
      const plot = realPlots.find(p => String(p.id) === String(plotId));
      if (plot) {
        setSelectedPlot(plot);
        setMessages([{ id: Date.now(), sender: 'bot', text: `Switched to **${plot.name}**. What would you like to know?`, plotId: String(plot.id), isWelcome: true }]);
        if (userId && !historyLoaded.current.has(plotId)) {
          historyLoaded.current.add(plotId);
          loadHistory(plotId, userId);
        }
      }
    }
  };

  const visibleMessages = selectedPlotId === 'general'
    ? messages.filter(m => !m.plotId)
    : messages.filter(m => String(m.plotId) === String(selectedPlotId) || (m.isWelcome && !m.plotId));

  const showSuggestions = visibleMessages.filter(m => !m.isWelcome).length === 0;

  const renderText = (text: string, isUser: boolean) => {
    // Simple bold rendering: **text** → bold
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return (
      <Text style={isUser ? styles.userMsgText : styles.botMsgText}>
        {parts.map((part, i) =>
          part.startsWith('**') && part.endsWith('**')
            ? <Text key={i} style={{ fontWeight: '700' }}>{part.slice(2, -2)}</Text>
            : <Text key={i}>{part}</Text>
        )}
      </Text>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <View style={styles.headerMiddle}>
          <View style={styles.avatarSmall}>
            <Ionicons name="leaf" size={13} color="white" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Miraqua</Text>
            {selectedPlot && <Text style={styles.headerSub}>{selectedPlot.name} · {selectedPlot.crop}</Text>}
          </View>
        </View>
        <TouchableOpacity style={styles.plotPill} onPress={() => setShowPlotSelector(true)}>
          <Text style={styles.plotPillText} numberOfLines={1}>{selectedPlot?.name ?? 'All Plots'}</Text>
          <Ionicons name="chevron-down" size={12} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          {visibleMessages.map(msg => (
            <View key={msg.id} style={msg.sender === 'user' ? styles.userRow : styles.botRow}>
              {msg.sender === 'bot' && <View style={styles.botDot} />}
              {msg.sender === 'user'
                ? <View style={styles.userBubble}>{renderText(msg.text, true)}</View>
                : (
                  <View style={styles.botContent}>
                    {renderText(msg.text, false)}
                    {msg.scheduleUpdated && (
                      <TouchableOpacity
                        style={styles.scheduleUpdatedBadge}
                        onPress={() => navigation.goBack()}
                      >
                        <Ionicons name="checkmark-circle" size={13} color="#1aa179" />
                        <Text style={styles.scheduleUpdatedText}>Schedule updated · Tap to view</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )
              }
            </View>
          ))}

          {isTyping && <TypingIndicator />}

          {showSuggestions && !isTyping && (
            <View style={styles.suggestions}>
              {SUGGESTIONS.map((s, i) => (
                <TouchableOpacity key={i} style={styles.suggestionChip} onPress={() => send(s.label)}>
                  <Ionicons name={s.icon as any} size={13} color="#1aa179" />
                  <Text style={styles.suggestionText}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputBar}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Message Miraqua…"
            placeholderTextColor="#4B5563"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={1000}
            onSubmitEditing={() => send()}
            blurOnSubmit={false}
            editable={!isTyping}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || isTyping) && styles.sendBtnDisabled]}
            onPress={() => send()}
            disabled={!input.trim() || isTyping}
          >
            <Ionicons name="arrow-up" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Plot selector modal */}
      <Modal visible={showPlotSelector} transparent animationType="slide" onRequestClose={() => setShowPlotSelector(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowPlotSelector(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Switch Plot</Text>
          <ScrollView>
            {[{ id: 'general', name: 'All Plots', crop: 'General assistant' }, ...realPlots].map(plot => (
              <TouchableOpacity
                key={plot.id}
                style={[styles.plotRow, String(selectedPlotId) === String(plot.id) && styles.plotRowActive]}
                onPress={() => switchPlot(String(plot.id))}
              >
                <View style={[styles.plotRowIcon, String(selectedPlotId) === String(plot.id) && styles.plotRowIconActive]}>
                  <Ionicons name="leaf" size={16} color={String(selectedPlotId) === String(plot.id) ? 'white' : '#1aa179'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.plotRowName}>{plot.name}</Text>
                  <Text style={styles.plotRowCrop}>{plot.crop}</Text>
                </View>
                {String(selectedPlotId) === String(plot.id) && <Ionicons name="checkmark" size={16} color="#1aa179" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1117' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  headerMiddle: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarSmall: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#1aa179',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 15, fontWeight: '700', color: 'white', letterSpacing: -0.2 },
  headerSub: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  plotPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, maxWidth: 120,
  },
  plotPillText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '500', flexShrink: 1 },

  // Messages
  messages: { flex: 1 },
  messagesContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16, flexGrow: 1 },

  botRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, gap: 10 },
  botDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#1aa179', marginTop: 8, flexShrink: 0,
  },
  botContent: { flex: 1 },
  botMsgText: { fontSize: 16, lineHeight: 26, color: 'rgba(255,255,255,0.88)', fontWeight: '400', letterSpacing: -0.1 },

  userRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16 },
  userBubble: {
    backgroundColor: '#1aa179',
    borderRadius: 20, borderBottomRightRadius: 6,
    paddingHorizontal: 16, paddingVertical: 10,
    maxWidth: '78%',
  },
  userMsgText: { fontSize: 15, lineHeight: 22, color: 'white', fontWeight: '400' },

  // Typing
  typingRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, gap: 10 },
  typingBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12,
  },
  typingDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#6B7280' },

  // Schedule updated badge
  scheduleUpdatedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    marginTop: 10,
    backgroundColor: 'rgba(26,161,121,0.1)',
    borderWidth: 1, borderColor: 'rgba(26,161,121,0.25)',
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  scheduleUpdatedText: { fontSize: 12, color: '#1aa179', fontWeight: '600' },

  // Suggestions
  suggestions: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestionChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  suggestionText: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },

  // Input
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)',
    gap: 10, backgroundColor: '#0F1117',
  },
  input: {
    flex: 1, minHeight: 44, maxHeight: 130,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 22, paddingHorizontal: 18, paddingTop: 11, paddingBottom: 11,
    color: 'white', fontSize: 15, lineHeight: 22,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1aa179', justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  sendBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.1)' },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: {
    backgroundColor: '#1C2333',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40,
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    maxHeight: '60%',
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: 'white', marginBottom: 16, letterSpacing: -0.3 },
  plotRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, paddingHorizontal: 14,
    borderRadius: 14, marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  plotRowActive: { backgroundColor: 'rgba(26,161,121,0.12)', borderWidth: 1, borderColor: 'rgba(26,161,121,0.3)' },
  plotRowIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(26,161,121,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  plotRowIconActive: { backgroundColor: '#1aa179' },
  plotRowName: { fontSize: 15, fontWeight: '600', color: 'white', letterSpacing: -0.2 },
  plotRowCrop: { fontSize: 12, color: '#6B7280', marginTop: 2 },
});
