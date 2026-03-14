import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Colors from "@/constants/colors";
import { Thread } from "@/context/ThreadContext";
import { PriorityBadge } from "./PriorityBadge";

interface ThreadCardProps {
  thread: Thread;
  isActive?: boolean;
  onPress: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

function formatRelativeTime(isoString: string): string {
  const now = new Date();
  const date = new Date(isoString);
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function ThreadCard({
  thread,
  isActive = false,
  onPress,
  onDelete,
  compact = false,
}: ThreadCardProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.975,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    onPress();
  };

  const handleDelete = () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete?.();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          isActive && styles.cardActive,
          compact && styles.cardCompact,
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <PriorityBadge priority={thread.priority} size="sm" />
            <Text style={styles.time}>{formatRelativeTime(thread.created_at)}</Text>
          </View>
          {onDelete && (
            <Pressable onPress={handleDelete} style={styles.deleteBtn} hitSlop={8}>
              <Feather name="trash-2" size={14} color={Colors.light.textTertiary} />
            </Pressable>
          )}
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {thread.thread_title}
        </Text>

        {!compact && (
          <>
            <Text style={styles.goal} numberOfLines={2}>
              {thread.goal}
            </Text>

            <View style={styles.stepRow}>
              <View style={styles.stepDot} />
              <Text style={styles.step} numberOfLines={1}>
                {thread.current_step}
              </Text>
            </View>
          </>
        )}

        {isActive && (
          <View style={styles.activeDot} />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
    position: "relative",
  },
  cardActive: {
    borderColor: Colors.light.tint + "60",
    backgroundColor: Colors.light.backgroundTertiary,
  },
  cardCompact: {
    padding: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  time: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.light.textTertiary,
  },
  deleteBtn: {
    padding: 4,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 6,
  },
  goal: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.tint,
  },
  step: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.light.tint,
    flex: 1,
  },
  activeDot: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.tint,
  },
});
