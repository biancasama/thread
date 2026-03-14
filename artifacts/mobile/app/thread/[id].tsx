import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Thread, useThreads } from "@/context/ThreadContext";

export default function ThreadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { threads, deleteThread } = useThreads();
  const [thread, setThread] = useState<Thread | null>(null);
  const [showRecovery, setShowRecovery] = useState(false);
  const recoveryAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const found = threads.find((t) => t.id === id);
    setThread(found ?? null);
  }, [id, threads]);

  const toggleRecovery = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const toValue = showRecovery ? 0 : 1;
    setShowRecovery(!showRecovery);
    Animated.spring(recoveryAnim, {
      toValue,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  };

  const handleDelete = () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (thread) {
      deleteThread(thread.id);
      router.back();
    }
  };

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  if (!thread) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.notFoundText}>Thread not found</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const recoveryScale = recoveryAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  });

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBack} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={Colors.light.text} />
        </Pressable>
        <PriorityBadge priority={thread.priority} />
        <Pressable onPress={handleDelete} style={styles.headerDelete} hitSlop={8}>
          <Feather name="trash-2" size={18} color={Colors.light.textTertiary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.threadTitle}>{thread.thread_title}</Text>
        </View>

        <Pressable
          style={[styles.recoveryTrigger, showRecovery && styles.recoveryTriggerActive]}
          onPress={toggleRecovery}
        >
          <View style={styles.recoveryTriggerLeft}>
            <View style={[styles.recoveryIcon, showRecovery && styles.recoveryIconActive]}>
              <Feather
                name="refresh-ccw"
                size={16}
                color={showRecovery ? "#FFFFFF" : Colors.light.tint}
              />
            </View>
            <View>
              <Text style={styles.recoveryLabel}>
                Find the thread
              </Text>
              <Text style={styles.recoverySubLabel}>Where was I?</Text>
            </View>
          </View>
          <Feather
            name={showRecovery ? "chevron-up" : "chevron-down"}
            size={18}
            color={showRecovery ? Colors.light.tint : Colors.light.textTertiary}
          />
        </Pressable>

        {showRecovery && (
          <Animated.View
            style={[
              styles.recoveryCard,
              {
                opacity: recoveryAnim,
                transform: [{ scale: recoveryScale }],
              },
            ]}
          >
            <RecoverySection thread={thread} />
          </Animated.View>
        )}

        <Section title="Goal" icon="target">
          <Text style={styles.bodyText}>{thread.goal}</Text>
        </Section>

        <Section title="Current Step" icon="git-commit">
          <View style={styles.currentStepBox}>
            <Text style={styles.currentStepText}>{thread.current_step}</Text>
          </View>
        </Section>

        <Section title="Important Context" icon="info">
          <Text style={styles.bodyText}>{thread.important_context}</Text>
        </Section>

        <Section title="Next Actions" icon="chevrons-right">
          <View style={styles.actionsList}>
            {thread.next_actions.map((action, i) => (
              <NextActionItem key={i} index={i} text={action} />
            ))}
          </View>
        </Section>

        {thread.raw_input && thread.raw_input !== "Demo thread loaded" && (
          <Section title="Original Thought" icon="message-square">
            <Text style={styles.rawInputText}>{thread.raw_input}</Text>
          </Section>
        )}
      </ScrollView>
    </View>
  );
}

function RecoverySection({ thread }: { thread: Thread }) {
  return (
    <View style={styles.recovery}>
      <Text style={styles.recoveryHeadline}>You were working on:</Text>
      <Text style={styles.recoveryValue}>{thread.thread_title}</Text>

      <View style={styles.recoveryDivider} />

      <RecoveryRow label="Goal" value={thread.goal} />
      <RecoveryRow label="Last known step" value={thread.current_step} />

      <View style={styles.recoveryDivider} />

      <Text style={styles.recoveryNextLabel}>Next best actions:</Text>
      {thread.next_actions.map((action, i) => (
        <View key={i} style={styles.recoveryAction}>
          <View style={styles.recoveryActionNum}>
            <Text style={styles.recoveryActionNumText}>{i + 1}</Text>
          </View>
          <Text style={styles.recoveryActionText}>{action}</Text>
        </View>
      ))}
    </View>
  );
}

function RecoveryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.recoveryRow}>
      <Text style={styles.recoveryRowLabel}>{label}</Text>
      <Text style={styles.recoveryRowValue}>{value}</Text>
    </View>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Feather name={icon} size={14} color={Colors.light.tint} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function NextActionItem({ index, text }: { index: number; text: string }) {
  const [done, setDone] = useState(false);
  return (
    <Pressable
      style={[styles.actionItem, done && styles.actionItemDone]}
      onPress={() => {
        if (Platform.OS !== "web") Haptics.selectionAsync();
        setDone(!done);
      }}
    >
      <View style={[styles.actionCheck, done && styles.actionCheckDone]}>
        {done ? (
          <Feather name="check" size={11} color="#FFFFFF" />
        ) : (
          <Text style={styles.actionIndexText}>{index + 1}</Text>
        )}
      </View>
      <Text style={[styles.actionText, done && styles.actionTextDone]}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundText: {
    fontFamily: "Lexend_500Medium",
    fontSize: 17,
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: {
    fontFamily: "Lexend_600SemiBold",
    fontSize: 15,
    color: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerBack: {
    padding: 8,
    minWidth: 56,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  headerDelete: {
    padding: 8,
    minWidth: 56,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 20,
  },
  titleSection: {
    marginBottom: 4,
  },
  threadTitle: {
    fontFamily: "Lexend_700Bold",
    fontSize: 26,
    color: Colors.light.text,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  recoveryTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.tint + "30",
    minHeight: 56,
  },
  recoveryTriggerActive: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.tint + "0A",
  },
  recoveryTriggerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  recoveryIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.light.tint + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  recoveryIconActive: {
    backgroundColor: Colors.light.tint,
  },
  recoveryLabel: {
    fontFamily: "Lexend_600SemiBold",
    fontSize: 16,
    color: Colors.light.tint,
  },
  recoverySubLabel: {
    fontFamily: "Lexend_400Regular",
    fontSize: 12,
    color: Colors.light.textTertiary,
    marginTop: 2,
  },
  recoveryCard: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.tint + "25",
    overflow: "hidden",
  },
  recovery: {
    padding: 24,
    gap: 0,
  },
  recoveryHeadline: {
    fontFamily: "Lexend_500Medium",
    fontSize: 12,
    color: Colors.light.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  recoveryValue: {
    fontFamily: "Lexend_700Bold",
    fontSize: 19,
    color: Colors.light.text,
    lineHeight: 28,
    marginBottom: 16,
  },
  recoveryDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 16,
  },
  recoveryRow: {
    marginBottom: 14,
  },
  recoveryRowLabel: {
    fontFamily: "Lexend_500Medium",
    fontSize: 12,
    color: Colors.light.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  recoveryRowValue: {
    fontFamily: "Lexend_400Regular",
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 24,
  },
  recoveryNextLabel: {
    fontFamily: "Lexend_600SemiBold",
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  recoveryAction: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  recoveryActionNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.light.tint,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  recoveryActionNumText: {
    fontFamily: "Lexend_700Bold",
    fontSize: 12,
    color: "#FFFFFF",
  },
  recoveryActionText: {
    fontFamily: "Lexend_400Regular",
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 24,
    flex: 1,
  },
  section: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontFamily: "Lexend_600SemiBold",
    fontSize: 13,
    color: Colors.light.tint,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  bodyText: {
    fontFamily: "Lexend_400Regular",
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 24,
  },
  currentStepBox: {
    backgroundColor: Colors.light.tint + "12",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.tint,
  },
  currentStepText: {
    fontFamily: "Lexend_500Medium",
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 24,
  },
  actionsList: {
    gap: 10,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 6,
    minHeight: 56,
  },
  actionItemDone: {
    opacity: 0.5,
  },
  actionCheck: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.light.tint + "60",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  actionCheckDone: {
    backgroundColor: Colors.light.priorityLow,
    borderColor: Colors.light.priorityLow,
  },
  actionIndexText: {
    fontFamily: "Lexend_600SemiBold",
    fontSize: 12,
    color: Colors.light.tint,
  },
  actionText: {
    fontFamily: "Lexend_400Regular",
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 24,
    flex: 1,
  },
  actionTextDone: {
    textDecorationLine: "line-through",
    color: Colors.light.textTertiary,
  },
  rawInputText: {
    fontFamily: "Lexend_400Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
});
