import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as FileSystem from 'expo-file-system/legacy';
import { FontAwesome5 } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { ENDPOINTS } from '../constants/api';
import { colors, radius, spacing, type } from '../constants/theme';

const REQUEST_TIMEOUT_MS = 90_000;

async function postPrompt(prompt) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(ENDPOINTS.grok, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Server returned ${res.status}${text ? `: ${text}` : ''}`);
    }
    return await res.json();
  }
  catch (error) {
    console.error('Error fetching image:', error);
    throw new Error('Failed to fetch image. Please try again.');
  }
  finally {
    clearTimeout(timer);
  }
}

function describeError(error) {
  if (error?.name === 'AbortError') {
    return 'The historian took too long to respond. The image may be too large — try another photo or check that the backend is reachable.';
  }
  if (String(error?.message || '').toLowerCase().includes('network')) {
    return "I couldn't reach the backend. Confirm both devices are on the same Wi-Fi and the server is running.";
  }
  return error?.message || 'Something went wrong. Please try again.';
}

export default function ImageDetail() {
  const { photoUri } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userText, setUserText] = useState('');
  const scrollRef = useRef(null);

  const appendMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!photoUri) return;
      setLoading(true);
      try {
        const base64 = await FileSystem.readAsStringAsync(photoUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const dataUrl = 'data:image/jpeg;base64,' + base64;
        console.log(`Sending image: ${(dataUrl.length / 1024).toFixed(0)} KB`);
        const data = await postPrompt(dataUrl);
        if (cancelled) return;
        appendMessage({ role: 'assistant', content: data.answer });
      } catch (error) {
        console.error('Error analyzing image:', error);
        if (!cancelled) {
          appendMessage({
            role: 'assistant',
            content: describeError(error),
            error: true,
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          scrollToEnd();
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [photoUri, appendMessage, scrollToEnd]);

  const resetAI = async () => {
    try {
      await fetch(ENDPOINTS.grok, { method: 'DELETE' });
    } catch (error) {
      console.error('Error resetting AI:', error);
    }
  };

  const handleBack = () => {
    resetAI();
    router.back();
  };

  const sendUserText = async () => {
    const text = userText.trim();
    if (!text || loading) return;
    setUserText('');
    Keyboard.dismiss();
    appendMessage({ role: 'user', content: text });
    scrollToEnd();
    setLoading(true);
    try {
      const data = await postPrompt(text);
      appendMessage({ role: 'assistant', content: data.answer });
    } catch (error) {
      console.error('Error sending question:', error);
      appendMessage({
        role: 'assistant',
        content: describeError(error),
        error: true,
      });
    } finally {
      setLoading(false);
      scrollToEnd();
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} hitSlop={8}>
          <FontAwesome5 name="chevron-left" size={16} color={colors.cream} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={scrollToEnd}
        >
          <View style={styles.imageCard}>
            <Image source={{ uri: photoUri }} style={styles.image} resizeMode="cover" />
          </View>

          {messages.map((m, i) => (
            <MessageBubble key={i} message={m} />
          ))}

          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.sepia} />
              <Text style={styles.loadingText}>The historian is thinking…</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={userText}
            onChangeText={setUserText}
            placeholder="Ask a follow-up question…"
            placeholderTextColor={colors.tan}
            multiline
            editable={!loading}
          />
          <TouchableOpacity
            onPress={sendUserText}
            style={[styles.sendButton, (loading || !userText.trim()) && styles.sendButtonDisabled]}
            disabled={loading || !userText.trim()}
            activeOpacity={0.85}
          >
            <FontAwesome5 name="paper-plane" size={16} color={colors.cream} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowRight : styles.bubbleRowLeft]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleAssistant,
          message.error && styles.bubbleError,
        ]}
      >
        {isUser ? (
          <Text style={styles.bubbleUserText}>{message.content}</Text>
        ) : (
          <Markdown style={markdownStyles}>{message.content}</Markdown>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.parchment },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.parchment,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.sepia,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...type.title,
    fontSize: 20,
  },
  headerSpacer: { width: 40 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  imageCard: {
    backgroundColor: colors.cream,
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.lg,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.line,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: radius.md,
    backgroundColor: colors.tanLight,
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  bubbleRowLeft: { justifyContent: 'flex-start' },
  bubbleRowRight: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '90%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  bubbleAssistant: {
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.line,
    borderTopLeftRadius: radius.sm,
  },
  bubbleUser: {
    backgroundColor: colors.sepia,
    borderTopRightRadius: radius.sm,
  },
  bubbleError: {
    backgroundColor: '#F8DDD7',
    borderColor: colors.error,
  },
  bubbleUserText: {
    color: colors.cream,
    fontSize: 16,
    lineHeight: 22,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  loadingText: {
    ...type.label,
    marginLeft: spacing.sm,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.cream,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    color: colors.ink,
    fontSize: 16,
    marginRight: spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.sepia,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { opacity: 0.4 },
});

const markdownStyles = {
  body: { color: colors.ink, fontSize: 15, lineHeight: 22 },
  strong: { color: colors.sepiaDeep, fontWeight: '700' },
  em: { color: colors.inkMuted, fontStyle: 'italic' },
  heading1: { color: colors.sepiaDeep, fontSize: 20, fontWeight: '700', marginTop: 6, marginBottom: 6 },
  heading2: { color: colors.sepiaDeep, fontSize: 18, fontWeight: '700', marginTop: 6, marginBottom: 6 },
  bullet_list: { marginVertical: 4 },
  list_item: { marginVertical: 2 },
  paragraph: { marginTop: 0, marginBottom: 8 },
};
