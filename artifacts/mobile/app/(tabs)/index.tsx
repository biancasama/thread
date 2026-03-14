import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { TAB_BAR_HEIGHT } from "@/constants/layout";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useThreads, type Fragment } from "@/context/ThreadContext";
import { LabyrinthLogo } from "@/components/LabyrinthLogo";

export default function CaptureScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = insets.bottom + TAB_BAR_HEIGHT;
  const { parseThought, loadDemoThread, isParsing, parseError, clearError, activeThread } = useThreads();
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);
  const buttonScale = useRef(new Animated.Value(1)).current;

  const charCount = text.length;
  const hasEnoughText = charCount >= 10;
  const hasImages = images.length > 0;
  const canSubmit = (hasEnoughText || hasImages) && !isParsing;

  const handlePressIn = () => {
    if (!canSubmit) return;
    Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true, speed: 50 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  };

  const handlePickImage = async () => {
    if (images.length >= 4) return;
    if (Platform.OS !== "web") Haptics.selectionAsync();

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      base64: true,
      allowsMultipleSelection: true,
      selectionLimit: 4 - images.length,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets
        .filter((a) => a.base64)
        .map((a) => {
          const ext = a.mimeType || "image/jpeg";
          return `data:${ext};base64,${a.base64}`;
        });
      setImages((prev) => [...prev, ...newImages].slice(0, 4));
    }
  };

  const removeImage = (index: number) => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCapture = async () => {
    if (!canSubmit) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const fragments: Fragment[] = [];
    const trimmed = text.trim();
    if (trimmed.length > 0) {
      fragments.push({ type: "text", content: trimmed });
    }
    for (const img of images) {
      fragments.push({ type: "image", content: img });
    }

    const result = await parseThought(fragments);
    if (result) {
      setText("");
      setImages([]);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push(`/thread/${result.id}`);
    }
  };

  const handleDemo = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    loadDemoThread();
    router.push("/threads");
  };

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  return (
    <KeyboardAwareScrollViewCompat
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topInset + 32,
          paddingBottom: tabBarHeight + 32 + bottomPad,
        },
      ]}
      bottomOffset={60}
    >
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <LabyrinthLogo size={40} />
          <Text style={styles.appName}>Thread</Text>
        </View>
      </View>

      <View style={styles.hero}>
        <Text style={styles.headline}>
          Lost in the labyrinth of interruptions?
        </Text>
      </View>

      {activeThread && (
        <Pressable
          style={styles.recoverBanner}
          onPress={() => router.push(`/thread/${activeThread.id}`)}
        >
          <View style={styles.recoverLeft}>
            <View style={styles.recoverDot} />
            <Text style={styles.recoverLabel}>Find the thread</Text>
          </View>
          <View style={styles.recoverRight}>
            <Text style={styles.recoverTitle} numberOfLines={1}>
              {activeThread.thread_title}
            </Text>
            <Feather name="chevron-right" size={16} color={Colors.light.textTertiary} />
          </View>
        </Pressable>
      )}

      <View style={styles.inputCard}>
        <Text style={styles.inputCardTitle}>What were you doing?</Text>
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          value={text}
          onChangeText={(t) => {
            if (parseError) clearError();
            setText(t);
          }}
          placeholder="What were you doing?"
          placeholderTextColor={Colors.light.textTertiary}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          returnKeyType="default"
          autoCorrect
          autoCapitalize="sentences"
          maxLength={1000}
        />

        {images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageRow}
            contentContainerStyle={styles.imageRowContent}
          >
            {images.map((uri, i) => (
              <View key={i} style={styles.imageThumbWrap}>
                <Image source={{ uri }} style={styles.imageThumb} />
                <Pressable
                  style={styles.imageRemoveBtn}
                  onPress={() => removeImage(i)}
                >
                  <View style={styles.imageRemoveBtnInner}>
                    <Feather name="x" size={10} color="#FFFFFF" />
                  </View>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}

        <Pressable
          style={[styles.attachBtn, images.length >= 4 && styles.attachBtnDisabled]}
          onPress={handlePickImage}
          disabled={images.length >= 4}
          hitSlop={8}
        >
          <Feather
            name="image"
            size={16}
            color={images.length >= 4 ? Colors.light.textTertiary : Colors.light.tint}
          />
          <Text style={[
            styles.attachLabel,
            images.length >= 4 && { color: Colors.light.textTertiary },
          ]}>
            {images.length > 0 ? `${images.length}/4` : "Add image"}
          </Text>
        </Pressable>
      </View>

      {parseError && (
        <View style={styles.errorBox}>
          <Feather name="alert-circle" size={14} color={Colors.light.priorityHigh} />
          <Text style={styles.errorText}>{parseError}</Text>
        </View>
      )}

      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <Pressable
          style={[styles.captureBtn, !canSubmit && styles.captureBtnDisabled]}
          onPress={handleCapture}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={!canSubmit}
        >
          {isParsing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={styles.threadIconWrap}>
              <View style={styles.threadLine} />
            </View>
          )}
          <Text style={[styles.captureBtnText, !canSubmit && styles.captureBtnTextDisabled]}>
            {isParsing ? "Spinning the thread..." : "Hold the thread"}
          </Text>
        </Pressable>
      </Animated.View>

      <Pressable style={styles.demoBtn} onPress={handleDemo}>
        <Text style={styles.demoBtnText}>Load demo thread</Text>
      </Pressable>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    paddingHorizontal: 24,
    gap: 24,
  },
  header: {
    marginBottom: 0,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  appName: {
    fontFamily: "Lexend_700Bold",
    fontSize: 30,
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  hero: {
    gap: 4,
  },
  headline: {
    fontFamily: "Lexend_600SemiBold",
    fontSize: 22,
    color: Colors.light.text,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  recoverBanner: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.tint + "30",
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 56,
  },
  recoverLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recoverDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.tint,
  },
  recoverLabel: {
    fontFamily: "Lexend_600SemiBold",
    fontSize: 14,
    color: Colors.light.tint,
  },
  recoverRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    justifyContent: "flex-end",
  },
  recoverTitle: {
    fontFamily: "Lexend_400Regular",
    fontSize: 13,
    color: Colors.light.textSecondary,
    flex: 1,
    textAlign: "right",
  },
  inputCard: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: 20,
    gap: 12,
  },
  inputCardTitle: {
    fontFamily: "Lexend_600SemiBold",
    fontSize: 16,
    color: Colors.light.text,
  },
  textInput: {
    fontFamily: "Lexend_400Regular",
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 26,
    minHeight: 120,
    textAlignVertical: "top",
  },
  imageRow: {
    marginTop: 4,
  },
  imageRowContent: {
    gap: 8,
  },
  imageThumbWrap: {
    position: "relative",
  },
  imageThumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: Colors.light.border,
  },
  imageRemoveBtn: {
    position: "absolute",
    top: -14,
    right: -14,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  imageRemoveBtnInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.light.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  attachBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: Colors.light.tint + "15",
    alignSelf: "flex-start",
    minHeight: 56,
  },
  attachBtnDisabled: {
    backgroundColor: Colors.light.border + "40",
  },
  attachLabel: {
    fontFamily: "Lexend_500Medium",
    fontSize: 13,
    color: Colors.light.tint,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: Colors.light.priorityHigh + "15",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.priorityHigh + "30",
  },
  errorText: {
    fontFamily: "Lexend_400Regular",
    fontSize: 14,
    color: Colors.light.priorityHigh,
    flex: 1,
    lineHeight: 20,
  },
  captureBtn: {
    backgroundColor: Colors.light.tint,
    borderRadius: 16,
    minHeight: 56,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  captureBtnDisabled: {
    backgroundColor: Colors.light.backgroundTertiary,
    shadowOpacity: 0,
    elevation: 0,
  },
  threadIconWrap: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  threadLine: {
    width: 2,
    height: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
  },
  captureBtnText: {
    fontFamily: "Lexend_600SemiBold",
    fontSize: 17,
    color: "#FFFFFF",
  },
  captureBtnTextDisabled: {
    color: Colors.light.textTertiary,
  },
  demoBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    minHeight: 56,
  },
  demoBtnText: {
    fontFamily: "Lexend_400Regular",
    fontSize: 15,
    color: Colors.light.textSecondary,
  },
});
