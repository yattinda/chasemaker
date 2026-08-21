import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Pacemaker from './pacemaker';
import DurationPickerModal from './src/DurationPickerModal';
import { maxDrinksForDuration } from './src/pacing';

export default function App() {
  const [durationHours, setDurationHours] = useState(2);
  const [isFirstSession, setIsFirstSession] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <LinearGradient colors={['#0C0B0A', '#161310', '#0C0B0A']} style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {!hasStarted ? (
            <View style={styles.formShell}>
              <View style={styles.formTop}>
                <View style={styles.headerSection}>
                  <Text style={styles.title}>Chase Maker</Text>
                </View>

                <View style={styles.settingsRow}>
                  <View style={styles.settingCard}>
                    <Text style={styles.label}>時間</Text>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setShowDurationPicker(true)}
                      style={styles.dropdownButton}
                    >
                      <Text style={styles.dropdownText}>{durationHours}時間</Text>
                      <Text style={styles.dropdownArrow}>▾</Text>
                    </Pressable>
                  </View>

                  <View style={styles.settingCard}>
                    <View style={styles.modeHeader}>
                      <Text style={styles.label}>1次会Mode</Text>
                    </View>
                    <View style={styles.modeButtonWrap}>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => setIsFirstSession((prev) => !prev)}
                        style={[styles.modeBadge, isFirstSession && styles.modeBadgeActive]}
                      >
                        <Text
                          style={[
                            styles.modeBadgeText,
                            isFirstSession && styles.modeBadgeTextActive,
                          ]}
                        >
                          {isFirstSession ? 'ON' : 'OFF'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => setHasStarted(true)}
                style={({ pressed }) => [
                  styles.startButton,
                  pressed && styles.startButtonPressed,
                ]}
              >
                <Text style={styles.startButtonText}>START</Text>
              </Pressable>
            </View>
          ) : (
            <Pacemaker
              durationHours={durationHours}
              isFirstSession={isFirstSession}
              maxDrinks={maxDrinksForDuration(durationHours)}
              onFinish={() => setHasStarted(false)}
            />
          )}
        </ScrollView>

        <DurationPickerModal
          visible={showDurationPicker}
          durationHours={durationHours}
          onClose={() => setShowDurationPicker(false)}
          onSelect={(hours) => {
            setDurationHours(hours);
            setShowDurationPicker(false);
          }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  formShell: {
    flex: 1,
    minHeight: 540,
    justifyContent: 'space-between',
    paddingVertical: 28,
  },
  formTop: {
    gap: 36,
  },
  headerSection: {
    paddingLeft: 4,
  },
  title: {
    color: '#F4EEE4',
    fontSize: 42,
    fontWeight: '300',
    letterSpacing: -0.6,
    lineHeight: 48,
  },
  settingsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  settingCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 246, 232, 0.05)',
    borderRadius: 24,
    padding: 18,
    minHeight: 152,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(243, 215, 160, 0.14)',
  },
  label: {
    color: 'rgba(244, 238, 228, 0.58)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  modeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modeButtonWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeBadge: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeBadgeActive: {
    backgroundColor: '#F3D7A0',
  },
  modeBadgeText: {
    color: '#C8C0B4',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 2,
  },
  modeBadgeTextActive: {
    color: '#1A140C',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 58,
  },
  dropdownText: {
    color: '#F4EEE4',
    fontSize: 18,
    fontWeight: '400',
  },
  dropdownArrow: {
    color: '#C9A66B',
    fontSize: 16,
    fontWeight: '400',
  },
  startButton: {
    backgroundColor: '#F3D7A0',
    borderRadius: 28,
    width: '100%',
    height: 68,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F3D7A0',
    shadowOpacity: 0.2,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  startButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  startButtonText: {
    color: '#1A140C',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 4,
  },
});
