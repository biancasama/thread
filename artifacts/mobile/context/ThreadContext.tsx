import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface Fragment {
  type: "text" | "image";
  content: string;
}

export interface Thread {
  id: string;
  thread_title: string;
  goal: string;
  current_step: string;
  important_context: string;
  next_actions: string[];
  priority: "low" | "medium" | "high";
  raw_input: string;
  created_at: string;
}

interface ThreadContextValue {
  threads: Thread[];
  activeThread: Thread | null;
  isLoading: boolean;
  isParsing: boolean;
  parseError: string | null;
  parseThought: (fragments: Fragment[]) => Promise<Thread | null>;
  loadDemoThread: () => void;
  deleteThread: (id: string) => void;
  setActiveThread: (thread: Thread | null) => void;
  clearError: () => void;
}

const STORAGE_KEY = "@thread_threads";

const DEMO_THREAD: Thread = {
  id: "demo-" + Date.now(),
  thread_title: "Hackathon Project - Thread",
  goal: "Build an AI external working memory assistant",
  current_step: "Preparing demo pitch",
  important_context: "The user is finalizing the hackathon demo",
  next_actions: [
    "Write 15-second hook",
    "Prepare demo artifacts",
    "Record submission video",
  ],
  priority: "high",
  raw_input: "Demo thread loaded",
  created_at: new Date().toISOString(),
};

const ThreadContext = createContext<ThreadContextValue | null>(null);

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "/api";

export function ThreadProvider({ children }: { children: React.ReactNode }) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Thread[] = JSON.parse(stored);
        setThreads(parsed);
        if (parsed.length > 0) {
          setActiveThread(parsed[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load threads", e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveThreads = async (updated: Thread[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save threads", e);
    }
  };

  const parseThought = useCallback(async (fragments: Fragment[]): Promise<Thread | null> => {
    setIsParsing(true);
    setParseError(null);

    try {
      const response = await fetch(`${API_BASE}/thread/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fragments }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: "Network error" }));
        throw new Error(errData.error || `Error ${response.status}`);
      }

      const data = await response.json();

      const rawInput = fragments
        .filter((f) => f.type === "text")
        .map((f) => f.content)
        .join("\n");

      const newThread: Thread = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
        thread_title: data.thread_title,
        goal: data.goal,
        current_step: data.current_step,
        important_context: data.important_context,
        next_actions: data.next_actions,
        priority: data.priority,
        raw_input: rawInput,
        created_at: new Date().toISOString(),
      };

      const updated = [newThread, ...threads];
      setThreads(updated);
      setActiveThread(newThread);
      await saveThreads(updated);
      return newThread;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to parse thought";
      setParseError(msg);
      return null;
    } finally {
      setIsParsing(false);
    }
  }, [threads]);

  const loadDemoThread = useCallback(() => {
    const demo: Thread = { ...DEMO_THREAD, id: Date.now().toString() + "-demo" };
    const updated = [demo, ...threads];
    setThreads(updated);
    setActiveThread(demo);
    saveThreads(updated);
  }, [threads]);

  const deleteThread = useCallback((id: string) => {
    setThreads(prev => {
      const updated = prev.filter(t => t.id !== id);
      saveThreads(updated);
      return updated;
    });
    setActiveThread(prev => {
      if (prev?.id === id) return null;
      return prev;
    });
  }, []);

  const clearError = useCallback(() => setParseError(null), []);

  const value = useMemo<ThreadContextValue>(() => ({
    threads,
    activeThread,
    isLoading,
    isParsing,
    parseError,
    parseThought,
    loadDemoThread,
    deleteThread,
    setActiveThread,
    clearError,
  }), [threads, activeThread, isLoading, isParsing, parseError, parseThought, loadDemoThread, deleteThread, clearError]);

  return (
    <ThreadContext.Provider value={value}>
      {children}
    </ThreadContext.Provider>
  );
}

export function useThreads() {
  const ctx = useContext(ThreadContext);
  if (!ctx) throw new Error("useThreads must be used within ThreadProvider");
  return ctx;
}
