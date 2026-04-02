import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setUserName } from '../db/sqlite';

interface Props {
  onComplete: (name: string) => void;
}

const OnboardingScreen = ({ onComplete }: Props) => {
  const [name, setName] = useState('');

  const handleContinue = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Please enter your name', 'We need your name to personalise your experience.');
      return;
    }
    setUserName(trimmed); // Persist to MMKV
    onComplete(trimmed);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        {/* Illustration */}
        <View style={styles.illustrationBox}>
          <Text style={styles.illustration}>🌱</Text>
        </View>

        {/* Copy */}
        <Text style={styles.headline}>Build habits that{'\n'}actually stick.</Text>
        <Text style={styles.subtext}>
          Track daily progress, build streaks, and become your best self — one day at a time.
        </Text>

        {/* Name input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>What should we call you?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Alex"
            placeholderTextColor="#CCC"
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleContinue}
            maxLength={30}
          />
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.btn, !name.trim() && styles.btnDisabled]}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Get Started →</Text>
        </TouchableOpacity>

        <Text style={styles.privacy}>
          Your data stays on your device. No account needed.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F2' },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
  },
  illustrationBox: {
    alignItems: 'center',
    marginBottom: 36,
  },
  illustration: { fontSize: 90 },
  headline: {
    fontSize: 34,
    fontWeight: '900',
    color: '#222',
    lineHeight: 42,
    fontFamily: 'McLaren-Regular',
    marginBottom: 14,
  },
  subtext: {
    fontSize: 15,
    color: '#888',
    lineHeight: 24,
    marginBottom: 40,
  },
  inputGroup: { marginBottom: 24 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 18,
    fontSize: 17,
    color: '#222',
    fontWeight: '600',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  btn: {
    backgroundColor: '#FF8A00',
    borderRadius: 18,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF8A00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#FFF', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  privacy: {
    textAlign: 'center',
    color: '#CCC',
    fontSize: 12,
    marginTop: 20,
  },
});

export default OnboardingScreen;
