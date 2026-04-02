import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../store/habitSlice';
import { getAllHistory } from '../db/sqlite';
import { formatDate } from '../utils/dateUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const CalendarScreen = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { habits } = useSelector((state: RootState) => state.habits);
  const allHistory = getAllHistory();

  // Build a set of dates that have at least 1 completion
  const completedDates = new Set(
    allHistory.filter((e) => e.completed).map((e) => e.date),
  );

  // Completions for a given date, by habit
  const getCompletionsForDate = (dateStr: string) => {
    return allHistory
      .filter((e) => e.date === dateStr && e.completed)
      .map((e) => habits.find((h: any) => h.id === e.habitId))
      .filter(Boolean);
  };

  const buildCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDow = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();

    const padding = firstDow === 0 ? 6 : firstDow - 1; // Shift to Mon-start
    const cells: { day: number; current: boolean; dateStr: string }[] = [];

    for (let i = padding; i > 0; i--) {
      cells.push({ day: prevDays - i + 1, current: false, dateStr: '' });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, current: true, dateStr });
    }
    return cells;
  };

  const changeMonth = (delta: number) => {
    setCurrentMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + delta);
      return d;
    });
  };

  const monthLabel = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const todayStr = formatDate(new Date());
  const cells = buildCalendarDays();
  const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  // Monthly stats
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthCompletions = allHistory.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month && e.completed;
  }).length;

  const selectedCompletions = selectedDate ? getCompletionsForDate(selectedDate) : [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Calendar</Text>
        </View>

        {/* Month nav */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navBtn}>
            <ChevronLeft color="#333" size={22} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navBtn}>
            <ChevronRight color="#333" size={22} />
          </TouchableOpacity>
        </View>

        {/* Calendar grid */}
        <View style={styles.calCard}>
          {/* Day labels */}
          <View style={styles.dayLabelsRow}>
            {DAY_LABELS.map((l) => (
              <Text key={l} style={styles.dayLabel}>{l}</Text>
            ))}
          </View>
          {/* Cells */}
          <View style={styles.grid}>
            {cells.map((cell, i) => {
              const isToday = cell.dateStr === todayStr;
              const isSelected = cell.dateStr === selectedDate;
              const hasCompletion = cell.current && completedDates.has(cell.dateStr);
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.cell,
                    isToday && styles.cellToday,
                    isSelected && styles.cellSelected,
                  ]}
                  onPress={() => cell.current && setSelectedDate(cell.dateStr)}
                  disabled={!cell.current}
                >
                  <Text
                    style={[
                      styles.cellText,
                      !cell.current && styles.cellTextInactive,
                      (isToday || isSelected) && styles.cellTextHighlight,
                    ]}
                  >
                    {cell.day}
                  </Text>
                  {hasCompletion && <View style={styles.dot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Monthly summary */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{monthCompletions}</Text>
            <Text style={styles.statLabel}>Completions this month</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{completedDates.size}</Text>
            <Text style={styles.statLabel}>Active days total</Text>
          </View>
        </View>

        {/* Selected day detail */}
        {selectedDate && (
          <View style={styles.detailCard}>
            <Text style={styles.detailDate}>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long', day: 'numeric', month: 'long',
              })}
            </Text>
            {selectedCompletions.length === 0 ? (
              <Text style={styles.detailEmpty}>No completions recorded.</Text>
            ) : (
              selectedCompletions.map((h: any, i: number) => (
                <View key={i} style={styles.detailItem}>
                  <Text style={styles.detailIcon}>{h.icon}</Text>
                  <Text style={styles.detailName}>{h.title}</Text>
                  <View style={[styles.doneDot, { backgroundColor: h.color }]} />
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F2' },
  scroll: { padding: 22, paddingBottom: 100 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '900', color: '#222', fontFamily: 'McLaren-Regular' },
  monthNav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16,
  },
  navBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  monthLabel: { fontSize: 18, fontWeight: '800', color: '#222' },
  calCard: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 16, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  dayLabelsRow: { flexDirection: 'row', marginBottom: 8 },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: '#CCC' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`, aspectRatio: 1,
    justifyContent: 'center', alignItems: 'center', marginTop: 6,
    borderRadius: 100,
  },
  cellToday: { borderWidth: 2, borderColor: '#FF8A00'},
  cellSelected: { backgroundColor: '#ffff9e' },
  cellText: { fontSize: 14, fontWeight: '600', color: '#333' },
  cellTextInactive: { color: '#E0E0E0' },
  cellTextHighlight: { color: '#052a75' },
  dot: {
    position: 'absolute', bottom: 5,
    width: 5, height: 5, borderRadius: 3, backgroundColor: '#FF8A00',
  },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statBox: {
    flex: 1, backgroundColor: '#FFF', borderRadius: 18, padding: 18, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  statNum: { fontSize: 28, fontWeight: '900', color: '#FF8A00' },
  statLabel: { fontSize: 11, color: '#AAA', fontWeight: '600', textAlign: 'center', marginTop: 4 },
  detailCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  detailDate: { fontSize: 16, fontWeight: '800', color: '#222', marginBottom: 14 },
  detailEmpty: { color: '#CCC', fontSize: 14, fontWeight: '600' },
  detailItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  detailIcon: { fontSize: 22 },
  detailName: { flex: 1, fontSize: 14, fontWeight: '700', color: '#333' },
  doneDot: { width: 10, height: 10, borderRadius: 5 },
});

export default CalendarScreen;
