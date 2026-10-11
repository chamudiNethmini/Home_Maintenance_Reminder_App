import {
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
  TextInput,
  View,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import type {
  HomeownerScreenProps,
} from '../../navigation/homeownerTypes';

import type {
  MaintenanceSchedule,
} from '../../types/maintenance';

import type {
  NotificationMethod,
} from '../../types/reminder';

import {
  getMaintenanceSchedules,
} from '../../services/maintenanceService';

import {
  deleteMaintenanceReminder,
  getReminderByScheduleId,
  saveMaintenanceReminder,
  testMaintenanceNotification,
} from '../../services/reminderService';

const COLORS = {
  background: '#F4F8FA',
  white: '#FFFFFF',
  teal: '#087F80',
  cyan: '#0EA5C6',
  heading: '#103851',
  secondary: '#58717F',
  border: '#DEE8ED',
  preview: '#F1F9F9',
  illustrationLine: '#CEDCE3',

  danger: '#AC3546',
  dangerBackground: '#FFF5F6',
};

const reminderOptions = [
  {
    label: '1 Day Before',
    days: 1,
  },

  {
    label: '3 Days Before',
    days: 3,
  },

  {
    label: '1 Week Before',
    days: 7,
  },
];

const notificationMethods:
  NotificationMethod[] = [
    'In-App',
    'Push Notification',
    'Email',
  ];

export default function ReminderSettingsScreen({
  navigation,
  route,
}: HomeownerScreenProps<'ReminderSettings'>) {
  const insets =
    useSafeAreaInsets();

  const [
    schedules,
    setSchedules,
  ] =
    useState<MaintenanceSchedule[]>(
      [],
    );

  const [
    selectedSchedule,
    setSelectedSchedule,
  ] =
    useState<MaintenanceSchedule | null>(
      null,
    );

  const [
    remindBeforeDays,
    setRemindBeforeDays,
  ] = useState(1);

  const [
    reminderTime,
    setReminderTime,
  ] = useState('09:00');

  const [
    notificationMethod,
    setNotificationMethod,
  ] =
    useState<NotificationMethod>(
      'In-App',
    );

  const [
    existingReminder,
    setExistingReminder,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    testingNotification,
    setTestingNotification,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  /* ===========================
     LOAD REMINDER
  =========================== */

  const loadReminderForSchedule =
    async (
      schedule:
        MaintenanceSchedule,
    ) => {
      try {
        setSelectedSchedule(
          schedule,
        );

        setError('');

        const reminder =
          await getReminderByScheduleId(
            schedule.id,
          );

        if (reminder) {
          setExistingReminder(
            true,
          );

          setRemindBeforeDays(
            reminder.remindBeforeDays,
          );

          setReminderTime(
            reminder.reminderTime,
          );

          setNotificationMethod(
            reminder.notificationMethod,
          );
        } else {
          setExistingReminder(
            false,
          );

          setRemindBeforeDays(
            1,
          );

          setReminderTime(
            '09:00',
          );

          setNotificationMethod(
            'In-App',
          );
        }
      } catch (
        reminderError
      ) {
        setError(
          reminderError instanceof
            Error
            ? reminderError.message
            : 'Unable to load reminder.',
        );
      }
    };

  /* ===========================
     LOAD MAINTENANCE
  =========================== */

  useEffect(() => {
    const loadData =
      async () => {
        try {
          setLoading(
            true,
          );

          setError('');

          const maintenance =
            await getMaintenanceSchedules();

          const upcoming =
            maintenance.filter(
              (item) =>
                item.status ===
                'upcoming',
            );

          setSchedules(
            upcoming,
          );

          if (
            upcoming.length ===
            0
          ) {
            setSelectedSchedule(
              null,
            );

            return;
          }

          const requestedId =
            route.params
              ?.scheduleId;

          const schedule =
            upcoming.find(
              (item) =>
                item.id ===
                requestedId,
            ) ??
            upcoming[0];

          await loadReminderForSchedule(
            schedule,
          );
        } catch (
          loadError
        ) {
          setError(
            loadError instanceof
              Error
              ? loadError.message
              : 'Unable to load reminder settings.',
          );
        } finally {
          setLoading(
            false,
          );
        }
      };

    void loadData();
  }, [
    route.params
      ?.scheduleId,
  ]);

  /* ===========================
     TIME VALIDATION
  =========================== */

  const validTime =
    (
      value: string,
    ) => {
      return /^([01]\d|2[0-3]):[0-5]\d$/.test(
        value,
      );
    };

  /* ===========================
     TEST NOTIFICATION
  =========================== */

  const handleTestNotification =
    async () => {
      /*
       * Expo Web cannot test
       * native phone notifications.
       */
      if (
        Platform.OS ===
        'web'
      ) {
        window.alert(
          'Please test notifications on your Android or iOS phone.',
        );

        return;
      }

      try {
        setTestingNotification(
          true,
        );

        setError('');

        await testMaintenanceNotification();

        Alert.alert(
          'Test Scheduled',
          'A test notification should appear in about 10 seconds.',
        );
      } catch (
        testError
      ) {
        setError(
          testError instanceof
            Error
            ? testError.message
            : 'Unable to test notification.',
        );
      } finally {
        setTestingNotification(
          false,
        );
      }
    };

  /* ===========================
     SAVE REMINDER
  =========================== */

  const handleSave =
    async () => {
      if (
        !selectedSchedule
      ) {
        setError(
          'Please select a maintenance schedule.',
        );

        return;
      }

      if (
        !validTime(
          reminderTime,
        )
      ) {
        setError(
          'Please enter time using HH:MM format. Example: 09:30.',
        );

        return;
      }

      try {
        setSaving(
          true,
        );

        setError('');

        await saveMaintenanceReminder(
          {
            scheduleId:
              selectedSchedule.id,

            applianceId:
              selectedSchedule.applianceId,

            applianceName:
              selectedSchedule.applianceName,

            maintenanceType:
              selectedSchedule.maintenanceType,

            scheduledDate:
              selectedSchedule.scheduledDate,

            remindBeforeDays,

            reminderTime,

            notificationMethod,
          },
        );

        setExistingReminder(
          true,
        );

        if (
          Platform.OS ===
          'web'
        ) {
          window.alert(
            'Reminder saved successfully.',
          );

          navigation.replace(
            'MaintenanceCalendar',
          );

          return;
        }

        Alert.alert(
          'Reminder Saved',
          notificationMethod ===
            'Push Notification'
            ? 'Your reminder was saved and the phone notification was scheduled.'
            : 'Your maintenance reminder has been saved.',
          [
            {
              text: 'OK',

              onPress: () =>
                navigation.replace(
                  'MaintenanceCalendar',
                ),
            },
          ],
        );
      } catch (
        saveError
      ) {
        setError(
          saveError instanceof
            Error
            ? saveError.message
            : 'Unable to save reminder.',
        );
      } finally {
        setSaving(
          false,
        );
      }
    };

  /* ===========================
     DELETE REMINDER
  =========================== */

  const handleDelete =
    () => {
      if (
        !selectedSchedule
      ) {
        return;
      }

      const performDelete =
        async () => {
          try {
            setError('');

            await deleteMaintenanceReminder(
              selectedSchedule.id,
            );

            setExistingReminder(
              false,
            );

            setRemindBeforeDays(
              1,
            );

            setReminderTime(
              '09:00',
            );

            setNotificationMethod(
              'In-App',
            );

            if (
              Platform.OS ===
              'web'
            ) {
              window.alert(
                'Reminder deleted.',
              );
            } else {
              Alert.alert(
                'Reminder Deleted',
                'The reminder was deleted successfully.',
              );
            }
          } catch (
            deleteError
          ) {
            setError(
              deleteError instanceof
                Error
                ? deleteError.message
                : 'Unable to delete reminder.',
            );
          }
        };

      if (
        Platform.OS ===
        'web'
      ) {
        const confirmed =
          window.confirm(
            'Delete this reminder?',
          );

        if (confirmed) {
          void performDelete();
        }

        return;
      }

      Alert.alert(
        'Delete Reminder',
        'Are you sure you want to delete this reminder?',
        [
          {
            text:
              'Cancel',

            style:
              'cancel',
          },

          {
            text:
              'Delete',

            style:
              'destructive',

            onPress: () =>
              void performDelete(),
          },
        ],
      );
    };

  return (
    <View
      style={
        styles.container
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,

          {
            paddingTop:
              insets.top +
              18,

            paddingBottom:
              insets.bottom +
              40,
          },
        ]}
      >
        {/* Header */}
        <View
          style={
            styles.header
          }
        >
          <Pressable
            style={
              styles.backButton
            }
            onPress={() =>
              navigation.goBack()
            }
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={
                COLORS.heading
              }
            />
          </Pressable>

          <View>
            <Text
              style={
                styles.title
              }
            >
              Reminder Settings
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Manage maintenance alerts
            </Text>
          </View>
        </View>

        {/* Loading */}
        {loading ? (
          <View
            style={
              styles.stateCard
            }
          >
            <ActivityIndicator
              size="large"
              color={
                COLORS.teal
              }
            />

            <Text
              style={
                styles.stateText
              }
            >
              Loading reminders...
            </Text>
          </View>
        ) : schedules.length ===
          0 ? (
          /* No Maintenance */
          <View
            style={
              styles.stateCard
            }
          >
            <Ionicons
              name="notifications-off-outline"
              size={42}
              color={
                COLORS.cyan
              }
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              No upcoming maintenance
            </Text>

            <Text
              style={
                styles.stateText
              }
            >
              Schedule maintenance
              before creating a
              reminder.
            </Text>

            <Pressable
              style={
                styles.primaryButton
              }
              onPress={() =>
                navigation.navigate(
                  'ScheduleMaintenance',
                  {},
                )
              }
            >
              <Text
                style={
                  styles.primaryButtonText
                }
              >
                Schedule Maintenance
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* =====================
                MAINTENANCE
            ===================== */}

            <Text
              style={
                styles.sectionTitle
              }
            >
              Maintenance
            </Text>

            <View
              style={
                styles.scheduleList
              }
            >
              {schedules.map(
                (
                  schedule,
                ) => {
                  const selected =
                    selectedSchedule
                      ?.id ===
                    schedule.id;

                  return (
                    <Pressable
                      key={
                        schedule.id
                      }
                      onPress={() =>
                        void loadReminderForSchedule(
                          schedule,
                        )
                      }
                      style={[
                        styles.scheduleCard,

                        selected &&
                          styles.selectedSchedule,
                      ]}
                    >
                      <View
                        style={
                          styles.scheduleIcon
                        }
                      >
                        <Ionicons
                          name="build-outline"
                          size={22}
                          color={
                            COLORS.cyan
                          }
                        />
                      </View>

                      <View
                        style={
                          styles.scheduleInfo
                        }
                      >
                        <Text
                          style={
                            styles.applianceName
                          }
                        >
                          {
                            schedule.applianceName
                          }
                        </Text>

                        <Text
                          style={
                            styles.scheduleMeta
                          }
                        >
                          {
                            schedule.maintenanceType
                          }
                          {' • '}
                          {
                            schedule.scheduledDate
                          }
                        </Text>
                      </View>

                      <Ionicons
                        name={
                          selected
                            ? 'checkmark-circle'
                            : 'ellipse-outline'
                        }
                        size={22}
                        color={
                          selected
                            ? COLORS.teal
                            : COLORS.border
                        }
                      />
                    </Pressable>
                  );
                },
              )}
            </View>

            {/* =====================
                REMIND BEFORE
            ===================== */}

            <Text
              style={
                styles.sectionTitle
              }
            >
              Remind Me
            </Text>

            <View
              style={
                styles.optionContainer
              }
            >
              {reminderOptions.map(
                (
                  option,
                ) => (
                  <Pressable
                    key={
                      option.days
                    }
                    style={[
                      styles.optionButton,

                      remindBeforeDays ===
                        option.days &&
                        styles.selectedOption,
                    ]}
                    onPress={() => {
                      setRemindBeforeDays(
                        option.days,
                      );

                      setError('');
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,

                        remindBeforeDays ===
                          option.days &&
                          styles.selectedOptionText,
                      ]}
                    >
                      {
                        option.label
                      }
                    </Text>
                  </Pressable>
                ),
              )}
            </View>

            {/* =====================
                TIME
            ===================== */}

            <Text
              style={
                styles.sectionTitle
              }
            >
              Reminder Time
            </Text>

            <View
              style={
                styles.timeInput
              }
            >
              <Ionicons
                name="time-outline"
                size={20}
                color={
                  COLORS.secondary
                }
              />

              <TextInput
                value={
                  reminderTime
                }
                onChangeText={(
                  value,
                ) => {
                  setReminderTime(
                    value,
                  );

                  setError('');
                }}
                placeholder="09:00"
                placeholderTextColor={
                  COLORS.secondary
                }
                style={
                  styles.input
                }
              />
            </View>

            <Text
              style={
                styles.helperText
              }
            >
              Use 24-hour format,
              for example 09:00 or
              18:30.
            </Text>

            {/* =====================
                NOTIFICATION METHOD
            ===================== */}

            <Text
              style={
                styles.sectionTitle
              }
            >
              Notification Method
            </Text>

            <View
              style={
                styles.methodContainer
              }
            >
              {notificationMethods.map(
                (
                  method,
                ) => {
                  const selected =
                    notificationMethod ===
                    method;

                  return (
                    <Pressable
                      key={
                        method
                      }
                      style={[
                        styles.methodCard,

                        selected &&
                          styles.selectedMethod,
                      ]}
                      onPress={() => {
                        setNotificationMethod(
                          method,
                        );

                        setError('');
                      }}
                    >
                      <Ionicons
                        name={
                          method ===
                          'Email'
                            ? 'mail-outline'
                            : method ===
                                'Push Notification'
                              ? 'phone-portrait-outline'
                              : 'notifications-outline'
                        }
                        size={22}
                        color={
                          selected
                            ? COLORS.teal
                            : COLORS.secondary
                        }
                      />

                      <Text
                        style={[
                          styles.methodText,

                          selected &&
                            styles.selectedMethodText,
                        ]}
                      >
                        {
                          method
                        }
                      </Text>

                      {selected ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={
                            COLORS.teal
                          }
                          style={
                            styles.methodCheck
                          }
                        />
                      ) : null}
                    </Pressable>
                  );
                },
              )}
            </View>

            {/* =====================
                TEST NOTIFICATION
            ===================== */}

            {__DEV__ &&
              notificationMethod ===
                'Push Notification' && (
                <>
                  <Pressable
                    disabled={
                      testingNotification
                    }
                    style={[
                      styles.testNotificationButton,

                      testingNotification && {
                        opacity:
                          0.65,
                      },
                    ]}
                    onPress={() =>
                      void handleTestNotification()
                    }
                  >
                    {testingNotification ? (
                      <ActivityIndicator
                        color={
                          COLORS.teal
                        }
                      />
                    ) : (
                      <>
                        <Ionicons
                          name="notifications-outline"
                          size={20}
                          color={
                            COLORS.teal
                          }
                        />

                        <Text
                          style={
                            styles.testNotificationText
                          }
                        >
                          Test Notification
                        </Text>
                      </>
                    )}
                  </Pressable>

                  <Text
                    style={
                      styles.testHelperText
                    }
                  >
                    Sends a test
                    notification in about
                    10 seconds. Use this
                    only for testing.
                  </Text>
                </>
              )}

            {/* =====================
                ERROR
            ===================== */}

            {error ? (
              <View
                style={
                  styles.errorBox
                }
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color={
                    COLORS.danger
                  }
                />

                <Text
                  style={
                    styles.errorText
                  }
                >
                  {error}
                </Text>
              </View>
            ) : null}

            {/* =====================
                SAVE / UPDATE
            ===================== */}

            <Pressable
              disabled={
                saving
              }
              style={[
                styles.saveButton,

                saving && {
                  opacity:
                    0.65,
                },
              ]}
              onPress={() =>
                void handleSave()
              }
            >
              {saving ? (
                <ActivityIndicator
                  color={
                    COLORS.white
                  }
                />
              ) : (
                <>
                  <Ionicons
                    name="notifications-outline"
                    size={20}
                    color={
                      COLORS.white
                    }
                  />

                  <Text
                    style={
                      styles.saveText
                    }
                  >
                    {existingReminder
                      ? 'Update Reminder'
                      : 'Save Reminder'}
                  </Text>
                </>
              )}
            </Pressable>

            {/* =====================
                DELETE
            ===================== */}

            {existingReminder ? (
              <Pressable
                style={
                  styles.deleteButton
                }
                onPress={
                  handleDelete
                }
              >
                <Ionicons
                  name="trash-outline"
                  size={19}
                  color={
                    COLORS.danger
                  }
                />

                <Text
                  style={
                    styles.deleteText
                  }
                >
                  Delete Reminder
                </Text>
              </Pressable>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

/* ===========================
   STYLES
=========================== */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      backgroundColor:
        COLORS.background,
    },

    content: {
      width:
        '100%',

      maxWidth:
        500,

      alignSelf:
        'center',

      paddingHorizontal:
        20,
    },

    /* Header */

    header: {
      flexDirection:
        'row',

      alignItems:
        'center',

      gap: 14,

      marginBottom:
        23,
    },

    backButton: {
      width: 44,

      height: 44,

      borderRadius:
        14,

      backgroundColor:
        COLORS.white,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    title: {
      fontSize: 23,

      fontWeight:
        '800',

      color:
        COLORS.heading,
    },

    subtitle: {
      marginTop:
        3,

      fontSize:
        13,

      color:
        COLORS.secondary,
    },

    /* Sections */

    sectionTitle: {
      marginTop:
        22,

      marginBottom:
        10,

      fontSize:
        15,

      fontWeight:
        '800',

      color:
        COLORS.heading,
    },

    /* Schedule */

    scheduleList: {
      gap:
        9,
    },

    scheduleCard: {
      minHeight:
        68,

      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        COLORS.white,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      borderRadius:
        14,

      padding:
        11,
    },

    selectedSchedule: {
      borderColor:
        COLORS.teal,

      backgroundColor:
        COLORS.preview,
    },

    scheduleIcon: {
      width:
        43,

      height:
        43,

      borderRadius:
        12,

      backgroundColor:
        COLORS.preview,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    scheduleInfo: {
      flex:
        1,

      marginLeft:
        11,
    },

    applianceName: {
      fontSize:
        14,

      fontWeight:
        '700',

      color:
        COLORS.heading,
    },

    scheduleMeta: {
      marginTop:
        4,

      fontSize:
        11,

      color:
        COLORS.secondary,
    },

    /* Reminder options */

    optionContainer: {
      flexDirection:
        'row',

      flexWrap:
        'wrap',

      gap:
        8,
    },

    optionButton: {
      paddingHorizontal:
        12,

      paddingVertical:
        9,

      borderRadius:
        10,

      backgroundColor:
        COLORS.white,

      borderWidth:
        1,

      borderColor:
        COLORS.border,
    },

    selectedOption: {
      borderColor:
        COLORS.teal,

      backgroundColor:
        COLORS.preview,
    },

    optionText: {
      color:
        COLORS.secondary,

      fontSize:
        11,

      fontWeight:
        '600',
    },

    selectedOptionText: {
      color:
        COLORS.teal,

      fontWeight:
        '700',
    },

    /* Time */

    timeInput: {
      minHeight:
        52,

      backgroundColor:
        COLORS.white,

      borderWidth:
        1,

      borderColor:
        COLORS.illustrationLine,

      borderRadius:
        12,

      paddingHorizontal:
        13,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap:
        9,
    },

    input: {
      flex:
        1,

      fontSize:
        14,

      color:
        COLORS.heading,
    },

    helperText: {
      marginTop:
        6,

      fontSize:
        10,

      color:
        COLORS.secondary,
    },

    /* Method */

    methodContainer: {
      gap:
        8,
    },

    methodCard: {
      minHeight:
        53,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap:
        11,

      paddingHorizontal:
        14,

      backgroundColor:
        COLORS.white,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      borderRadius:
        13,
    },

    selectedMethod: {
      borderColor:
        COLORS.teal,

      backgroundColor:
        COLORS.preview,
    },

    methodText: {
      color:
        COLORS.secondary,

      fontSize:
        13,

      fontWeight:
        '600',
    },

    selectedMethodText: {
      color:
        COLORS.teal,

      fontWeight:
        '700',
    },

    methodCheck: {
      marginLeft:
        'auto',
    },

    /* Test Notification */

    testNotificationButton: {
      minHeight:
        50,

      marginTop:
        12,

      borderRadius:
        13,

      borderWidth:
        1,

      borderColor:
        COLORS.teal,

      backgroundColor:
        COLORS.preview,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap:
        8,
    },

    testNotificationText: {
      color:
        COLORS.teal,

      fontSize:
        13,

      fontWeight:
        '700',
    },

    testHelperText: {
      marginTop:
        6,

      fontSize:
        10,

      lineHeight:
        15,

      color:
        COLORS.secondary,

      textAlign:
        'center',
    },

    /* Error */

    errorBox: {
      marginTop:
        18,

      padding:
        11,

      flexDirection:
        'row',

      gap:
        8,

      backgroundColor:
        COLORS.dangerBackground,

      borderWidth:
        1,

      borderColor:
        '#F1D3D7',

      borderRadius:
        11,
    },

    errorText: {
      flex:
        1,

      color:
        COLORS.danger,

      fontSize:
        12,
    },

    /* Save */

    saveButton: {
      minHeight:
        54,

      marginTop:
        23,

      borderRadius:
        14,

      backgroundColor:
        COLORS.teal,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap:
        8,
    },

    saveText: {
      color:
        COLORS.white,

      fontSize:
        14,

      fontWeight:
        '700',
    },

    /* Delete */

    deleteButton: {
      minHeight:
        50,

      marginTop:
        10,

      borderRadius:
        13,

      backgroundColor:
        COLORS.dangerBackground,

      borderWidth:
        1,

      borderColor:
        '#F1D3D7',

      flexDirection:
        'row',

      justifyContent:
        'center',

      alignItems:
        'center',

      gap:
        7,
    },

    deleteText: {
      color:
        COLORS.danger,

      fontSize:
        13,

      fontWeight:
        '700',
    },

    /* Empty / loading */

    stateCard: {
      minHeight:
        250,

      backgroundColor:
        COLORS.white,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      borderRadius:
        18,

      padding:
        25,

      alignItems:
        'center',

      justifyContent:
        'center',

      gap:
        10,
    },

    stateText: {
      color:
        COLORS.secondary,

      fontSize:
        12,

      textAlign:
        'center',
    },

    emptyTitle: {
      color:
        COLORS.heading,

      fontSize:
        17,

      fontWeight:
        '800',
    },

    primaryButton: {
      marginTop:
        8,

      paddingHorizontal:
        16,

      paddingVertical:
        10,

      borderRadius:
        10,

      backgroundColor:
        COLORS.teal,
    },

    primaryButtonText: {
      color:
        COLORS.white,

      fontWeight:
        '700',

      fontSize:
        12,
    },
  });