import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@chasemaker/session';

export type PersistedSession = {
  durationHours: number;
  isFirstSession: boolean;
  drinks: number;
  sessionStart: number | null;
  endTimestamp: number | null;
  scheduledNotifId: string | null;
};

export async function loadSession(): Promise<PersistedSession | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedSession;
  } catch {
    return null;
  }
}

export async function saveSession(session: PersistedSession): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Persistence is best-effort; session continues in memory.
  }
}

export async function clearSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore cleanup failures.
  }
}

export function createEmptySession(
  durationHours: number,
  isFirstSession: boolean,
): PersistedSession {
  return {
    durationHours,
    isFirstSession,
    drinks: 0,
    sessionStart: null,
    endTimestamp: null,
    scheduledNotifId: null,
  };
}
