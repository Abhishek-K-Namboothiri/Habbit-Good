import notifee, { TriggerType, RepeatFrequency } from '@notifee/react-native';

export const requestNotificationPermission = async () => {
  await notifee.requestPermission();
};

export const scheduleHabitReminder = async (habit: any) => {
  if (!habit.reminderTime) return;

  const [hours, minutes] = habit.reminderTime.split(':').map(Number);
  const date = new Date(Date.now());
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);

  // If time has already passed today, schedule for tomorrow
  if (date.getTime() < Date.now()) {
    date.setDate(date.getDate() + 1);
  }

  await notifee.createTriggerNotification(
    {
      id: habit.id,
      title: `Time to ${habit.title}!`,
      body: `Don't forget to complete your habit for today.`,
      android: {
        channelId: 'habbit-good-reminders',
        smallIcon: 'ic_launcher',
        pressAction: {
          id: 'default',
        },
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    }
  );
};

export const cancelHabitReminder = async (habitId: string) => {
  await notifee.cancelNotification(habitId);
};

export const createNotificationChannel = async () => {
  await notifee.createChannel({
    id: 'habbit-good-reminders',
    name: 'Habit Reminders',
    importance: 4,
  });
};
