import React, { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const durationOptions = [1, 1.5, 2, 2.5, 3] as const;
const sessionOptions = [1, 2, 3] as const;

export default function App() {
  const [durationHours, setDurationHours] = useState<number>(2);
  const [sessionNumber, setSessionNumber] = useState<number>(1);
  const [isFirstSession, setIsFirstSession] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const activeSession = isFirstSession ? 1 : sessionNumber;

  const maxDrinks = useMemo(() => {
    if (activeSession === 1) {
      return Math.floor(durationHours * 2.5);
    }
    return Math.max(0, durationHours * 2 - 1);
  }, [activeSession, durationHours]);

  const summaryLabel = `${durationHours}時間 / ${activeSession}次会`;

  const handleStart = () => {
    setHasStarted(true);
  };

  const handleReset = () => {
    setHasStarted(false);
  };

  return (
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
                      style={[
                        styles.modeBadge,
                        isFirstSession && styles.modeBadgeActive,
                      ]}
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
              onPress={handleStart}
              style={({ pressed }) => [
                styles.startButton,
                pressed && styles.startButtonPressed,
              ]}
            >
              <Text style={styles.startButtonText}>START</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.startedPanel}>
            <Text style={styles.startedTitle}>設定を開始しました</Text>
            <Text style={styles.startedSummary}>{summaryLabel}</Text>
            <Text style={styles.startedSummary}>最高杯数: {maxDrinks}杯</Text>
            <Text style={styles.startedHint}>次の画面でカウントダウンと通知を行います。</Text>
            <Pressable
              accessibilityRole="button"
              onPress={handleReset}
              style={styles.resetButton}
            >
              <Text style={styles.resetButtonText}>設定を見直す</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <Modal
        transparent
        visible={showDurationPicker}
        animationType="fade"
        onRequestClose={() => setShowDurationPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowDurationPicker(false)}
        >
          <Pressable style={styles.modalPanel} onPress={() => undefined}>
            <Text style={styles.modalTitle}>時間を選択</Text>
            {durationOptions.map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  setDurationHours(option);
                  setShowDurationPicker(false);
                }}
                style={[
                  styles.optionItem,
                  option === durationHours && styles.optionItemSelected,
                ]}
              >
                <Text
                  style={[
                    styles.optionItemText,
                    option === durationHours && styles.optionItemTextSelected,
                  ]}
                >
                  {option}時間
                </Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  formShell: {
    flex: 1,
    minHeight: 540,
    justifyContent: 'center',
  },
  formTop: {
    justifyContent: 'center',
  },
  headerSection: {
    marginBottom: 16,
  },
  eyebrow: {
    color: '#b9b9b5',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  title: {
    color: '#f5f5f4',
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 40,
    marginBottom: 8,
  },
  description: {
    color: '#d4d4d8',
    fontSize: 16,
    lineHeight: 24,
  },
  settingsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  settingCard: {
    flex: 1,
    backgroundColor: '#17171a',
    borderRadius: 20,
    padding: 18,
    minHeight: 144,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2b2b2f',
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  label: {
    color: '#f3f4f6',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
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
    width: '84%',
    minWidth: 92,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#1f2329',
    borderWidth: 1,
    borderColor: '#3f454d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeBadgeActive: {
    backgroundColor: '#1f3a2b',
    borderColor: '#3abf76',
  },
  modeBadgeText: {
    color: '#dfe3ea',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  modeBadgeTextActive: {
    color: '#d1fae5',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#101113',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#3a3a3d',
    minHeight: 64,
  },
  dropdownText: {
    color: '#f5f5f4',
    fontSize: 16,
    fontWeight: '900',
  },
  dropdownArrow: {
    color: '#e7c48d',
    fontSize: 20,
    fontWeight: '800',
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  sessionButton: {
    flex: 1,
    backgroundColor: '#101113',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#303033',
  },
  sessionButtonSelected: {
    backgroundColor: '#d5a96d',
    borderColor: '#efc48c',
  },
  sessionText: {
    color: '#e5e5e5',
    fontSize: 16,
    fontWeight: '700',
  },
  sessionTextSelected: {
    color: '#1a1208',
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#17171a',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#2b2b2f',
    marginBottom: 18,
  },
  switchHint: {
    color: '#a1a1aa',
    fontSize: 12,
    marginTop: 2,
  },
  summaryBox: {
    backgroundColor: '#121316',
    borderRadius: 18,
    padding: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#2d2d31',
  },
  summaryTitle: {
    color: '#d1b286',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  summaryText: {
    color: '#f5f5f4',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  summarySubText: {
    color: '#d4d4d8',
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#f2d7a5',
    borderRadius: 22,
    width: '100%',
    maxWidth: 320,
    height: 72,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f0c57f',
    shadowColor: '#f0c57f',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    marginTop: 12,
    marginBottom: 6,
  },
  startButtonPressed: {
    backgroundColor: '#e8c68a',
    transform: [{ scale: 0.98 }],
  },
  startButtonText: {
    color: '#17120d',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  startedPanel: {
    backgroundColor: '#17171a',
    borderRadius: 24,
    padding: 26,
    borderWidth: 1,
    borderColor: '#2b2b2f',
  },
  startedTitle: {
    color: '#f5f5f4',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
  },
  startedSummary: {
    color: '#e7e7e5',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  startedHint: {
    color: '#bdbdc0',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
    marginBottom: 22,
  },
  resetButton: {
    backgroundColor: '#2e3d2f',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4b5d4d',
  },
  resetButtonText: {
    color: '#f2f5f0',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    justifyContent: 'flex-end',
  },
  modalPanel: {
    backgroundColor: '#121315',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: '#2a2a2d',
  },
  modalTitle: {
    color: '#f5f5f4',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  optionItem: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: '#1a1c1f',
    borderWidth: 1,
    borderColor: '#2a2d30',
  },
  optionItemSelected: {
    backgroundColor: '#d29d58',
    borderColor: '#efc48c',
  },
  optionItemText: {
    color: '#f3f3f3',
    fontSize: 16,
    fontWeight: '700',
  },
  optionItemTextSelected: {
    color: '#190f07',
  },
});