import React from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, deleteHabit } from '../store/habitSlice';
import { deleteHabitFromDB } from '../db/sqlite';
import { Trash2, ChevronLeft, Edit3 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const AllHabitsScreen = () => {
  const habits = useSelector((state: RootState) => state.habits.habits);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      `Delete "${title}"?`,
      'This will also remove its entire history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteHabitFromDB(id); // Sync MMKV delete
            dispatch(deleteHabit(id));
          },
        },
      ],
    );
  };

  const frequencyLabel = (freq: string) => {
    if (freq === 'daily') return '📅 Every day';
    if (freq.startsWith('weekly:')) {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const indices = freq.split(':')[1].split(',').map(Number);
      return '📅 ' + indices.map((i) => days[i]).join(', ');
    }
    if (freq.startsWith('custom:')) return `📅 Every ${freq.split(':')[1]} days`;
    return freq;
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { borderLeftColor: item.color }]}>
      <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.title}</Text>
        <Text style={styles.freq}>{frequencyLabel(item.frequency)}</Text>
        <Text style={styles.type}>
          {item.type === 'checkbox' ? '✅ Tick' : item.type === 'timer' ? `⏱ ${item.target} min` : `🔢 Target: ${item.target}`}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('AddHabit', { editHabit: item })}
        >
          <Edit3 color="#AAA" size={18} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleDelete(item.id, item.title)}
        >
          <Trash2 color="#FF4444" size={18} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#333" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>All Habits</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyText}>No habits yet.</Text>
            <Text style={styles.emptySubText}>Go back and tap + to add your first habit!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F2' },
  header: {
    paddingHorizontal: 16, paddingVertical: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  title: { fontSize: 20, fontWeight: '900', color: '#222', fontFamily: 'McLaren-Regular' },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#FFF', borderRadius: 18, padding: 14,
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 12, borderLeftWidth: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  iconBox: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  icon: { fontSize: 24 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '800', color: '#222', marginBottom: 3 },
  freq: { fontSize: 12, color: '#999', marginBottom: 2 },
  type: { fontSize: 12, color: '#AAA' },
  actions: { flexDirection: 'row', gap: 6 },
  actionBtn: { padding: 8 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 52, marginBottom: 14 },
  emptyText: { fontSize: 18, fontWeight: '800', color: '#333' },
  emptySubText: { fontSize: 13, color: '#AAA', marginTop: 6, textAlign: 'center' },
});

export default AllHabitsScreen;
