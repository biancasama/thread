import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";

type Priority = "low" | "medium" | "high";

interface PriorityBadgeProps {
  priority: Priority;
  size?: "sm" | "md";
}

const LABELS: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function PriorityBadge({ priority, size = "md" }: PriorityBadgeProps) {
  const color = {
    high: Colors.light.priorityHigh,
    medium: Colors.light.priorityMedium,
    low: Colors.light.priorityLow,
  }[priority];

  const isSmall = size === "sm";

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color + "1A",
          borderColor: color + "40",
          paddingHorizontal: isSmall ? 8 : 12,
          paddingVertical: isSmall ? 3 : 5,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text
        style={[
          styles.label,
          { color, fontSize: isSmall ? 11 : 12 },
        ]}
      >
        {LABELS[priority]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
});
