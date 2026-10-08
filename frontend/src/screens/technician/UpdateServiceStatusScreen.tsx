import React, { useEffect, useState } from 'react';

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';

import {
  useNavigation,
  NavigationProp,
  useRoute,
} from '@react-navigation/native';

import type { RouteProp } from '@react-navigation/native';

import type { TechnicianStackParamList } from '../../navigation/technicianTypes';

import { useAuth } from '../../components/auth/AuthContext';

import {
  updateServiceRequestStatus,
} from '../../services/serviceRequestService';

import {
  addRepairHistory,
} from '../../services/repairHistoryService';

import type {
  ServiceRequestStatus,
} from '../../types/serviceRequest';

import {
  doc,
  getDoc,
} from 'firebase/firestore';

import { db } from '../../config/firebase';

type Navigation =
  NavigationProp<TechnicianStackParamList>;

type UpdateServiceStatusRouteProp =
  RouteProp<
    TechnicianStackParamList,
    'UpdateServiceStatus'
  >;

type ServiceStatus =
  | 'Pending'
  | 'In Progress'
  | 'Completed';

type ServiceRequestData = {
  applianceId?: string;
  applianceName?: string;
  status?: ServiceRequestStatus;
};

export default function UpdateServiceStatusScreen() {
  const navigation =
    useNavigation<Navigation>();

  const route =
    useRoute<UpdateServiceStatusRouteProp>();

  const { serviceRequestId } =
    route.params;

  const { user } = useAuth();

  const [status, setStatus] =
    useState<ServiceStatus>('Pending');

  const [notes, setNotes] =
    useState('');

  const [showStatusOptions, setShowStatusOptions] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState('');

  const [serviceRequest, setServiceRequest] =
    useState<ServiceRequestData | null>(null);

  const [loadingRequest, setLoadingRequest] =
    useState(true);

  const statusOptions: ServiceStatus[] = [
    'Pending',
    'In Progress',
    'Completed',
  ];

  useEffect(() => {
    async function loadServiceRequest() {
      try {
        setLoadingRequest(true);
        setErrorMessage('');

        const requestRef = doc(
          db,
          'serviceRequests',
          serviceRequestId,
        );

        const requestSnapshot =
          await getDoc(requestRef);

        if (!requestSnapshot.exists()) {
          setErrorMessage(
            'Service request not found.',
          );
          return;
        }

        const data =
          requestSnapshot.data() as ServiceRequestData;

        setServiceRequest(data);

        if (data.status === 'inProgress') {
          setStatus('In Progress');
        } else if (data.status === 'completed') {
          setStatus('Completed');
        } else {
          setStatus('Pending');
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Could not load service request.',
        );
      } finally {
        setLoadingRequest(false);
      }
    }

    loadServiceRequest();
  }, [serviceRequestId]);

  const getApplianceIcon = (
    applianceName: string,
  ) => {
    const name =
      applianceName.toLowerCase();

    if (
      name.includes('refrigerator') ||
      name.includes('fridge')
    ) {
      return '🧊';
    }

    if (name.includes('washing')) {
      return '🧺';
    }

    if (
      name.includes('air conditioner') ||
      name.includes('ac')
    ) {
      return '❄️';
    }

    if (
      name.includes('television') ||
      name.includes('tv')
    ) {
      return '📺';
    }

    if (name.includes('microwave')) {
      return '🍽️';
    }

    if (name.includes('oven')) {
      return '🔥';
    }

    if (name.includes('dishwasher')) {
      return '🍽️';
    }

    if (name.includes('dryer')) {
      return '👕';
    }

    if (
      name.includes('water heater') ||
      name.includes('heater')
    ) {
      return '♨️';
    }

    if (name.includes('fan')) {
      return '🌀';
    }

    if (name.includes('vacuum')) {
      return '🧹';
    }

    if (
      name.includes('stove') ||
      name.includes('cooker')
    ) {
      return '🍳';
    }

    if (name.includes('iron')) {
      return '👔';
    }

    if (name.includes('coffee')) {
      return '☕';
    }

    if (name.includes('blender')) {
      return '🥤';
    }

    return '🔧';
  };

  const handleSaveStatus = async () => {
    if (saving) {
      return;
    }

    if (!user?.uid) {
      setErrorMessage(
        'Please log in again before updating the service status.',
      );
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      const firestoreStatus: ServiceRequestStatus =
        status === 'Pending'
          ? 'pending'
          : status === 'In Progress'
            ? 'inProgress'
            : 'completed';

      // Update service request status
      await updateServiceRequestStatus(
        serviceRequestId,
        firestoreStatus,
      );

      // Create repair history when repair is completed
      if (status === 'Completed') {
        await addRepairHistory({
          serviceRequestId,

          applianceId:
            serviceRequest?.applianceId ||
            serviceRequestId,

          applianceName:
            serviceRequest?.applianceName ||
            'Appliance',

          technicianId: user.uid,

          status: 'completed',

          repairNotes:
            notes.trim() ||
            'Repair completed',

          completedDate:
            new Date()
              .toISOString()
              .split('T')[0],
        });
      }

      // Go directly to Repair History
      navigation.navigate(
        'RepairHistory',
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Could not update the service status.',
      );
    } finally {
      setSaving(false);
    }
  };

  const applianceName =
    serviceRequest?.applianceName ||
    'Appliance';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.contentContainer
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>
              HomeCare
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

        {/* Title */}
        <View style={styles.titleRow}>
          <Pressable
            style={styles.backButton}
            onPress={() =>
              navigation.goBack()
            }
          >
            <Text style={styles.backArrow}>
              ‹
            </Text>
          </Pressable>

          <View style={styles.titleContent}>
            <Text style={styles.pageTitle}>
              Update Service Status
            </Text>

            <Text style={styles.pageSubtitle}>
              Update the repair progress and add notes
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Appliance Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Appliance Information
          </Text>

          {loadingRequest ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="small"
                color="#0EA5C6"
              />

              <Text style={styles.loadingText}>
                Loading appliance details...
              </Text>
            </View>
          ) : (
            <View style={styles.applianceRow}>
              <View style={styles.applianceIconBox}>
                <Text style={styles.applianceEmoji}>
                  {getApplianceIcon(
                    applianceName,
                  )}
                </Text>
              </View>

              <View style={styles.applianceDetails}>
                <Text style={styles.applianceName}>
                  {applianceName}
                </Text>

                <Text style={styles.applianceText}>
                  Model: Not available
                </Text>

                <Text style={styles.applianceText}>
                  Serial Number: Not available
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Service Progress */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Service Progress
          </Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressStep}>
              <View
                style={[
                  styles.progressCircle,
                  status === 'Pending' ||
                  status === 'In Progress' ||
                  status === 'Completed'
                    ? styles.progressCircleActive
                    : null,
                ]}
              >
                <Text
                  style={
                    styles.progressNumber
                  }
                >
                  1
                </Text>
              </View>

              <Text style={styles.progressLabel}>
                Pending
              </Text>
            </View>

            <View style={styles.progressLine} />

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
                <Text
                  style={
                    styles.progressNumber
                  }
                >
                  2
                </Text>
              </View>

              <Text style={styles.progressLabel}>
                In Progress
              </Text>
            </View>

            <View style={styles.progressLine} />

            <View style={styles.progressStep}>
              <View
                style={[
                  styles.progressCircle,
                  status === 'Completed'
                    ? styles.progressCircleActive
                    : styles.progressCircleInactive,
                ]}
              >
                <Text
                  style={
                    styles.progressNumber
                  }
                >
                  3
                </Text>
              </View>

              <Text style={styles.progressLabel}>
                Completed
              </Text>
            </View>
          </View>
        </View>

        {/* Current Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Current Status
          </Text>

          <Pressable
            style={styles.statusSelector}
            onPress={() =>
              setShowStatusOptions(
                !showStatusOptions,
              )
            }
          >
            <Text style={styles.statusText}>
              {status}
            </Text>

            <Text style={styles.dropdownArrow}>
              ▾
            </Text>
          </Pressable>

          {showStatusOptions && (
            <View style={styles.statusOptions}>
              {statusOptions.map(
                (option) => (
                  <Pressable
                    key={option}
                    style={[
                      styles.statusOption,
                      option === status &&
                        styles.selectedStatusOption,
                    ]}
                    onPress={() => {
                      setStatus(option);
                      setShowStatusOptions(
                        false,
                      );
                    }}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        option === status &&
                          styles.selectedStatusOptionText,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ),
              )}
            </View>
          )}
        </View>

        {/* Repair Notes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Repair Notes
          </Text>

          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Enter repair details or notes..."
            placeholderTextColor="#58717F"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Error */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {errorMessage}
            </Text>
          </View>
        ) : null}

        {/* Save Button */}
        <Pressable
          style={[
            styles.saveButton,
            saving &&
              styles.saveButtonDisabled,
          ]}
          onPress={handleSaveStatus}
          disabled={saving}
        >
          {saving ? (
            <View style={styles.savingContent}>
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

              <Text
                style={styles.saveButtonText}
              >
                Saving...
              </Text>
            </View>
          ) : (
            <Text
              style={styles.saveButtonText}
            >
              Save Status
            </Text>
          )}
        </Pressable>
      </ScrollView>
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
    backgroundColor: '#F4F8FA',
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  /* Header */

  header: {
    height: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  logoText: {
    fontSize: 23,
    fontWeight: '700',
    color: '#103851',
  },

  tagline: {
    marginTop: 2,
    fontSize: 11,
    color: '#58717F',
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
    fontSize: 22,
  },

  /* Title */

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  backButton: {
    width: 34,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  backArrow: {
    fontSize: 35,
    lineHeight: 35,
    color: '#103851',
  },

  titleContent: {
    flex: 1,
  },

  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#103851',
  },

  pageSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#58717F',
  },

  divider: {
    height: 1,
    backgroundColor: '#DEE8ED',
    marginTop: 10,
    marginBottom: 16,
  },

  /* Cards */

  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },

  cardTitle: {
    fontSize: 16,
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
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F1F9F9',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  applianceEmoji: {
    fontSize: 25,
  },

  applianceDetails: {
    flex: 1,
  },

  applianceName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#103851',
    marginBottom: 4,
  },

  applianceText: {
    fontSize: 12,
    color: '#58717F',
    marginBottom: 2,
  },

  loadingContainer: {
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },

  loadingText: {
    fontSize: 12,
    color: '#58717F',
  },

  /* Progress */

  progressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  progressStep: {
    alignItems: 'center',
    width: 65,
  },

  progressCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressCircleActive: {
    backgroundColor: '#0EA5C6',
  },

  progressCircleInactive: {
    backgroundColor: '#CEDCE3',
  },

  progressNumber: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  progressLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#0EA5C6',
    marginTop: 15,
    marginHorizontal: 3,
  },

  progressLabel: {
    marginTop: 7,
    fontSize: 10,
    color: '#58717F',
    textAlign: 'center',
  },

  /* Status */

  statusSelector: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 12,
    backgroundColor: '#F1F9F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 13,
  },

  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#103851',
  },

  dropdownArrow: {
    fontSize: 17,
    color: '#58717F',
  },

  statusOptions: {
    marginTop: 7,
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },

  statusOption: {
    paddingVertical: 12,
    paddingHorizontal: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#DEE8ED',
  },

  selectedStatusOption: {
    backgroundColor: '#F1F9F9',
  },

  statusOptionText: {
    fontSize: 13,
    color: '#58717F',
  },

  selectedStatusOptionText: {
    color: '#087F80',
    fontWeight: '700',
  },

  /* Notes */

  notesInput: {
    minHeight: 92,
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 12,
    backgroundColor: '#F1F9F9',
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 13,
    color: '#103851',
  },

  /* Error */

  errorBox: {
    backgroundColor: '#FFF3F3',
    borderWidth: 1,
    borderColor: '#F0CACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },

  errorText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#A33A3A',
  },

  /* Save */

  saveButton: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: '#087F80',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },

  saveButtonDisabled: {
    opacity: 0.7,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  savingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});