import React, { useEffect, useRef, useState } from 'react';
import Constants from 'expo-constants';
import {
  Alert,
  Pressable,
  Platform,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';

type Props = {
  durationHours: number;
  isFirstSession: boolean;
  maxDrinks: number;
  onFinish: () => void;
};

const canUseNotifications = Platform.OS !== 'web' && Constants.appOwnership !== 'expo';

const cancelNotification = async (notificationId: string | null) => {
  if (!notificationId || !canUseNotifications) return;

  try {
    const Notifications = await import('expo-notifications');
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Notifications are best-effort in Expo Go and on unsupported platforms.
  }
};

export default function Pacemaker({ durationHours, isFirstSession, maxDrinks, onFinish }: Props) {
  const [drinks, setDrinks] = useState<number>(0);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [endTimestamp, setEndTimestamp] = useState<number | null>(null);
  const [scheduledNotifId, setScheduledNotifId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownActive = endTimestamp !== null;
  const countdownSec = endTimestamp === null
    ? null
    : Math.max(0, Math.ceil((endTimestamp - currentTime) / 1000));

  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        if (!canUseNotifications) return;
        const Notifications = await import('expo-notifications');
        await Notifications.requestPermissionsAsync();
      } catch {
        // Notifications are best-effort in Expo Go and on unsupported platforms.
      }
    };

    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (endTimestamp === null) return;

    const updateCountdown = () => {
      const now = Date.now();
      setCurrentTime(now);
      if (now >= endTimestamp) {
        setEndTimestamp(null);
        void cancelNotification(scheduledNotifId);
        setScheduledNotifId(null);
        Vibration.vibrate(800);
      }
    };

    updateCountdown();
    intervalRef.current = setInterval(updateCountdown, 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [endTimestamp, scheduledNotifId]);

  const getIntervalMinutesForOrder = (afterDrinksCount: number) => {
    if (!isFirstSession) return 30;
    // first-session sequence: 1->10, 2->20, 3->20, >=4 ->30
    if (afterDrinksCount === 1) return 10;
    if (afterDrinksCount === 2 || afterDrinksCount === 3) return 20;
    return 30;
  };

  const canStartNextInterval = (intervalMinutes: number) => {
    const now = Date.now();
    const start = sessionStart ?? now;
    const end = start + durationHours * 60 * 60 * 1000;
    return now + intervalMinutes * 60 * 1000 <= end;
  };

  const handleOrderPress = async () => {
    if (countdownActive) return;
    if (drinks >= maxDrinks) return;

    const afterCount = drinks + 1;
    const intervalM = getIntervalMinutesForOrder(afterCount);

    if (!canStartNextInterval(intervalM)) {
      // cannot schedule next interval because it would exceed session limit
      Alert.alert('もうそろそろ退店の時間です...');
      return;
    }

    const now = Date.now();
    if (!sessionStart) setSessionStart(now);

    const end = now + intervalM * 60 * 1000;
    setDrinks(afterCount);
    setEndTimestamp(end);

    try {
      if (canUseNotifications) {
        const Notifications = await import('expo-notifications');
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: '飲んでOK',
            body: '次の飲みのタイミングです。',
            sound: 'default',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: intervalM * 60,
            repeats: false,
          },
        });
        setScheduledNotifId(id);
      }
    } catch {
      // Notifications are best-effort in Expo Go and on unsupported platforms.
    }
  };

  const formatTime = (s: number | null, currentDrinks: number, canOrderNext: boolean) => {
    if (currentDrinks >= maxDrinks || !canOrderNext) return 'お酒は控えめに...';
    if (currentDrinks === 0) return 'ビールを飲みましょう';
    if (s === null) return 'まだ飲めますね';
    const totalMinutes = Math.ceil(s / 60);
    const steps = [1, 5, 10, 15, 20, 30];
    const rounded = steps.find((step) => totalMinutes <= step) ?? 30;
    return `あと${rounded}分くらい`;
  };

  const handleDecreaseLong = () => {
    setEndTimestamp(null);
    void cancelNotification(scheduledNotifId);
    setScheduledNotifId(null);
    setDrinks((d) => Math.max(0, d - 1));
  };

  const isMaxed = drinks >= maxDrinks;

  const nextIntervalForPotentialPress = getIntervalMinutesForOrder(drinks + 1);
  const nextAllowedByTime = canStartNextInterval(nextIntervalForPotentialPress);
  const isSessionEnded = isMaxed || !nextAllowedByTime;

  const backgroundColor = isSessionEnded ? styles.bgMax : countdownActive ? styles.bgCountdown : styles.bgReady;

  return (
    <View style={[styles.container, backgroundColor]}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>残り時間</Text>
        <Text style={styles.headerTime}>{formatTime(countdownSec, drinks, nextAllowedByTime)}</Text>
      </View>

      <View style={styles.centerArea}>
        <View style={styles.actionCard}>
          <Pressable
            accessibilityRole="button"
            onPress={handleOrderPress}
            disabled={countdownActive || isMaxed || !nextAllowedByTime}
            style={({ pressed }) => [
              styles.orderButton,
              pressed && styles.orderButtonPressed,
              (countdownActive || isMaxed || !nextAllowedByTime) && styles.orderButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.orderButtonText,
                (isSessionEnded || countdownActive) && styles.orderButtonTextWhite,
              ]}
            >
              {isSessionEnded ? 'もう飲めません...' : countdownActive ? '飲みましょう!' : '酒を注文する'}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onLongPress={handleDecreaseLong}
            delayLongPress={3000}
            style={styles.smallButton}
          >
            <Text style={styles.smallButtonText}>一杯へらす (長押し3秒)</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setEndTimestamp(null);
            void cancelNotification(scheduledNotifId);
            onFinish();
          }}
          style={styles.finishButton}
        >
          <Text style={styles.finishButtonText}>終わる</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 52,
    paddingHorizontal: 18,
    justifyContent: 'space-between',
    backgroundColor: '#0b0d10',
  },
  header: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerLabel: {
    color: '#d7bd8a',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 10,
    opacity: 0.95,
    textTransform: 'uppercase',
  },
  headerTime: {
    color: '#f7efe4',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(215, 189, 138, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  centerArea: {
    alignItems: 'center',
  },
  actionCard: {
    width: '100%',
    maxWidth: 370,
    alignItems: 'center',
    backgroundColor: '#13171b',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#2a3037',
    paddingVertical: 18,
    paddingHorizontal: 18,
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  orderButton: {
    width: '100%',
    minHeight: 108,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dcb77a',
    borderWidth: 1,
    borderColor: '#f0ddb0',
    shadowColor: '#dcb77a',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  orderButtonPressed: {
    transform: [{ scale: 0.99 }],
  },
  orderButtonDisabled: {
    opacity: 0.62,
    backgroundColor: '#3a3e44',
    borderColor: '#5b6169',
    shadowOpacity: 0,
  },
  orderButtonText: {
    color: '#17120d',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    paddingHorizontal: 18,
    letterSpacing: 0.4,
  },
  orderButtonTextWhite: {
    color: '#ffffff',
  },
  smallButton: {
    marginTop: 18,
    width: '82%',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 16,
    backgroundColor: '#1b2026',
    borderWidth: 1,
    borderColor: '#3b4550',
    alignItems: 'center',
  },
  smallButtonText: {
    color: '#e8e3db',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  finishButton: {
    backgroundColor: '#d8bc8d',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0d7a4',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  finishButtonText: {
    color: '#17120d',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  bgCountdown: {
    backgroundColor: '#171417',
  },
  bgReady: {
    backgroundColor: '#11181d',
  },
  bgMax: {
    backgroundColor: '#1a1415',
  },
});
