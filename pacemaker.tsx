import { Button, Text } from '@react-native-material/core';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, fontFamily } from './src/theme';
import { usePacemakerSession } from './src/usePacemakerSession';

type Props = {
  durationHours: number;
  isFirstSession: boolean;
  maxDrinks: number;
  onFinish: () => void;
};

const backgrounds = {
  ready: colors.background,
  wait: '#2A1A1A',
  max: colors.background,
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

  const backgroundColor = isSessionEnded
    ? backgrounds.max
    : countdownActive
      ? backgrounds.wait
      : backgrounds.ready;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Text variant="h4" color={colors.text} style={styles.headerTime}>
          {headerText}
        </Text>
      </View>

      <View style={styles.centerArea}>
        <Button
          accessibilityRole="button"
          title={isSessionEnded ? 'もう飲めません...' : countdownActive ? '飲みましょう!' : '酒を注文する'}
          uppercase={false}
          disabled={orderDisabled}
          onPress={orderDrink}
          variant={countdownActive || isSessionEnded ? 'outlined' : 'contained'}
          color="primary"
          style={styles.orderButton}
          contentContainerStyle={styles.orderButtonContent}
          titleStyle={styles.orderButtonText}
        />

        <Button
          accessibilityRole="button"
          variant="text"
          color="secondary"
          uppercase={false}
          title="一杯へらす (長押し3秒)"
          onLongPress={decreaseDrink}
          delayLongPress={3000}
          contentContainerStyle={styles.smallButton}
          titleStyle={styles.smallButtonText}
        />
      </View>

      <View style={styles.footer}>
        <Button
          accessibilityRole="button"
          variant="text"
          color="secondary"
          uppercase={false}
          title="終わる"
          onPress={finish}
          contentContainerStyle={styles.finishButton}
          titleStyle={styles.finishButtonText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 28,
    paddingHorizontal: 8,
  },
  headerTime: {
    textAlign: 'center',
    fontFamily: fontFamily.body,
  },
  centerArea: {
    alignItems: 'stretch',
    gap: 8,
  },
  orderButton: {
    width: '100%',
  },
  orderButtonContent: {
    height: 148,
  },
  orderButtonText: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 24,
    letterSpacing: 0.2,
  },
  smallButton: {
    height: 44,
  },
  smallButtonText: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    letterSpacing: 0.1,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  finishButton: {
    height: 44,
    paddingHorizontal: 20,
  },
  finishButtonText: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    letterSpacing: 0.6,
  },
});
