import { Feather } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
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
import { ThreadCard } from "@/components/ThreadCard";
import { useThreads } from "@/context/ThreadContext";

export default function ThreadsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { threads, activeThread, setActiveThread, deleteThread } = useThreads();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Feather name="git-merge" size={28} color={Colors.light.tint} />
      </View>
      <Text style={styles.emptyTitle}>No threads yet</Text>
      <Text style={styles.emptyBody}>
        Capture your first thought to get started. Your structured threads will appear here.
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
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.light.tint + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.light.text,
    textAlign: "center",
  },
  emptyBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
});
