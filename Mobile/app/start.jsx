import { View, Text, TouchableOpacity, Image } from 'react-native';
import { router } from "expo-router";
import { useState, useEffect, useRef } from 'react';
import { Camera, CameraView } from 'expo-camera';
import { FontAwesome5 } from '@expo/vector-icons';

export default function Start() {
  const cameraRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        alert('Sorry, camera access is needed');
      }
    })();
  }, []);

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const result = await cameraRef.current.takePictureAsync();
      setPhoto(result);
    } catch (error) {
      console.error("Error taking picture:", error);
      alert("Failed to take picture. Please try again.");
    }
  };

  const confirmPhoto = () => {
    router.navigate({
      pathname: '/ImageDetail',
      params: {
        photoUri: photo.uri,
        width: photo.width.toString(),
        height: photo.height.toString(),
      }
    });
  };

  const retakePhoto = () => {
    setPhoto(null);
  };

  if (hasPermission === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ textAlign: 'center' }}>
          Camera access denied. Please go to Settings and allow camera access.
        </Text>
      </View>
    );
  }

  if (photo) {
    return (
      <View style={{ flex: 1 }}>
        <Image source={{ uri: photo.uri }} style={{ flex: 1 }} />
        <View style={{
          position: 'absolute',
          bottom: 30,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 20,
        }}>
          <TouchableOpacity
            style={{ backgroundColor: '#e53935', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 10 }}
            onPress={retakePhoto}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: '#4caf50', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 10 }}
            onPress={confirmPhoto}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Use Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView style={{ flex: 1 }} ref={cameraRef} />
      <View style={{
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <TouchableOpacity
          style={{ padding: 20, borderRadius: 10, marginBottom: 20 }}
          onPress={takePicture}
        >
          <FontAwesome5 name="dot-circle" size={55} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
