import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import { useDispatch } from 'react-redux';
import { updateHistory } from '../store/habitSlice';
import { saveHistory, getAllHistory } from '../db/sqlite';
import { formatDate } from '../utils/dateUtils';
import { calculateStreak } from '../utils/frequencyUtils';
import { Check, Clock, Hash, Smile, Flame } from 'lucide-react-native';

interface HabitCardProps {
  habit: any;
  completed: boolean;
  value: number;
}

const HabitCard = ({ habit, completed, value }: HabitCardProps) => {
  const dispatch = useDispatch();
  
  // Calculate real streak from MMKV history
  const allHistory = getAllHistory();
  const currentStreak = calculateStreak(habit.id, allHistory);

  const handleToggle = () => {
    Vibration.vibrate(40); // Simple haptic feedback
    const today = formatDate(new Date());
    const newEntry = {
      id: `${habit.id}-${today}`,
      habitId: habit.id,
      date: today,
      completed: !completed,
      value: habit.type === 'checkbox' ? (!completed ? 1 : 0) : value,
    };

    // MMKV is synchronous — no await needed
    saveHistory(newEntry);
    dispatch(updateHistory(newEntry));
  };

  /** Pick an inline icon based on habit type */
  // const TypeIcon = () => {
  //   if (habit.type === 'timer') return <Clock color={habit.color} size={20} />;
  //   if (habit.type === 'count') return <Hash color={habit.color} size={20} />;
  //   return <Smile color={habit.color} size={20} />;
  // };
  // Remove the separate TypeIcon component and simplify IconComponent

const getIcon = () => {
  if (habit.icon) {
    // If it's a string (emoji), render as Text
    if (typeof habit.icon === 'string') {
      return <Text style={{ fontSize: 20 }}>{habit.icon}</Text>;
    }
    // If it's a Lucide component reference
    const Icon = habit.icon;
    return <Icon color={habit.color} size={20} />;
  }
  if (habit.type === 'timer') return <Clock color={habit.color} size={20} />;
  if (habit.type === 'count') return <Hash color={habit.color} size={20} />;
  return <Smile color={habit.color} size={20} />;
};
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[styles.card, { borderLeftColor: habit.color }]}
      onPress={handleToggle}
    >
      {/* Habit icon box */}
      <View style={[styles.iconContainer, { backgroundColor: habit.color + '20' }]}>
       {getIcon()}{/* Custom icon from user */}
        {/* <TypeIcon />  */}
      </View>

      {/* Title & streak */}
      <View style={styles.details}>
        <Text style={styles.title}>{habit.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.streakText}>
            {habit.type === 'timer'
              ? `${habit.target} min`
              : habit.type === 'count'
              ? `Target: ${habit.target}`
              : 'Tap to complete'}
          </Text>
          {currentStreak > 0 && (
            <View style={styles.streakBadge}>
              <Flame color="#FF8A00" size={14} />
              <Text style={styles.streakCount}>{currentStreak}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Completion indicator */}
      <View style={styles.status}>
        <TouchableOpacity
          onPress={handleToggle}
          style={[
            styles.checkbox,
            completed
              ? { backgroundColor: habit.color }
              : { borderColor: habit.color, borderWidth: 2 },
          ]}
        >
          {completed && <Check color="#FFF" size={14} strokeWidth={3} />}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderLeftWidth: 5,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    fontFamily: 'McLaren-Regular',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  streakText: {
    fontSize: 12,
    color: '#AAA',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  streakCount: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF8A00',
  },
  status: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HabitCard;
