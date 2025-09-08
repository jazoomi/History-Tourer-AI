import React, { useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import Markdown from 'react-native-markdown-display';

export default function ImageDetail() {
  const { photoUri, width, height } = useLocalSearchParams();
  const [result, setResult] = React.useState(null);
  const [prompt, setPrompt] = React.useState(photoUri);
  const [userText, setUserText] = React.useState("");
  useEffect(() => {
    (async () => {
      let base64Prompt;
      try {
        base64Prompt = await FileSystem.readAsStringAsync(photoUri, { encoding: FileSystem.EncodingType.Base64 });
    }
    catch (error) {
        console.error("Error reading image file:", error);
    }
    base64Prompt = 'data:image/jpeg;base64,' + base64Prompt;
    let request = base64Prompt;
    
    try {
        const res = await fetch('http://192.168.2.23:3000/routes/grokRoute', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify( { prompt: request} )
        });
        const data = await res.json();
        setResult(data.answer);
    }
    catch (error) {
        console.error("Error fetching image analysis:", error);
    }
})();
  },[photoUri]);

  //function to reset the AI when user goes back
  const resetAI = async () => {
    try {
        const res = await fetch('http://192.168.2.23:3000/routes/grokRoute', {
            method: "DELETE"
        });
            if (!res.ok) {
      throw new Error(`Failed with status ${res.status}`);
    }

    }
    catch (error) {
        console.error("Error resetting AI:", error);
    }
    setResult(null);
    setPrompt(null);
    setUserText("");
  };

  sendUserText = async () => {
    if (userText.trim() === "") return;
    setResult(null);
    try {
      const res = await fetch('http://192.168.2.23:3000/routes/grokRoute', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: userText })
      });
      const data = await res.json();
      setResult(data.answer);
    }
    catch (error) {
      console.error("Error sending user text:", error);
    }
    setUserText("");
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
        <SafeAreaView style={styles.container}>
            
            <TouchableOpacity onPress={() => {router.back(); resetAI(); }} style={styles.backButton}>
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
                <View style={styles.imageContainer}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <Image
                        source={{ uri: photoUri }}
                        style={[styles.image, { width: Number(width), height: Number(height) }]}
                        resizeMode='contain'
                    />
                    </TouchableWithoutFeedback>

                </View>
            <ScrollView>
            <View style={styles.resultContainer}>
                {result == null ? ( <ActivityIndicator size="large" color="#4caf50" /> ) : (
                    <Markdown style={{ body: styles.resultText }}>{result}</Markdown>
                )}
            </View>
            </ScrollView>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={userText}
                    onChangeText={setUserText}
                    placeholder="Ask for further details here"
                    placeholderTextColor='rgba(0, 100, 0, 0.5)'
                    multiline={true}
                /> 
                <TouchableOpacity onPress={sendUserText} style={styles.sendButton}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
  );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#e6f5e6"
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
        zIndex: 10,      // <-- add this
        elevation: 10,   // <-- add this (for Android)

    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: "600",
    },
    imageContainer: {
        marginTop: 10,          // small margin to avoid status bar/back button overlap
        justifyContent: 'flex-start', 
        alignItems: 'center',
        paddingTop: 10, // padding to avoid overlap with the back button

    },
    image: {
        maxWidth: 300,
        maxHeight: 200,
        borderRadius: 10,
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
    sendButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
