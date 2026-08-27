import { useEffect, useRef, useState } from 'react';
import { Alert, AppState } from 'react-native';
import { triggerCountdownEndHaptic, triggerOrderHaptic } from './haptics';
import {
  cancelAllScheduledNotifications,
  cancelScheduledNotification,
  requestNotificationPermission,
  rescheduleCountdownNotification,
  scheduleDrinkReadyNotification,
} from './notifications';
import {
  canFitInterval,
  headerMessage,
  intervalMinutesAfterDrink,
  remainingSeconds,
} from './pacing';
import { clearSession, loadSession, saveSession } from './sessionStorage';

type Params = {
  durationHours: number;
  isFirstSession: boolean;
  maxDrinks: number;
  onFinish: () => void;
};

export function usePacemakerSession({
  durationHours,
  isFirstSession,
  maxDrinks,
  onFinish,
}: Params) {
  const [drinks, setDrinks] = useState(0);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [endTimestamp, setEndTimestamp] = useState<number | null>(null);
  const [scheduledNotifId, setScheduledNotifId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [hydrated, setHydrated] = useState(false);

  const endTimestampRef = useRef(endTimestamp);
  const scheduledNotifIdRef = useRef(scheduledNotifId);
  const scheduleGenerationRef = useRef(0);

  endTimestampRef.current = endTimestamp;
  scheduledNotifIdRef.current = scheduledNotifId;

  const countdownActive = endTimestamp !== null;
  const countdownSec =
    endTimestamp === null ? null : remainingSeconds(endTimestamp, currentTime);

  const completeCountdown = () => {
    setEndTimestamp(null);
    setScheduledNotifId(null);
  };

  const stopCountdown = () => {
    scheduleGenerationRef.current += 1;
    setEndTimestamp(null);
    setScheduledNotifId(null);
    void cancelAllScheduledNotifications();
  };

  useEffect(() => {
    void requestNotificationPermission();
    return () => {
      scheduleGenerationRef.current += 1;
      void cancelAllScheduledNotifications();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const saved = await loadSession();
      if (cancelled) return;

      if (
        saved &&
        saved.durationHours === durationHours &&
        saved.isFirstSession === isFirstSession
      ) {
        const now = Date.now();
        setDrinks(saved.drinks);
        setSessionStart(saved.sessionStart);

        if (saved.endTimestamp !== null && saved.endTimestamp > now) {
          setEndTimestamp(saved.endTimestamp);
          const notificationId = await rescheduleCountdownNotification(
            saved.endTimestamp,
            saved.scheduledNotifId,
            now,
          );
          if (!cancelled && notificationId) setScheduledNotifId(notificationId);
        }
      }

      if (!cancelled) setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [durationHours, isFirstSession]);

  useEffect(() => {
    if (!hydrated) return;

    void saveSession({
      durationHours,
      isFirstSession,
      drinks,
      sessionStart,
      endTimestamp,
      scheduledNotifId,
    });
  }, [
    hydrated,
    durationHours,
    isFirstSession,
    drinks,
    sessionStart,
    endTimestamp,
    scheduledNotifId,
  ]);

  const syncCountdown = (now: number) => {
    setCurrentTime(now);

    const activeEnd = endTimestampRef.current;
    if (activeEnd === null) return;

    if (now >= activeEnd) {
      completeCountdown();
      void cancelAllScheduledNotifications();
      void triggerCountdownEndHaptic();
    }
  };

  const refreshCountdownNotification = (now = Date.now()) => {
    const activeEnd = endTimestampRef.current;
    if (activeEnd === null || now >= activeEnd) return;

    void rescheduleCountdownNotification(activeEnd, scheduledNotifIdRef.current, now).then(
      (notificationId) => {
        if (notificationId) setScheduledNotifId(notificationId);
      },
    );
  };

  useEffect(() => {
    if (endTimestamp === null) return;

    syncCountdown(Date.now());
    const intervalId = setInterval(() => syncCountdown(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, [endTimestamp]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        const now = Date.now();
        syncCountdown(now);
        refreshCountdownNotification(now);
      }
    });

    return () => subscription.remove();
  }, []);

  const nextIntervalMinutes = intervalMinutesAfterDrink(drinks + 1, isFirstSession);
  const nextAllowedByTime = canFitInterval(nextIntervalMinutes, sessionStart, durationHours);
  const isMaxed = drinks >= maxDrinks;
  const isSessionEnded = isMaxed || !nextAllowedByTime;
  const orderDisabled = countdownActive || isMaxed || !nextAllowedByTime;

  const orderDrink = async () => {
    if (countdownActive || drinks >= maxDrinks) return;

    const afterCount = drinks + 1;
    const intervalMinutes = intervalMinutesAfterDrink(afterCount, isFirstSession);

    if (!canFitInterval(intervalMinutes, sessionStart, durationHours)) {
      Alert.alert('もうそろそろ退店の時間です...');
      return;
    }

    const now = Date.now();
    if (!sessionStart) setSessionStart(now);

    const scheduleGeneration = scheduleGenerationRef.current;

    setDrinks(afterCount);
    setEndTimestamp(now + intervalMinutes * 60 * 1000);
    void triggerOrderHaptic();

    await cancelAllScheduledNotifications();

    const notificationId = await scheduleDrinkReadyNotification(intervalMinutes * 60);
    if (scheduleGeneration !== scheduleGenerationRef.current) {
      if (notificationId) await cancelScheduledNotification(notificationId);
      return;
    }

    if (notificationId) setScheduledNotifId(notificationId);
  };

  return {
    countdownActive,
    headerText: headerMessage(countdownSec, drinks, maxDrinks, nextAllowedByTime),
    isSessionEnded,
    orderDisabled,
    orderDrink,
    decreaseDrink: () => {
      stopCountdown();
      setDrinks((count) => Math.max(0, count - 1));
    },
    finish: () => {
      stopCountdown();
      void clearSession();
      onFinish();
    },
  };
}
