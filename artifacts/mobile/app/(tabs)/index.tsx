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

export default function CaptureScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = insets.bottom + TAB_BAR_HEIGHT;
  const { parseThought, loadDemoThread, isParsing, parseError, clearError, activeThread } = useThreads();
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);
  const buttonScale = useRef(new Animated.Value(1)).current;

  const charCount = text.length;
  const canSubmit = charCount >= 10 && !isParsing;

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

    const fragments: Fragment[] = [{ type: "text", content: text.trim() }];
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
          paddingTop: topInset + 24,
          paddingBottom: tabBarHeight + 24 + bottomPad,
        },
      ]}
      bottomOffset={60}
    >
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoMark}>
            <Feather name="git-merge" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>Thread</Text>
        </View>
        <Text style={styles.tagline}>Recover your train of thought</Text>
      </View>

      {activeThread && (
        <Pressable
          style={styles.recoverBanner}
          onPress={() => router.push(`/thread/${activeThread.id}`)}
        >
          <View style={styles.recoverLeft}>
            <Feather name="refresh-ccw" size={14} color={Colors.light.tint} />
            <Text style={styles.recoverLabel}>Where was I?</Text>
          </View>
          <View style={styles.recoverRight}>
            <Text style={styles.recoverTitle} numberOfLines={1}>
              {activeThread.thread_title}
            </Text>
            <Feather name="chevron-right" size={14} color={Colors.light.textTertiary} />
          </View>
        </Pressable>
      )}

      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>What are you thinking?</Text>
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          value={text}
          onChangeText={(t) => {
            if (parseError) clearError();
            setText(t);
          }}
          placeholder="Capture what you're thinking, planning, or trying to do. The more detail, the better your thread."
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
                  hitSlop={8}
                >
                  <Feather name="x" size={10} color="#FFFFFF" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.inputFooter}>
          <View style={styles.inputFooterLeft}>
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
          <View style={styles.inputFooterRight}>
            {charCount < 10 && charCount > 0 && (
              <Text style={styles.hintText}>Keep going...</Text>
            )}
            <Text style={[
              styles.charCount,
              charCount > 900 && { color: Colors.light.priorityHigh }
            ]}>
              {charCount}/1000
            </Text>
          </View>
        </View>
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
            <Feather name="cpu" size={18} color={canSubmit ? "#FFFFFF" : Colors.light.textTertiary} />
          )}
          <Text style={[styles.captureBtnText, !canSubmit && styles.captureBtnTextDisabled]}>
            {isParsing ? "Structuring thought..." : "Capture Thread"}
          </Text>
        </Pressable>
      </Animated.View>

      <Pressable style={styles.demoBtn} onPress={handleDemo}>
        <Feather name="play-circle" size={14} color={Colors.light.textSecondary} />
        <Text style={styles.demoBtnText}>Load Demo Thread</Text>
      </Pressable>

      <View style={styles.helperSection}>
        <HelperItem icon="zap" text="Context switching? Capture your current state before switching." />
        <HelperItem icon="camera" text="Attach screenshots of what you're working on for richer context." />
        <HelperItem icon="arrow-right-circle" text="Come back later and tap 'Where was I?' to recover context instantly." />
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

function HelperItem({ icon, text }: { icon: React.ComponentProps<typeof Feather>["name"]; text: string }) {
  return (
    <View style={styles.helperItem}>
      <View style={styles.helperIconWrap}>
        <Feather name={icon} size={13} color={Colors.light.tint} />
      </View>
      <Text style={styles.helperText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  header: {
    marginBottom: 4,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.light.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginLeft: 46,
  },
  recoverBanner: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.light.tint + "40",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recoverLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  recoverLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.light.tint,
  },
  recoverRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    justifyContent: "flex-end",
  },
  recoverTitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.light.textSecondary,
    flex: 1,
    textAlign: "right",
  },
  inputCard: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    padding: 20,
    shadowColor: Colors.light.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  inputLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 12,
  },
  textInput: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 24,
    minHeight: 140,
    textAlignVertical: "top",
  },
  imageRow: {
    marginTop: 12,
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
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.light.text,
    alignItems: "center",
    justifyContent: "center",
  },
  inputFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  inputFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputFooterRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  attachBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.tint + "12",
  },
  attachBtnDisabled: {
    backgroundColor: Colors.light.border + "40",
  },
  attachLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.light.tint,
  },
  charCount: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.light.textTertiary,
  },
  hintText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.light.textTertiary,
    fontStyle: "italic",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: Colors.light.priorityHigh + "12",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.priorityHigh + "30",
  },
  errorText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.light.priorityHigh,
    flex: 1,
    lineHeight: 19,
  },
  captureBtn: {
    backgroundColor: Colors.light.tint,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  captureBtnDisabled: {
    backgroundColor: Colors.light.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  captureBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  captureBtnTextDisabled: {
    color: Colors.light.textTertiary,
  },
  demoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  demoBtnText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  helperSection: {
    gap: 10,
    marginTop: 4,
  },
  helperItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  helperIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: Colors.light.tint + "15",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  helperText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.light.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
});
