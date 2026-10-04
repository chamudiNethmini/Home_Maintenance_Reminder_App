import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { TechnicianStackParamList } from '../../navigation/technicianTypes';

import { useAuth } from '../../components/auth/AuthContext';

import {
  getTechnicianServiceRequests,
} from '../../services/serviceRequestService';

import type {
  ServiceRequest,
  ServiceRequestStatus,
} from '../../types/serviceRequest';

type Props = NativeStackScreenProps<
  TechnicianStackParamList,
  'ServiceRequests'
>;

type RequestStatus =
  | 'Pending'
  | 'In Progress'
  | 'Completed';

const filters: Array<'All' | RequestStatus> = [
  'All',
  'Pending',
  'In Progress',
  'Completed',
];

function getDisplayStatus(
  status: ServiceRequestStatus,
): RequestStatus {
  if (status === 'inProgress') {
    return 'In Progress';
  }

  if (status === 'completed') {
    return 'Completed';
  }

  return 'Pending';
}

function getApplianceIcon(
  applianceName: string,
): string {
  const name = applianceName.toLowerCase();

  if (name.includes('washing')) {
    return '🧺';
  }

  if (name.includes('refrigerator')) {
    return '▯';
  }

  if (
    name.includes('air conditioner') ||
    name.includes('ac')
  ) {
    return '❄️';
  }

  return '🔧';
}

export default function ServiceRequestsScreen({
  navigation,
}: Props) {
  const { user } = useAuth();

  const [requests, setRequests] =
    useState<ServiceRequest[]>([]);

  const [selectedFilter, setSelectedFilter] =
    useState<'All' | RequestStatus>('All');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const loadRequests = async () => {
    if (!user?.uid) {
      setRequests([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data =
        await getTechnicianServiceRequests(
          user.uid,
        );

      setRequests(data);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not load service requests.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, [user?.uid]);

  const filteredRequests =
    selectedFilter === 'All'
      ? requests
      : requests.filter(
          (request) =>
            getDisplayStatus(
              request.status,
            ) === selectedFilter,
        );

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
              Smart Home Maintenance
            </Text>
          </View>

          <View style={styles.profileCircle}>
            <Text style={styles.profileEmoji}>
              👷
            </Text>
          </View>
        </View>

        {/* Back Button */}
        <Pressable
          style={styles.backButton}
          onPress={() =>
            navigation.goBack()
          }
        >
          <Text style={styles.backArrow}>
            ‹
          </Text>

          <Text style={styles.backText}>
            Back
          </Text>
        </Pressable>

        {/* Page Title */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>
            Service Requests
          </Text>

          <Text style={styles.pageSubtitle}>
            View and manage assigned service requests
          </Text>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.filterContainer
          }
        >
          {filters.map((filter) => {
            const isSelected =
              selectedFilter === filter;

            return (
              <Pressable
                key={filter}
                onPress={() =>
                  setSelectedFilter(filter)
                }
                style={[
                  styles.filterButton,
                  isSelected &&
                    styles.filterButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    isSelected &&
                      styles.filterTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Loading */}
        {loading && (
          <View style={styles.messageContainer}>
            <ActivityIndicator
              size="small"
              color="#087F80"
            />

            <Text style={styles.messageText}>
              Loading service requests...
            </Text>
          </View>
        )}

        {/* Error */}
        {!loading && error !== '' && (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>
              Could not load requests
            </Text>

            <Text style={styles.messageText}>
              {error}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={() =>
                void loadRequests()
              }
            >
              <Text style={styles.retryText}>
                Try Again
              </Text>
            </Pressable>
          </View>
        )}

        {/* Empty */}
        {!loading &&
          error === '' &&
          filteredRequests.length === 0 && (
            <View style={styles.messageCard}>
              <Text style={styles.messageTitle}>
                No Service Requests
              </Text>

              <Text style={styles.messageText}>
                There are no service requests for
                this technician.
              </Text>
            </View>
          )}

        {/* Service Requests */}
        {!loading &&
          error === '' &&
          filteredRequests.map((request) => {
            const displayStatus =
              getDisplayStatus(
                request.status,
              );

            return (
              <Pressable
                key={request.id}
                style={styles.requestCard}
                onPress={() =>
                  navigation.navigate(
                    'ApplianceInformation',
                    {
                      serviceRequestId:
                        request.id,
                    },
                  )
                }
              >
                {/* Appliance Icon */}
                <View style={styles.applianceIcon}>
                  <Text
                    style={styles.applianceEmoji}
                  >
                    {getApplianceIcon(
                      request.applianceName,
                    )}
                  </Text>
                </View>

                {/* Request Information */}
                <View style={styles.requestInfo}>
                  <Text style={styles.requestId}>
                    {request.requestId}
                  </Text>

                  <Text
                    style={styles.applianceName}
                  >
                    {request.applianceName}
                  </Text>

                  <Text
                    style={styles.customerText}
                  >
                    Customer: {request.customerName}
                  </Text>

                  <Text
                    style={styles.problemText}
                  >
                    {request.problemDescription}
                  </Text>
                </View>

                {/* Status */}
                <View style={styles.rightSection}>
                  <View
                    style={[
                      styles.statusBadge,
                      displayStatus ===
                        'Pending' &&
                        styles.pendingBadge,
                      displayStatus ===
                        'In Progress' &&
                        styles.progressBadge,
                      displayStatus ===
                        'Completed' &&
                        styles.completedBadge,
                    ]}
                  >
                    <Text
                      style={styles.statusText}
                    >
                      {displayStatus}
                    </Text>
                  </View>

                  <Text style={styles.chevron}>
                    ›
                  </Text>
                </View>
              </Pressable>
            );
          })}
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
    alignSelf: 'center',
    backgroundColor: '#F4F8FA',
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 35,
  },

  /* Header */
  header: {
    height: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  logoText: {
    fontSize: 22,
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
    backgroundColor: '#087F80',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileEmoji: {
    fontSize: 22,
  },

  /* Back Button */
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 18,
  },

  backArrow: {
    fontSize: 30,
    lineHeight: 30,
    color: '#103851',
    marginRight: 5,
  },

  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#58717F',
  },

  /* Page Title */
  titleSection: {
    marginBottom: 18,
  },

  pageTitle: {
    fontSize: 27,
    fontWeight: '700',
    color: '#103851',
  },

  pageSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#58717F',
  },

  /* Filters */
  filterContainer: {
    paddingVertical: 4,
    paddingBottom: 18,
    gap: 8,
  },

  filterButton: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterButtonActive: {
    backgroundColor: '#087F80',
    borderColor: '#087F80',
  },

  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#58717F',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  /* Request Card */
  requestCard: {
    minHeight: 128,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  applianceIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#F1F9F9',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    justifyContent: 'center',
    alignItems: 'center',
  },

  applianceEmoji: {
    fontSize: 25,
  },

  requestInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  requestId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#58717F',
    marginBottom: 4,
  },

  applianceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#103851',
    marginBottom: 4,
  },

  customerText: {
    fontSize: 12,
    color: '#58717F',
    marginBottom: 3,
  },

  problemText: {
    fontSize: 12,
    color: '#58717F',
  },

  /* Right Section */
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 82,
  },

  statusBadge: {
    minWidth: 86,
    minHeight: 30,
    paddingHorizontal: 9,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pendingBadge: {
    backgroundColor: '#0EA5C6',
  },

  progressBadge: {
    backgroundColor: '#087F80',
  },

  completedBadge: {
    backgroundColor: '#087F80',
  },

  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  chevron: {
    color: '#58717F',
    fontSize: 27,
    fontWeight: '300',
    marginRight: 3,
  },

  /* Loading / Empty / Error */
  messageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

  messageCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
  },

  messageTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#103851',
    marginBottom: 6,
  },

  messageText: {
    fontSize: 13,
    color: '#58717F',
    textAlign: 'center',
    marginTop: 5,
  },

  retryButton: {
    marginTop: 15,
    backgroundColor: '#087F80',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});