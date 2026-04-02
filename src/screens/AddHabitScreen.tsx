import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Switch,
  TouchableOpacity, ScrollView, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { addHabit, updateHabit } from '../store/habitSlice';
import { saveHabit } from '../db/sqlite';
import { scheduleHabitReminder } from '../notifications/notifee';
import { X, Bell, Clock } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import DateTimePicker from '@react-native-community/datetimepicker';

const COLORS = ['#FF8A00', '#3D251E', '#8BA133', '#D46299', '#4C8BFF', '#8B4513'];
const ICONS = ['😊', '💧', '🏃', '🧘', '📚', '💤', '🏋️', '🎯'];
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const AddHabitScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editHabit = route.params?.editHabit;

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'checkbox' | 'timer' | 'count'>('checkbox');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [target, setTarget] = useState('1');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('😊');
  const [color, setColor] = useState('#FF8A00');

  React.useEffect(() => {
    if (editHabit) {
      setTitle(editHabit.title);
      setType(editHabit.type);
      setTarget(editHabit.target.toString());
      setColor(editHabit.color);
      setSelectedIcon(editHabit.icon);

      const freqStr = editHabit.frequency;
      if (freqStr === 'daily') {
        setFrequency('daily');
      } else if (freqStr.startsWith('weekly:')) {
        setFrequency('weekly');
        setSelectedDays(freqStr.split(':')[1].split(',').map(Number));
      } else if (freqStr.startsWith('custom:')) {
        setFrequency('custom');
      }

      if (editHabit.reminderTime) {
        setReminderEnabled(true);
        const [h, m] = editHabit.reminderTime.split(':').map(Number);
        const d = new Date();
        d.setHours(h);
        d.setMinutes(m);
        setReminderTime(d);
      }
    }
  }, [editHabit]);

  const toggleDay = (index: number) => {
    setSelectedDays(prev =>
      prev.includes(index) ? prev.filter(d => d !== index) : [...prev, index]
    );
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Missing Name', 'Please enter a habit name.');
      return;
    }
    if (frequency === 'weekly' && selectedDays.length === 0) {
      Alert.alert('Select Days', 'Please select at least one weekday.');
      return;
    }

    const finalFrequency =
      frequency === 'weekly'
        ? `weekly:${selectedDays.join(',')}`
        : frequency;

    const timeStr = `${reminderTime.getHours().toString().padStart(2, '0')}:${reminderTime.getMinutes().toString().padStart(2, '0')}`;

    const newHabit = {
      id: editHabit ? editHabit.id : uuidv4(),
      title: title.trim(),
      type,
      frequency: finalFrequency,
      target: parseInt(target, 10) || 1,
      reminderTime: reminderEnabled ? timeStr : null,
      color,
      icon: selectedIcon,
      createdAt: editHabit ? editHabit.createdAt : new Date().toISOString(),
    };

    // MMKV is synchronous — no try/catch on async needed
    saveHabit(newHabit);
    
    if (editHabit) {
      dispatch(updateHabit(newHabit));
    } else {
      dispatch(addHabit(newHabit));
    }

    // Schedule notification if reminder is enabled

    if (reminderEnabled) {
      scheduleHabitReminder(newHabit);
    }

    navigation.goBack();
  };

  const onTimeChange = (_event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setReminderTime(selectedDate);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New habit</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <X color="#333" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        {/* Big emoji icon picker */}
        <View style={styles.iconPreview}>
          <Text style={styles.selectedEmoji}>{selectedIcon}</Text>
        </View>

        <View style={styles.emojiRow}>
          {ICONS.map(e => (
            <TouchableOpacity
              key={e}
              onPress={() => setSelectedIcon(e)}
              style={[styles.emojiBtn, selectedIcon === e && { borderColor: color, borderWidth: 2 }]}
            >
              <Text style={styles.emojiText}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Habit name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name your habit</Text>
          <TextInput
            style={styles.input}
            placeholder="Morning Meditations"
            placeholderTextColor="#CCC"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Type: Tick / Time / Count */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.segmentedControl}>
            {(['checkbox', 'timer', 'count'] as const).map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t)}
                style={[styles.segment, type === t && { backgroundColor: color }]}
              >
                <Text style={[styles.segmentText, type === t && styles.segmentTextActive]}>
                  {t === 'checkbox' ? '✅ Tick' : t === 'timer' ? '⏱ Time' : '🔢 Count'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Target (shown for timer and count) */}
        {type !== 'checkbox' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{type === 'timer' ? 'Duration (mins)' : 'Target count'}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={target}
              onChangeText={setTarget}
              placeholderTextColor="#CCC"
            />
          </View>
        )}

        {/* Frequency */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Repeat</Text>
          <View style={styles.segmentedControl}>
            {(['daily', 'weekly', 'custom'] as const).map(f => (
              <TouchableOpacity
                key={f}
                onPress={() => setFrequency(f)}
                style={[styles.segment, frequency === f && { backgroundColor: color }]}
              >
                <Text style={[styles.segmentText, frequency === f && styles.segmentTextActive]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Weekly day picker */}
        {frequency === 'weekly' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Repeat days</Text>
            <View style={styles.daysRow}>
              {DAY_LABELS.map((l, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => toggleDay(i)}
                  style={[
                    styles.dayCircle,
                    selectedDays.includes(i) && { backgroundColor: color },
                  ]}
                >
                  <Text style={[styles.dayText, selectedDays.includes(i) && styles.activeDayText]}>
                    {l}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Reminders */}
        <View style={[styles.inputGroup]}>
          <View style={styles.row}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
               <Bell size={18} color="#999" />
               <Text style={styles.label}>Get reminders</Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: '#DDD', true: color }}
              thumbColor="#FFF"
            />
          </View>

          {reminderEnabled && (
            <TouchableOpacity 
              style={styles.timeSelector} 
              onPress={() => setShowPicker(true)}
              activeOpacity={0.7}
            >
              <View style={styles.timeInfo}>
                <Clock size={16} color={color} />
                <Text style={[styles.timeText, { color }]}>{formatTime(reminderTime)}</Text>
              </View>
              <Text style={styles.changeLabel}>Change</Text>
            </TouchableOpacity>
          )}

          {showPicker && (
            <DateTimePicker
              value={reminderTime}
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
            />
          )}
        </View>

        {/* Color picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Choose a color</Text>
          <View style={styles.colorRow}>
            {COLORS.map(c => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.colorCircle,
                  { backgroundColor: c },
                  color === c && styles.colorSelected,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Save */}
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: color }]} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Habit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF9' },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#222', fontFamily: 'McLaren-Regular' },
  closeBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center', alignItems: 'center',
  },
  form: { padding: 24, paddingBottom: 60 },
  iconPreview: { alignItems: 'center', marginBottom: 16 },
  selectedEmoji: { fontSize: 68 },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 28, gap: 8 },
  emojiBtn: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center', alignItems: 'center',
    borderColor: 'transparent', borderWidth: 2,
  },
  emojiText: { fontSize: 24 },
  inputGroup: { marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 13, color: '#999', marginBottom: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  input: {
    backgroundColor: '#F5F5F5', borderRadius: 14,
    height: 52, paddingHorizontal: 16,
    fontSize: 16, color: '#222',
  },
  segmentedControl: {
    flexDirection: 'row', backgroundColor: '#F0F0F0',
    borderRadius: 14, padding: 4, gap: 4,
  },
  segment: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    alignItems: 'center',
  },
  segmentText: { fontSize: 12, fontWeight: '700', color: '#888' },
  segmentTextActive: { color: '#FFF' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCircle: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center', alignItems: 'center',
  },
  dayText: { fontSize: 14, fontWeight: '700', color: '#555' },
  activeDayText: { color: '#FFF' },
  colorRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  colorCircle: { width: 38, height: 38, borderRadius: 19 },
  colorSelected: { borderWidth: 3, borderColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  timeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  changeLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  saveBtn: {
    height: 60, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginTop: 16,
  },
  saveBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
});

export default AddHabitScreen;
