import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

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

import {
  doc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from '../../config/firebase';

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
  const [waiting, setWaiting] = useState(false);

  const savingRef = useRef(false);
  const mountedRef = useRef(true);
  const demoVersionRef = useRef(0);

  const timerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const audioRef = useRef<AudioContext | null>(null);

  function cancelDemo() {
    demoVersionRef.current += 1;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const context = audioRef.current;
    audioRef.current = null;

    if (context && context.state !== 'closed') {
      void context.close().catch(() => {});
    }

    if (mountedRef.current) {
      setWaiting(false);
    }
  }

  useEffect(() => {
    mountedRef.current = true;

    const stopBlur = navigation.addListener('blur', () => {
      cancelDemo();
    });

    return () => {
      mountedRef.current = false;
      stopBlur();
      cancelDemo();
    };
  }, [navigation]);

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

  async function saveDemoAlert(
    customerId: string,
    dueAtMs: number,
  ) {
    const applianceId = route.params.applianceId.trim();

    if (!applianceId) {
      throw new Error('Appliance ID is missing.');
    }

    const warrantyId =
      `${customerId}_${encodeURIComponent(applianceId)}`;

    const warrantyRef = doc(
      db,
      'homeownerWarranties',
      warrantyId,
    );

    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(warrantyRef);

      if (auth.currentUser?.uid !== customerId) {
        throw new Error('Please log in again.');
      }

      if (!snapshot.exists()) {
        throw new Error('Please save your warranty first.');
      }

      const data = snapshot.data();

      if (
        data.customerId !== customerId ||
        data.applianceId !== applianceId
      ) {
        throw new Error(
          'You cannot update this warranty reminder.',
        );
      }

      // Save only after the due popup is acknowledged.
      transaction.update(warrantyRef, {
        reminder: {
          option: DEMO_OPTION,
          enabled: true,
          pushNotification: true,
          emailNotification: false,
          dueAtMs,
          notificationVisible: true,
          isRead: false,
          savedAt: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      });
    });
  }

  const startDemoReminder = (
    applianceName: string,
    audioContext: AudioContext | null,
    customerId: string,
  ) => {
    const version = demoVersionRef.current;
    const dueAtMs = Date.now() + 8000;

    audioRef.current = audioContext;
    setWaiting(true);

    const stillActive = () =>
      mountedRef.current &&
      version === demoVersionRef.current &&
      navigation.isFocused() &&
      auth.currentUser?.uid === customerId;

    let acknowledged = false;

    const finishDemo = async () => {
      if (acknowledged || !stillActive()) return;

      acknowledged = true;
      savingRef.current = true;
      setSaving(true);

      try {
        await saveDemoAlert(customerId, dueAtMs);

        if (stillActive()) {
          // Navigate only after the alert has been saved.
          navigation.navigate('Notifications');
        }
      } catch (error) {
        if (stillActive()) {
          showMessage(
            'Could not save notification',
            error instanceof Error
              ? error.message
              : 'Please try the demo again.',
          );
        }
      } finally {
        savingRef.current = false;

        if (mountedRef.current) {
          setSaving(false);
          setWaiting(false);
        }

        if (
          audioContext &&
          audioContext.state !== 'closed'
        ) {
          void audioContext.close().catch(() => {});
        }
      }
    };

    let popupShown = false;

    const showPopup = () => {
      if (popupShown || !stillActive()) return;

      popupShown = true;

      const title = '🔔 Demo Warranty Reminder';
      const message =
        `${applianceName}: Your warranty expiry reminder is due.`;

      if (Platform.OS === 'web') {
        window.alert(`${title}\n\n${message}`);

        // window.alert returns after the user clicks OK.
        void finishDemo();
      } else {
        Alert.alert(
          title,
          message,
          [
            {
              text: 'OK',
              onPress: () => {
                void finishDemo();
              },
            },
          ],
          { cancelable: false },
        );
      }
    };

    timerRef.current = setTimeout(() => {
      timerRef.current = null;

      if (!stillActive()) {
        cancelDemo();
        return;
      }

      if (!audioContext) {
        showPopup();
        return;
      }

      void (async () => {
        try {
          await audioContext.resume();

          if (!stillActive()) return;

          if (audioContext.state !== 'running') {
            showPopup();
            return;
          }

          const oscillator = audioContext.createOscillator();
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
            showPopup();
          };

          oscillator.start(now);
          oscillator.stop(now + 0.65);
        } catch {
          showPopup();
        }
      })();
    }, 8000);
  };

  const handleSaveReminder = async () => {
    if (savingRef.current || waiting) return;

    const user = auth.currentUser;

    if (!user) {
      showMessage('Login required', 'Please log in first.');
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

    savingRef.current = true;
    setSaving(true);

    try {
      if (isDemo) {
        cancelDemo();

        const audioContext = prepareDemoSound();

        // Stay on this page until the popup is acknowledged.
        startDemoReminder(
          route.params.applianceName,
          audioContext,
          user.uid,
        );

        return;
      }

      await saveHomeownerReminder({
        applianceId: route.params.applianceId,
        option: selectedReminder,
        pushNotification,
        emailNotification:
          pushNotification && emailNotification,
      });

      const title = 'Reminder saved';

      const message = pushNotification
        ? `Reminder settings saved for ${route.params.applianceName}.\n${selectedReminder}`
        : 'Warranty reminder disabled.';

      const goToNotifications = () => {
        navigation.navigate('Notifications');
      };

      if (Platform.OS === 'web') {
        window.alert(`${title}\n\n${message}`);
        goToNotifications();
      } else {
        Alert.alert(
          title,
          message,
          [{ text: 'OK', onPress: goToNotifications }],
          { cancelable: false },
        );
      }
    } catch (error) {
      showMessage(
        'Save failed',
        error instanceof Error
          ? error.message
          : 'Could not save the reminder. Please try again.',
      );
    } finally {
      savingRef.current = false;

      if (mountedRef.current) {
        setSaving(false);
      }
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
              disabled={saving || waiting}
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

          {selectedReminder === DEMO_OPTION && (
            <Text style={styles.demoText}>
              {waiting
                ? 'Waiting for the reminder. Stay on this page.'
                : 'Testing only. Keep this page open for the 8-second popup.'}
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
              onValueChange={(enabled) => {
                setPushNotification(enabled);

                if (!enabled) {
                  setEmailNotification(false);
                  cancelDemo();
                }
              }}
              trackColor={{
                false: '#DEE8ED',
                true: '#8ED6E5',
              }}
              thumbColor={
                pushNotification ? '#0EA5C6' : '#FFFFFF'
              }
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              Email Notification
            </Text>

            <Switch
              value={emailNotification}
              disabled={
                saving || waiting || !pushNotification
              }
              onValueChange={setEmailNotification}
              trackColor={{
                false: '#DEE8ED',
                true: '#8ED6E5',
              }}
              thumbColor={
                emailNotification ? '#0EA5C6' : '#FFFFFF'
              }
            />
          </View>

          <Pressable
            style={[
              styles.saveButton,
              (saving || waiting) && styles.disabledButton,
            ]}
            disabled={saving || waiting}
            onPress={() => {
              void handleSaveReminder();
            }}
          >
            <Text style={styles.saveText}>
              {saving
                ? 'Saving...'
                : waiting
                  ? 'Waiting for reminder...'
                  : 'Save Reminder'}
            </Text>
          </Pressable>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            style={styles.navigationItem}
            disabled={saving}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Ionicons
              name="home-outline"
              size={22}
              color="#58717F"
            />
            <Text style={styles.navigationText}>Home</Text>
          </Pressable>

          <Pressable
            style={styles.navigationItem}
            disabled={saving}
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
            disabled={saving}
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
            disabled={saving}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons
              name="person-outline"
              size={22}
              color="#58717F"
            />
            <Text style={styles.navigationText}>Profile</Text>
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
  scrollView: { flex: 1 },
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
  disabledButton: { opacity: 0.6 },
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