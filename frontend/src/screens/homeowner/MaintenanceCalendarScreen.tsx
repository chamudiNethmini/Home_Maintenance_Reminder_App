import {
  useCallback,
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

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import type {
  HomeownerScreenProps,
} from '../../navigation/homeownerTypes';

import type {
  MaintenanceSchedule,
} from '../../types/maintenance';

import {
  deleteMaintenanceSchedule,
  getMaintenanceSchedules,
  updateMaintenanceStatus,
} from '../../services/maintenanceService';

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
  dangerBorder: '#F1D3D7',
};

function getTodayString() {
  const today =
    new Date();

  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1,
    ).padStart(
      2,
      '0',
    );

  const day =
    String(
      today.getDate(),
    ).padStart(
      2,
      '0',
    );

  return `${year}-${month}-${day}`;
}

export default function MaintenanceCalendarScreen({
  navigation,
}: HomeownerScreenProps<'MaintenanceCalendar'>) {
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
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState('');

  const loadSchedules =
    useCallback(
      async () => {
        try {
          setLoading(
            true,
          );

          setError(
            '',
          );

          const data =
            await getMaintenanceSchedules();

          setSchedules(
            data,
          );
        } catch (
          loadError
        ) {
          setError(
            loadError instanceof
              Error
              ? loadError.message
              : 'Unable to load maintenance schedules.',
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [],
    );

  useFocusEffect(
    useCallback(
      () => {
        void loadSchedules();
      },
      [
        loadSchedules,
      ],
    ),
  );

  const markCompleted =
    async (
      scheduleId: string,
    ) => {
      try {
        await updateMaintenanceStatus(
          scheduleId,
          'completed',
        );

        await loadSchedules();
      } catch (
        updateError
      ) {
        const message =
          updateError instanceof
            Error
            ? updateError.message
            : 'Unable to update maintenance status.';

        if (
          Platform.OS ===
          'web'
        ) {
          window.alert(
            message,
          );
        } else {
          Alert.alert(
            'Update Failed',
            message,
          );
        }
      }
    };

  const handleDelete =
    (
      scheduleId: string,
    ) => {
      const performDelete =
        async () => {
          try {
            await deleteMaintenanceSchedule(
              scheduleId,
            );

            await loadSchedules();
          } catch (
            deleteError
          ) {
            const message =
              deleteError instanceof
                Error
                ? deleteError.message
                : 'Unable to delete maintenance schedule.';

            if (
              Platform.OS ===
              'web'
            ) {
              window.alert(
                message,
              );
            } else {
              Alert.alert(
                'Delete Failed',
                message,
              );
            }
          }
        };

      if (
        Platform.OS ===
        'web'
      ) {
        const confirmed =
          window.confirm(
            'Delete this maintenance schedule?',
          );

        if (
          confirmed
        ) {
          void performDelete();
        }

        return;
      }

      Alert.alert(
        'Delete Schedule',
        'Are you sure you want to delete this maintenance schedule?',
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

  const today =
    getTodayString();

  // Not completed + date today or future
  const upcoming =
    schedules.filter(
      (
        schedule,
      ) =>
        schedule.status ===
          'upcoming' &&
        schedule.scheduledDate >=
          today,
    );

  // Not completed + date before today
  const overdue =
    schedules.filter(
      (
        schedule,
      ) =>
        schedule.status ===
          'upcoming' &&
        schedule.scheduledDate <
          today,
    );

  const completed =
    schedules.filter(
      (
        schedule,
      ) =>
        schedule.status ===
        'completed',
    );

  const renderScheduleCard =
    (
      schedule:
        MaintenanceSchedule,

      displayStatus:
        | 'Upcoming'
        | 'Overdue'
        | 'Completed',
    ) => {
      const isOverdue =
        displayStatus ===
        'Overdue';

      const isCompleted =
        displayStatus ===
        'Completed';

      return (
        <View
          key={
            schedule.id
          }
          style={[
            styles.scheduleCard,

            isOverdue &&
              styles.overdueCard,

            isCompleted && {
              opacity: 0.7,
            },
          ]}
        >
          <View
            style={
              styles.scheduleHeader
            }
          >
            <View
              style={[
                styles.scheduleIcon,

                isOverdue &&
                  styles.overdueIcon,
              ]}
            >
              <Ionicons
                name={
                  isCompleted
                    ? 'checkmark-circle-outline'
                    : isOverdue
                      ? 'warning-outline'
                      : 'build-outline'
                }
                size={23}
                color={
                  isOverdue
                    ? COLORS.danger
                    : isCompleted
                      ? COLORS.teal
                      : COLORS.cyan
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
                  styles.maintenanceType
                }
              >
                {
                  schedule.maintenanceType
                }
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,

                isOverdue &&
                  styles.overdueStatusBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,

                  isOverdue &&
                    styles.overdueStatusText,
                ]}
              >
                {
                  displayStatus
                }
              </Text>
            </View>
          </View>

          <View
            style={
              styles.dateRow
            }
          >
            <Ionicons
              name="calendar-outline"
              size={17}
              color={
                isOverdue
                  ? COLORS.danger
                  : COLORS.secondary
              }
            />

            <Text
              style={[
                styles.dateText,

                isOverdue &&
                  styles.overdueDateText,
              ]}
            >
              {
                schedule.scheduledDate
              }
            </Text>
          </View>

          {schedule.notes ? (
            <Text
              style={
                styles.notes
              }
            >
              {
                schedule.notes
              }
            </Text>
          ) : null}

          {!isCompleted ? (
            <View
              style={
                styles.actionRow
              }
            >
              <Pressable
                style={
                  styles.completeButton
                }
                onPress={() =>
                  void markCompleted(
                    schedule.id,
                  )
                }
              >
                <Ionicons
                  name="checkmark"
                  size={17}
                  color={
                    COLORS.white
                  }
                />

                <Text
                  style={
                    styles.completeButtonText
                  }
                >
                  Complete
                </Text>
              </Pressable>

              <Pressable
                style={
                  styles.deleteButton
                }
                onPress={() =>
                  handleDelete(
                    schedule.id,
                  )
                }
              >
                <Ionicons
                  name="trash-outline"
                  size={17}
                  color={
                    COLORS.danger
                  }
                />

                <Text
                  style={
                    styles.deleteText
                  }
                >
                  Delete
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={
                styles.completedDeleteButton
              }
              onPress={() =>
                handleDelete(
                  schedule.id,
                )
              }
            >
              <Ionicons
                name="trash-outline"
                size={17}
                color={
                  COLORS.danger
                }
              />

              <Text
                style={
                  styles.deleteText
                }
              >
                Delete
              </Text>
            </Pressable>
          )}
        </View>
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
        contentContainerStyle={[
          styles.content,

          {
            paddingTop:
              insets.top +
              18,

            paddingBottom:
              120,
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

          <View
            style={
              styles.headerText
            }
          >
            <Text
              style={
                styles.title
              }
            >
              Maintenance Calendar
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Track your maintenance
              schedules
            </Text>
          </View>
        </View>

        {/* Summary */}
        <View
          style={
            styles.summaryContainer
          }
        >
          <View
            style={
              styles.summaryCard
            }
          >
            <Ionicons
              name="calendar-outline"
              size={24}
              color={
                COLORS.cyan
              }
            />

            <Text
              style={
                styles.summaryNumber
              }
            >
              {
                upcoming.length
              }
            </Text>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Upcoming
            </Text>
          </View>

          <View
            style={[
              styles.summaryCard,

              overdue.length >
                0 &&
                styles.overdueSummaryCard,
            ]}
          >
            <Ionicons
              name="warning-outline"
              size={24}
              color={
                COLORS.danger
              }
            />

            <Text
              style={[
                styles.summaryNumber,

                overdue.length >
                  0 &&
                  styles.overdueSummaryNumber,
              ]}
            >
              {
                overdue.length
              }
            </Text>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Overdue
            </Text>
          </View>

          <View
            style={
              styles.summaryCard
            }
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color={
                COLORS.teal
              }
            />

            <Text
              style={
                styles.summaryNumber
              }
            >
              {
                completed.length
              }
            </Text>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Completed
            </Text>
          </View>
        </View>

        {loading ? (
          <View
            style={[
              styles.stateCard,
              {
                marginTop:
                  24,
              },
            ]}
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
              Loading maintenance...
            </Text>
          </View>
        ) : error ? (
          <View
            style={[
              styles.stateCard,
              {
                marginTop:
                  24,
              },
            ]}
          >
            <Ionicons
              name="alert-circle-outline"
              size={34}
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

            <Pressable
              style={
                styles.retryButton
              }
              onPress={() =>
                void loadSchedules()
              }
            >
              <Text
                style={
                  styles.retryText
                }
              >
                Try Again
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Overdue */}
            {overdue.length >
              0 && (
              <>
                <View
                  style={
                    styles.sectionHeader
                  }
                >
                  <Text
                    style={[
                      styles.sectionTitle,
                      {
                        color:
                          COLORS.danger,
                      },
                    ]}
                  >
                    Overdue Maintenance
                  </Text>
                </View>

                {overdue.map(
                  (
                    schedule,
                  ) =>
                    renderScheduleCard(
                      schedule,
                      'Overdue',
                    ),
                )}
              </>
            )}

            {/* Upcoming */}
            <View
              style={
                styles.sectionHeader
              }
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Upcoming Maintenance
              </Text>
            </View>

            {upcoming.length ===
            0 ? (
              <View
                style={
                  styles.stateCard
                }
              >
                <View
                  style={
                    styles.emptyIcon
                  }
                >
                  <Ionicons
                    name="calendar-outline"
                    size={38}
                    color={
                      COLORS.cyan
                    }
                  />
                </View>

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
                  for one of your
                  appliances.
                </Text>
              </View>
            ) : (
              upcoming.map(
                (
                  schedule,
                ) =>
                  renderScheduleCard(
                    schedule,
                    'Upcoming',
                  ),
              )
            )}

            {/* Completed */}
            {completed.length >
              0 && (
              <>
                <View
                  style={
                    styles.sectionHeader
                  }
                >
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Completed
                  </Text>
                </View>

                {completed.map(
                  (
                    schedule,
                  ) =>
                    renderScheduleCard(
                      schedule,
                      'Completed',
                    ),
                )}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Bottom Schedule Button */}
      <View
        style={[
          styles.bottomContainer,

          {
            paddingBottom:
              Math.max(
                insets.bottom,
                16,
              ),
          },
        ]}
      >
        <Pressable
          style={
            styles.scheduleButton
          }
          onPress={() =>
            navigation.navigate(
              'ScheduleMaintenance',
              {},
            )
          }
        >
          <Ionicons
            name="add"
            size={22}
            color={
              COLORS.white
            }
          />

          <Text
            style={
              styles.scheduleButtonText
            }
          >
            Schedule Maintenance
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      backgroundColor:
        COLORS.background,
    },

    content: {
      width: '100%',

      maxWidth: 500,

      alignSelf:
        'center',

      paddingHorizontal:
        20,
    },

    header: {
      flexDirection:
        'row',

      alignItems:
        'center',

      gap: 14,

      marginBottom:
        22,
    },

    backButton: {
      width: 44,

      height: 44,

      borderRadius:
        14,

      backgroundColor:
        COLORS.white,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    headerText: {
      flex: 1,
    },

    title: {
      fontSize: 23,

      fontWeight:
        '800',

      color:
        COLORS.heading,
    },

    subtitle: {
      marginTop: 3,

      fontSize: 13,

      color:
        COLORS.secondary,
    },

    summaryContainer: {
      flexDirection:
        'row',

      gap: 8,
    },

    summaryCard: {
      flex: 1,

      backgroundColor:
        COLORS.white,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      borderRadius:
        15,

      paddingVertical:
        14,

      paddingHorizontal:
        6,

      alignItems:
        'center',

      gap: 4,
    },

    overdueSummaryCard: {
      backgroundColor:
        COLORS.dangerBackground,

      borderColor:
        COLORS.dangerBorder,
    },

    summaryNumber: {
      fontSize: 20,

      fontWeight:
        '800',

      color:
        COLORS.heading,
    },

    overdueSummaryNumber: {
      color:
        COLORS.danger,
    },

    summaryLabel: {
      fontSize: 10,

      color:
        COLORS.secondary,
    },

    sectionHeader: {
      marginTop: 24,

      marginBottom:
        11,
    },

    sectionTitle: {
      fontSize: 17,

      fontWeight:
        '800',

      color:
        COLORS.heading,
    },

    scheduleCard: {
      backgroundColor:
        COLORS.white,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      borderRadius:
        17,

      padding: 15,

      marginBottom:
        11,
    },

    overdueCard: {
      borderColor:
        COLORS.dangerBorder,

      backgroundColor:
        COLORS.dangerBackground,
    },

    scheduleHeader: {
      flexDirection:
        'row',

      alignItems:
        'center',
    },

    scheduleIcon: {
      width: 45,

      height: 45,

      borderRadius:
        13,

      backgroundColor:
        COLORS.preview,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    overdueIcon: {
      backgroundColor:
        COLORS.white,
    },

    scheduleInfo: {
      flex: 1,

      marginLeft:
        11,
    },

    applianceName: {
      fontSize: 14,

      fontWeight:
        '700',

      color:
        COLORS.heading,
    },

    maintenanceType: {
      marginTop: 3,

      fontSize: 11,

      color:
        COLORS.secondary,
    },

    statusBadge: {
      paddingHorizontal:
        8,

      paddingVertical:
        5,

      borderRadius:
        8,

      backgroundColor:
        COLORS.preview,
    },

    statusText: {
      color:
        COLORS.teal,

      fontSize: 9,

      fontWeight:
        '700',
    },

    overdueStatusBadge: {
      backgroundColor:
        COLORS.white,

      borderWidth: 1,

      borderColor:
        COLORS.dangerBorder,
    },

    overdueStatusText: {
      color:
        COLORS.danger,
    },

    dateRow: {
      marginTop: 13,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap: 7,
    },

    dateText: {
      fontSize: 12,

      color:
        COLORS.secondary,
    },

    overdueDateText: {
      color:
        COLORS.danger,

      fontWeight:
        '700',
    },

    notes: {
      marginTop: 9,

      fontSize: 12,

      lineHeight: 18,

      color:
        COLORS.secondary,
    },

    actionRow: {
      marginTop: 14,

      flexDirection:
        'row',

      gap: 9,
    },

    completeButton: {
      flex: 1,

      minHeight: 42,

      borderRadius:
        10,

      backgroundColor:
        COLORS.teal,

      flexDirection:
        'row',

      gap: 6,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    completeButtonText: {
      color:
        COLORS.white,

      fontSize: 11,

      fontWeight:
        '700',
    },

    deleteButton: {
      minHeight: 42,

      paddingHorizontal:
        14,

      borderRadius:
        10,

      backgroundColor:
        COLORS.dangerBackground,

      borderWidth: 1,

      borderColor:
        COLORS.dangerBorder,

      flexDirection:
        'row',

      gap: 6,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    completedDeleteButton: {
      minHeight: 42,

      marginTop: 14,

      borderRadius:
        10,

      backgroundColor:
        COLORS.dangerBackground,

      borderWidth: 1,

      borderColor:
        COLORS.dangerBorder,

      flexDirection:
        'row',

      gap: 6,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    deleteText: {
      color:
        COLORS.danger,

      fontSize: 11,

      fontWeight:
        '700',
    },

    stateCard: {
      minHeight: 200,

      backgroundColor:
        COLORS.white,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      borderRadius:
        18,

      padding: 25,

      alignItems:
        'center',

      justifyContent:
        'center',

      gap: 10,
    },

    emptyIcon: {
      width: 70,

      height: 70,

      borderRadius:
        20,

      backgroundColor:
        COLORS.preview,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    emptyTitle: {
      color:
        COLORS.heading,

      fontSize: 17,

      fontWeight:
        '800',
    },

    stateText: {
      color:
        COLORS.secondary,

      fontSize: 12,

      textAlign:
        'center',
    },

    errorText: {
      color:
        COLORS.danger,

      fontSize: 12,

      textAlign:
        'center',
    },

    retryButton: {
      backgroundColor:
        COLORS.teal,

      paddingHorizontal:
        15,

      paddingVertical:
        8,

      borderRadius:
        9,
    },

    retryText: {
      color:
        COLORS.white,

      fontWeight:
        '700',
    },

    bottomContainer: {
      position:
        'absolute',

      left: 0,

      right: 0,

      bottom: 0,

      backgroundColor:
        COLORS.background,

      paddingHorizontal:
        20,

      paddingTop: 11,
    },

    scheduleButton: {
      width: '100%',

      maxWidth: 460,

      alignSelf:
        'center',

      minHeight: 54,

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

      gap: 8,
    },

    scheduleButtonText: {
      color:
        COLORS.white,

      fontSize: 14,

      fontWeight:
        '700',
    },
  });