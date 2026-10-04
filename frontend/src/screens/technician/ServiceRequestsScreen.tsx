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

type RequestStatus = 'Pending' | 'In Progress' | 'Completed';

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
    icon: '◉',
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
    icon: '▱',
  },
  {
    id: 'SR-1004',
    appliance: 'Washing Machine',
    customer: 'Nisha',
    problem: 'Water leakage',
    status: 'Pending',
    icon: '◉',
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Text style={styles.houseIcon}>🏠</Text>

            <View>
              <Text style={styles.brandName}>
                <Text style={styles.homeText}>Home</Text>
                <Text style={styles.careText}>Care</Text>
              </Text>

              <Text style={styles.tagline}>
                Care for Every Home
              </Text>
            </View>
          </View>

          <View style={styles.technicianCircle}>
            <Text style={styles.technicianEmoji}>👨‍🔧</Text>
          </View>
        </View>

        {/* Page heading */}
        <View style={styles.pageHeader}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              Service Requests
            </Text>

            <Text style={styles.subtitle}>
              View and manage assigned service requests
            </Text>
          </View>
        </View>

        {/* Filter buttons */}
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

        {/* Requests */}
        <View style={styles.requestsContainer}>
          {filteredRequests.map((request) => (
            <Pressable
              key={request.id}
              style={styles.requestCard}
              onPress={() => {
                // Details screen will be connected next.
              }}
            >
              <View style={styles.applianceIconBox}>
                <Text style={styles.applianceIcon}>
                  {request.icon}
                </Text>
              </View>

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
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F8FA',
  },

  scrollContent: {
    paddingBottom: 40,
  },

  header: {
    backgroundColor: '#FFFFFF',
    minHeight: 135,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  houseIcon: {
    fontSize: 58,
    marginRight: 12,
  },

  brandName: {
    fontSize: 39,
    fontWeight: '700',
    letterSpacing: -1.2,
  },

  homeText: {
    color: '#103851',
  },

  careText: {
    color: '#0EA5C6',
  },

  tagline: {
    marginTop: 2,
    color: '#58717F',
    fontSize: 16,
  },

  technicianCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0EA5C6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  technicianEmoji: {
    fontSize: 31,
  },

  pageHeader: {
    paddingTop: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },

  backButton: {
    position: 'absolute',
    left: 18,
    top: 28,
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  backArrow: {
    color: '#103851',
    fontSize: 48,
    fontWeight: '300',
    lineHeight: 42,
  },

  titleContainer: {
    alignItems: 'center',
    paddingHorizontal: 35,
  },

  title: {
    color: '#16202B',
    fontSize: 38,
    fontWeight: '700',
    textAlign: 'center',
  },

  subtitle: {
    color: '#58717F',
    fontSize: 20,
    marginTop: 8,
    textAlign: 'center',
  },

  filterContainer: {
    paddingHorizontal: 32,
    paddingTop: 26,
    paddingBottom: 25,
    gap: 12,
  },

  filterButton: {
    minWidth: 125,
    height: 58,
    paddingHorizontal: 22,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterButtonActive: {
    backgroundColor: '#0EA5C6',
  },

  filterText: {
    color: '#687583',
    fontSize: 18,
    fontWeight: '700',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  requestsContainer: {
    paddingHorizontal: 32,
    gap: 18,
  },

  requestCard: {
    minHeight: 168,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  applianceIconBox: {
    width: 82,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },

  applianceIcon: {
    color: '#0EA5C6',
    fontSize: 54,
    fontWeight: '300',
  },

  requestInfo: {
    flex: 1,
    paddingLeft: 8,
    paddingRight: 8,
  },

  requestId: {
    color: '#687583',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },

  applianceName: {
    color: '#17202B',
    fontSize: 25,
    fontWeight: '700',
    marginBottom: 4,
  },

  customerText: {
    color: '#687583',
    fontSize: 18,
    marginBottom: 5,
  },

  problemText: {
    color: '#687583',
    fontSize: 18,
  },

  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 105,
  },

  statusBadge: {
    minWidth: 132,
    paddingHorizontal: 18,
    height: 56,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pendingBadge: {
    backgroundColor: '#0EA5C6',
  },

  progressBadge: {
    backgroundColor: '#FFAC22',
  },

  completedBadge: {
    backgroundColor: '#2FC45A',
  },

  statusText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  chevron: {
    color: '#687583',
    fontSize: 34,
    fontWeight: '300',
    marginRight: 5,
  },
});