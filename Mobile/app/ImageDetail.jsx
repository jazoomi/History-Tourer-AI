import React, { useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { resetAI, AI }  from './AI';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ImageDetail() {
  const { photoUri, width, height } = useLocalSearchParams();
  const [result, setResult] = React.useState(null);
  const [prompt, setPrompt] = React.useState(photoUri);
  
  useEffect(() => {
    (async () => {
      let res = await AI(prompt);
      setResult(res);
    })();
  }, [prompt]);
  
  return (
    <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => {router.back(); resetAI(); }} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.imageContainer}>
            <Image
                source={{ uri: photoUri }}
                style={[styles.image, { width: Number(width), height: Number(height) }]}
                resizeMode='contain'
            />
        </View>
        <ScrollView>
        <View style={styles.resultContainer}>
            <Text style={styles.resultText}>{result}</Text>
        </View>
        </ScrollView>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}>
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                onChangeText={(text) => {}}
                placeholder="Ask for further details here"
                placeholderTextColor='rgba(0, 0, 0, 0.5)'
                multiline={true}
            /> 
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
        backgroundColor: 'lightgrey',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 5,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
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
    },
    resultContainer: {
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    resultText: {
        color: '#000',
        fontSize: 16,
        padding: 10,
        alignItems: 'center',
    },
    inputContainer: {
        width: '100%',
        padding: 10,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
    },
});