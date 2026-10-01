import { useState } from 'react';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useAuth,
} from '../../components/auth/AuthContext';

import type {
  HomeownerScreenProps,
} from '../../navigation/homeownerTypes';

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

export default function HomeownerProfileScreen({
  navigation,
}: HomeownerScreenProps<'Profile'>) {
  const insets = useSafeAreaInsets();

  const {
    user,
    logout,
  } = useAuth();

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      setError('');

      await logout();

      // No manual navigation needed.
      // RootNavigator will see user === null
      // and automatically show Role Selection.
    } catch (logoutError) {
      setError(
        logoutError instanceof Error
          ? logoutError.message
          : 'Unable to log out. Please try again.',
      );
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 18,
            paddingBottom: insets.bottom + 35,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() =>
              navigation.goBack()
            }
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={COLORS.heading}
            />
          </Pressable>

          <View>
            <Text style={styles.title}>
              My Profile
            </Text>

            <Text style={styles.subtitle}>
              Manage your account
            </Text>
          </View>
        </View>

        {/* Profile */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons
              name="person-outline"
              size={42}
              color={COLORS.teal}
            />
          </View>

          <Text style={styles.profileName}>
            Homeowner
          </Text>

          <Text style={styles.profileEmail}>
            {user?.email ?? 'No email available'}
          </Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              HOMEOWNER
            </Text>
          </View>
        </View>

        {/* Account Information */}
        <Text style={styles.sectionTitle}>
          Account Information
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="mail-outline"
                size={21}
                color={COLORS.cyan}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Email Address
              </Text>

              <Text style={styles.infoValue}>
                {user?.email ?? 'Not available'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="person-circle-outline"
                size={21}
                color={COLORS.cyan}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Account Type
              </Text>

              <Text style={styles.infoValue}>
                Homeowner
              </Text>
            </View>
          </View>
        </View>

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={COLORS.danger}
            />

            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        ) : null}

        {/* Logout */}
        <Pressable
          disabled={loggingOut}
          style={[
            styles.logoutButton,
            loggingOut && {
              opacity: 0.6,
            },
          ]}
          onPress={() =>
            void handleLogout()
          }
        >
          {loggingOut ? (
            <ActivityIndicator
              color={COLORS.danger}
            />
          ) : (
            <>
              <Ionicons
                name="log-out-outline"
                size={21}
                color={COLORS.danger}
              />

              <Text style={styles.logoutText}>
                Log Out
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: COLORS.border,

    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    color: COLORS.heading,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 13,
    color: COLORS.secondary,
  },

  profileCard: {
    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,

    padding: 24,

    alignItems: 'center',
  },

  avatar: {
    width: 86,
    height: 86,

    borderRadius: 43,

    backgroundColor: COLORS.preview,

    borderWidth: 1,
    borderColor: COLORS.illustrationLine,

    alignItems: 'center',
    justifyContent: 'center',
  },

  profileName: {
    marginTop: 14,

    fontSize: 21,
    fontWeight: '800',

    color: COLORS.heading,
  },

  profileEmail: {
    marginTop: 5,

    fontSize: 13,

    color: COLORS.secondary,
  },

  roleBadge: {
    marginTop: 12,

    backgroundColor: COLORS.preview,

    borderWidth: 1,
    borderColor: COLORS.border,

    borderRadius: 999,

    paddingHorizontal: 13,
    paddingVertical: 6,
  },

  roleText: {
    color: COLORS.teal,

    fontSize: 10,
    fontWeight: '800',

    letterSpacing: 0.7,
  },

  sectionTitle: {
    marginTop: 25,
    marginBottom: 10,

    color: COLORS.heading,

    fontSize: 17,
    fontWeight: '800',
  },

  infoCard: {
    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: COLORS.border,

    borderRadius: 18,

    paddingHorizontal: 16,
  },

  infoRow: {
    minHeight: 78,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 12,
  },

  infoIcon: {
    width: 43,
    height: 43,

    borderRadius: 13,

    backgroundColor: COLORS.preview,

    alignItems: 'center',
    justifyContent: 'center',
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    color: COLORS.secondary,

    fontSize: 11,
  },

  infoValue: {
    marginTop: 3,

    color: COLORS.heading,

    fontSize: 14,
    fontWeight: '700',
  },

  divider: {
    height: 1,

    backgroundColor: COLORS.border,
  },

  errorBox: {
    marginTop: 18,

    flexDirection: 'row',

    gap: 8,

    padding: 11,

    borderRadius: 11,

    borderWidth: 1,
    borderColor: '#F1D3D7',

    backgroundColor: COLORS.dangerBackground,
  },

  errorText: {
    flex: 1,

    color: COLORS.danger,

    fontSize: 12,
  },

  logoutButton: {
    minHeight: 54,

    marginTop: 25,

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,

    borderRadius: 14,

    backgroundColor: COLORS.dangerBackground,

    borderWidth: 1,
    borderColor: '#F1D3D7',
  },

  logoutText: {
    color: COLORS.danger,

    fontSize: 15,
    fontWeight: '700',
  },
});