import {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
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

import {
  getHomeownerAppliances,
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

export default function MyAppliancesScreen({
  navigation,
}: HomeownerScreenProps<'MyAppliances'>) {
  const insets =
    useSafeAreaInsets();

  const [
    appliances,
    setAppliances,
  ] = useState<
    HomeownerAppliance[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const loadAppliances =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError('');

          const data =
            await getHomeownerAppliances();

          setAppliances(
            data,
          );
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
        void loadAppliances();
      },
      [loadAppliances],
    ),
  );

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
              My Appliances
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Manage your home
              appliances
            </Text>
          </View>
        </View>

        {/* Summary */}
        <View
          style={
            styles.summaryCard
          }
        >
          <View
            style={
              styles.summaryIcon
            }
          >
            <Ionicons
              name="apps-outline"
              size={28}
              color={
                COLORS.cyan
              }
            />
          </View>

          <View>
            <Text
              style={
                styles.summaryNumber
              }
            >
              {
                appliances.length
              }
            </Text>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Total Appliances
            </Text>
          </View>
        </View>

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
            Your Appliances
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
                styles.addSmallText
              }
            >
              + Add New
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <View
            style={
              styles.centerState
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
              Loading appliances...
            </Text>
          </View>
        ) : error ? (
          <View
            style={
              styles.centerState
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={34}
              color="#AC3546"
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
                void loadAppliances()
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
        ) : appliances.length ===
          0 ? (
          <View
            style={
              styles.emptyCard
            }
          >
            <View
              style={
                styles.emptyIcon
              }
            >
              <Ionicons
                name="cube-outline"
                size={42}
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
              No appliances yet
            </Text>

            <Text
              style={
                styles.emptyDescription
              }
            >
              Add your first
              appliance to start
              tracking maintenance
              and reminders.
            </Text>
          </View>
        ) : (
          appliances.map(
            (appliance) => (
              <Pressable
                key={
                  appliance.id
                }
                style={({
                  pressed,
                }) => [
                  styles.applianceCard,

                  pressed && {
                    opacity:
                      0.75,
                  },
                ]}
                onPress={() =>
                  navigation.navigate(
                    'ApplianceDetails',
                    {
                      applianceId:
                        appliance.id,
                    },
                  )
                }
              >
                <View
                  style={
                    styles.applianceIcon
                  }
                >
                  <Ionicons
                    name="cube-outline"
                    size={27}
                    color={
                      COLORS.cyan
                    }
                  />
                </View>

                <View
                  style={
                    styles.applianceInfo
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

                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={
                    COLORS.secondary
                  }
                />
              </Pressable>
            ),
          )
        )}
      </ScrollView>

      <View
        style={[
          styles.bottomButtonContainer,

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
            styles.addButton
          }
          onPress={() =>
            navigation.navigate(
              'AddAppliance',
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
              styles.addButtonText
            }
          >
            Add New Appliance
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
      paddingBottom:
        110,
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

    summaryCard: {
      backgroundColor:
        COLORS.white,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        18,
      padding: 17,
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 13,
    },

    summaryIcon: {
      width: 52,
      height: 52,
      borderRadius:
        15,
      backgroundColor:
        COLORS.preview,
      borderWidth: 1,
      borderColor:
        COLORS.illustrationLine,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    summaryNumber: {
      fontSize: 23,
      fontWeight:
        '800',
      color:
        COLORS.heading,
    },

    summaryLabel: {
      fontSize: 12,
      marginTop: 2,
      color:
        COLORS.secondary,
    },

    sectionHeader: {
      marginTop: 25,
      marginBottom:
        12,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight:
        '800',
      color:
        COLORS.heading,
    },

    addSmallText: {
      color:
        COLORS.teal,
      fontSize: 12,
      fontWeight:
        '700',
    },

    applianceCard: {
      backgroundColor:
        COLORS.white,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        16,
      padding: 14,
      marginBottom:
        11,
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    applianceIcon: {
      width: 52,
      height: 52,
      borderRadius:
        15,
      backgroundColor:
        COLORS.preview,
      borderWidth: 1,
      borderColor:
        COLORS.illustrationLine,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    applianceInfo: {
      flex: 1,
      marginLeft: 12,
    },

    applianceName: {
      fontSize: 15,
      fontWeight:
        '700',
      color:
        COLORS.heading,
    },

    applianceMeta: {
      marginTop: 3,
      fontSize: 12,
      color:
        COLORS.secondary,
    },

    categoryBadge: {
      alignSelf:
        'flex-start',
      marginTop: 7,
      paddingHorizontal:
        9,
      paddingVertical:
        4,
      borderRadius: 7,
      backgroundColor:
        COLORS.preview,
    },

    categoryText: {
      color:
        COLORS.teal,
      fontSize: 10,
      fontWeight:
        '700',
    },

    centerState: {
      minHeight: 220,
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

    stateText: {
      color:
        COLORS.secondary,
      fontSize: 13,
    },

    errorText: {
      color:
        '#AC3546',
      fontSize: 13,
      textAlign:
        'center',
    },

    retryButton: {
      backgroundColor:
        COLORS.teal,
      borderRadius:
        10,
      paddingHorizontal:
        17,
      paddingVertical:
        9,
    },

    retryText: {
      color:
        COLORS.white,
      fontWeight:
        '700',
    },

    emptyCard: {
      minHeight: 250,
      backgroundColor:
        COLORS.white,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius:
        18,
      padding: 30,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    emptyIcon: {
      width: 76,
      height: 76,
      borderRadius:
        22,
      backgroundColor:
        COLORS.preview,
      borderWidth: 1,
      borderColor:
        COLORS.illustrationLine,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    emptyTitle: {
      marginTop: 16,
      color:
        COLORS.heading,
      fontSize: 18,
      fontWeight:
        '800',
    },

    emptyDescription: {
      marginTop: 7,
      color:
        COLORS.secondary,
      fontSize: 13,
      lineHeight: 19,
      textAlign:
        'center',
    },

    bottomButtonContainer: {
      position:
        'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal:
        20,
      paddingTop: 12,
      backgroundColor:
        COLORS.background,
    },

    addButton: {
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

    addButtonText: {
      color:
        COLORS.white,
      fontWeight:
        '700',
      fontSize: 15,
    },
  });