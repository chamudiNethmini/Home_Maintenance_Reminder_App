import {
  useState,
} from 'react';

import {
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
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  Brand,
  ui,
  colors,
  Icon,
} from '../../components/provider/ProviderUI';

import type {
  RootStackParamList,
  UserRole,
} from '../../navigation/rootTypes';

import {
  useAuth,
} from '../../components/auth/AuthContext';

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    'SignUp'
  >;

const roleLabels:
Record<UserRole, string> = {
  homeowner:
    'Homeowner',

  technician:
    'Technician',

  provider:
    'Warranty Provider',
};

export default function SignUpScreen({
  route,
  navigation,
}: Props) {
  const insets =
    useSafeAreaInsets();

  const {
    signup,
  } = useAuth();

  const {
    role,
  } = route.params;

  const [
    name,
    setName,
  ] = useState('');

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(false);

  const clearError =
    () => {
      if (
        error
      ) {
        setError('');
      }
    };

  const validate =
    () => {
      if (
        !name.trim()
      ) {
        setError(
          'Please enter your full name.',
        );

        return false;
      }

      if (
        !email.trim()
      ) {
        setError(
          'Please enter your email address.',
        );

        return false;
      }

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailPattern.test(
          email.trim(),
        )
      ) {
        setError(
          'Please enter a valid email address.',
        );

        return false;
      }

      if (
        !password
      ) {
        setError(
          'Please enter a password.',
        );

        return false;
      }

      if (
        password.length <
        6
      ) {
        setError(
          'Password must contain at least 6 characters.',
        );

        return false;
      }

      if (
        !confirmPassword
      ) {
        setError(
          'Please confirm your password.',
        );

        return false;
      }

      if (
        password !==
        confirmPassword
      ) {
        setError(
          'Passwords do not match.',
        );

        return false;
      }

      setError('');

      return true;
    };

  const handleSignUp =
    async () => {
      if (
        !validate()
      ) {
        return;
      }

      try {
        setLoading(
          true,
        );

        setError('');

        await signup(
          name.trim(),
          email.trim(),
          password,
          role,
        );

        /*
         * No navigation is required here.
         *
         * AuthContext will set the logged-in user,
         * then RootNavigator will automatically
         * open the correct dashboard according
         * to the selected role.
         */
      } catch (
        signupError
      ) {
        if (
          signupError instanceof
          Error
        ) {
          setError(
            signupError.message,
          );
        } else {
          setError(
            'Unable to create your account. Please try again.',
          );
        }
      } finally {
        setLoading(
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
        style={
          ui.scrollViewport
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
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
          {/* Back Button */}

          <Pressable
            style={
              styles.backButton
            }
            disabled={
              loading
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
            <Brand
              large
            />

            <Text
              style={
                styles.heading
              }
            >
              Create Your Account
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
              Enter your details to create your FixMate account.
            </Text>
          </View>

          {/* Sign Up Card */}

          <View
            style={
              styles.formCard
            }
          >
            {/* Full Name */}

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
                Full Name
              </Text>

              <View
                style={
                  styles.inputRow
                }
              >
                <Icon
                  name="person-outline"
                  size={20}
                  color={
                    colors.muted
                  }
                />

                <TextInput
                  value={
                    name
                  }
                  onChangeText={(
                    text,
                  ) => {
                    setName(
                      text,
                    );

                    clearError();
                  }}
                  placeholder="Enter your full name"
                  placeholderTextColor="#58717F"
                  autoCapitalize="words"
                  autoCorrect={
                    false
                  }
                  editable={
                    !loading
                  }
                  style={
                    styles.input
                  }
                />
              </View>
            </View>

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
                  value={
                    email
                  }
                  onChangeText={(
                    text,
                  ) => {
                    setEmail(
                      text,
                    );

                    clearError();
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor="#58717F"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={
                    false
                  }
                  editable={
                    !loading
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
                  onChangeText={(
                    text,
                  ) => {
                    setPassword(
                      text,
                    );

                    clearError();
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#58717F"
                  secureTextEntry={
                    !showPassword
                  }
                  autoCapitalize="none"
                  autoCorrect={
                    false
                  }
                  editable={
                    !loading
                  }
                  style={
                    styles.input
                  }
                />

                <Pressable
                  disabled={
                    loading
                  }
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

              <Text
                style={
                  styles.passwordHint
                }
              >
                Use at least 6 characters.
              </Text>
            </View>

            {/* Confirm Password */}

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
                Confirm Password
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
                    confirmPassword
                  }
                  onChangeText={(
                    text,
                  ) => {
                    setConfirmPassword(
                      text,
                    );

                    clearError();
                  }}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#58717F"
                  secureTextEntry={
                    !showPassword
                  }
                  autoCapitalize="none"
                  autoCorrect={
                    false
                  }
                  editable={
                    !loading
                  }
                  onSubmitEditing={
                    handleSignUp
                  }
                  style={
                    styles.input
                  }
                />
              </View>
            </View>

            {/* Error */}

            {error ? (
              <View
                style={
                  styles.errorContainer
                }
              >
                <Icon
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

            {/* Create Account Button */}

            <Pressable
              accessibilityRole="button"
              disabled={
                loading
              }
              onPress={
                handleSignUp
              }
              style={({
                pressed,
              }) => [
                styles.signUpButton,

                loading &&
                  styles.disabledButton,

                pressed &&
                  !loading &&
                  styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.signUpButtonText
                }
              >
                {loading
                  ? 'Creating Account...'
                  : 'Create Account'}
              </Text>

              {!loading && (
                <Icon
                  name="arrow-forward"
                  size={20}
                  color={
                    colors.white
                  }
                />
              )}
            </Pressable>
          </View>

          {/* Login Link */}

          <View
            style={
              styles.loginContainer
            }
          >
            <Text
              style={
                styles.loginPrompt
              }
            >
              Already have an account?{' '}
            </Text>

            <Pressable
              disabled={
                loading
              }
              onPress={() =>
                navigation.replace(
                  'Login',
                  {
                    role,
                  },
                )
              }
            >
              <Text
                style={
                  styles.loginLink
                }
              >
                Login
              </Text>
            </Pressable>
          </View>

          {/* Change Role */}

          <Pressable
            disabled={
              loading
            }
            onPress={() =>
              navigation.navigate(
                'RoleSelection',
              )
            }
          >
            <Text
              style={
                styles.changeRoleText
              }
            >
              Not {
                roleLabels[
                  role
                ]
              }? Change role
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
    flex:
      1,

    backgroundColor:
      '#F4F8FA',
  },

  page: {
    flexGrow:
      1,

    justifyContent:
      Platform.OS ===
      'web'
        ? 'flex-start'
        : 'center',

    paddingHorizontal:
      24,
  },

  content: {
    width:
      '100%',

    maxWidth:
      470,

    alignSelf:
      'center',

    gap:
      24,
  },

  backButton: {
    width:
      44,

    height:
      44,

    borderRadius:
      14,

    borderWidth:
      1,

    borderColor:
      '#DEE8ED',

    backgroundColor:
      '#FFFFFF',

    alignItems:
      'center',

    justifyContent:
      'center',
  },

  intro: {
    alignItems:
      'center',

    gap:
      10,
  },

  heading: {
    color:
      '#103851',

    fontSize:
      28,

    fontWeight:
      '800',

    textAlign:
      'center',
  },

  subtitle: {
    color:
      '#58717F',

    fontSize:
      14,

    textAlign:
      'center',

    lineHeight:
      20,
  },

  roleBadge: {
    backgroundColor:
      '#F1F9F9',

    borderColor:
      '#CEDCE3',

    borderWidth:
      1,

    borderRadius:
      999,

    paddingHorizontal:
      14,

    paddingVertical:
      7,
  },

  roleBadgeText: {
    color:
      '#087F80',

    fontWeight:
      '700',

    fontSize:
      12,
  },

  formCard: {
    backgroundColor:
      '#FFFFFF',

    borderWidth:
      1,

    borderColor:
      '#DEE8ED',

    borderRadius:
      20,

    padding:
      20,

    gap:
      18,
  },

  fieldGroup: {
    gap:
      7,
  },

  label: {
    color:
      '#103851',

    fontSize:
      13,

    fontWeight:
      '700',
  },

  inputRow: {
    minHeight:
      52,

    flexDirection:
      'row',

    alignItems:
      'center',

    gap:
      10,

    backgroundColor:
      '#FFFFFF',

    borderWidth:
      1,

    borderColor:
      '#CEDCE3',

    borderRadius:
      12,

    paddingHorizontal:
      14,
  },

  input: {
    flex:
      1,

    minWidth:
      0,

    color:
      '#103851',

    fontSize:
      15,

    paddingVertical:
      12,
  },

  passwordHint: {
    color:
      '#58717F',

    fontSize:
      11,
  },

  errorContainer: {
    flexDirection:
      'row',

    alignItems:
      'flex-start',

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
      13,

    lineHeight:
      18,
  },

  signUpButton: {
    minHeight:
      52,

    borderRadius:
      12,

    backgroundColor:
      '#087F80',

    flexDirection:
      'row',

    alignItems:
      'center',

    justifyContent:
      'center',

    gap:
      8,
  },

  signUpButtonText: {
    color:
      '#FFFFFF',

    fontSize:
      15,

    fontWeight:
      '700',
  },

  disabledButton: {
    opacity:
      0.65,
  },

  pressed: {
    opacity:
      0.75,
  },

  loginContainer: {
    flexDirection:
      'row',

    justifyContent:
      'center',

    alignItems:
      'center',

    flexWrap:
      'wrap',
  },

  loginPrompt: {
    color:
      '#58717F',

    fontSize:
      13,
  },

  loginLink: {
    color:
      '#087F80',

    fontSize:
      13,

    fontWeight:
      '800',
  },

  changeRoleText: {
    color:
      '#087F80',

    fontSize:
      13,

    fontWeight:
      '700',

    textAlign:
      'center',
  },
});