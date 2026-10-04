import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';

import {
  useNavigation,
  NavigationProp,
  useRoute,
} from '@react-navigation/native';

import type { RouteProp } from '@react-navigation/native';

import type { TechnicianStackParamList } from '../../navigation/technicianTypes';

type Navigation =
  NavigationProp<TechnicianStackParamList>;

type ApplianceInformationRouteProp =
  RouteProp<
    TechnicianStackParamList,
    'ApplianceInformation'
  >;

export default function ApplianceInformationScreen() {
  const navigation =
    useNavigation<Navigation>();

  const route =
    useRoute<ApplianceInformationRouteProp>();

  const { serviceRequestId } =
    route.params;

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
            Appliance Information
          </Text>

          <Text style={styles.pageSubtitle}>
            View appliance and service request details
          </Text>
        </View>

        {/* Appliance Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Appliance Information
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Appliance
            </Text>

            <Text style={styles.value}>
              Washing Machine
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Model
            </Text>

            <Text style={styles.value}>
              Samsung
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Serial Number
            </Text>

            <Text style={styles.value}>
              W88910
            </Text>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Customer Information
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Customer
            </Text>

            <Text style={styles.value}>
              Kumar
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Phone
            </Text>

            <Text style={styles.value}>
              +94 77 123 4567
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Address
            </Text>

            <Text style={styles.value}>
              No. 25, Main Street, Colombo
            </Text>
          </View>
        </View>

        {/* Problem Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Problem Description
          </Text>

          <Text style={styles.description}>
            Not working properly
          </Text>
        </View>

        {/* Request Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Request Details
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Request ID
            </Text>

            <Text style={styles.value}>
              {serviceRequestId}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Date
            </Text>

            <Text style={styles.value}>
              04 Oct 2026
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Priority
            </Text>

            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>
                High
              </Text>
            </View>
          </View>
        </View>

        {/* Update Service Status */}
        <Pressable
          style={styles.updateButton}
          onPress={() =>
            navigation.navigate(
              'UpdateServiceStatus',
              {
                serviceRequestId,
              },
            )
          }
        >
          <Text style={styles.updateButtonText}>
            Update Service Status
          </Text>
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

  /* Title */

  titleSection: {
    marginBottom: 20,
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

  /* Cards */

  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#103851',
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 7,
  },

  label: {
    flex: 1,
    fontSize: 13,
    color: '#58717F',
  },

  value: {
    flex: 1.3,
    fontSize: 13,
    fontWeight: '600',
    color: '#103851',
    textAlign: 'right',
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    color: '#58717F',
  },

  /* Priority */

  priorityBadge: {
    backgroundColor: '#0EA5C6',
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 15,
  },

  priorityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Update Button */

  updateButton: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: '#087F80',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },

  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});