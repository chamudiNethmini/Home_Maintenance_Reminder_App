import React, { useRef, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';

import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import type {
  HomeownerScreenProps,
} from '../../navigation/homeownerTypes';

import {
  saveHomeownerReminder,
} from '../../services/homeownerReminderService';

const DEMO_OPTION = 'Demo — after 8 seconds';

const reminderOptions = [
  '1 month before expiry',
  '3 months before expiry',
  '1 week before expiry',
  'On expiry date',
  DEMO_OPTION,
];

function showMessage(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function SetExpiryReminderScreen({
  route,
  navigation,
}: HomeownerScreenProps<'SetExpiryReminder'>) {
  const [selectedReminder, setSelectedReminder] =
    useState('1 month before expiry');

  const [pushNotification, setPushNotification] =
    useState(true);

  const [emailNotification, setEmailNotification] =
    useState(false);

  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const prepareDemoSound = (): AudioContext | null => {
    if (Platform.OS !== 'web') {
      return null;
    }

    try {
      const context = new window.AudioContext();

      void context.resume().catch(() => {});

      return context;
    } catch {
      return null;
    }
  };

  const startDemoReminder = (
    applianceName: string,
    audioContext: AudioContext | null,
  ) => {
    // This timer continues when navigating to Notifications.
    setTimeout(() => {
      const showPopup = () => {
        showMessage(
          '🔔 Demo Warranty Reminder',
          `${applianceName}: Your warranty expiry reminder is due.`,
        );
      };

      if (!audioContext) {
        showPopup();
        return;
      }

      void (async () => {
        try {
          await audioContext.resume();

          if (audioContext.state !== 'running') {
            void audioContext.close().catch(() => {});
            showPopup();
            return;
          }

          const oscillator =
            audioContext.createOscillator();

          const volume = audioContext.createGain();
          const now = audioContext.currentTime;

          oscillator.type = 'sine';
          oscillator.frequency.value = 880;

          volume.gain.setValueAtTime(0, now);

          volume.gain.linearRampToValueAtTime(
            0.2,
            now + 0.03,
          );

          volume.gain.setValueAtTime(0.2, now + 0.5);

          volume.gain.linearRampToValueAtTime(
            0,
            now + 0.6,
          );

          oscillator.connect(volume);
          volume.connect(audioContext.destination);

          oscillator.onended = () => {
            oscillator.disconnect();
            volume.disconnect();

            void audioContext.close().catch(() => {});

            showPopup();
          };

          oscillator.start(now);
          oscillator.stop(now + 0.65);
        } catch {
          void audioContext.close().catch(() => {});
          showPopup();
        }
      })();
    }, 8000);
  };

  const handleSaveReminder = async () => {
    if (savingRef.current) {
      return;
    }

    const isDemo = selectedReminder === DEMO_OPTION;

    if (isDemo && !pushNotification) {
      showMessage(
        'Demo reminder',
        'Please enable Push Notification to test the demo popup.',
      );
      return;
    }

    if (!pushNotification && !emailNotification) {
      showMessage(
        'Notification method required',
        'Please select at least one notification method.',
      );
      return;
    }

    savingRef.current = true;
    setSaving(true);

    const applianceName = route.params.applianceName;

    const audioContext = isDemo
      ? prepareDemoSound()
      : null;

    try {
      // The demo is local; existing backend options stay unchanged.
      if (!isDemo) {
        await saveHomeownerReminder({
          applianceId: route.params.applianceId,
          option: selectedReminder,
          pushNotification,
          emailNotification,
        });
      }

      const goToNotifications = () => {
        navigation.navigate('Notifications');

        if (isDemo) {
          startDemoReminder(
            applianceName,
            audioContext,
          );
        }
      };

      const title = isDemo
        ? 'Demo reminder ready'
        : 'Reminder saved';

      const message = isDemo
        ? `Click OK. A demo popup for ${applianceName} will appear after 8 seconds.`
        : `Reminder settings saved for ${applianceName}.\n${selectedReminder}`;

      if (Platform.OS === 'web') {
        window.alert(`${title}\n\n${message}`);
        goToNotifications();
      } else {
        Alert.alert(
          title,
          message,
          [
            {
              text: 'OK',
              onPress: goToNotifications,
            },
          ],
          { cancelable: false },
        );
      }
    } catch (error) {
      if (audioContext) {
        void audioContext.close().catch(() => {});
      }

      showMessage(
        'Save failed',
        error instanceof Error
          ? error.message
          : 'Could not save the reminder. Please try again.',
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'bottom', 'left', 'right']}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            disabled={saving}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.title}>
            Set Expiry Reminder
          </Text>

          <Text style={styles.headerIcon}>♧</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.applianceCard}>
            <Text style={styles.applianceName}>
              {route.params.applianceName}
            </Text>

            <Text style={styles.expiryText}>
              Expires {route.params.expiry}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>
            Reminder options
          </Text>

          {reminderOptions.map((option) => (
            <Pressable
              key={option}
              disabled={saving}
              onPress={() =>
                setSelectedReminder(option)
              }
              style={styles.optionRow}
            >
              <View
                style={[
                  styles.radio,
                  selectedReminder === option &&
                    styles.radioSelected,
                ]}
              >
                {selectedReminder === option && (
                  <View style={styles.radioDot} />
                )}
              </View>

              <Text style={styles.optionText}>
                {option}
              </Text>
            </Pressable>
          ))}

          {selectedReminder === DEMO_OPTION && (
            <Text style={styles.demoText}>
              Testing only. Keep the app open for the
              8-second popup.
            </Text>
          )}

          <Text style={styles.sectionTitle}>
            Notification method
          </Text>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              Push Notification
            </Text>

            <Switch
              value={pushNotification}
              disabled={saving}
              onValueChange={setPushNotification}
              trackColor={{
                false: '#DEE8ED',
                true: '#8ED6E5',
              }}
              thumbColor={
                pushNotification
                  ? '#0EA5C6'
                  : '#FFFFFF'
              }
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              Email Notification
            </Text>

            <Switch
              value={emailNotification}
              disabled={saving}
              onValueChange={setEmailNotification}
              trackColor={{
                false: '#DEE8ED',
                true: '#8ED6E5',
              }}
              thumbColor={
                emailNotification
                  ? '#0EA5C6'
                  : '#FFFFFF'
              }
            />
          </View>

          <Pressable
            style={[
              styles.saveButton,
              saving && styles.disabledButton,
            ]}
            disabled={saving}
            onPress={handleSaveReminder}
          >
            <Text style={styles.saveText}>
              {saving ? 'Saving...' : 'Save Reminder'}
            </Text>
          </Pressable>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            style={styles.navigationItem}
            onPress={() =>
              navigation.navigate('Dashboard')
            }
          >
            <Ionicons
              name="home-outline"
              size={22}
              color="#58717F"
            />

            <Text style={styles.navigationText}>
              Home
            </Text>
          </Pressable>

          <Pressable
            style={styles.navigationItem}
            onPress={() =>
              navigation.navigate('MyAppliances')
            }
          >
            <Ionicons
              name="apps-outline"
              size={22}
              color="#58717F"
            />

            <Text style={styles.navigationText}>
              Appliances
            </Text>
          </Pressable>

          <Pressable
            style={styles.navigationItem}
            onPress={() =>
              navigation.navigate('MaintenanceCalendar')
            }
          >
            <Ionicons
              name="calendar-outline"
              size={22}
              color="#58717F"
            />

            <Text style={styles.navigationText}>
              Calendar
            </Text>
          </Pressable>

          <Pressable
            style={styles.navigationItem}
            onPress={() =>
              navigation.navigate('Profile')
            }
          >
            <Ionicons
              name="person-outline"
              size={22}
              color="#58717F"
            />

            <Text style={styles.navigationText}>
              Profile
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F8FA',
  },

  scrollView: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#F4F8FA',
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#DDF4FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backText: {
    color: '#087F80',
    fontSize: 28,
    lineHeight: 30,
  },

  title: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    color: '#103851',
    fontSize: 19,
    fontWeight: '700',
  },

  headerIcon: {
    color: '#58717F',
    fontSize: 22,
  },

  applianceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DEE8ED',
    padding: 15,
    marginBottom: 24,
  },

  applianceName: {
    color: '#103851',
    fontSize: 14,
    fontWeight: '700',
  },

  expiryText: {
    color: '#58717F',
    fontSize: 11,
    marginTop: 5,
  },

  sectionTitle: {
    color: '#103851',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },

  optionRow: {
    minHeight: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DEE8ED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioSelected: {
    borderColor: '#0EA5C6',
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0EA5C6',
  },

  optionText: {
    flex: 1,
    color: '#103851',
    fontSize: 12,
    marginLeft: 10,
  },

  demoText: {
    color: '#58717F',
    fontSize: 12,
    marginTop: 3,
    marginBottom: 16,
  },

  switchRow: {
    minHeight: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },

  switchText: {
    flex: 1,
    marginRight: 8,
    color: '#103851',
    fontSize: 12,
  },

  saveButton: {
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: '#0EA5C6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 18,
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  disabledButton: {
    opacity: 0.6,
  },

  bottomBar: {
    minHeight: 68,
    paddingTop: 9,
    paddingBottom: 9,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#DEE8ED',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  navigationItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  navigationText: {
    fontSize: 10,
    color: '#58717F',
  },

  bottomItem: {
    color: '#8CA0AA',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 17,
  },

  activeBottomItem: {
    color: '#0EA5C6',
    fontWeight: '700',
  },
});