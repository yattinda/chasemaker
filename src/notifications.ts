import { Platform } from 'react-native';
import Constants from 'expo-constants';

const canUseNotifications = Platform.OS !== 'web' && Constants.appOwnership !== 'expo';

async function withNotifications<T>(fn: (mod: typeof import('expo-notifications')) => Promise<T>) {
  if (!canUseNotifications) return null;

  try {
    const Notifications = await import('expo-notifications');
    return await fn(Notifications);
  } catch {
    // Notifications are best-effort in Expo Go and on unsupported platforms.
    return null;
  }
}

export async function requestNotificationPermission() {
  await withNotifications((Notifications) => Notifications.requestPermissionsAsync());
}

export async function cancelScheduledNotification(notificationId: string | null) {
  if (!notificationId) return;
  await withNotifications((Notifications) =>
    Notifications.cancelScheduledNotificationAsync(notificationId),
  );
}

export async function cancelAllScheduledNotifications() {
  await withNotifications((Notifications) => Notifications.cancelAllScheduledNotificationsAsync());
}

export async function scheduleDrinkReadyNotification(seconds: number) {
  return withNotifications((Notifications) =>
    Notifications.scheduleNotificationAsync({
      content: {
        title: '飲んでOK',
        body: '次の飲みのタイミングです。',
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: false,
      },
    }),
  );
}
