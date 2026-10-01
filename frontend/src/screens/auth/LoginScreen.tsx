import { useState } from 'react';

import {
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

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  Brand,
  colors,
  Icon,
} from '../../components/provider/ProviderUI';

import type {
  RootStackParamList,
  UserRole,
} from '../../navigation/rootTypes';

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    'Login'
  >;

const roleLabels: Record<
  UserRole,
  string
> = {
  homeowner: 'Homeowner',

  technician: 'Technician',

  provider: 'Warranty Provider',
};

export default function LoginScreen({
  route,
  navigation,
}: Props) {
  const insets =
    useSafeAreaInsets();

  const { role } =
    route.params;

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const handleLogin = () => {
  if (!email.trim() || !password.trim()) {
    setError('Please enter your email and password.');
    return;
  }

  setError('');

  // HOMEOWNER
  if (role === 'homeowner') {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'HomeownerDashboard',
        },
      ],
    });

    return;
  }

  // WARRANTY PROVIDER
  if (role === 'provider') {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'ProviderFlow',
          params: {
            screen: 'ProviderHome',
          },
        },
      ],
    });

    return;
  }

  // TECHNICIAN
  if (role === 'technician') {
    Alert.alert(
      'Technician',
      'Technician module is not connected yet.',
    );
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.page,

          {
            paddingTop:
              insets.top +
              24,

            paddingBottom:
              insets.bottom +
              28,
          },
        ]}
      >
        <View
          style={
            styles.content
          }
        >
          {/* Back */}
          <Pressable
            style={
              styles.backButton
            }
            onPress={() =>
              navigation.goBack()
            }
          >
            <Icon
              name="arrow-back"
              size={22}
              color={
                colors.navy
              }
            />
          </Pressable>

          {/* Header */}
          <View
            style={
              styles.intro
            }
          >
            <Brand large />

            <Text
              style={
                styles.heading
              }
            >
              Login to FixMate
            </Text>

            <View
              style={
                styles.roleBadge
              }
            >
              <Text
                style={
                  styles.roleBadgeText
                }
              >
                {
                  roleLabels[
                    role
                  ]
                }
              </Text>
            </View>

            <Text
              style={
                styles.subtitle
              }
            >
              Enter your account details to continue.
            </Text>
          </View>

          {/* Login Card */}
          <View
            style={
              styles.formCard
            }
          >
            {/* Email */}
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
                Email
              </Text>

              <View
                style={
                  styles.inputRow
                }
              >
                <Icon
                  name="mail-outline"
                  size={20}
                  color={
                    colors.muted
                  }
                />

                <TextInput
                  value={email}
                  onChangeText={
                    setEmail
                  }
                  placeholder="Enter your email"
                  placeholderTextColor="#58717F"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={
                    false
                  }
                  style={
                    styles.input
                  }
                />
              </View>
            </View>

            {/* Password */}
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
                Password
              </Text>

              <View
                style={
                  styles.inputRow
                }
              >
                <Icon
                  name="lock-closed-outline"
                  size={20}
                  color={
                    colors.muted
                  }
                />

                <TextInput
                  value={
                    password
                  }
                  onChangeText={
                    setPassword
                  }
                  placeholder="Enter your password"
                  placeholderTextColor="#58717F"
                  secureTextEntry={
                    !showPassword
                  }
                  style={
                    styles.input
                  }
                />

                <Pressable
                  onPress={() =>
                    setShowPassword(
                      (
                        current,
                      ) =>
                        !current,
                    )
                  }
                >
                  <Icon
                    name={
                      showPassword
                        ? 'eye-off-outline'
                        : 'eye-outline'
                    }
                    size={21}
                    color={
                      colors.muted
                    }
                  />
                </Pressable>
              </View>
            </View>

            {error ? (
              <Text
                style={
                  styles.errorText
                }
              >
                {error}
              </Text>
            ) : null}

            {/* Login Button */}
            <Pressable
              accessibilityRole="button"
              onPress={
                handleLogin
              }
              style={({
                pressed,
              }) => [
                styles.loginButton,

                pressed &&
                  styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.loginButtonText
                }
              >
                Login
              </Text>

              <Icon
                name="arrow-forward"
                size={20}
                color={
                  colors.white
                }
              />
            </Pressable>
          </View>

          {/* Change Role */}
          <Pressable
            onPress={() =>
              navigation.goBack()
            }
          >
            <Text
              style={
                styles.changeRoleText
              }
            >
              Not{' '}
              {
                roleLabels[
                  role
                ]
              }
              ? Change role
            </Text>
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
        colors.background,
    },

    page: {
      flexGrow: 1,

      justifyContent:
        'center',

      paddingHorizontal:
        24,
    },

    content: {
      width: '100%',

      maxWidth: 470,

      alignSelf:
        'center',

      gap: 24,
    },

    backButton: {
      width: 44,

      height: 44,

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        colors.border,

      backgroundColor:
        colors.white,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    intro: {
      alignItems:
        'center',

      gap: 10,
    },

    heading: {
      color:
        colors.navy,

      fontSize: 28,

      fontWeight:
        '800',
    },

    subtitle: {
      color:
        colors.muted,

      fontSize: 14,

      textAlign:
        'center',
    },

    roleBadge: {
      backgroundColor:
        '#F1F9F9',

      borderColor:
        '#CEDCE3',

      borderWidth: 1,

      borderRadius:
        999,

      paddingHorizontal:
        14,

      paddingVertical:
        7,
    },

    roleBadgeText: {
      color:
        colors.teal,

      fontWeight:
        '700',

      fontSize: 12,
    },

    formCard: {
      backgroundColor:
        colors.white,

      borderWidth: 1,

      borderColor:
        colors.border,

      borderRadius: 20,

      padding: 20,

      gap: 18,
    },

    fieldGroup: {
      gap: 7,
    },

    label: {
      color:
        colors.navy,

      fontSize: 13,

      fontWeight:
        '700',
    },

    inputRow: {
      minHeight: 52,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap: 10,

      backgroundColor:
        colors.white,

      borderWidth: 1,

      borderColor:
        '#CEDCE3',

      borderRadius: 12,

      paddingHorizontal:
        14,
    },

    input: {
      flex: 1,

      minWidth: 0,

      color:
        colors.navy,

      fontSize: 15,

      paddingVertical:
        12,
    },

    errorText: {
      color:
        '#AC3546',

      fontSize: 13,
    },

    loginButton: {
      minHeight: 52,

      borderRadius: 12,

      backgroundColor:
        colors.teal,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap: 8,
    },

    loginButtonText: {
      color:
        colors.white,

      fontSize: 15,

      fontWeight:
        '700',
    },

    pressed: {
      opacity: 0.75,
    },

    changeRoleText: {
      color:
        colors.teal,

      fontSize: 13,

      fontWeight:
        '700',

      textAlign:
        'center',
    },
  });