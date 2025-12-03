// Notification utilities

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function showNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  new Notification(title, {
    icon: '/favicon.png',
    badge: '/favicon.png',
    ...options,
  });
}

export function scheduleNotification(
  title: string,
  body: string,
  time: Date,
  options?: NotificationOptions
): number {
  const now = Date.now();
  const scheduledTime = time.getTime();
  const delay = scheduledTime - now;

  if (delay < 0) {
    console.warn('Cannot schedule notification in the past');
    return -1;
  }

  return window.setTimeout(() => {
    showNotification(title, { body, ...options });
  }, delay);
}

export function cancelNotification(timeoutId: number) {
  clearTimeout(timeoutId);
}

// Habit reminder notification
export function scheduleHabitReminder(
  habitTitle: string,
  reminderTime: string,
  enabled: boolean = true
): number | null {
  if (!enabled) return null;

  requestNotificationPermission().then((granted) => {
    if (!granted) return;

    const [hours, minutes] = reminderTime.split(':').map(Number);
    const reminderDate = new Date();
    reminderDate.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (reminderDate.getTime() < Date.now()) {
      reminderDate.setDate(reminderDate.getDate() + 1);
    }

    return scheduleNotification(
      'Напоминание о привычке',
      `Не забудьте выполнить: ${habitTitle}`,
      reminderDate,
      {
        tag: `habit-${habitTitle}`,
        requireInteraction: false,
      }
    );
  });

  return null;
}

// Task reminder notification
export function scheduleTaskReminder(
  taskTitle: string,
  reminderTime: Date,
  enabled: boolean = true
): number | null {
  if (!enabled) return null;

  requestNotificationPermission().then((granted) => {
    if (!granted) return;

    return scheduleNotification(
      'Напоминание о задаче',
      `Не забудьте: ${taskTitle}`,
      reminderTime,
      {
        tag: `task-${taskTitle}`,
        requireInteraction: false,
      }
    );
  });

  return null;
}

