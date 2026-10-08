import React, { useRef, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import type {
  HomeownerScreenProps,
} from '../../navigation/homeownerTypes';

import {
  saveHomeownerReminder,
} from '../../services/homeownerReminderService';

const reminderOptions = [
  '1 month before expiry',
  '3 months before expiry',
  '1 week before expiry',
  'On expiry date',
];

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
      const audioContext = new window.AudioContext();

      // Enable audio during the Save button click.
      void audioContext.resume().catch(() => {});

      return audioContext;
    } catch {
      return null;
    }
  };

  const startDemoReminder = (
    audioContext: AudioContext | null,
    applianceName: string,
  ) => {
    if (Platform.OS !== 'web') {
      return;
    }

    window.setTimeout(() => {
      const showDemoPopup = () => {
        window.alert(
          '🔔 Demo Warranty Reminder\n\n' +
            `${applianceName}: Your warranty expiry reminder is due.`,
        );
      };

      void (async () => {
        if (!audioContext) {
          showDemoPopup();
          return;
        }

        try {
          await audioContext.resume();

          if (audioContext.state !== 'running') {
            void audioContext.close().catch(() => {});
            showDemoPopup();
            return;
          }

          const oscillator =
            audioContext.createOscillator();

          const volume = audioContext.createGain();

          oscillator.type = 'sine';
          oscillator.frequency.value = 880;

          const now = audioContext.currentTime;

          volume.gain.setValueAtTime(0, now);
          volume.gain.linearRampToValueAtTime(
            0.2,
            now + 0.03,
          );
          volume.gain.setValueAtTime(
            0.2,
            now + 0.5,
          );
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
            showDemoPopup();
          };

          oscillator.start(now);
          oscillator.stop(now + 0.65);
        } catch {
          void audioContext.close().catch(() => {});
          showDemoPopup();
        }
      })();
    }, 8000);
  };

  const handleSaveReminder = async () => {
    if (savingRef.current) {
      return;
    }

    if (!pushNotification && !emailNotification) {
      const message =
        'Please select at least one notification method.';

      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert(
          'Notification method required',
          message,
        );
      }

      return;
    }

    const applianceName = route.params.applianceName;
    const demoEnabled =
      Platform.OS === 'web' && pushNotification;

    const audioContext = demoEnabled
      ? prepareDemoSound()
      : null;

    savingRef.current = true;
    setSaving(true);

    try {
      await saveHomeownerReminder({
        applianceId: route.params.applianceId,
        option: selectedReminder,
        pushNotification,
        emailNotification,
      });

      const message =
        `Reminder settings saved for ${applianceName}.\n` +
        selectedReminder;

      if (Platform.OS === 'web') {
        window.alert(
          message +
            (demoEnabled
              ? '\n\nDemo alert will appear 8 seconds after clicking OK.'
              : ''),
        );

        navigation.navigate('Notifications');

        if (demoEnabled) {
          startDemoReminder(
            audioContext,
            applianceName,
          );
        }
      } else {
        Alert.alert(
          'Reminder saved',
          message,
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('Notifications');
              },
            },
          ],
          {
            cancelable: false,
          },
        );
      }
    } catch (error) {
      if (audioContext) {
        void audioContext.close().catch(() => {});
      }

      const message =
        error instanceof Error
          ? error.message
          : 'Could not save the reminder. Please try again.';

      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Save failed', message);
      }
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
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
            onPress={() => setSelectedReminder(option)}
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
          style={styles.saveButton}
          disabled={saving}
          onPress={handleSaveReminder}
        >
          <Text style={styles.saveText}>
            {saving ? 'Saving...' : 'Save Reminder'}
          </Text>
        </Pressable>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Text style={styles.bottomItem}>
          ⌂{'\n'}Home
        </Text>

        <Text style={styles.bottomItem}>
          ▦{'\n'}Appliances
        </Text>

        <Text style={styles.bottomItem}>
          □{'\n'}Calendar
        </Text>

        <Text
          style={[
            styles.bottomItem,
            styles.activeBottomItem,
          ]}
        >
          ♙{'\n'}Profile
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F8FA',
  },
  container: {
    padding: 16,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
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
  },
  title: {
    flex: 1,
    marginLeft: 12,
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
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 10,
    paddingHorizontal: 12,
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
    color: '#103851',
    fontSize: 12,
    marginLeft: 10,
  },
  switchRow: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  switchText: {
    color: '#103851',
    fontSize: 12,
  },
  saveButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: '#0EA5C6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#DEE8ED',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
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