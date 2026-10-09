import React from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import type {
  HomeownerScreenProps,
} from '../../navigation/homeownerTypes';

type AlertItem = {
  title: string;
  message: string;
  time: string;
  icon: string;
  color: string;
};

const alerts: AlertItem[] = [
  {
    title: 'LG Washing Machine',
    message: 'Warranty expiring in 2 weeks',
    time: 'Today, 9:30 AM',
    icon: '!',
    color: '#F5A623',
  },
  {
    title: 'Samsung Refrigerator',
    message: 'Reminder set 1 month before expiry',
    time: 'Yesterday',
    icon: '✓',
    color: '#0EA5C6',
  },
  {
    title: 'Sony TV',
    message: 'Warranty has expired',
    time: '10 Jan',
    icon: '×',
    color: '#E64646',
  },
];

export default function NotificationsScreen({
  navigation,
}: HomeownerScreenProps<'Notifications'>) {
  return (
    <SafeAreaProvider style={styles.safeArea}>
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'bottom', 'left', 'right']}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.title}>
            Notifications
          </Text>

          <View style={styles.profileBox}>
            <Text style={styles.profileText}>K</Text>

            <Text style={styles.profileName}>
              Kavi
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>
            Warranty Alerts
          </Text>

          {alerts.map((alert) => (
            <Pressable
              key={alert.title}
              style={styles.alertCard}
            >
              <View style={styles.alertIcon}>
                <Text
                  style={[
                    styles.alertIconText,
                    { color: alert.color },
                  ]}
                >
                  {alert.icon}
                </Text>
              </View>

              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>
                  {alert.title}
                </Text>

                <Text style={styles.alertMessage}>
                  {alert.message}
                </Text>

                <Text style={styles.alertTime}>
                  {alert.time}
                </Text>
              </View>
            </Pressable>
          ))}

          <Pressable style={styles.readButton}>
            <Text style={styles.readButtonText}>
              Mark All as Read
            </Text>
          </Pressable>

          <Pressable style={styles.settingsButton}>
            <Text style={styles.settingsButtonText}>
              Warranty Settings
            </Text>
          </Pressable>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            style={styles.navigationItem}
            onPress={() =>
              navigation.navigate('Dashboard')
            }
            accessibilityRole="button"
            accessibilityLabel="Home"
          >
            <Ionicons
              name="home-outline"
              size={22}
              color="#58717F"
            />

            <Text style={styles.navigationText}>
              Home
            </Text>
          </Pressable>

          <Pressable
            style={styles.navigationItem}
            onPress={() =>
              navigation.navigate('MyAppliances')
            }
            accessibilityRole="button"
            accessibilityLabel="Appliances"
          >
            <Ionicons
              name="apps-outline"
              size={22}
              color="#58717F"
            />

            <Text style={styles.navigationText}>
              Appliances
            </Text>
          </Pressable>

          <Pressable
            style={styles.navigationItem}
            onPress={() =>
              navigation.navigate('MaintenanceCalendar')
            }
            accessibilityRole="button"
            accessibilityLabel="Calendar"
          >
            <Ionicons
              name="calendar-outline"
              size={22}
              color="#58717F"
            />

            <Text style={styles.navigationText}>
              Calendar
            </Text>
          </Pressable>

          <Pressable
            style={styles.navigationItem}
            onPress={() =>
              navigation.navigate('Profile')
            }
            accessibilityRole="button"
            accessibilityLabel="Profile"
          >
            <Ionicons
              name="person-outline"
              size={22}
              color="#58717F"
            />

            <Text style={styles.navigationText}>
              Profile
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F8FA',
  },

  scrollView: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
    backgroundColor: '#F4F8FA',
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#DDF4FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backText: {
    color: '#087F80',
    fontSize: 28,
    lineHeight: 30,
  },

  title: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    color: '#103851',
    fontSize: 21,
    fontWeight: '700',
  },

  profileBox: {
    alignItems: 'center',
  },

  profileText: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0EA5C6',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingTop: 6,
    fontWeight: '700',
  },

  profileName: {
    color: '#58717F',
    fontSize: 9,
    marginTop: 2,
  },

  sectionTitle: {
    color: '#103851',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },

  alertCard: {
    minHeight: 82,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4F8FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  alertIconText: {
    fontSize: 19,
    fontWeight: '700',
  },

  alertContent: {
    flex: 1,
    marginLeft: 12,
  },

  alertTitle: {
    color: '#103851',
    fontSize: 12,
    fontWeight: '700',
  },

  alertMessage: {
    color: '#58717F',
    fontSize: 11,
    marginTop: 4,
  },

  alertTime: {
    color: '#8CA0AA',
    fontSize: 10,
    marginTop: 4,
  },

  readButton: {
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0EA5C6',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },

  readButtonText: {
    color: '#0EA5C6',
    fontWeight: '700',
    fontSize: 12,
  },

  settingsButton: {
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: '#0EA5C6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  settingsButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },

  bottomBar: {
    minHeight: 68,
    paddingTop: 9,
    paddingBottom: 9,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#DEE8ED',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  navigationItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  navigationText: {
    fontSize: 10,
    color: '#58717F',
  },

  bottomItem: {
    color: '#8CA0AA',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 17,
  },

  activeBottomItem: {
    color: '#0EA5C6',
    fontWeight: '700',
  },
});