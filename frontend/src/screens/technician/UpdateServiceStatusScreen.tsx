import React, { useState } from 'react';

import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import { useNavigation } from '@react-navigation/native';

import type { TechnicianStackParamList } from '../../navigation/technicianTypes';

type NavigationProp =
  NativeStackNavigationProp<TechnicianStackParamList>;

type ServiceStatus =
  'Pending' | 'In Progress' | 'Completed';

export default function UpdateServiceStatusScreen() {
  const navigation =
    useNavigation<NavigationProp>();

  const [status, setStatus] =
    useState<ServiceStatus>('In Progress');

  const [showStatusOptions, setShowStatusOptions] =
    useState(false);

  const [notes, setNotes] = useState('');

  const handleSaveStatus = () => {
    Alert.alert(
      'Status Updated',
      `Service status updated to "${status}".`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.brandName}>
                <Text style={styles.homeText}>
                  Home
                </Text>
                <Text style={styles.careText}>
                  Care
                </Text>
              </Text>

              <Text style={styles.tagline}>
                Care for Every Home
              </Text>
            </View>

            <View style={styles.profileCircle}>
              <Text style={styles.profileEmoji}>
                👷
              </Text>
            </View>
          </View>

          {/* Back + Title */}
          <View style={styles.titleSection}>
            <Pressable
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backIcon}>
                ‹
              </Text>
            </Pressable>

            <View style={styles.titleTextContainer}>
              <Text style={styles.pageTitle}>
                Update Service Status
              </Text>

              <Text style={styles.pageSubtitle}>
                Update the repair progress and add notes
              </Text>
            </View>
          </View>

          {/* Appliance Information */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Appliance Information
            </Text>

            <View style={styles.applianceRow}>
              <View style={styles.applianceIconBox}>
                <Text style={styles.applianceEmoji}>
                  🧺
                </Text>
              </View>

              <View style={styles.applianceDetails}>
                <Text style={styles.applianceName}>
                  Washing Machine
                </Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>
                    Model
                  </Text>

                  <Text style={styles.colon}>
                    :
                  </Text>

                  <Text style={styles.infoValue}>
                    Samsung
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>
                    Serial Number
                  </Text>

                  <Text style={styles.colon}>
                    :
                  </Text>

                  <Text style={styles.infoValue}>
                    W88910
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Service Progress */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Service Progress
            </Text>

            <View style={styles.progressContainer}>

              {/* Pending */}
              <View style={styles.progressStep}>
                <View
                  style={[
                    styles.progressCircle,
                    styles.progressCircleActive,
                  ]}
                >
                  <Text style={styles.progressNumber}>
                    1
                  </Text>
                </View>

                <Text style={styles.progressText}>
                  Pending
                </Text>
              </View>

              {/* Line 1 */}
              <View
                style={[
                  styles.progressLine,
                  status === 'Pending' &&
                    styles.progressLineInactive,
                ]}
              />

              {/* In Progress */}
              <View style={styles.progressStep}>
                <View
                  style={[
                    styles.progressCircle,
                    status === 'In Progress' ||
                    status === 'Completed'
                      ? styles.progressCircleActive
                      : styles.progressCircleInactive,
                  ]}
                >
                  <Text style={styles.progressNumber}>
                    2
                  </Text>
                </View>

                <Text style={styles.progressText}>
                  In Progress
                </Text>
              </View>

              {/* Line 2 */}
              <View
                style={[
                  styles.progressLine,
                  status !== 'Completed' &&
                    styles.progressLineInactive,
                ]}
              />

              {/* Completed */}
              <View style={styles.progressStep}>
                <View
                  style={[
                    styles.progressCircle,
                    status === 'Completed'
                      ? styles.progressCircleActive
                      : styles.progressCircleInactive,
                  ]}
                >
                  <Text style={styles.progressNumber}>
                    3
                  </Text>
                </View>

                <Text style={styles.progressText}>
                  Completed
                </Text>
              </View>

            </View>
          </View>

          {/* Current Status */}
          <View style={styles.inputSection}>
            <Text style={styles.fieldTitle}>
              Current Status
            </Text>

            <Pressable
              style={styles.statusSelector}
              onPress={() =>
                setShowStatusOptions(
                  (current) => !current,
                )
              }
            >
              <Text style={styles.statusText}>
                {status}
              </Text>

              <Text style={styles.dropdownIcon}>
                {showStatusOptions ? '⌃' : '⌄'}
              </Text>
            </Pressable>

            {showStatusOptions && (
              <View style={styles.statusOptions}>
                {(
                  [
                    'Pending',
                    'In Progress',
                    'Completed',
                  ] as ServiceStatus[]
                ).map((option) => (
                  <Pressable
                    key={option}
                    style={[
                      styles.statusOption,
                      option === status &&
                        styles.selectedStatusOption,
                    ]}
                    onPress={() => {
                      setStatus(option);
                      setShowStatusOptions(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        option === status &&
                          styles.selectedStatusText,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Notes */}
          <View style={styles.inputSection}>
            <Text style={styles.fieldTitle}>
              Notes
            </Text>

            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes about the repair..."
              placeholderTextColor="#58717F"
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Save Button */}
          <Pressable
            style={styles.saveButton}
            onPress={handleSaveStatus}
          >
            <Text style={styles.saveButtonText}>
              Save Status
            </Text>
          </Pressable>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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

  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  /* Header */

  header: {
    height: 78,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#DEE8ED',
  },

  brandName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  homeText: {
    color: '#103851',
  },

  careText: {
    color: '#0EA5C6',
  },

  tagline: {
    marginTop: 1,
    fontSize: 11,
    color: '#58717F',
    fontWeight: '500',
  },

  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0EA5C6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileEmoji: {
    fontSize: 23,
  },

  /* Title */

  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 18,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  backIcon: {
    fontSize: 31,
    lineHeight: 31,
    color: '#103851',
    marginTop: -3,
  },

  titleTextContainer: {
    flex: 1,
  },

  pageTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: '#103851',
  },

  pageSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#58717F',
  },

  /* Cards */

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DEE8ED',
    padding: 18,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#103851',
    marginBottom: 14,
  },

  /* Appliance */

  applianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  applianceIconBox: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: '#F1F9F9',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  applianceEmoji: {
    fontSize: 27,
  },

  applianceDetails: {
    flex: 1,
  },

  applianceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#103851',
    marginBottom: 6,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },

  infoLabel: {
    width: 88,
    fontSize: 12,
    color: '#58717F',
  },

  colon: {
    width: 15,
    fontSize: 12,
    color: '#58717F',
  },

  infoValue: {
    flex: 1,
    fontSize: 12,
    color: '#103851',
    fontWeight: '600',
  },

  /* Progress */

  progressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  progressStep: {
    alignItems: 'center',
    width: 82,
  },

  progressCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F9F9',
    borderWidth: 2,
    borderColor: '#DEE8ED',
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressCircleActive: {
    backgroundColor: '#0EA5C6',
    borderColor: '#0EA5C6',
  },

  progressCircleInactive: {
    backgroundColor: '#F1F9F9',
  },

  progressNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#103851',
  },

  progressLine: {
    height: 2,
    flex: 1,
    backgroundColor: '#0EA5C6',
    marginTop: 21,
  },

  progressLineInactive: {
    backgroundColor: '#CEDCE3',
  },

  progressText: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '600',
    color: '#58717F',
    textAlign: 'center',
  },

  /* Inputs */

  inputSection: {
    marginBottom: 18,
  },

  fieldTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#103851',
    marginBottom: 9,
    marginLeft: 2,
  },

  statusSelector: {
    minHeight: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DEE8ED',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#58717F',
  },

  dropdownIcon: {
    fontSize: 23,
    color: '#58717F',
  },

  statusOptions: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 14,
    marginTop: 6,
    overflow: 'hidden',
  },

  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#DEE8ED',
  },

  selectedStatusOption: {
    backgroundColor: '#F1F9F9',
  },

  statusOptionText: {
    fontSize: 14,
    color: '#58717F',
  },

  selectedStatusText: {
    color: '#087F80',
    fontWeight: '700',
  },

  notesInput: {
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DEE8ED',
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 13,
    color: '#103851',
  },

  /* Save */

  saveButton: {
    height: 52,
    backgroundColor: '#087F80',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});