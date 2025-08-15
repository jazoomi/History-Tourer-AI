import { Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  return (
    <View
      style={styles.title}
    >
      <TouchableOpacity
      style={{color: "blue", padding: 10, backgroundColor: "lightblue", borderRadius: 5}}
      >
        <Text> Start </Text> 
      </TouchableOpacity>
      <Link href="/start"> here </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  title :{
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    fontSize: 20,
    fontWeight: "bold",
  }
})