import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../store/habitSlice';
import { getAllHistory } from '../db/sqlite';
import { getUserName } from '../db/sqlite';
import { formatDate } from '../utils/dateUtils';
import { TrendingUp, Award, Calendar } from 'lucide-react-native';

/** Build a bar chart from real completion data for the last 7 days */
const getLast7DaysStats = (habits: any[], allHistory: any[]) => {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const scheduled = habits.filter((h) => {
      if (h.frequency === 'daily') return true;
      if (h.frequency.startsWith('weekly:')) {
        const days = h.frequency.split(':')[1].split(',').map(Number);
        // 0=Mon...6=Sun
        let dow = d.getDay(); // 0=Sun
        dow = dow === 0 ? 6 : dow - 1;
        return days.includes(dow);
      }
      return true;
    });
    const completed = allHistory.filter(
      (e) => e.date === dateStr && e.completed,
    ).length;
    const pct = scheduled.length > 0 ? Math.round((completed / scheduled.length) * 100) : 0;
    result.push({ label: dayLabel, pct, completed, scheduled: scheduled.length });
  }
  return result;
};

/** Per-habit completion % for all time */
const getHabitStats = (habits: any[], allHistory: any[]) => {
  return habits.map((h) => {
    const entries = allHistory.filter((e) => e.habitId === h.id);
    const done = entries.filter((e) => e.completed).length;
    const pct = entries.length > 0 ? Math.round((done / entries.length) * 100) : 0;
    return { ...h, pct, totalDone: done, totalEntries: entries.length };
  });
};

const BAR_HEIGHT = 180;

const InsightsScreen = () => {
  const { habits, history: reduxHistory } = useSelector((state: RootState) => state.habits);
  // Read full history from MMKV (Redux only stores today's)
  const allHistory = getAllHistory();
  const userName = getUserName() ?? 'there';

  const weekStats = getLast7DaysStats(habits, allHistory);
  const habitStats = getHabitStats(habits, allHistory);

  const totalCompletions = allHistory.filter((e) => e.completed).length;
  const currentWeekDone = weekStats.reduce((s, d) => s + d.completed, 0);
  const avgPct =
    weekStats.length > 0
      ? Math.round(weekStats.reduce((s, d) => s + d.pct, 0) / weekStats.length)
      : 0;

  const BAR_COLORS = ['#3D251E', '#8B4513', '#8BA133', '#D46299', '#4C8BFF', '#FF8A00', '#6B6B6B'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your progress{'\n'}& insights</Text>
        </View>

        {/* Summary cards */}
        <View style={styles.cardRow}>
          <View style={[styles.summaryCard, { backgroundColor: '#FFF3E8' }]}>
            <TrendingUp color="#FF8A00" size={22} />
            <Text style={styles.cardNum}>{avgPct}%</Text>
            <Text style={styles.cardLabel}>Avg this week</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#EDF7ED' }]}>
            <Award color="#8BA133" size={22} />
            <Text style={styles.cardNum}>{totalCompletions}</Text>
            <Text style={styles.cardLabel}>Total done</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#E8F0FF' }]}>
            <Calendar color="#4C8BFF" size={22} />
            <Text style={styles.cardNum}>{habits.length}</Text>
            <Text style={styles.cardLabel}>Habits</Text>
          </View>
        </View>

        {/* Weekly bar chart — real data */}
        {habits.length > 0 ? (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Last 7 days</Text>
            <View style={styles.barsWrapper}>
              {weekStats.map((day, i) => (
                <View key={i} style={styles.barCol}>
                  <Text style={styles.barPct}>{day.pct > 0 ? `${day.pct}%` : ''}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${Math.max(day.pct, 4)}%`,
                          backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barDay}>{day.label}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyText}>Add habits to see your weekly chart</Text>
          </View>
        )}

        {/* Per-habit breakdown */}
        {habitStats.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habit breakdown</Text>
            {habitStats.map((h, i) => (
              <View key={h.id} style={styles.habitRow}>
                <Text style={styles.habitIcon}>{h.icon}</Text>
                <View style={styles.habitInfo}>
                  <View style={styles.habitNameRow}>
                    <Text style={styles.habitName}>{h.title}</Text>
                    <Text style={[styles.habitPct, { color: h.color }]}>{h.pct}%</Text>
                  </View>
                  {/* Progress bar */}
                  <View style={styles.progressTrack}>
                    <View
                      style={[styles.progressFill, { width: `${h.pct}%`, backgroundColor: h.color }]}
                    />
                  </View>
                  <Text style={styles.habitMeta}>{h.totalDone} of {h.totalEntries} days completed</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Week summary strip */}
        {habits.length > 0 && (
          <View style={styles.weekStrip}>
            <Text style={styles.weekStripTitle}>This week</Text>
            <Text style={styles.weekStripValue}>{currentWeekDone} completions</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F2' },
  scroll: { padding: 22, paddingBottom: 100 },
  header: { marginBottom: 24 },
  title: {
    fontSize: 28, fontWeight: '900', color: '#222',
    lineHeight: 34, fontFamily: 'McLaren-Regular',
  },
  cardRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  summaryCard: {
    flex: 1, borderRadius: 18, padding: 14,
    alignItems: 'center', gap: 6,
  },
  cardNum: { fontSize: 22, fontWeight: '900', color: '#222' },
  cardLabel: { fontSize: 11, color: '#888', fontWeight: '600' },
  chartCard: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 20,
    marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  chartTitle: { fontSize: 16, fontWeight: '800', color: '#222', marginBottom: 16 },
  barsWrapper: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-end', height: 180,
  },
  barCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barPct: { fontSize: 10, color: '#999', fontWeight: '700', marginBottom: 4 },
  barTrack: {
    width: '65%', height: '80%',
    backgroundColor: '#F0EDE8', borderRadius: 20,
    justifyContent: 'flex-end', overflow: 'hidden',
  },
  barFill: { width: '100%', borderRadius: 20 },
  barDay: { fontSize: 10, color: '#AAA', fontWeight: '700', marginTop: 6 },
  emptyChart: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 40,
    alignItems: 'center', marginBottom: 24,
  },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyText: { color: '#BBB', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#222', marginBottom: 16 },
  habitRow: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  habitIcon: { fontSize: 28 },
  habitInfo: { flex: 1 },
  habitNameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  habitName: { fontSize: 14, fontWeight: '700', color: '#222' },
  habitPct: { fontSize: 14, fontWeight: '900' },
  progressTrack: {
    height: 8, backgroundColor: '#F0F0F0', borderRadius: 4,
    overflow: 'hidden', marginBottom: 4,
  },
  progressFill: { height: '100%', borderRadius: 4 },
  habitMeta: { fontSize: 11, color: '#AAA' },
  weekStrip: {
    backgroundColor: '#3D251E', borderRadius: 20, padding: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  weekStripTitle: { color: '#FFD6A5', fontSize: 15, fontWeight: '700' },
  weekStripValue: { color: '#FF8A00', fontSize: 18, fontWeight: '900' },
});

export default InsightsScreen;
