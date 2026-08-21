import { useEffect, useState } from 'react';
import { Alert, Vibration } from 'react-native';
import {
  cancelScheduledNotification,
  requestNotificationPermission,
  scheduleDrinkReadyNotification,
} from './notifications';
import {
  canFitInterval,
  headerMessage,
  intervalMinutesAfterDrink,
  remainingSeconds,
} from './pacing';

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

  const countdownActive = endTimestamp !== null;
  const countdownSec =
    endTimestamp === null ? null : remainingSeconds(endTimestamp, currentTime);

  useEffect(() => {
    void requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (endTimestamp === null) return;

    const updateCountdown = () => {
      const now = Date.now();
      setCurrentTime(now);
      if (now >= endTimestamp) {
        setEndTimestamp(null);
        void cancelScheduledNotification(scheduledNotifId);
        setScheduledNotifId(null);
        Vibration.vibrate(800);
      }
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalId);
  }, [endTimestamp, scheduledNotifId]);

  const stopCountdown = () => {
    setEndTimestamp(null);
    void cancelScheduledNotification(scheduledNotifId);
    setScheduledNotifId(null);
  };

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

    setDrinks(afterCount);
    setEndTimestamp(now + intervalMinutes * 60 * 1000);

    const notificationId = await scheduleDrinkReadyNotification(intervalMinutes * 60);
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
      onFinish();
    },
  };
}
