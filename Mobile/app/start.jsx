import { View, Text, TouchableOpacity, Image } from 'react-native'
import {router } from "expo-router";
import { useState, useEffect, useRef} from 'react'
import { Camera, CameraView} from 'expo-camera';
import { FontAwesome5 } from '@expo/vector-icons';
    console.log('Camera import:', Camera);


export default function start() {
  const cameraRef = useRef(null);
  const [photoUri, setPhotoUri] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync(); 
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        alert('Sorry, camera access is needed');
        console.log('camera permission status:', status);
      }
  })();
  }, []);

  const takePicture = async () => {
    try{
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync();
        setPhotoUri(photo);
            
        // You can handle the photo here, e.g., save it or upload it
      } else {
        console.error("Camera reference is not set");
      }
      
    }
    catch (error) {
      console.error("Error taking picture:", error);
      alert("Failed to take picture. Please try again.");
    }
  }


  if (hasPermission === null) {
    return <View><Text>Requesting camera permission...</Text></View>;
  }

  if (!hasPermission) {
    return <Text>Camera access denied, please go into settings and allow camera access</Text>;
  }

  return (
    <View style={{ flex: 1}}>
      {photoUri ? (
        <TouchableOpacity style={{ flex: 1 }} onPress={() => router.navigate({ pathname:'/ImageDetail', params: { photoUri: photoUri.uri, width: photoUri.width.toString(), height: photoUri.height.toString() }})}>
          <Image source={{ uri: photoUri.uri }} style={{ flex: 1 }} />
        </TouchableOpacity>
      ) : ( console.log("No photo taken yet"))}
        <CameraView style={{ flex: 1}} ref={cameraRef}/>
          <View style={{
          position: 'absolute', 
          bottom: 30, 
          left: 0, 
          right: 0, 
          justifyContent: 'center', 
          alignItems: 'center'
          }}>
            <TouchableOpacity
              style={{ padding: 20, borderRadius: 10, marginBottom: 20 }}
              onPress={takePicture}
            >
              <FontAwesome5 name="dot-circle" size={55} color={"white"}/>

            </TouchableOpacity>

          </View>
          


    </View>

    
  )}