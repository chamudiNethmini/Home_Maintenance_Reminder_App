import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { TechnicianStackParamList } from '../../navigation/technicianTypes';
import { useAuth } from '../../components/auth/AuthContext';

type TechnicianNavigationProp =
  NativeStackNavigationProp<TechnicianStackParamList>;

export default function TechnicianDashboardScreen() {
  const navigation =
    useNavigation<TechnicianNavigationProp>();

  const { logout } = useAuth();
  const [showLogout, setShowLogout] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoArea}>
              <View style={styles.logoIcon}>
                <Text style={styles.logoEmoji}>🏠</Text>
              </View>

              <View>
                <Text style={styles.logoText}>
                  Home<Text style={styles.logoBlue}>Care</Text>
                </Text>

                <Text style={styles.tagline}>
                  Care for Every Home
                </Text>
              </View>
            </View>

            <View style={styles.profileWrapper}>
              <Pressable
                style={styles.profileCircle}
                onPress={() =>
                  setShowLogout((current) => !current)
                }
              >
                <Text style={styles.profileEmoji}>👷</Text>
              </Pressable>

              {showLogout && (
                <Pressable
                  style={styles.logoutButton}
                  onPress={async () => {
                    setShowLogout(false);
                    await logout();
                  }}
                >
                  <Text style={styles.logoutText}>Logout</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Greeting */}
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>
              Hello, Dheena! 👋
            </Text>

            <Text style={styles.subtitle}>
              Here's your service overview for today.
            </Text>
          </View>

          {/* Banner */}
          <View style={styles.banner}>
            <View style={styles.bannerTextArea}>
              <Text style={styles.bannerTitle}>
                Keep Homes{'\n'}Running Smoothly
              </Text>

              <Text style={styles.bannerSubtitle}>
                Your skills make{'\n'}a difference.
              </Text>

              <View style={styles.bannerLine} />
            </View>

            <View style={styles.bannerIllustration}>
              <Text style={styles.technicianEmoji}>👨‍🔧</Text>
              <Text style={styles.houseEmoji}>🏠</Text>
            </View>
          </View>

          {/* Statistics */}
          <View style={styles.statsContainer}>
            {/* Assigned Requests */}
            <View style={styles.statCard}>
              <View style={styles.statIconCircle}>
                <Text style={styles.statEmoji}>🗓️</Text>
              </View>

              <View style={styles.statTextArea}>
                <Text
                  style={[
                    styles.statNumber,
                    styles.blueNumber,
                  ]}
                >
                  5
                </Text>

                <Text style={styles.statLabel}>
                  Assigned Requests
                </Text>
              </View>
            </View>

            {/* In Progress */}
            <View style={styles.statCard}>
              <View style={styles.statIconCircle}>
                <Text style={styles.statEmoji}>⏱️</Text>
              </View>

              <View style={styles.statTextArea}>
                <Text
                  style={[
                    styles.statNumber,
                    styles.orangeNumber,
                  ]}
                >
                  3
                </Text>

                <Text style={styles.statLabel}>
                  In Progress
                </Text>
              </View>
            </View>

            {/* Completed */}
            <View style={styles.statCard}>
              <View style={styles.statIconCircle}>
                <Text style={styles.statEmoji}>✅</Text>
              </View>

              <View style={styles.statTextArea}>
                <Text
                  style={[
                    styles.statNumber,
                    styles.greenNumber,
                  ]}
                >
                  8
                </Text>

                <Text style={styles.statLabel}>
                  Completed
                </Text>
              </View>
            </View>

            {/* High Priority */}
            <View style={styles.statCard}>
              <View style={styles.statIconCircle}>
                <Text style={styles.statEmoji}>⚠️</Text>
              </View>

              <View style={styles.statTextArea}>
                <Text
                  style={[
                    styles.statNumber,
                    styles.redNumber,
                  ]}
                >
                  2
                </Text>

                <Text style={styles.statLabel}>
                  High Priority
                </Text>
              </View>
            </View>
          </View>

          {/* Service Requests Button */}
          <Pressable
            style={styles.requestButton}
            onPress={() =>
              navigation.navigate('ServiceRequests')
            }
          >
            <View style={styles.requestIconCircle}>
              <Text style={styles.requestIcon}>🗓️</Text>
            </View>

            <View style={styles.requestTextArea}>
              <Text style={styles.requestTitle}>
                View Service Requests
              </Text>

              <Text style={styles.requestSubtitle}>
                Check and manage assigned requests
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNavigation}>
          {/* Home */}
          <View
            style={[
              styles.navItem,
              styles.activeNavItem,
            ]}
          >
            <Text style={styles.navIcon}>⌂</Text>

            <Text style={styles.activeNavText}>
              Home
            </Text>
          </View>

          {/* Requests */}
          <Pressable
            style={styles.navItem}
            onPress={() =>
              navigation.navigate('ServiceRequests')
            }
          >
            <Text style={styles.navIconInactive}>
              🗓️
            </Text>

            <Text style={styles.navText}>
              Requests
            </Text>
          </Pressable>

         {/* History */}
<Pressable
  style={styles.navItem}
  onPress={() =>
    navigation.navigate('RepairHistory')
  }
>
            <Text style={styles.navIconInactive}>
              📋
            </Text>

            <Text style={styles.navText}>
              History
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* Main */

  safeArea: {
    flex: 1,
    backgroundColor: '#F4F8FA',
    alignItems: 'center',
  },

  container: {
    flex: 1,
    width: '100%',
    maxWidth: 550,
    alignSelf: 'center',
    backgroundColor: '#F4F8FA',
  },

  scrollContent: {
    paddingBottom: 30,
  },

  /* Header */

  header: {
    backgroundColor: '#FFFFFF',
    minHeight: 110,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoIcon: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  logoEmoji: {
    fontSize: 34,
  },

  logoText: {
    fontSize: 23,
    fontWeight: '700',
    color: '#103851',
  },

  logoBlue: {
    color: '#0EA5C6',
  },

  tagline: {
    fontSize: 11,
    color: '#58717F',
    marginTop: 2,
  },

  profileWrapper: {
    position: 'relative',
    alignItems: 'flex-end',
  },

  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#087F80',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileEmoji: {
    fontSize: 23,
  },

  logoutButton: {
    position: 'absolute',
    top: 52,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DEE8ED',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    zIndex: 10,
  },

  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#103851',
  },

  /* Greeting */

  greetingSection: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 18,
  },

  greeting: {
    fontSize: 27,
    fontWeight: '700',
    color: '#103851',
  },

  subtitle: {
    fontSize: 14,
    color: '#58717F',
    marginTop: 5,
  },

  /* Banner */

  banner: {
    height: 190,
    backgroundColor: '#F1F9F9',
    flexDirection: 'row',
    overflow: 'hidden',
  },

  bannerTextArea: {
    flex: 1,
    paddingLeft: 20,
    paddingTop: 25,
    zIndex: 2,
  },

  bannerTitle: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '800',
    color: '#103851',
  },

  bannerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#58717F',
    marginTop: 10,
  },

  bannerLine: {
    width: 50,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0EA5C6',
    marginTop: 14,
  },

  bannerIllustration: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  technicianEmoji: {
    fontSize: 75,
  },

  houseEmoji: {
    fontSize: 48,
    position: 'absolute',
    right: 8,
    top: 20,
    opacity: 0.45,
  },

  /* Statistics */

  statsContainer: {
    paddingHorizontal: 20,
    paddingTop: 25,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },

  statCard: {
    width: '48%',
    minHeight: 92,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DEE8ED',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F9F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  statEmoji: {
    fontSize: 22,
  },

  statTextArea: {
    flex: 1,
  },

  statNumber: {
    fontSize: 27,
    fontWeight: '700',
  },

  blueNumber: {
    color: '#0EA5C6',
  },

  orangeNumber: {
    color: '#0EA5C6',
  },

  greenNumber: {
    color: '#087F80',
  },

  redNumber: {
    color: '#087F80',
  },

  statLabel: {
    fontSize: 11,
    color: '#58717F',
    marginTop: -2,
  },

  /* Service Request Button */

  requestButton: {
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 30,
    minHeight: 82,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  requestIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F1F9F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  requestIcon: {
    fontSize: 25,
  },

  requestTextArea: {
    flex: 1,
    marginLeft: 12,
  },

  requestTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#103851',
  },

  requestSubtitle: {
    fontSize: 12,
    color: '#58717F',
    marginTop: 3,
  },

  arrow: {
    fontSize: 30,
    color: '#087F80',
    fontWeight: '400',
    marginRight: 5,
  },

  /* Bottom Navigation */

  bottomNavigation: {
    height: 78,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#DEE8ED',
  },

  navItem: {
    width: 90,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },

  activeNavItem: {
    backgroundColor: '#F1F9F9',
  },

  navIcon: {
    fontSize: 25,
    color: '#0EA5C6',
  },

  navIconInactive: {
    fontSize: 22,
    color: '#58717F',
  },

  activeNavText: {
    color: '#0EA5C6',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },

  navText: {
    color: '#58717F',
    fontSize: 12,
    marginTop: 2,
  },
});