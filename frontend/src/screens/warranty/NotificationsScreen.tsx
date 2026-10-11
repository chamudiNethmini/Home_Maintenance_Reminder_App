
import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import {
  onAuthStateChanged,
} from 'firebase/auth';

import {
  auth,
  db,
} from '../../config/firebase';

import {
  markHomeownerReminderRead,
} from '../../services/homeownerReminderService';

import type {
  HomeownerScreenProps,
} from '../../navigation/homeownerTypes';

type WarrantyReminder = {
  id: string;
  applianceName: string;
  message: string;
  time: string;
  color: string;
  icon: string;
  isRead: boolean;
  dueAt: Date;
};

type WarrantyData = {
  customerId?: string;
  applianceId?: string;
  applianceName?: string;
  name?: string;
  expiry?: unknown;
  expiryDate?: unknown;
  warrantyExpiry?: unknown;
  warrantyEndDate?: unknown;
  warrantyExpiryDate?: unknown;
  reminder?: {
    option?: string;
    enabled?: boolean;
    pushNotification?: boolean;
    emailNotification?: boolean;
    isRead?: boolean;
  };
  [key: string]: unknown;
};

const REMINDER_OPTIONS = [
  '1 month before expiry',
  '3 months before expiry',
  '1 week before expiry',
  'On expiry date',
];

function showMessage(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

function parseExpiryDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  let date: Date;

  // Firestore Timestamp
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof value.toDate === 'function'
  ) {
    date = value.toDate();
  } else if (
    value instanceof Date
  ) {
    date = new Date(value.getTime());
  } else if (
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    date = new Date(value);
  } else {
    return null;
  }

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  // Treat a date-only value as the end of that local day.
  if (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    date.setHours(23, 59, 59, 999);
  }

  return date;
}

function getExpiryDate(
  warranty: WarrantyData,
): Date | null {
  const possibleFields = [
    warranty.expiry,
    warranty.expiryDate,
    warranty.warrantyExpiry,
    warranty.warrantyEndDate,
    warranty.warrantyExpiryDate,
  ];

  for (const value of possibleFields) {
    const parsed = parseExpiryDate(value);

    if (parsed) {
      return parsed;
    }
  }

  return null;
}

function calculateReminderDate(
  expiryDate: Date,
  option: string,
): Date | null {
  if (!REMINDER_OPTIONS.includes(option)) {
    return null;
  }

  const reminderDate = new Date(expiryDate);

  if (option === '1 month before expiry') {
    const originalDay = reminderDate.getDate();

    reminderDate.setDate(1);
    reminderDate.setMonth(
      reminderDate.getMonth() - 1,
    );

    const lastDay = new Date(
      reminderDate.getFullYear(),
      reminderDate.getMonth() + 1,
      0,
    ).getDate();

    reminderDate.setDate(
      Math.min(originalDay, lastDay),
    );
  } else if (
    option === '3 months before expiry'
  ) {
    const originalDay = reminderDate.getDate();

    reminderDate.setDate(1);
    reminderDate.setMonth(
      reminderDate.getMonth() - 3,
    );

    const lastDay = new Date(
      reminderDate.getFullYear(),
      reminderDate.getMonth() + 1,
      0,
    ).getDate();

    reminderDate.setDate(
      Math.min(originalDay, lastDay),
    );
  } else if (
    option === '1 week before expiry'
  ) {
    reminderDate.setDate(
      reminderDate.getDate() - 7,
    );
  }

  return reminderDate;
}

function formatReminderTime(date: Date): string {
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function createReminder(
  id: string,
  warranty: WarrantyData,
): WarrantyReminder | null {
  const reminder = warranty.reminder;

  if (
    !reminder ||
    reminder.enabled !== true ||
    !reminder.option ||
    !REMINDER_OPTIONS.includes(reminder.option)
  ) {
    return null;
  }

  // Email-only or disabled reminders are not shown
  // as push notification alerts.
  if (reminder.pushNotification !== true) {
    return null;
  }

  const expiryDate = getExpiryDate(warranty);

  if (!expiryDate) {
    return null;
  }

  const dueAt = calculateReminderDate(
    expiryDate,
    reminder.option,
  );

  if (!dueAt) {
    return null;
  }

  // Do not show reminders before their scheduled date.
  if (dueAt.getTime() > Date.now()) {
    return null;
  }

  const applianceName =
    warranty.applianceName ||
    warranty.name ||
    'Appliance';

  const isExpired = expiryDate.getTime() < Date.now();

  return {
    id,
    applianceName,
    message: isExpired
      ? 'Warranty has expired'
      : 'Warranty expiry reminder is due',
    time: formatReminderTime(dueAt),
    color: isExpired ? '#E64646' : '#F5A623',
    icon: isExpired ? 'close' : 'alert',
    isRead: reminder.isRead === true,
    dueAt,
  };
}

export default function NotificationsScreen({
  navigation,
}: HomeownerScreenProps<'Notifications'>) {
  const [alerts, setAlerts] = useState<WarrantyReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);

  const loadReminders = useCallback(async () => {
    const user = auth.currentUser;

    if (!user) {
      setAlerts([]);
      setLoading(false);
      return;
    }

    try {
      const warrantiesQuery = query(
        collection(db, 'homeownerWarranties'),
        where('customerId', '==', user.uid),
      );

      const snapshot = await getDocs(warrantiesQuery);

      // Do not show data if the signed-in user changed
      // while the request was running.
      if (auth.currentUser?.uid !== user.uid) {
        setAlerts([]);
        return;
      }

      const currentTime = Date.now();

      const reminders = snapshot.docs
        .map((document) => {
          const warranty =
            document.data() as WarrantyData;

          return createReminder(
            document.id,
            warranty,
          );
        })
        .filter(
          (
            reminder,
          ): reminder is WarrantyReminder =>
            reminder !== null,
        )
        .sort(
          (a, b) =>
            a.dueAt.getTime() - b.dueAt.getTime(),
        );

      // Hide future reminders. Keep due and overdue alerts.
      setAlerts(
        reminders.filter(
          (item) =>
            item.dueAt.getTime() <= currentTime,
        ),
      );
    } catch (error) {
      console.error(
        'Failed to load warranty reminders:',
        error,
      );

      showMessage(
        'Unable to load reminders',
        'Please check your internet connection and try again.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      () => {
        void loadReminders();
      },
    );

    const unsubscribeFocus = navigation.addListener(
      'focus',
      () => {
        setRefreshing(true);
        void loadReminders();
      },
    );

    return () => {
      unsubscribeAuth();
      unsubscribeFocus();
    };
  }, [navigation, loadReminders]);

  const handleMarkAllAsRead = async () => {
    const unreadAlerts = alerts.filter(
      (item) => !item.isRead,
    );

    if (unreadAlerts.length === 0) {
      showMessage(
        'Notifications',
        'All reminders are already marked as read.',
      );
      return;
    }

    setMarkingRead(true);

    try {
      await Promise.all(
        unreadAlerts.map((item) =>
          markHomeownerReminderRead(item.id),
        ),
      );

      setAlerts((previous) =>
        previous.map((item) => ({
          ...item,
          isRead: true,
        })),
      );

      showMessage(
        'Success',
        'All reminders marked as read.',
      );
    } catch (error) {
      console.error(
        'Failed to mark reminders as read:',
        error,
      );

      showMessage(
        'Update failed',
        'Could not mark all reminders as read. Please try again.',
      );

      await loadReminders();
    } finally {
      setMarkingRead(false);
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
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.title}>
            Notifications
          </Text>

          <View style={styles.profileBox}>
            <Text style={styles.profileText}>
              {(auth.currentUser?.displayName || 'K')
                .charAt(0)
                .toUpperCase()}
            </Text>

            <Text style={styles.profileName}>
              {auth.currentUser?.displayName || 'Profile'}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => {
            // No automatic network request on every scroll.
          }}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Warranty Alerts
            </Text>

            <Pressable
              onPress={() => {
                setRefreshing(true);
                void loadReminders();
              }}
              accessibilityRole="button"
              accessibilityLabel="Refresh reminders"
            >
              <Ionicons
                name="refresh-outline"
                size={21}
                color="#0EA5C6"
              />
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator
                size="large"
                color="#0EA5C6"
              />

              <Text style={styles.stateText}>
                Loading warranty reminders...
              </Text>
            </View>
          ) : alerts.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="notifications-outline"
                  size={28}
                  color="#0EA5C6"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No due reminders
              </Text>

              <Text style={styles.emptyMessage}>
                Reminders will appear here when the
                scheduled notification date arrives.
              </Text>
            </View>
          ) : (
            alerts.map((alert) => (
              <View
                key={alert.id}
                style={[
                  styles.alertCard,
                  !alert.isRead &&
                    styles.unreadAlertCard,
                ]}
              >
                <View style={styles.alertIcon}>
                  <Ionicons
                    name={
                      alert.icon === 'close'
                        ? 'close-circle-outline'
                        : 'alert-circle-outline'
                    }
                    size={23}
                    color={alert.color}
                  />
                </View>

                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>
                    {alert.applianceName}
                  </Text>

                  <Text style={styles.alertMessage}>
                    {alert.message}
                  </Text>

                  <Text style={styles.alertTime}>
                    Reminder date: {alert.time}
                  </Text>

                  {!alert.isRead && (
                    <Text style={styles.unreadText}>
                      Unread
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}

          <Pressable
            style={[
              styles.readButton,
              (markingRead ||
                alerts.every((item) => item.isRead)) &&
                styles.disabledButton,
            ]}
            disabled={
              markingRead ||
              alerts.every((item) => item.isRead)
            }
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.readButtonText}>
              {markingRead
                ? 'Updating...'
                : 'Mark All as Read'}
            </Text>
          </Pressable>

          <Pressable
            style={styles.settingsButton}
            onPress={() => {
              showMessage(
                'Warranty Settings',
                'Open an appliance from Appliances to update its warranty reminder settings.',
              );
            }}
          >
            <Text style={styles.settingsButtonText}>
              Warranty Settings
            </Text>
          </Pressable>

          {refreshing && !loading && (
            <Text style={styles.refreshText}>
              Refreshing reminders...
            </Text>
          )}
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            style={styles.navigationItem}
            onPress={() =>
              navigation.navigate('Dashboard')
            }
            accessibilityRole="button"
            accessibilityLabel="Home"
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
            accessibilityRole="button"
            accessibilityLabel="Appliances"
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
            accessibilityRole="button"
            accessibilityLabel="Calendar"
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
            accessibilityRole="button"
            accessibilityLabel="Profile"
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
    paddingBottom: 18,
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
    fontSize: 21,
    fontWeight: '700',
  },

  profileBox: {
    alignItems: 'center',
    maxWidth: 75,
  },

  profileText: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#0EA5C6',
    color: '#FFFFFF',
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingTop: 5,
    fontWeight: '700',
  },

  profileName: {
    color: '#58717F',
    fontSize: 9,
    marginTop: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#103851',
    fontSize: 15,
    fontWeight: '700',
  },

  alertCard: {
    minHeight: 82,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  unreadAlertCard: {
    borderColor: '#B9EAF3',
  },

  alertIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F4F8FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  alertContent: {
    flex: 1,
    marginLeft: 12,
  },

  alertTitle: {
    color: '#103851',
    fontSize: 13,
    fontWeight: '700',
  },

  alertMessage: {
    color: '#58717F',
    fontSize: 12,
    marginTop: 4,
  },

  alertTime: {
    color: '#8CA0AA',
    fontSize: 10,
    marginTop: 4,
  },

  unreadText: {
    color: '#0EA5C6',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },

  stateContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stateText: {
    color: '#58717F',
    fontSize: 12,
    marginTop: 12,
  },

  emptyCard: {
    minHeight: 190,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  emptyTitle: {
    color: '#103851',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },

  emptyMessage: {
    color: '#58717F',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 7,
  },

  readButton: {
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0EA5C6',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },

  readButtonText: {
    color: '#0EA5C6',
    fontWeight: '700',
    fontSize: 12,
  },

  settingsButton: {
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: '#0EA5C6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  settingsButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },

  disabledButton: {
    opacity: 0.45,
  },

  refreshText: {
    color: '#58717F',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 10,
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
});
