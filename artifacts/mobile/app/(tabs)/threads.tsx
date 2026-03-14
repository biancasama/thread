import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { TAB_BAR_HEIGHT } from "@/constants/layout";
import { ThreadCard } from "@/components/ThreadCard";
import { useThreads } from "@/context/ThreadContext";
import { LabyrinthLogo } from "@/components/LabyrinthLogo";

export default function ThreadsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = insets.bottom + TAB_BAR_HEIGHT;
  const { threads, activeThread, setActiveThread, deleteThread } = useThreads();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <LabyrinthLogo size={56} />
      <Text style={styles.emptyTitle}>No threads yet</Text>
      <Text style={styles.emptyBody}>
        Capture your first thought to begin.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topInset + 16 }]}>
        <Text style={styles.headerTitle}>Threads</Text>
        <Text style={styles.headerSubtitle}>
          {threads.length} {threads.length === 1 ? "thread" : "threads"} saved
        </Text>
      </View>

      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ThreadCard
            thread={item}
            isActive={activeThread?.id === item.id}
            onPress={() => {
              setActiveThread(item);
              router.push(`/thread/${item.id}`);
            }}
            onDelete={() => deleteThread(item.id)}
          />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: tabBarHeight + 24 + bottomPad },
        ]}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        scrollEnabled={!!threads.length}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  headerTitle: {
    fontFamily: "Lexend_700Bold",
    fontSize: 30,
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: "Lexend_400Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontFamily: "Lexend_600SemiBold",
    fontSize: 20,
    color: Colors.light.text,
    textAlign: "center",
  },
  emptyBody: {
    fontFamily: "Lexend_400Regular",
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
});
