import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../store/habitSlice';
import { getTodayHabits } from '../utils/frequencyUtils';
import { getUserName, getProfileImage } from '../db/sqlite';
import { Plus } from 'lucide-react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import HabitCard from '../components/HabitCard';
import Timeline from '../components/Timeline';
import { Image } from 'react-native';

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { habits, history } = useSelector((state: RootState) => state.habits);
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(today);

  // Read from MMKV — synchronous, re-reads when tab is focused
  const userName = getUserName() ?? 'there';
  const profileImage = getProfileImage();

  const todayHabits = getTodayHabits(habits, selectedDay);

  const greeting = () => {
    const h = today.getHours();
    if (h < 12) return `Good morning, ${userName} ☀️`;
    if (h < 18) return `Good afternoon, ${userName} 👋`;
    return `Good evening, ${userName} 🌙`;
  };

  const completedCount = todayHabits.filter((habit: any) =>
    history.some((h: any) => h.habitId === habit.id && h.completed),
  ).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.date}>
              {today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.avatarCircle} 
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarActualImage} />
            ) : (
              <Text style={styles.avatarLetter}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Progress pill */}
        {todayHabits.length > 0 && (
          <View style={styles.progressPill}>
            <View style={[styles.progressFill, { flex: completedCount / todayHabits.length }]} />
            <View style={[styles.progressRem, { flex: 1 - completedCount / todayHabits.length }]} />
          </View>
        )}
        {todayHabits.length > 0 && (
          <Text style={styles.progressText}>
            {completedCount} of {todayHabits.length} done today
          </Text>
        )}

        {/* Weekly timeline */}
        <Timeline selectedDate={selectedDay} onDateChange={setSelectedDay} />

        {/* Today's habits */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily routine</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllHabits')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {todayHabits.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🎯</Text>
              <Text style={styles.emptyText}>No habits scheduled today.</Text>
              <Text style={styles.emptySubText}>Tap + to create your first habit!</Text>
            </View>
          ) : (
            todayHabits.map((habit: any) => {
              const entry = history.find((h: any) => h.habitId === habit.id);
              return (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  completed={!!entry?.completed}
                  value={entry?.value || 0}
                />
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddHabit')}
        activeOpacity={0.85}
      >
        <Plus color="#FFF" size={30} strokeWidth={2.5} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F2' },
  scrollContent: { padding: 20, paddingBottom: 120 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  headerText: { flex: 1 },
  greeting: {
    fontSize: 22, fontWeight: '900', color: '#222',
    fontFamily: 'McLaren-Regular', flexWrap: 'wrap',
  },
  date: { fontSize: 13, color: '#AAA', marginTop: 4 },
  avatarCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#FF8A00', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#FF8A00', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  avatarLetter: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  avatarActualImage: { width: 48, height: 48, borderRadius: 24 },
  progressPill: {
    height: 6, borderRadius: 3, flexDirection: 'row',
    overflow: 'hidden', marginBottom: 6, backgroundColor: '#F0EDE8',
  },
  progressFill: { backgroundColor: '#FF8A00', borderRadius: 3 },
  progressRem: { backgroundColor: 'transparent' },
  progressText: { fontSize: 12, color: '#AAA', fontWeight: '600', marginBottom: 20 },
  section: { marginTop: 8 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#222' },
  seeAll: { color: '#FF8A00', fontWeight: '700', fontSize: 13 },
  emptyState: { alignItems: 'center', paddingVertical: 50 },
  emptyEmoji: { fontSize: 52, marginBottom: 14 },
  emptyText: { fontSize: 16, fontWeight: '800', color: '#333' },
  emptySubText: { fontSize: 13, color: '#AAA', marginTop: 6 },
  fab: {
    position: 'absolute', right: 22, bottom: 28,
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#3D251E',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#3D251E', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 10,
  },
});

export default HomeScreen;
