import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePacemakerSession } from './src/usePacemakerSession';

type Props = {
  durationHours: number;
  isFirstSession: boolean;
  maxDrinks: number;
  onFinish: () => void;
};

const palette = {
  ready: ['#0B1C33', '#164A78', '#0B1C33'] as const,
  wait: ['#2A0B12', '#7A1E2C', '#2A0B12'] as const,
  max: ['#1A0A0C', '#4A141C', '#1A0A0C'] as const,
};

export default function Pacemaker({ durationHours, isFirstSession, maxDrinks, onFinish }: Props) {
  const {
    countdownActive,
    headerText,
    isSessionEnded,
    orderDisabled,
    orderDrink,
    decreaseDrink,
    finish,
  } = usePacemakerSession({ durationHours, isFirstSession, maxDrinks, onFinish });

  const gradientColors = isSessionEnded
    ? palette.max
    : countdownActive
      ? palette.wait
      : palette.ready;

  return (
    <LinearGradient colors={[...gradientColors]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTime}>{headerText}</Text>
      </View>

      <View style={styles.centerArea}>
        <Pressable
          accessibilityRole="button"
          onPress={orderDrink}
          disabled={orderDisabled}
          style={({ pressed }) => [
            styles.orderButton,
            orderDisabled && styles.orderButtonDisabled,
            pressed && !orderDisabled && styles.orderButtonPressed,
          ]}
        >
          <Text
            style={[
              styles.orderButtonText,
              (isSessionEnded || countdownActive) && styles.orderButtonTextWhite,
            ]}
          >
            {isSessionEnded ? 'もう飲めません...' : countdownActive ? '飲みましょう!' : '酒を注文する'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onLongPress={decreaseDrink}
          delayLongPress={3000}
          style={styles.smallButton}
        >
          <Text style={styles.smallButtonText}>一杯へらす (長押し3秒)</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Pressable accessibilityRole="button" onPress={finish} style={styles.finishButton}>
          <Text style={styles.finishButtonText}>終わる</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 560,
    paddingTop: 36,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    borderRadius: 28,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
  },
  headerTime: {
    color: '#FFF8EE',
    fontSize: 30,
    fontWeight: '300',
    letterSpacing: -0.3,
    textAlign: 'center',
    lineHeight: 38,
  },
  centerArea: {
    alignItems: 'center',
  },
  orderButton: {
    width: '100%',
    minHeight: 160,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 248, 238, 0.94)',
  },
  orderButtonPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  orderButtonDisabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },
  orderButtonText: {
    color: '#1A140C',
    fontSize: 26,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 18,
  },
  orderButtonTextWhite: {
    color: '#FFF8EE',
  },
  smallButton: {
    marginTop: 20,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  smallButtonText: {
    color: 'rgba(255, 248, 238, 0.5)',
    fontSize: 13,
    fontWeight: '400',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 22,
  },
  finishButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 248, 238, 0.28)',
  },
  finishButtonText: {
    color: '#FFF8EE',
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 1.2,
  },
});
