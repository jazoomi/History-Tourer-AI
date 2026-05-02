import { useEffect, useRef, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, Image, Keyboard, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, CameraView } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors, radius, spacing, type } from '../constants/theme';

const MAX_DIMENSION = 1280;

export default function Start() {
  const router = useRouter();
  const cameraRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');

  const resetPreview = () => {
    setPhoto(null);
    setUserPrompt('');
    Keyboard.dismiss();
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const captured = await cameraRef.current.takePictureAsync({ quality: 0.8, skipProcessing: true });
      const longest = Math.max(captured.width ?? 0, captured.height ?? 0);
      const scale = longest > MAX_DIMENSION ? MAX_DIMENSION / longest : 1;
      const manipulated = await ImageManipulator.manipulateAsync(
        captured.uri,
        scale < 1
          ? [{ resize: { width: Math.round((captured.width ?? MAX_DIMENSION) * scale) } }]
          : [],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG },
      );
      setPhoto({
        uri: manipulated.uri,
        width: manipulated.width,
        height: manipulated.height,
      });
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Capture failed', 'Failed to take picture. Please try again.');
    } finally {
      setCapturing(false);
    }
  };

  const analyzePhoto = () => {
    if (!photo) return;
    Keyboard.dismiss();
    router.push({
      pathname: '/ImageDetail',
      params: {
        photoUri: photo.uri,
        width: String(photo.width ?? 0),
        height: String(photo.height ?? 0),
        userPrompt: userPrompt.trim(),
      },
    });
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.statusContainer}>
        <Text style={styles.statusText}>Requesting camera permission…</Text>
      </SafeAreaView>
    );
  }

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.statusContainer}>
        <FontAwesome5 name="camera" size={48} color={colors.sepia} />
        <Text style={styles.statusTitle}>Camera access needed</Text>
        <Text style={styles.statusText}>
          Please enable camera access in your device settings to analyze historical items.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (photo) {
    return (
      <View style={styles.previewContainer}>
        <StatusBar style="light" />
        <Image source={{ uri: photo.uri }} style={styles.previewImage} resizeMode="cover" />
        <View style={styles.previewScrim} pointerEvents="none" />
        <KeyboardAvoidingView
          style={StyleSheet.absoluteFill}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
          pointerEvents="box-none"
        >
          <SafeAreaView style={styles.previewOverlay} edges={['top', 'bottom']} pointerEvents="box-none">
            <TouchableOpacity style={styles.closeButton} onPress={resetPreview}>
              <FontAwesome5 name="times" size={18} color={colors.cream} />
            </TouchableOpacity>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
              <View style={styles.previewBottom}>
                <View style={styles.promptCard}>
                  <Text style={styles.promptLabel}>Add a question (optional)</Text>
                  <TextInput
                    style={styles.promptInput}
                    value={userPrompt}
                    onChangeText={setUserPrompt}
                    placeholder="e.g. What dynasty is this from?"
                    placeholderTextColor={colors.tan}
                    multiline
                    maxLength={500}
                    returnKeyType="done"
                    blurOnSubmit
                  />
                </View>
                <View style={styles.previewActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.retakeButton]}
                    onPress={resetPreview}
                    activeOpacity={0.85}
                  >
                    <FontAwesome5 name="redo" size={16} color={colors.sepiaDeep} />
                    <Text style={[styles.actionText, { color: colors.sepiaDeep }]}>Retake</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.analyzeButton]}
                    onPress={analyzePhoto}
                    activeOpacity={0.85}
                  >
                    <FontAwesome5 name="search" size={16} color={colors.cream} />
                    <Text style={styles.actionText}>Analyze</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <StatusBar style="light" />
      <CameraView style={StyleSheet.absoluteFill} ref={cameraRef} />
      <SafeAreaView style={styles.cameraOverlay} edges={['top', 'bottom']} pointerEvents="box-none">
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <FontAwesome5 name="chevron-left" size={18} color={colors.cream} />
        </TouchableOpacity>
        <View style={styles.captureWrap}>
          <Text style={styles.captureHint}>Frame a historical item and tap the shutter</Text>
          <TouchableOpacity
            style={[styles.shutter, capturing && styles.shutterActive]}
            onPress={takePicture}
            activeOpacity={0.8}
            disabled={capturing}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.parchment,
  },
  statusTitle: {
    ...type.title,
    fontSize: 24,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  statusText: {
    ...type.subtitle,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.sepia,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  primaryButtonText: { ...type.button },

  cameraContainer: { flex: 1, backgroundColor: '#000' },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  captureWrap: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  captureHint: {
    color: colors.cream,
    fontSize: 14,
    marginBottom: spacing.lg,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: colors.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterActive: { opacity: 0.5 },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.cream,
  },

  previewContainer: { flex: 1, backgroundColor: '#000' },
  previewImage: { ...StyleSheet.absoluteFillObject },
  previewScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  previewOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  previewBottom: {
    paddingBottom: spacing.xl,
  },
  promptCard: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  promptLabel: {
    color: colors.cream,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    opacity: 0.8,
    marginBottom: spacing.xs,
  },
  promptInput: {
    minHeight: 40,
    maxHeight: 120,
    color: colors.cream,
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: 0,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    marginHorizontal: spacing.xs,
  },
  retakeButton: { backgroundColor: colors.cream },
  analyzeButton: { backgroundColor: colors.sepia },
  actionText: {
    ...type.button,
    marginLeft: spacing.sm,
  },
});
