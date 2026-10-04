import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { TechnicianStackParamList } from '../../navigation/technicianTypes';

type Props = NativeStackScreenProps<
  TechnicianStackParamList,
  'ServiceRequests'
>;

type RequestStatus =
  | 'Pending'
  | 'In Progress'
  | 'Completed';

type ServiceRequest = {
  id: string;
  appliance: string;
  customer: string;
  problem: string;
  status: RequestStatus;
  icon: string;
};

const requests: ServiceRequest[] = [
  {
    id: 'SR-1001',
    appliance: 'Washing Machine',
    customer: 'Kumar',
    problem: 'Not working',
    status: 'Pending',
    icon: '🧺',
  },
  {
    id: 'SR-1002',
    appliance: 'Refrigerator',
    customer: 'Ahamed',
    problem: 'Not cooling',
    status: 'In Progress',
    icon: '▯',
  },
  {
    id: 'SR-1003',
    appliance: 'Air Conditioner',
    customer: 'Fathima',
    problem: 'No power',
    status: 'Completed',
    icon: '❄️',
  },
  {
    id: 'SR-1004',
    appliance: 'Washing Machine',
    customer: 'Nisha',
    problem: 'Water leakage',
    status: 'Pending',
    icon: '🧺',
  },
];

const filters: Array<'All' | RequestStatus> = [
  'All',
  'Pending',
  'In Progress',
  'Completed',
];

export default function ServiceRequestsScreen({
  navigation,
}: Props) {
  const [selectedFilter, setSelectedFilter] =
    useState<'All' | RequestStatus>('All');

  const filteredRequests =
    selectedFilter === 'All'
      ? requests
      : requests.filter(
          (request) =>
            request.status === selectedFilter,
        );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
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
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>‹</Text>

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
          contentContainerStyle={styles.filterContainer}
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

        {/* Service Requests */}
        <View style={styles.requestsContainer}>
          {filteredRequests.map((request) => (
            <Pressable
              key={request.id}
              style={styles.requestCard}
              onPress={() =>
                navigation.navigate(
                  'ApplianceInformation',
                )
              }
            >
              {/* Appliance Icon */}
              <View style={styles.applianceIcon}>
                <Text style={styles.applianceEmoji}>
                  {request.icon}
                </Text>
              </View>

              {/* Request Information */}
              <View style={styles.requestInfo}>
                <Text style={styles.requestId}>
                  {request.id}
                </Text>

                <Text style={styles.applianceName}>
                  {request.appliance}
                </Text>

                <Text style={styles.customerText}>
                  Customer: {request.customer}
                </Text>

                <Text style={styles.problemText}>
                  {request.problem}
                </Text>
              </View>

              {/* Status */}
              <View style={styles.rightSection}>
                <View
                  style={[
                    styles.statusBadge,
                    request.status ===
                      'Pending' &&
                      styles.pendingBadge,
                    request.status ===
                      'In Progress' &&
                      styles.progressBadge,
                    request.status ===
                      'Completed' &&
                      styles.completedBadge,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {request.status}
                  </Text>
                </View>

                <Text style={styles.chevron}>
                  ›
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* Main Screen */

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

  /* Requests */

  requestsContainer: {
    gap: 14,
  },

  requestCard: {
    minHeight: 128,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* Appliance Icon */

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

  /* Request Information */

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
});