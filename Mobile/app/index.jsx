import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { colors, radius, spacing, type } from "../constants/theme";

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <FontAwesome5 name="landmark" size={42} color={colors.cream} />
          </View>
          <Text style={styles.title}>History Tourer</Text>
          <Text style={styles.subtitle}>
            Point your camera at any historical item and receive expert analysis in seconds.
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            onPress={() => router.push("/start")}
          >
            <FontAwesome5 name="camera" size={18} color={colors.cream} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Begin Tour</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>Your tour guide is an AI historian.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.parchment,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  header: {
    alignItems: "center",
    marginTop: spacing.xxl * 2,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.sepia,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    ...type.title,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...type.subtitle,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
  footer: {
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.sepia,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.lg,
    shadowColor: colors.shadow,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: spacing.md,
  },
  buttonText: {
    ...type.button,
  },
  hint: {
    ...type.label,
    marginTop: spacing.lg,
  },
});
