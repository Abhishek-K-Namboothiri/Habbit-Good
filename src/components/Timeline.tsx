import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { formatDate, getDayIndex } from '../utils/dateUtils';

const Timeline = ({ selectedDate, onDateChange }: { selectedDate: Date; onDateChange: (date: Date) => void }) => {
  const days = [];
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - getDayIndex(selectedDate));

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
  }

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <View style={styles.container}>
      <View style={styles.daysLabels}>
        {dayLabels.map((label, index) => (
          <Text key={index} style={styles.label}>{label}</Text>
        ))}
      </View>
      <View style={styles.datesContainer}>
        {days.map((day, index) => {
          const isSelected = formatDate(day) === formatDate(selectedDate);
          const isToday = formatDate(day) === formatDate(new Date());

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                isSelected && styles.selectedDayButton,
                isToday && !isSelected && styles.todayButton
              ]}
              onPress={() => onDateChange(day)}
            >
              <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
                {day.getDate()}
              </Text>
              {isToday && !isSelected && <View style={styles.todayIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  daysLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    color: '#AAA',
    fontWeight: '600',
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayButton: {
    backgroundColor: '#333',
  },
  todayButton: {
    borderColor: '#FF8A00',
    borderWidth: 1,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  selectedDayText: {
    color: '#FFF',
  },
  todayIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF8A00',
    position: 'absolute',
    bottom: 4,
  }
});

export default Timeline;
