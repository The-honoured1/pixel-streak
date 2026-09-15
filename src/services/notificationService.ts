import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const CHANNEL_ID = 'habit-reminders';

/**
 * Call once at app startup.
 * - Registers the global notification handler (controls foreground behaviour).
 * - Creates the Android notification channel.
 */
export async function initNotifications(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Habit Reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

/**
 * Requests notification permissions from the OS.
 * Returns `true` when permission is granted, `false` otherwise.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

/**
 * Schedules a repeating daily notification for a habit.
 *
 * @param habitId   - Unique habit identifier (used only for logging context).
 * @param habitName - Human-readable name shown in the notification body.
 * @param hour      - Local hour to fire (0–23).
 * @param minute    - Local minute to fire (0–59).
 * @returns The notification identifier string, or `null` on failure.
 */
export async function scheduleHabitReminder(
  habitId: string,
  habitName: string,
  hour: number,
  minute: number,
): Promise<string | null> {
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎯 Habit Reminder',
        body: `Time to track "${habitName}"!`,
        data: { habitId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    return identifier;
  } catch (err) {
    console.warn('[notificationService] scheduleHabitReminder failed:', err);
    return null;
  }
}

/**
 * Cancels a single scheduled notification by its identifier.
 */
export async function cancelHabitReminder(identifier: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (err) {
    console.warn('[notificationService] cancelHabitReminder failed:', err);
  }
}

/**
 * Cancels every scheduled notification managed by this app.
 */
export async function cancelAllHabitReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (err) {
    console.warn('[notificationService] cancelAllHabitReminders failed:', err);
  }
}
