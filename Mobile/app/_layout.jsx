import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack 
  screenOptions ={{ headerShown: false}}
  >
  <Stack.Screen name="index" options ={{ title: "Home" }} />
  <Stack.Screen name="start" options ={{ title: "camera"}}/>
  <Stack.Screen name="ImageDetail" options={{ title: "Image Detail" }} />
  </Stack>
}
