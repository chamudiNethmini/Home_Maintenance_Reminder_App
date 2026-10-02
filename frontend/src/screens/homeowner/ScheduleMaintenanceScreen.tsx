import {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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
  HomeownerAppliance,
} from '../../types/homeownerAppliance';

import type {
  MaintenanceType,
} from '../../types/maintenance';

import {
  getHomeownerAppliances,
} from '../../services/homeownerApplianceService';

import {
  createMaintenanceSchedule,
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
};

const maintenanceTypes:
  MaintenanceType[] = [
    'Filter Cleaning',
    'General Service',
    'Deep Cleaning',
    'Inspection',
    'Repair',
    'Other',
  ];

export default function ScheduleMaintenanceScreen({
  navigation,
  route,
}: HomeownerScreenProps<'ScheduleMaintenance'>) {
  const insets =
    useSafeAreaInsets();

  const [
    appliances,
    setAppliances,
  ] = useState<
    HomeownerAppliance[]
  >([]);

  const [
    selectedAppliance,
    setSelectedAppliance,
  ] =
    useState<HomeownerAppliance | null>(
      null,
    );

  const [
    maintenanceType,
    setMaintenanceType,
  ] =
    useState<MaintenanceType>(
      'Filter Cleaning',
    );

  const [
    scheduledDate,
    setScheduledDate,
  ] = useState('');

  const [
    notes,
    setNotes,
  ] = useState('');

  const [
    loadingAppliances,
    setLoadingAppliances,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  useEffect(() => {
    const loadAppliances =
      async () => {
        try {
          setLoadingAppliances(
            true,
          );

          const data =
            await getHomeownerAppliances();

          setAppliances(
            data,
          );

          const requestedApplianceId =
            route.params
              ?.applianceId;

          if (
            requestedApplianceId
          ) {
            const appliance =
              data.find(
                (item) =>
                  item.id ===
                  requestedApplianceId,
              );

            if (
              appliance
            ) {
              setSelectedAppliance(
                appliance,
              );
            }
          }
        } catch (
          loadError
        ) {
          setError(
            loadError instanceof
              Error
              ? loadError.message
              : 'Unable to load appliances.',
          );
        } finally {
          setLoadingAppliances(
            false,
          );
        }
      };

    void loadAppliances();
  }, [
    route.params
      ?.applianceId,
  ]);

  const validateDate =
    (
      value: string,
    ): boolean => {
      const pattern =
        /^\d{4}-\d{2}-\d{2}$/;

      if (
        !pattern.test(
          value,
        )
      ) {
        return false;
      }

      const parsed =
        new Date(
          `${value}T00:00:00`,
        );

      return (
        !Number.isNaN(
          parsed.getTime(),
        )
      );
    };

  const handleSave =
    async () => {
      if (
        !selectedAppliance
      ) {
        setError(
          'Please select an appliance.',
        );

        return;
      }

      if (
        !scheduledDate.trim()
      ) {
        setError(
          'Please enter a maintenance date.',
        );

        return;
      }

      if (
        !validateDate(
          scheduledDate,
        )
      ) {
        setError(
          'Maintenance date must use YYYY-MM-DD format.',
        );

        return;
      }

      try {
        setSaving(true);
        setError('');

        await createMaintenanceSchedule(
          {
            applianceId:
              selectedAppliance.id,

            applianceName:
              selectedAppliance.name,

            maintenanceType,

            scheduledDate,

            notes,
          },
        );

        if (
          Platform.OS ===
          'web'
        ) {
          window.alert(
            'Maintenance scheduled successfully.',
          );

          navigation.replace(
            'MaintenanceCalendar',
          );

          return;
        }

        Alert.alert(
          'Maintenance Scheduled',
          'Your maintenance schedule was saved successfully.',
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
            : 'Unable to save maintenance schedule.',
        );
      } finally {
        setSaving(
          false,
        );
      }
    };

  return (
    <KeyboardAvoidingView
      style={
        styles.container
      }
      behavior={
        Platform.OS ===
        'ios'
          ? 'padding'
          : undefined
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
              35,
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
              Schedule Maintenance
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Plan your appliance
              maintenance
            </Text>
          </View>
        </View>

        <View
          style={
            styles.formCard
          }
        >
          {/* Appliance */}
          <View
            style={
              styles.fieldGroup
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Select Appliance
            </Text>

            {loadingAppliances ? (
              <View
                style={
                  styles.loadingBox
                }
              >
                <ActivityIndicator
                  color={
                    COLORS.teal
                  }
                />

                <Text
                  style={
                    styles.loadingText
                  }
                >
                  Loading appliances...
                </Text>
              </View>
            ) : appliances.length ===
              0 ? (
              <View
                style={
                  styles.emptyBox
                }
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={22}
                  color={
                    COLORS.cyan
                  }
                />

                <Text
                  style={
                    styles.emptyText
                  }
                >
                  You don't have any
                  appliances yet.
                </Text>

                <Pressable
                  onPress={() =>
                    navigation.navigate(
                      'AddAppliance',
                    )
                  }
                >
                  <Text
                    style={
                      styles.addApplianceText
                    }
                  >
                    Add Appliance
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View
                style={
                  styles.applianceList
                }
              >
                {appliances.map(
                  (
                    appliance,
                  ) => {
                    const selected =
                      selectedAppliance
                        ?.id ===
                      appliance.id;

                    return (
                      <Pressable
                        key={
                          appliance.id
                        }
                        onPress={() => {
                          setSelectedAppliance(
                            appliance,
                          );

                          setError(
                            '',
                          );
                        }}
                        style={[
                          styles.applianceOption,

                          selected &&
                            styles.selectedApplianceOption,
                        ]}
                      >
                        <View
                          style={
                            styles.applianceIcon
                          }
                        >
                          <Ionicons
                            name="cube-outline"
                            size={
                              23
                            }
                            color={
                              selected
                                ? COLORS.white
                                : COLORS.cyan
                            }
                          />
                        </View>

                        <View
                          style={
                            styles.applianceText
                          }
                        >
                          <Text
                            style={
                              styles.applianceName
                            }
                          >
                            {
                              appliance.name
                            }
                          </Text>

                          <Text
                            style={
                              styles.applianceMeta
                            }
                          >
                            {
                              appliance.brand
                            }{' '}
                            •{' '}
                            {
                              appliance.model
                            }
                          </Text>
                        </View>

                        <Ionicons
                          name={
                            selected
                              ? 'checkmark-circle'
                              : 'ellipse-outline'
                          }
                          size={
                            22
                          }
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
            )}
          </View>

          {/* Type */}
          <View
            style={
              styles.fieldGroup
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Maintenance Type
            </Text>

            <View
              style={
                styles.typeContainer
              }
            >
              {maintenanceTypes.map(
                (
                  item,
                ) => (
                  <Pressable
                    key={
                      item
                    }
                    onPress={() =>
                      setMaintenanceType(
                        item,
                      )
                    }
                    style={[
                      styles.typeButton,

                      maintenanceType ===
                        item &&
                        styles.selectedTypeButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeText,

                        maintenanceType ===
                          item &&
                          styles.selectedTypeText,
                      ]}
                    >
                      {
                        item
                      }
                    </Text>
                  </Pressable>
                ),
              )}
            </View>
          </View>

          {/* Date */}
          <View
            style={
              styles.fieldGroup
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Maintenance Date
            </Text>

            <View
              style={
                styles.inputRow
              }
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={
                  COLORS.secondary
                }
              />

              <TextInput
                value={
                  scheduledDate
                }
                onChangeText={
                  setScheduledDate
                }
                placeholder="YYYY-MM-DD"
                placeholderTextColor={
                  COLORS.secondary
                }
                style={
                  styles.input
                }
              />
            </View>
          </View>

          {/* Notes */}
          <View
            style={
              styles.fieldGroup
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Notes
            </Text>

            <TextInput
              value={
                notes
              }
              onChangeText={
                setNotes
              }
              placeholder="Add maintenance notes..."
              placeholderTextColor={
                COLORS.secondary
              }
              multiline
              numberOfLines={
                4
              }
              textAlignVertical="top"
              style={
                styles.notesInput
              }
            />
          </View>

          {/* Error */}
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

          {/* Save */}
          <Pressable
            disabled={
              saving
            }
            onPress={() =>
              void handleSave()
            }
            style={[
              styles.saveButton,

              saving && {
                opacity:
                  0.65,
              },
            ]}
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
                  name="calendar-outline"
                  size={21}
                  color={
                    COLORS.white
                  }
                />

                <Text
                  style={
                    styles.saveButtonText
                  }
                >
                  Schedule Maintenance
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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

    formCard: {
      backgroundColor:
        COLORS.white,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        20,
      padding: 19,
      gap: 20,
    },

    fieldGroup: {
      gap: 8,
    },

    label: {
      fontSize: 13,
      fontWeight:
        '700',
      color:
        COLORS.heading,
    },

    loadingBox: {
      minHeight: 80,
      backgroundColor:
        COLORS.preview,
      borderRadius:
        12,
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 7,
    },

    loadingText: {
      color:
        COLORS.secondary,
      fontSize: 12,
    },

    emptyBox: {
      padding: 18,
      borderRadius:
        12,
      backgroundColor:
        COLORS.preview,
      alignItems:
        'center',
      gap: 7,
    },

    emptyText: {
      color:
        COLORS.secondary,
      fontSize: 12,
    },

    addApplianceText: {
      color:
        COLORS.teal,
      fontWeight:
        '700',
      fontSize: 12,
    },

    applianceList: {
      gap: 9,
    },

    applianceOption: {
      minHeight: 67,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        13,
      backgroundColor:
        COLORS.white,
      padding: 11,
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    selectedApplianceOption: {
      borderColor:
        COLORS.teal,
      backgroundColor:
        COLORS.preview,
    },

    applianceIcon: {
      width: 43,
      height: 43,
      borderRadius:
        12,
      backgroundColor:
        COLORS.teal,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    applianceText: {
      flex: 1,
      marginLeft: 11,
    },

    applianceName: {
      fontSize: 14,
      fontWeight:
        '700',
      color:
        COLORS.heading,
    },

    applianceMeta: {
      marginTop: 3,
      fontSize: 11,
      color:
        COLORS.secondary,
    },

    typeContainer: {
      flexDirection:
        'row',
      flexWrap:
        'wrap',
      gap: 8,
    },

    typeButton: {
      paddingHorizontal:
        11,
      paddingVertical:
        8,
      borderRadius:
        9,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      backgroundColor:
        COLORS.white,
    },

    selectedTypeButton: {
      borderColor:
        COLORS.teal,
      backgroundColor:
        COLORS.preview,
    },

    typeText: {
      color:
        COLORS.secondary,
      fontSize: 11,
      fontWeight:
        '600',
    },

    selectedTypeText: {
      color:
        COLORS.teal,
      fontWeight:
        '700',
    },

    inputRow: {
      minHeight: 51,
      borderWidth: 1,
      borderColor:
        COLORS.illustrationLine,
      borderRadius:
        12,
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 9,
      paddingHorizontal:
        13,
    },

    input: {
      flex: 1,
      color:
        COLORS.heading,
      fontSize: 14,
      paddingVertical:
        11,
    },

    notesInput: {
      minHeight: 100,
      borderWidth: 1,
      borderColor:
        COLORS.illustrationLine,
      borderRadius:
        12,
      padding: 13,
      color:
        COLORS.heading,
      fontSize: 14,
    },

    errorBox: {
      flexDirection:
        'row',
      gap: 7,
      backgroundColor:
        '#FFF5F6',
      borderWidth: 1,
      borderColor:
        '#F1D3D7',
      borderRadius:
        10,
      padding: 10,
    },

    errorText: {
      flex: 1,
      color:
        COLORS.danger,
      fontSize: 12,
    },

    saveButton: {
      minHeight: 54,
      backgroundColor:
        COLORS.teal,
      borderRadius:
        13,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 8,
    },

    saveButtonText: {
      color:
        COLORS.white,
      fontWeight:
        '700',
      fontSize: 14,
    },
  });