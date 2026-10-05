import { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type {
  HomeownerScreenProps,
} from '../../navigation/homeownerTypes';

import {
  addHomeownerAppliance,
} from '../../services/homeownerApplianceService';

import type {
  ApplianceCategory,
} from '../../types/homeownerAppliance';

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
};

const categories: ApplianceCategory[] = [
  'Kitchen',
  'Laundry',
  'Cooling',
  'Cleaning',
  'Other',
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEK_DAYS = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];

export default function AddApplianceScreen({
  navigation,
}: HomeownerScreenProps<'AddAppliance'>) {
  const insets = useSafeAreaInsets();

  const [
    name,
    setName,
  ] = useState('');

  const [
    brand,
    setBrand,
  ] = useState('');

  const [
    model,
    setModel,
  ] = useState('');

  const [
    serialNumber,
    setSerialNumber,
  ] = useState('');

  const [
    category,
    setCategory,
  ] = useState<ApplianceCategory>(
    'Kitchen',
  );

  const [
    purchaseDate,
    setPurchaseDate,
  ] = useState('');

  const [
    installationDate,
    setInstallationDate,
  ] = useState('');

  const [
    error,
    setError,
  ] = useState('');

  const [
    saving,
    setSaving,
  ] = useState(false);

  const validate = (): boolean => {
    if (
      !name.trim() ||
      !brand.trim() ||
      !model.trim()
    ) {
      setError(
        'Please enter appliance name, brand and model.',
      );

      return false;
    }

    const datePattern =
      /^\d{4}-\d{2}-\d{2}$/;

    if (
      !datePattern.test(
        purchaseDate,
      )
    ) {
      setError(
        'Please select a purchase date.',
      );

      return false;
    }

    if (
      !datePattern.test(
        installationDate,
      )
    ) {
      setError(
        'Please select an installation date.',
      );

      return false;
    }

    setError('');

    return true;
  };

  const handleSave =
    async () => {
      if (!validate()) {
        return;
      }

      try {
        setSaving(true);
        setError('');

        await addHomeownerAppliance(
          {
            name:
              name.trim(),

            brand:
              brand.trim(),

            model:
              model.trim(),

            serialNumber:
              serialNumber.trim(),

            category,

            purchaseDate:
              purchaseDate.trim(),

            installationDate:
              installationDate.trim(),
          },
        );

        if (
          Platform.OS ===
          'web'
        ) {
          window.alert(
            'Appliance added successfully!',
          );

          navigation.replace(
            'MyAppliances',
          );

          return;
        }

        Alert.alert(
          'Success',
          'Appliance added successfully!',
          [
            {
              text:
                'OK',

              onPress: () =>
                navigation.replace(
                  'MyAppliances',
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
            : 'Unable to save appliance.',
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
        keyboardShouldPersistTaps="handled"
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
              Add Appliance
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Register a new household appliance
            </Text>
          </View>
        </View>

        {/* Form */}
        <View
          style={
            styles.formCard
          }
        >
          <FormField
            label="Appliance Name"
            value={
              name
            }
            placeholder="e.g. Washing Machine"
            onChangeText={
              setName
            }
          />

          <FormField
            label="Brand"
            value={
              brand
            }
            placeholder="e.g. Samsung"
            onChangeText={
              setBrand
            }
          />

          <FormField
            label="Model"
            value={
              model
            }
            placeholder="e.g. WW80"
            onChangeText={
              setModel
            }
          />

          <FormField
            label="Serial Number"
            value={
              serialNumber
            }
            placeholder="e.g. SM12345"
            onChangeText={
              setSerialNumber
            }
          />

          {/* Category */}
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
              Category
            </Text>

            <View
              style={
                styles.categoryContainer
              }
            >
              {categories.map(
                (
                  item,
                ) => (
                  <Pressable
                    key={
                      item
                    }
                    onPress={() =>
                      setCategory(
                        item,
                      )
                    }
                    style={[
                      styles.categoryButton,

                      category ===
                        item &&
                        styles.selectedCategory,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,

                        category ===
                          item &&
                          styles.selectedCategoryText,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                ),
              )}
            </View>
          </View>

          {/* Purchase Date */}
          <DatePickerField
            label="Purchase Date"
            value={
              purchaseDate
            }
            onChange={
              setPurchaseDate
            }
          />

          {/* Installation Date */}
          <DatePickerField
            label="Installation Date"
            value={
              installationDate
            }
            onChange={
              setInstallationDate
            }
          />

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
                color="#AC3546"
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
                  name="checkmark"
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
                  Save Appliance
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ===========================
   NORMAL TEXT INPUT
=========================== */

type FormFieldProps = {
  label: string;

  value: string;

  placeholder: string;

  onChangeText:
    (
      value: string,
    ) => void;
};

function FormField({
  label,
  value,
  placeholder,
  onChangeText,
}: FormFieldProps) {
  return (
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
        {label}
      </Text>

      <TextInput
        value={
          value
        }
        placeholder={
          placeholder
        }
        placeholderTextColor={
          COLORS.secondary
        }
        onChangeText={
          onChangeText
        }
        style={
          styles.input
        }
      />
    </View>
  );
}

/* ===========================
   DATE PICKER
=========================== */

type DatePickerFieldProps = {
  label: string;

  value: string;

  onChange:
    (
      value: string,
    ) => void;
};

function getInitialMonth(
  value: string,
) {
  const parts =
    value.split(
      '-',
    );

  if (
    parts.length ===
    3
  ) {
    const year =
      Number(
        parts[0],
      );

    const month =
      Number(
        parts[1],
      );

    if (
      !Number.isNaN(
        year,
      ) &&
      !Number.isNaN(
        month,
      )
    ) {
      return new Date(
        year,
        month - 1,
        1,
      );
    }
  }

  const today =
    new Date();

  return new Date(
    today.getFullYear(),
    today.getMonth(),
    1,
  );
}

function formatDate(
  year: number,
  month: number,
  day: number,
) {
  return `${year}-${String(
    month + 1,
  ).padStart(
    2,
    '0',
  )}-${String(
    day,
  ).padStart(
    2,
    '0',
  )}`;
}

function DatePickerField({
  label,
  value,
  onChange,
}: DatePickerFieldProps) {
  const [
    visible,
    setVisible,
  ] = useState(false);

  const [
    displayedMonth,
    setDisplayedMonth,
  ] = useState(
    getInitialMonth(
      value,
    ),
  );

  const year =
    displayedMonth.getFullYear();

  const month =
    displayedMonth.getMonth();

  const firstDay =
    new Date(
      year,
      month,
      1,
    ).getDay();

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0,
    ).getDate();

  const calendarCells:
    Array<number | null> =
      [];

  for (
    let index = 0;
    index < firstDay;
    index += 1
  ) {
    calendarCells.push(
      null,
    );
  }

  for (
    let day = 1;
    day <=
    daysInMonth;
    day += 1
  ) {
    calendarCells.push(
      day,
    );
  }

  while (
    calendarCells.length %
      7 !==
    0
  ) {
    calendarCells.push(
      null,
    );
  }

  const openCalendar =
    () => {
      setDisplayedMonth(
        getInitialMonth(
          value,
        ),
      );

      setVisible(
        true,
      );
    };

  const previousMonth =
    () => {
      setDisplayedMonth(
        new Date(
          year,
          month - 1,
          1,
        ),
      );
    };

  const nextMonth =
    () => {
      setDisplayedMonth(
        new Date(
          year,
          month + 1,
          1,
        ),
      );
    };

  const selectDate =
    (
      day: number,
    ) => {
      const selectedDate =
        formatDate(
          year,
          month,
          day,
        );

      onChange(
        selectedDate,
      );

      setVisible(
        false,
      );
    };

  const selectToday =
    () => {
      const today =
        new Date();

      onChange(
        formatDate(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
        ),
      );

      setVisible(
        false,
      );
    };

  return (
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
        {label}
      </Text>

      <Pressable
        style={
          styles.dateInput
        }
        onPress={
          openCalendar
        }
      >
        <Text
          style={[
            styles.dateInputText,

            !value &&
              styles.datePlaceholder,
          ]}
        >
          {value ||
            'Select date'}
        </Text>

        <Ionicons
          name="calendar-outline"
          size={21}
          color={
            COLORS.teal
          }
        />
      </Pressable>

      <Modal
        visible={
          visible
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setVisible(
            false,
          )
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.calendarCard
            }
          >
            {/* Month Header */}
            <View
              style={
                styles.calendarHeader
              }
            >
              <Pressable
                style={
                  styles.monthButton
                }
                onPress={
                  previousMonth
                }
              >
                <Ionicons
                  name="chevron-back"
                  size={22}
                  color={
                    COLORS.heading
                  }
                />
              </Pressable>

              <Text
                style={
                  styles.monthTitle
                }
              >
                {
                  MONTHS[
                    month
                  ]
                }{' '}
                {year}
              </Text>

              <Pressable
                style={
                  styles.monthButton
                }
                onPress={
                  nextMonth
                }
              >
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={
                    COLORS.heading
                  }
                />
              </Pressable>
            </View>

            {/* Week Days */}
            <View
              style={
                styles.weekRow
              }
            >
              {WEEK_DAYS.map(
                (
                  day,
                ) => (
                  <Text
                    key={
                      day
                    }
                    style={
                      styles.weekDayText
                    }
                  >
                    {day}
                  </Text>
                ),
              )}
            </View>

            {/* Days */}
            <View
              style={
                styles.daysGrid
              }
            >
              {calendarCells.map(
                (
                  day,
                  index,
                ) => {
                  if (
                    day ===
                    null
                  ) {
                    return (
                      <View
                        key={`empty-${index}`}
                        style={
                          styles.dayCell
                        }
                      />
                    );
                  }

                  const dateValue =
                    formatDate(
                      year,
                      month,
                      day,
                    );

                  const selected =
                    value ===
                    dateValue;

                  return (
                    <Pressable
                      key={
                        dateValue
                      }
                      style={[
                        styles.dayCell,

                        selected &&
                          styles.selectedDay,
                      ]}
                      onPress={() =>
                        selectDate(
                          day,
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.dayText,

                          selected &&
                            styles.selectedDayText,
                        ]}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </View>

            {/* Bottom Buttons */}
            <View
              style={
                styles.calendarActions
              }
            >
              <Pressable
                style={
                  styles.calendarCancelButton
                }
                onPress={() =>
                  setVisible(
                    false,
                  )
                }
              >
                <Text
                  style={
                    styles.calendarCancelText
                  }
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={
                  styles.todayButton
                }
                onPress={
                  selectToday
                }
              >
                <Ionicons
                  name="calendar"
                  size={17}
                  color={
                    COLORS.white
                  }
                />

                <Text
                  style={
                    styles.todayButtonText
                  }
                >
                  Today
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ===========================
   STYLES
=========================== */

const styles =
  StyleSheet.create({
    container: {
      flex:
        1,

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

    header: {
      flexDirection:
        'row',

      alignItems:
        'center',

      gap:
        14,

      marginBottom:
        22,
    },

    backButton: {
      width:
        44,

      height:
        44,

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
      fontSize:
        25,

      fontWeight:
        '800',

      color:
        COLORS.heading,
    },

    subtitle: {
      fontSize:
        13,

      marginTop:
        3,

      color:
        COLORS.secondary,
    },

    formCard: {
      backgroundColor:
        COLORS.white,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      borderRadius:
        20,

      padding:
        19,

      gap:
        17,
    },

    fieldGroup: {
      gap:
        7,
    },

    label: {
      fontSize:
        13,

      fontWeight:
        '700',

      color:
        COLORS.heading,
    },

    input: {
      minHeight:
        51,

      borderWidth:
        1,

      borderColor:
        COLORS.illustrationLine,

      borderRadius:
        12,

      backgroundColor:
        COLORS.white,

      paddingHorizontal:
        14,

      color:
        COLORS.heading,

      fontSize:
        14,
    },

    categoryContainer: {
      flexDirection:
        'row',

      flexWrap:
        'wrap',

      gap:
        8,
    },

    categoryButton: {
      borderWidth:
        1,

      borderColor:
        COLORS.border,

      backgroundColor:
        COLORS.white,

      paddingHorizontal:
        12,

      paddingVertical:
        9,

      borderRadius:
        10,
    },

    selectedCategory: {
      backgroundColor:
        COLORS.preview,

      borderColor:
        COLORS.teal,
    },

    categoryButtonText: {
      color:
        COLORS.secondary,

      fontSize:
        12,

      fontWeight:
        '600',
    },

    selectedCategoryText: {
      color:
        COLORS.teal,

      fontWeight:
        '700',
    },

    dateInput: {
      minHeight:
        51,

      borderWidth:
        1,

      borderColor:
        COLORS.illustrationLine,

      borderRadius:
        12,

      backgroundColor:
        COLORS.white,

      paddingHorizontal:
        14,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },

    dateInputText: {
      color:
        COLORS.heading,

      fontSize:
        14,
    },

    datePlaceholder: {
      color:
        COLORS.secondary,
    },

    modalOverlay: {
      flex:
        1,

      backgroundColor:
        'rgba(16, 56, 81, 0.35)',

      justifyContent:
        'center',

      alignItems:
        'center',

      padding:
        20,
    },

    calendarCard: {
      width:
        '100%',

      maxWidth:
        390,

      backgroundColor:
        COLORS.white,

      borderRadius:
        20,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      padding:
        18,
    },

    calendarHeader: {
      flexDirection:
        'row',

      justifyContent:
        'space-between',

      alignItems:
        'center',

      marginBottom:
        17,
    },

    monthButton: {
      width:
        40,

      height:
        40,

      borderRadius:
        12,

      backgroundColor:
        COLORS.preview,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    monthTitle: {
      color:
        COLORS.heading,

      fontSize:
        16,

      fontWeight:
        '800',
    },

    weekRow: {
      flexDirection:
        'row',

      marginBottom:
        6,
    },

    weekDayText: {
      width:
        '14.285%',

      textAlign:
        'center',

      color:
        COLORS.secondary,

      fontSize:
        10,

      fontWeight:
        '700',
    },

    daysGrid: {
      flexDirection:
        'row',

      flexWrap:
        'wrap',
    },

    dayCell: {
      width:
        '14.285%',

      aspectRatio:
        1,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        50,
    },

    dayText: {
      fontSize:
        13,

      fontWeight:
        '600',

      color:
        COLORS.heading,
    },

    selectedDay: {
      backgroundColor:
        COLORS.teal,
    },

    selectedDayText: {
      color:
        COLORS.white,

      fontWeight:
        '800',
    },

    calendarActions: {
      marginTop:
        16,

      borderTopWidth:
        1,

      borderTopColor:
        COLORS.border,

      paddingTop:
        14,

      flexDirection:
        'row',

      justifyContent:
        'flex-end',

      gap:
        9,
    },

    calendarCancelButton: {
      minHeight:
        42,

      paddingHorizontal:
        16,

      borderRadius:
        10,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      backgroundColor:
        COLORS.white,

      justifyContent:
        'center',

      alignItems:
        'center',
    },

    calendarCancelText: {
      color:
        COLORS.secondary,

      fontSize:
        12,

      fontWeight:
        '700',
    },

    todayButton: {
      minHeight:
        42,

      paddingHorizontal:
        16,

      borderRadius:
        10,

      backgroundColor:
        COLORS.teal,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap:
        6,
    },

    todayButtonText: {
      color:
        COLORS.white,

      fontSize:
        12,

      fontWeight:
        '700',
    },

    errorBox: {
      flexDirection:
        'row',

      gap:
        7,

      backgroundColor:
        '#FFF5F6',

      borderWidth:
        1,

      borderColor:
        '#F1D3D7',

      borderRadius:
        10,

      padding:
        10,
    },

    errorText: {
      flex:
        1,

      color:
        '#AC3546',

      fontSize:
        12,

      lineHeight:
        17,
    },

    saveButton: {
      minHeight:
        54,

      borderRadius:
        13,

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

    saveButtonText: {
      color:
        COLORS.white,

      fontSize:
        15,

      fontWeight:
        '700',
    },
  });