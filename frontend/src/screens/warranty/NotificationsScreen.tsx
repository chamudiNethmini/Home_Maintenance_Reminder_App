import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>

          <View style={styles.profileBox}>
            <Text style={styles.profileText}>K</Text>
            <Text style={styles.profileName}>Kavi</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Warranty Alerts</Text>

        {alerts.map((alert) => (
          <Pressable key={alert.title} style={styles.alertCard}>
            <View style={styles.alertIcon}>
              <Text style={[styles.alertIconText, { color: alert.color }]}>
                {alert.icon}
              </Text>
            </View>

            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Text style={styles.alertMessage}>{alert.message}</Text>
              <Text style={styles.alertTime}>{alert.time}</Text>
            </View>
          </Pressable>
        ))}

        <Pressable style={styles.readButton}>
          <Text style={styles.readButtonText}>Mark All as Read</Text>
        </Pressable>

        <Pressable style={styles.settingsButton}>
          <Text style={styles.settingsButtonText}>Warranty Settings</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Text style={styles.bottomItem}>⌂{'\n'}Home</Text>
        <Text style={styles.bottomItem}>▦{'\n'}Appliances</Text>
        <Text style={styles.bottomItem}>□{'\n'}Calendar</Text>
        <Text style={[styles.bottomItem, styles.activeBottomItem]}>
          ♙{'\n'}Profile
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F8FA',
  },
  container: {
    padding: 16,
    paddingBottom: 110,
  },
  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  title: {
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
    height: 46,
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
    height: 46,
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#DEE8ED',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
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