import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

const reminderOptions = [
  '1 month before expiry',
  '3 months before expiry',
  '1 week before expiry',
  'On expiry date',
];

export default function SetExpiryReminderScreen() {
  const [selectedReminder, setSelectedReminder] =
    useState('1 month before expiry');
  const [pushNotification, setPushNotification] = useState(true);
  const [emailNotification, setEmailNotification] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.title}>Set Expiry Reminder</Text>
          <Text style={styles.headerIcon}>♧</Text>
        </View>

        <View style={styles.applianceCard}>
          <Text style={styles.applianceName}>
            Samsung Refrigerator
          </Text>
          <Text style={styles.expiryText}>
            Expires 15 Mar 2028
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Reminder options</Text>

        {reminderOptions.map((option) => (
          <Pressable
            key={option}
            onPress={() => setSelectedReminder(option)}
            style={styles.optionRow}
          >
            <View
              style={[
                styles.radio,
                selectedReminder === option && styles.radioSelected,
              ]}
            >
              {selectedReminder === option && (
                <View style={styles.radioDot} />
              )}
            </View>

            <Text style={styles.optionText}>{option}</Text>
          </Pressable>
        ))}

        <Text style={styles.sectionTitle}>Notification method</Text>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Push Notification</Text>
          <Switch
            value={pushNotification}
            onValueChange={setPushNotification}
            trackColor={{ false: '#DEE8ED', true: '#8ED6E5' }}
            thumbColor={pushNotification ? '#0EA5C6' : '#FFFFFF'}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Email Notification</Text>
          <Switch
            value={emailNotification}
            onValueChange={setEmailNotification}
            trackColor={{ false: '#DEE8ED', true: '#8ED6E5' }}
            thumbColor={emailNotification ? '#0EA5C6' : '#FFFFFF'}
          />
        </View>

        <Pressable style={styles.saveButton}>
          <Text style={styles.saveText}>Save Reminder</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
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
  },
  title: {
    flex: 1,
    marginLeft: 12,
    color: '#103851',
    fontSize: 19,
    fontWeight: '700',
  },
  headerIcon: {
    color: '#58717F',
    fontSize: 22,
  },
  applianceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DEE8ED',
    padding: 15,
    marginBottom: 24,
  },
  applianceName: {
    color: '#103851',
    fontSize: 14,
    fontWeight: '700',
  },
  expiryText: {
    color: '#58717F',
    fontSize: 11,
    marginTop: 5,
  },
  sectionTitle: {
    color: '#103851',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  optionRow: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DEE8ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#0EA5C6',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0EA5C6',
  },
  optionText: {
    color: '#103851',
    fontSize: 12,
    marginLeft: 10,
  },
  switchRow: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  switchText: {
    color: '#103851',
    fontSize: 12,
  },
  saveButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: '#0EA5C6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
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