import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, Alert, Image, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { getUserName, setUserName, getProfileImage, setProfileImage, getAllHistory } from '../db/sqlite';
import { ChevronLeft, Camera, User } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/habitSlice';

const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const { habits } = useSelector((state: RootState) => state.habits);

  useEffect(() => {
    setName(getUserName() ?? '');
    setImageUri(getProfileImage());
  }, []);

  // const handlePickImage = () => {
  //   ImagePicker.launchImageLibrary(
  //     {
  //       mediaType: 'photo',
  //       quality: 0.8,
  //       includeBase64: false,
  //     },
  //     (response) => {
  //       if (response.didCancel || response.errorCode || !response.assets) return;
  //       const uri = response.assets[0].uri;
  //       if (uri) {
  //         setImageUri(uri);
  //       }
  //     }
  //   );
  // };
  const handlePickImage = () => {
  launchImageLibrary(
    {
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: false,
    },
    (response) => {
      if (response.didCancel || response.errorCode || !response.assets) return;
      const uri = response.assets[0].uri;
      if (uri) {
        setImageUri(uri);
      }
    }
  );
};

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your name.');
      return;
    }
    setUserName(name.trim());
    if (imageUri) {
      setProfileImage(imageUri);
    }
    Alert.alert('Profile Saved', 'Your profile has been updated successfully.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const allHistory = getAllHistory();
  const totalCompletions = allHistory.filter(h => h.completed).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#333" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Your Profile</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={handlePickImage} activeOpacity={0.8}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User color="#FF8A00" size={40} />
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Camera color="#FFF" size={14} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to change photo</Text>
        </View>

        {/* Profile Info Form */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="What should we call you?"
            placeholderTextColor="#AAA"
          />
        </View>

        {/* Mini Stats Summary */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Journey</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{habits.length}</Text>
              <Text style={styles.statLabel}>Active Habits</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{totalCompletions}</Text>
              <Text style={styles.statLabel}>Total Done</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F2' },
  header: {
    paddingHorizontal: 20, paddingVertical: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  title: { fontSize: 22, fontWeight: '900', color: '#222', fontFamily: 'McLaren-Regular' },
  content: { paddingHorizontal: 24, paddingBottom: 100 },
  avatarSection: { alignItems: 'center', marginBottom: 40 },
  avatarWrapper: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#FFE0B2', justifyContent: 'center', alignItems: 'center',
    position: 'relative',
    shadowColor: '#FF8A00', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 6,
  },
  avatarPlaceholder: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFE0B2' },
  avatarImage: { width: 120, height: 120, borderRadius: 60 },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#3D251E', justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#FFF8F2'
  },
  avatarHint: { fontSize: 13, color: '#999', marginTop: 16, fontWeight: '600' },
  formSection: { marginBottom: 32 },
  label: { fontSize: 14, fontWeight: '800', color: '#555', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: '#FFF', borderRadius: 16, height: 56, paddingHorizontal: 18,
    fontSize: 16, color: '#222', fontWeight: '600',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  statsCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  statsTitle: { fontSize: 16, fontWeight: '800', color: '#222', marginBottom: 16 },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: 26, fontWeight: '900', color: '#FF8A00' },
  statLabel: { fontSize: 12, color: '#AAA', fontWeight: '600', marginTop: 4 },
  statDivider: { width: 1, height: 40, backgroundColor: '#EEE' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 24, paddingBottom: 34, backgroundColor: 'transparent'
  },
  saveBtn: {
    backgroundColor: '#FF8A00', height: 60, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#FF8A00', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  saveBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
});

export default ProfileScreen;
