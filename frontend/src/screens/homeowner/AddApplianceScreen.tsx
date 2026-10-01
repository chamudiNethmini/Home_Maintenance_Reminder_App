import {
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

const categories:
  ApplianceCategory[] = [
    'Kitchen',
    'Laundry',
    'Cooling',
    'Cleaning',
    'Other',
  ];

export default function AddApplianceScreen({
  navigation,
}: HomeownerScreenProps<'AddAppliance'>) {
  const insets =
    useSafeAreaInsets();

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
  ] =
    useState<ApplianceCategory>(
      'Kitchen',
    );

  const [
    purchaseDate,
    setPurchaseDate,
  ] = useState('');

  const [
    warrantyExpiryDate,
    setWarrantyExpiryDate,
  ] = useState('');

  const [
    error,
    setError,
  ] = useState('');

  const [
    saving,
    setSaving,
  ] = useState(false);

  const validate =
    (): boolean => {
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
          'Purchase date must use YYYY-MM-DD format.',
        );

        return false;
      }

      if (
        !datePattern.test(
          warrantyExpiryDate,
        )
      ) {
        setError(
          'Warranty expiry date must use YYYY-MM-DD format.',
        );

        return false;
      }

      setError('');

      return true;
    };

  const handleSave =
    async () => {
      if (
        !validate()
      ) {
        return;
      }

      try {
        setSaving(true);

        await addHomeownerAppliance(
          {
            name,
            brand,
            model,
            serialNumber,
            category,
            purchaseDate,
            warrantyExpiryDate,
          },
        );

        Alert.alert(
          'Appliance Added',
          'Your appliance was saved successfully.',
          [
            {
              text: 'OK',

              onPress:
                () =>
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
              Register a new
              household appliance
            </Text>
          </View>
        </View>

        <View
          style={
            styles.formCard
          }
        >
          <FormField
            label="Appliance Name"
            value={name}
            placeholder="e.g. Washing Machine"
            onChangeText={
              setName
            }
          />

          <FormField
            label="Brand"
            value={brand}
            placeholder="e.g. Samsung"
            onChangeText={
              setBrand
            }
          />

          <FormField
            label="Model"
            value={model}
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
                (item) => (
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
                      {
                        item
                      }
                    </Text>
                  </Pressable>
                ),
              )}
            </View>
          </View>

          <FormField
            label="Purchase Date"
            value={
              purchaseDate
            }
            placeholder="YYYY-MM-DD"
            onChangeText={
              setPurchaseDate
            }
          />

          <FormField
            label="Warranty Expiry Date"
            value={
              warrantyExpiryDate
            }
            placeholder="YYYY-MM-DD"
            onChangeText={
              setWarrantyExpiryDate
            }
          />

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
        value={value}
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
      fontSize: 25,
      fontWeight:
        '800',
      color:
        COLORS.heading,
    },

    subtitle: {
      fontSize: 13,
      marginTop: 3,
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
      gap: 17,
    },

    fieldGroup: {
      gap: 7,
    },

    label: {
      fontSize: 13,
      fontWeight:
        '700',
      color:
        COLORS.heading,
    },

    input: {
      minHeight: 51,
      borderWidth: 1,
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
      fontSize: 14,
    },

    categoryContainer: {
      flexDirection:
        'row',
      flexWrap:
        'wrap',
      gap: 8,
    },

    categoryButton: {
      borderWidth: 1,
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
      fontSize: 12,
      fontWeight:
        '600',
    },

    selectedCategoryText: {
      color:
        COLORS.teal,
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
        '#AC3546',
      fontSize: 12,
      lineHeight: 17,
    },

    saveButton: {
      minHeight: 54,
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
      gap: 8,
    },

    saveButtonText: {
      color:
        COLORS.white,
      fontSize: 15,
      fontWeight:
        '700',
    },
  });