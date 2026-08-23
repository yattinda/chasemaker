import { NotoSansJP_400Regular, NotoSansJP_500Medium, NotoSansJP_700Bold } from '@expo-google-fonts/noto-sans-jp';
import { Outfit_300Light, Outfit_500Medium, Outfit_600SemiBold } from '@expo-google-fonts/outfit';
import { Button, Text } from '@react-native-material/core';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Pacemaker from './pacemaker';
import DurationPickerModal from './src/DurationPickerModal';
import { maxDrinksForDuration } from './src/pacing';
import { createEmptySession, loadSession, saveSession } from './src/sessionStorage';
import { Provider, appTheme, colors, fontFamily } from './src/theme';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Outfit_300Light,
    Outfit_500Medium,
    Outfit_600SemiBold,
    NotoSansJP_400Regular,
    NotoSansJP_500Medium,
    NotoSansJP_700Bold,
  });
  const [durationHours, setDurationHours] = useState(2);
  const [isFirstSession, setIsFirstSession] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    void (async () => {
      const saved = await loadSession();
      if (saved) {
        setDurationHours(saved.durationHours);
        setIsFirstSession(saved.isFirstSession);
        setHasStarted(true);
      }
      setSessionReady(true);
    })();
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && sessionReady) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, sessionReady]);

  if ((!fontsLoaded && !fontError) || !sessionReady) {
    return null;
  }

  return (
    <Provider theme={appTheme}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        {!hasStarted ? (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.formShell}>
              <View style={styles.formTop}>
                <Text variant="h3" style={styles.title}>
                  Chase Maker
                </Text>

                <View style={styles.field}>
                  <Text variant="overline" color={colors.muted}>
                    時間
                  </Text>
                  <Button
                    accessibilityRole="button"
                    variant="outlined"
                    color="secondary"
                    uppercase={false}
                    title={`${durationHours}時間`}
                    trailing={() => (
                      <Text variant="button" color="secondary">
                        ▾
                      </Text>
                    )}
                    onPress={() => setShowDurationPicker(true)}
                    style={styles.fullWidth}
                    contentContainerStyle={styles.fieldButton}
                    titleStyle={styles.fieldButtonTitle}
                  />
                </View>

                <View style={styles.field}>
                  <Text variant="overline" color={colors.muted}>
                    1次会Mode
                  </Text>
                  <Button
                    accessibilityRole="button"
                    variant={isFirstSession ? 'contained' : 'outlined'}
                    color={isFirstSession ? 'primary' : 'secondary'}
                    title={isFirstSession ? 'ON' : 'OFF'}
                    onPress={() => setIsFirstSession((prev) => !prev)}
                    style={styles.fullWidth}
                    contentContainerStyle={styles.fieldButton}
                    titleStyle={styles.modeButtonTitle}
                  />
                </View>
              </View>

              <Button
                accessibilityRole="button"
                title="START"
                color="primary"
                onPress={() => {
                  void saveSession(createEmptySession(durationHours, isFirstSession));
                  setHasStarted(true);
                }}
                style={styles.fullWidth}
                contentContainerStyle={styles.startButton}
                titleStyle={styles.startButtonText}
              />
            </View>
          </ScrollView>
        ) : (
          <Pacemaker
            durationHours={durationHours}
            isFirstSession={isFirstSession}
            maxDrinks={maxDrinksForDuration(durationHours)}
            onFinish={() => setHasStarted(false)}
          />
        )}

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
    </Provider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 24,
  },
  formShell: {
    flex: 1,
    minHeight: 540,
    justifyContent: 'space-between',
  },
  formTop: {
    gap: 28,
  },
  title: {
    marginBottom: 8,
  },
  field: {
    gap: 10,
  },
  fullWidth: {
    width: '100%',
  },
  fieldButton: {
    height: 52,
    justifyContent: 'space-between',
  },
  fieldButtonTitle: {
    fontFamily: fontFamily.body,
    fontSize: 17,
    letterSpacing: 0.1,
  },
  modeButtonTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 15,
    letterSpacing: 1.2,
  },
  startButton: {
    height: 56,
  },
  startButtonText: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 16,
    letterSpacing: 2,
  },
});
