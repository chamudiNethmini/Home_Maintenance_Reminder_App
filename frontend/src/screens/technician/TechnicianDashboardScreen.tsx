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
                onPress={() => setShowLogout((current) => !current)}
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

              <View>
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

              <View>
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

              <View>
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

              <View>
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

            <Text style={styles.arrow}>
              ›
            </Text>
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
          <Pressable style={styles.navItem}>
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
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6F7',
  },

  container: {
    flex: 1,
    backgroundColor: '#F2FFFD',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },

  scrollContent: {
    paddingBottom: 30,
  },

  /* Header */

  header: {
    backgroundColor: '#FFFFFF',
    minHeight: 155,
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoIcon: {
    width: 95,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoEmoji: {
    fontSize: 62,
  },

  logoText: {
    fontSize: 34,
    fontWeight: '700',
    color: '#243B53',
  },

  logoBlue: {
    color: '#25A9CD',
  },

  tagline: {
    fontSize: 17,
    color: '#6B7280',
    marginTop: 2,
  },

  profileWrapper: {
    position: 'relative',
    alignItems: 'flex-end',
  },

  profileCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#27A9D0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoutButton: {
    position: 'absolute',
    top: 70,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 10,
  },

  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#243B53',
  },

  profileEmoji: {
    fontSize: 32,
  },

  /* Greeting */

  greetingSection: {
    paddingHorizontal: 35,
    paddingTop: 35,
    paddingBottom: 22,
  },

  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: '#17202A',
  },

  subtitle: {
    fontSize: 21,
    color: '#687586',
    marginTop: 7,
  },

  /* Banner */

  banner: {
    marginHorizontal: 0,
    height: 305,
    backgroundColor: '#D8F8FA',
    flexDirection: 'row',
    overflow: 'hidden',
  },

  bannerTextArea: {
    flex: 1,
    paddingLeft: 35,
    paddingTop: 42,
    zIndex: 2,
  },

  bannerTitle: {
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '800',
    color: '#10194D',
  },

  bannerSubtitle: {
    fontSize: 20,
    lineHeight: 28,
    color: '#61748A',
    marginTop: 18,
  },

  bannerLine: {
    width: 70,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#25A9CD',
    marginTop: 22,
  },

  bannerIllustration: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  technicianEmoji: {
    fontSize: 105,
  },

  houseEmoji: {
    fontSize: 70,
    position: 'absolute',
    right: 5,
    top: 30,
    opacity: 0.45,
  },

  /* Statistics */

  statsContainer: {
    paddingHorizontal: 28,
    paddingTop: 55,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
  },

  statCard: {
    width: '47%',
    minHeight: 125,
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  statIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ECF9FC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  statEmoji: {
    fontSize: 31,
  },

  statNumber: {
    fontSize: 39,
    fontWeight: '700',
  },

  blueNumber: {
    color: '#25A9CD',
  },

  orangeNumber: {
    color: '#F6A623',
  },

  greenNumber: {
    color: '#2DBB59',
  },

  redNumber: {
    color: '#FF6262',
  },

  statLabel: {
    fontSize: 17,
    color: '#687586',
    marginTop: -3,
  },

  /* Service Request Button */

  requestButton: {
    marginHorizontal: 30,
    marginTop: 300,
    marginBottom: 40,
    minHeight: 105,
    borderRadius: 25,
    backgroundColor: '#28A8CD',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },

  requestIconCircle: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#EAF8FC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  requestIcon: {
    fontSize: 34,
  },

  requestTextArea: {
    flex: 1,
    marginLeft: 18,
  },

  requestTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#071827',
  },

  requestSubtitle: {
    fontSize: 16,
    color: '#607487',
    marginTop: 5,
  },

  arrow: {
    fontSize: 40,
    color: '#071827',
    fontWeight: '400',
    marginRight: 8,
  },

  /* Bottom Navigation */

  bottomNavigation: {
    height: 105,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  navItem: {
    width: 110,
    height: 85,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },

  activeNavItem: {
    backgroundColor: '#E1F6FC',
  },

  navIcon: {
    fontSize: 35,
    color: '#25A9CD',
  },

  navIconInactive: {
    fontSize: 31,
    color: '#777777',
  },

  activeNavText: {
    color: '#25A9CD',
    fontSize: 17,
    fontWeight: '600',
    marginTop: 3,
  },

  navText: {
    color: '#6B7280',
    fontSize: 17,
    marginTop: 3,
  },
});