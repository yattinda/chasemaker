import React, { useEffect, useRef, useState } from 'react';
import Constants from 'expo-constants';
import {
  Alert,
  AppState,
  Pressable,
  Platform,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
// Note: don't import expo-notifications at top-level to avoid runtime errors in Expo Go
// We'll dynamically import it when needed.

type Props = {
  durationHours: number;
  isFirstSession: boolean;
  maxDrinks: number;
  onFinish: () => void;
};

export default function Pacemaker({ durationHours, isFirstSession, maxDrinks, onFinish }: Props) {
  const [drinks, setDrinks] = useState<number>(0);
  const [countdownSec, setCountdownSec] = useState<number | null>(null);
  const [countdownActive, setCountdownActive] = useState<boolean>(false);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [endTimestamp, setEndTimestamp] = useState<number | null>(null);
  const [scheduledNotifId, setScheduledNotifId] = useState<string | null>(null);

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Request notification permissions on mount (best-effort)
    (async () => {
      try {
        if (Platform.OS !== 'web' && Constants.appOwnership !== 'expo') {
          // Only request permissions in dev clients / standalone builds, not Expo Go
          const Notifications = await import('expo-notifications');
          if (Notifications && Notifications.requestPermissionsAsync) {
            await Notifications.requestPermissionsAsync();
          }
        }
      } catch (e) {
        // ignore import / permission errors (Expo Go on Android may throw)
      }
    })();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        // when returning to foreground, recalculate remaining time
        if (endTimestamp) {
          const remainingMs = endTimestamp - Date.now();
          if (remainingMs <= 0) {
            // finished while in background
            if (intervalRef.current) {
              clearInterval(intervalRef.current as any);
              intervalRef.current = null;
            }
            setCountdownActive(false);
            setCountdownSec(null);
            setEndTimestamp(null);
            if (scheduledNotifId) {
              if (Constants.appOwnership !== 'expo') {
                import('expo-notifications')
                  .then((Notifications) => {
                    if (Notifications && Notifications.cancelScheduledNotificationAsync) {
                      Notifications.cancelScheduledNotificationAsync(scheduledNotifId).catch(() => {});
                    }
                  })
                  .catch(() => {});
              }
              setScheduledNotifId(null);
            }
            Vibration.vibrate(800);
            return;
          }
          setCountdownSec(Math.ceil(remainingMs / 1000));
          setCountdownActive(true);
          // start interval if not running
          if (!intervalRef.current) {
            intervalRef.current = setInterval(() => {
              setCountdownSec((s) => {
                if (s === null) return null;
                if (s <= 1) {
                  if (intervalRef.current) {
                    clearInterval(intervalRef.current as any);
                    intervalRef.current = null;
                  }
                  setCountdownActive(false);
                  setCountdownSec(null);
                  setEndTimestamp(null);
                  if (scheduledNotifId) {
                    if (Constants.appOwnership !== 'expo') {
                      import('expo-notifications')
                        .then((Notifications) => {
                          if (Notifications && Notifications.cancelScheduledNotificationAsync) {
                            Notifications.cancelScheduledNotificationAsync(scheduledNotifId).catch(() => {});
                          }
                        })
                        .catch(() => {});
                    }
                    setScheduledNotifId(null);
                  }
                  Vibration.vibrate(800);
                  return null;
                }
                return s - 1;
              });
            }, 1000) as unknown as number;
          }
        }
      } else {
        // when going to background/inactive, stop interval to conserve resources
        if (intervalRef.current) {
          clearInterval(intervalRef.current as any);
          intervalRef.current = null;
        }
      }
    });

    return () => {
      sub.remove();
    };
  }, [countdownActive, countdownSec]);

  // manage active interval while app is foreground
  useEffect(() => {
    if (countdownActive && countdownSec !== null) {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          setCountdownSec((s) => {
            if (s === null) return null;
            if (s <= 1) {
              if (intervalRef.current) {
                clearInterval(intervalRef.current as any);
                intervalRef.current = null;
              }
              setCountdownActive(false);
              setCountdownSec(null);
              setEndTimestamp(null);
              if (scheduledNotifId) {
                import('expo-notifications')
                  .then((Notifications) => {
                    if (Notifications && Notifications.cancelScheduledNotificationAsync) {
                      Notifications.cancelScheduledNotificationAsync(scheduledNotifId).catch(() => {});
                    }
                  })
                  .catch(() => {});
                setScheduledNotifId(null);
              }
              Vibration.vibrate(800);
              return null;
            }
            return s - 1;
          });
        }, 1000) as unknown as number;
      }
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current as any);
          intervalRef.current = null;
        }
      };
    }
    return;
  }, [countdownActive, countdownSec, scheduledNotifId]);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current as any);
        intervalRef.current = null;
      }
    };
  }, []);

  const sessionEndTime = sessionStart ? sessionStart + durationHours * 60 * 60 * 1000 : null;

  const getIntervalMinutesForOrder = (afterDrinksCount: number) => {
    if (!isFirstSession) return 30;
    // first-session sequence: 1->10, 2->20, 3->20, >=4 ->30
    if (afterDrinksCount === 1) return 10;
    if (afterDrinksCount === 2 || afterDrinksCount === 3) return 20;
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
    setCountdownSec(intervalM * 60);
    setCountdownActive(true);
    setEndTimestamp(end);

    // schedule a local notification for when the timer ends (best-effort)
    try {
      if (Platform.OS !== 'web' && Constants.appOwnership !== 'expo') {
        const Notifications = await import('expo-notifications');
        if (Notifications && Notifications.scheduleNotificationAsync) {
          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: '飲んでOK',
              body: '次の飲みのタイミングです。',
              sound: 'default',
            },
            trigger: { seconds: intervalM * 60, repeats: false },
          });
          setScheduledNotifId(id);
        }
      }
    } catch (e) {
      // ignore scheduling errors
    }
  };

  const formatTime = (s: number | null) => {
    if (s === null) return '--:--';
    const mm = Math.floor(s / 60)
      .toString()
      .padStart(2, '0');
    const ss = Math.floor(s % 60)
      .toString()
      .padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const handleDecreaseLong = () => {
    // stop any running countdown and reset, cancel notification
    if (intervalRef.current) {
      clearInterval(intervalRef.current as any);
      intervalRef.current = null;
    }
    setCountdownActive(false);
    setCountdownSec(null);
    setEndTimestamp(null);
    if (scheduledNotifId) {
      if (Constants.appOwnership !== 'expo') {
        import('expo-notifications')
          .then((Notifications) => {
            if (Notifications && Notifications.cancelScheduledNotificationAsync) {
              Notifications.cancelScheduledNotificationAsync(scheduledNotifId).catch(() => {});
            }
          })
          .catch(() => {});
      }
      setScheduledNotifId(null);
    }
    setDrinks((d) => Math.max(0, d - 1));
  };

  const isMaxed = drinks >= maxDrinks;

  const nextIntervalForPotentialPress = getIntervalMinutesForOrder(drinks + 1);
  const nextAllowedByTime = canStartNextInterval(nextIntervalForPotentialPress);

  const backgroundColor = isMaxed ? styles.bgMax : countdownActive ? styles.bgCountdown : styles.bgReady;

  return (
    <View style={[styles.container, backgroundColor]}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>残り時間</Text>
        <Text style={styles.headerTime}>{formatTime(countdownSec)}</Text>
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
            <Text style={styles.orderButtonText}>{isMaxed ? 'もう飲めません...' : countdownActive ? '飲みましょう!' : '酒を注文する'}</Text>
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
            // stop timers and go back
            if (intervalRef.current) {
              clearInterval(intervalRef.current as any);
              intervalRef.current = null;
            }
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
    paddingTop: 56,
    paddingHorizontal: 18,
    justifyContent: 'space-between',
    backgroundColor: '#121416',
  },
  header: {
    alignItems: 'center',
    paddingTop: 14,
  },
  headerLabel: {
    color: '#d7d7d1',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
    opacity: 0.9,
  },
  headerText: {
    color: '#f5f5f4',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  headerTime: {
    color: '#f5f5f1',
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: 1,
  },
  centerArea: {
    alignItems: 'center',
  },
  actionCard: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  orderButton: {
    width: '100%',
    minHeight: 104,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#355d7d',
    borderWidth: 1,
    borderColor: '#6ca8d7',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  orderButtonPressed: {
    transform: [{ scale: 0.99 }],
  },
  orderButtonDisabled: {
    opacity: 0.6,
    backgroundColor: '#3c3f45',
    borderColor: '#5f646b',
  },
  orderButtonText: {
    color: '#f4f7fb',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    paddingHorizontal: 20,
    letterSpacing: 0.5,
  },
  smallButton: {
    marginTop: 18,
    width: '72%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#1e2329',
    borderWidth: 1,
    borderColor: '#3a4048',
    alignItems: 'center',
  },
  smallButtonText: {
    color: '#e6e6e6',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  finishButton: {
    backgroundColor: '#d9c7a6',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1d9aa',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  finishButtonText: {
    color: '#191511',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  bgCountdown: {
    backgroundColor: '#211d21',
  },
  bgReady: {
    backgroundColor: '#141b22',
  },
  bgMax: {
    backgroundColor: '#221b1f',
  },
});
