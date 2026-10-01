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

import {
  deleteHomeownerAppliance,
  getHomeownerApplianceById,
  updateHomeownerAppliance,
} from '../../services/homeownerApplianceService';

import type {
  HomeownerAppliance,
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

export default function ApplianceDetailsScreen({
  route,
  navigation,
}: HomeownerScreenProps<'ApplianceDetails'>) {
  const insets =
    useSafeAreaInsets();

  const {
    applianceId,
  } = route.params;

  const [
    appliance,
    setAppliance,
  ] =
    useState<HomeownerAppliance | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

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
    purchaseDate,
    setPurchaseDate,
  ] = useState('');

  const [
    warrantyExpiryDate,
    setWarrantyExpiryDate,
  ] = useState('');

  const loadAppliance =
    async () => {
      try {
        setLoading(true);

        const data =
          await getHomeownerApplianceById(
            applianceId,
          );

        setAppliance(
          data,
        );

        setName(
          data.name,
        );

        setBrand(
          data.brand,
        );

        setModel(
          data.model,
        );

        setSerialNumber(
          data.serialNumber,
        );

        setPurchaseDate(
          data.purchaseDate,
        );

        setWarrantyExpiryDate(
          data.warrantyExpiryDate,
        );
      } catch (
        error
      ) {
        Alert.alert(
          'Unable to Load',
          error instanceof
            Error
            ? error.message
            : 'Unable to load appliance.',
          [
            {
              text: 'OK',
              onPress:
                () =>
                  navigation.goBack(),
            },
          ],
        );
      } finally {
        setLoading(
          false,
        );
      }
    };

  useEffect(
    () => {
      void loadAppliance();
    },
    [applianceId],
  );

  const handleSave =
    async () => {
      if (
        !appliance
      ) {
        return;
      }

      if (
        !name.trim() ||
        !brand.trim() ||
        !model.trim()
      ) {
        Alert.alert(
          'Missing Details',
          'Name, brand and model are required.',
        );

        return;
      }

      try {
        setSaving(true);

        await updateHomeownerAppliance(
          applianceId,
          {
            name,
            brand,
            model,
            serialNumber,
            purchaseDate,
            warrantyExpiryDate,
          },
        );

        setEditing(
          false,
        );

        await loadAppliance();

        Alert.alert(
          'Updated',
          'Appliance details were updated successfully.',
        );
      } catch (
        error
      ) {
        Alert.alert(
          'Update Failed',
          error instanceof
            Error
            ? error.message
            : 'Unable to update appliance.',
        );
      } finally {
        setSaving(
          false,
        );
      }
    };

  const handleDelete = () => {
  const deleteAppliance = async () => {
    try {
      await deleteHomeownerAppliance(
        applianceId,
      );

      navigation.replace(
        'MyAppliances',
      );
    } catch (error) {
      Alert.alert(
        'Delete Failed',
        error instanceof Error
          ? error.message
          : 'Unable to delete appliance.',
      );
    }
  };

  // Expo Web
  if (Platform.OS === 'web') {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this appliance?',
      );

    if (confirmed) {
      void deleteAppliance();
    }

    return;
  }

  // Android / iOS
  Alert.alert(
    'Delete Appliance',
    'Are you sure you want to delete this appliance?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteAppliance();
        },
      },
    ],
  );
};

  if (
    loading
  ) {
    return (
      <View
        style={
          styles.loading
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
            styles.loadingText
          }
        >
          Loading appliance...
        </Text>
      </View>
    );
  }

  if (
    !appliance
  ) {
    return null;
  }

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
              styles.iconButton
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
              Appliance Details
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              View and manage
              appliance information
            </Text>
          </View>

          <Pressable
            style={
              styles.iconButton
            }
            onPress={() =>
              setEditing(
                (
                  current,
                ) =>
                  !current,
              )
            }
          >
            <Ionicons
              name={
                editing
                  ? 'close-outline'
                  : 'create-outline'
              }
              size={22}
              color={
                COLORS.teal
              }
            />
          </Pressable>
        </View>

        <View
          style={
            styles.heroCard
          }
        >
          <View
            style={
              styles.heroIcon
            }
          >
            <Ionicons
              name="cube-outline"
              size={40}
              color={
                COLORS.cyan
              }
            />
          </View>

          <Text
            style={
              styles.applianceName
            }
          >
            {
              appliance.name
            }
          </Text>

          <View
            style={
              styles.categoryBadge
            }
          >
            <Text
              style={
                styles.categoryText
              }
            >
              {
                appliance.category
              }
            </Text>
          </View>
        </View>

        <View
          style={
            styles.detailsCard
          }
        >
          <DetailField
            label="Appliance Name"
            value={name}
            editing={
              editing
            }
            onChangeText={
              setName
            }
          />

          <DetailField
            label="Brand"
            value={brand}
            editing={
              editing
            }
            onChangeText={
              setBrand
            }
          />

          <DetailField
            label="Model"
            value={model}
            editing={
              editing
            }
            onChangeText={
              setModel
            }
          />

          <DetailField
            label="Serial Number"
            value={
              serialNumber
            }
            editing={
              editing
            }
            onChangeText={
              setSerialNumber
            }
          />

          <DetailField
            label="Purchase Date"
            value={
              purchaseDate
            }
            editing={
              editing
            }
            onChangeText={
              setPurchaseDate
            }
          />

          <DetailField
            label="Warranty Expiry"
            value={
              warrantyExpiryDate
            }
            editing={
              editing
            }
            onChangeText={
              setWarrantyExpiryDate
            }
          />

          {editing && (
            <Pressable
              disabled={
                saving
              }
              style={
                styles.saveButton
              }
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
                    Save Changes
                  </Text>
                </>
              )}
            </Pressable>
          )}

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
              size={20}
              color="#AC3546"
            />

            <Text
              style={
                styles.deleteButtonText
              }
            >
              Delete Appliance
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

type DetailFieldProps = {
  label: string;
  value: string;
  editing: boolean;
  onChangeText:
    (
      value: string,
    ) => void;
};

function DetailField({
  label,
  value,
  editing,
  onChangeText,
}: DetailFieldProps) {
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

      {editing ? (
        <TextInput
          value={value}
          onChangeText={
            onChangeText
          }
          style={
            styles.input
          }
        />
      ) : (
        <View
          style={
            styles.readOnlyField
          }
        >
          <Text
            style={
              styles.readOnlyText
            }
          >
            {value ||
              'Not provided'}
          </Text>
        </View>
      )}
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

    loading: {
      flex: 1,
      backgroundColor:
        COLORS.background,
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 10,
    },

    loadingText: {
      color:
        COLORS.secondary,
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
      gap: 12,
      marginBottom:
        20,
    },

    headerText: {
      flex: 1,
    },

    iconButton: {
      width: 43,
      height: 43,
      borderRadius:
        13,
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
      fontSize: 12,
      color:
        COLORS.secondary,
    },

    heroCard: {
      backgroundColor:
        COLORS.preview,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        20,
      padding: 22,
      alignItems:
        'center',
    },

    heroIcon: {
      width: 75,
      height: 75,
      borderRadius:
        22,
      backgroundColor:
        COLORS.white,
      borderWidth: 1,
      borderColor:
        COLORS.illustrationLine,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    applianceName: {
      marginTop: 12,
      fontSize: 20,
      fontWeight:
        '800',
      color:
        COLORS.heading,
    },

    categoryBadge: {
      marginTop: 8,
      paddingHorizontal:
        12,
      paddingVertical:
        5,
      borderRadius:
        8,
      backgroundColor:
        COLORS.white,
    },

    categoryText: {
      color:
        COLORS.teal,
      fontSize: 11,
      fontWeight:
        '700',
    },

    detailsCard: {
      marginTop: 16,
      backgroundColor:
        COLORS.white,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        20,
      padding: 19,
      gap: 16,
    },

    fieldGroup: {
      gap: 6,
    },

    label: {
      fontSize: 12,
      fontWeight:
        '700',
      color:
        COLORS.secondary,
    },

    readOnlyField: {
      minHeight: 48,
      borderRadius:
        11,
      backgroundColor:
        COLORS.preview,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      justifyContent:
        'center',
      paddingHorizontal:
        13,
    },

    readOnlyText: {
      fontSize: 14,
      color:
        COLORS.heading,
    },

    input: {
      minHeight: 48,
      borderRadius:
        11,
      backgroundColor:
        COLORS.white,
      borderWidth: 1,
      borderColor:
        COLORS.teal,
      color:
        COLORS.heading,
      paddingHorizontal:
        13,
      fontSize: 14,
    },

    saveButton: {
      minHeight: 52,
      borderRadius:
        13,
      backgroundColor:
        COLORS.teal,
      flexDirection:
        'row',
      gap: 8,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    saveButtonText: {
      color:
        COLORS.white,
      fontSize: 14,
      fontWeight:
        '700',
    },

    deleteButton: {
      minHeight: 50,
      borderRadius:
        13,
      borderWidth: 1,
      borderColor:
        '#F1D3D7',
      backgroundColor:
        '#FFF5F6',
      flexDirection:
        'row',
      gap: 8,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    deleteButtonText: {
      color:
        '#AC3546',
      fontSize: 14,
      fontWeight:
        '700',
    },
  });