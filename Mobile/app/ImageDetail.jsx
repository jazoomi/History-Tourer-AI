import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import Markdown from 'react-native-markdown-display';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function ImageDetail() {
  const { photoUri, width, height } = useLocalSearchParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [userText, setUserText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const analyzeImage = async () => {
      let base64Prompt;
      try {
        base64Prompt = await FileSystem.readAsStringAsync(photoUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } catch (err) {
        console.error("Error reading image file:", err);
        setError("Failed to read the image. Please go back and try again.");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/analyze`, {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: `data:image/jpeg;base64,${base64Prompt}` }),
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        setResult(data.answer);
      } catch (err) {
        console.error("Error fetching image analysis:", err);
        setError("Failed to analyze image. Make sure the server is running.");
      }
    };

    analyzeImage();
  }, [photoUri]);

  const resetAI = async () => {
    try {
      await fetch(`${API_URL}/api/analyze`, { method: "DELETE" });
    } catch (err) {
      console.error("Error resetting AI:", err);
    }
  };

  const handleBack = async () => {
    await resetAI();
    router.back();
  };

  const sendUserText = async () => {
    const text = userText.trim();
    if (!text) return;

    setSending(true);
    setResult(null);
    setError(null);
    setUserText("");

    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResult(data.answer);
    } catch (err) {
      console.error("Error sending follow-up:", err);
      setError("Failed to get a response. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.imageContainer}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <Image
            source={{ uri: photoUri }}
            style={[styles.image, { width: Number(width), height: Number(height) }]}
            resizeMode="contain"
          />
        </TouchableWithoutFeedback>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.resultContainer}>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : result == null ? (
            <ActivityIndicator size="large" color="#4caf50" />
          ) : (
            <Markdown style={{ body: styles.resultText }}>{result}</Markdown>
          )}
        </View>
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={userText}
            onChangeText={setUserText}
            placeholder="Ask for further details here"
            placeholderTextColor="rgba(0, 100, 0, 0.5)"
            multiline
            editable={!sending}
          />
          <TouchableOpacity
            onPress={sendUserText}
            style={[styles.sendButton, sending && styles.sendButtonDisabled]}
            disabled={sending}
          >
            <Text style={styles.sendButtonText}>{sending ? "..." : "Send"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6f5e6",
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10,
    backgroundColor: "#4caf50",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderRadius: 5,
    zIndex: 10,
    elevation: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: "600",
  },
  imageContainer: {
    marginTop: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 10,
  },
  image: {
    maxWidth: 300,
    maxHeight: 200,
    borderRadius: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  resultContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 15,
  },
  resultText: {
    color: '#000',
    fontSize: 16,
    padding: 5,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    textAlign: 'center',
    padding: 10,
  },
  inputContainer: {
    width: '100%',
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f0fdf0",
    borderTopWidth: 1,
    borderColor: "#cceccc",
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#4caf50",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#4caf50",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
