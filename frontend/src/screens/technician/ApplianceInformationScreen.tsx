import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { TechnicianStackParamList } from '../../navigation/technicianTypes';

type Props = NativeStackScreenProps<
  TechnicianStackParamList,
  'ApplianceInformation'
>;

export default function ApplianceInformationScreen({
  navigation,
}: Props) {
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
            <Text style={styles.logoText}>HomeCare</Text>

            <Text style={styles.tagline}>
              Smart Home Maintenance
            </Text>
          </View>

          <View style={styles.profileCircle}>
            <Text style={styles.profileEmoji}>👷</Text>
          </View>
        </View>

        {/* Back Button */}
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        {/* Page Title */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>
            Appliance Information
          </Text>

          <Text style={styles.pageSubtitle}>
            View appliance and customer details
          </Text>
        </View>

        {/* Appliance Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Appliance Information
          </Text>

          <View style={styles.applianceHeader}>
            <View style={styles.applianceIcon}>
              <Text style={styles.applianceEmoji}>🧺</Text>
            </View>

            <View style={styles.applianceTitleContainer}>
              <Text style={styles.applianceName}>
                Washing Machine
              </Text>

              <Text style={styles.applianceType}>
                Home Appliance
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Model
            </Text>

            <Text style={styles.detailValue}>
              Samsung
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Serial Number
            </Text>

            <Text style={styles.detailValue}>
              W88910
            </Text>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Customer Information
          </Text>

          <View style={styles.customerRow}>
            <View style={styles.customerIcon}>
              <Text style={styles.customerEmoji}>
                👤
              </Text>
            </View>

            <View>
              <Text style={styles.customerName}>
                Kumar
              </Text>

              <Text style={styles.customerDetail}>
                Customer
              </Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>
              Phone
            </Text>

            <Text style={styles.infoValue}>
              +94 77 123 4567
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>
              Address
            </Text>

            <Text style={styles.infoValue}>
              No. 25, Main Street, Colombo
            </Text>
          </View>
        </View>

        {/* Problem Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Problem Description
          </Text>

          <View style={styles.problemBox}>
            <Text style={styles.problemText}>
              Not working properly
            </Text>
          </View>
        </View>

        {/* Request Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Request Details
          </Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Request ID
            </Text>

            <Text style={styles.detailValue}>
              SR-1001
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Date
            </Text>

            <Text style={styles.detailValue}>
              04 Oct 2026
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Priority
            </Text>

            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>
                High
              </Text>
            </View>
          </View>
        </View>

        {/* Update Service Status Button */}
        <Pressable
          style={styles.updateButton}
          onPress={() =>
            navigation.navigate('UpdateServiceStatus')
          }
        >
          <Text style={styles.updateButtonText}>
            Update Service Status
          </Text>

          <Text style={styles.updateArrow}>
            →
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

  /* Back */
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
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#103851',
    marginBottom: 16,
  },

  /* Appliance */
  applianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  applianceIcon: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: '#F1F9F9',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    justifyContent: 'center',
    alignItems: 'center',
  },

  applianceEmoji: {
    fontSize: 27,
  },

  applianceTitleContainer: {
    marginLeft: 14,
  },

  applianceName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#103851',
  },

  applianceType: {
    marginTop: 4,
    fontSize: 13,
    color: '#58717F',
  },

  divider: {
    height: 1,
    backgroundColor: '#DEE8ED',
    marginVertical: 17,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },

  detailLabel: {
    fontSize: 14,
    color: '#58717F',
  },

  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#103851',
    maxWidth: '60%',
    textAlign: 'right',
  },

  /* Customer */
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  customerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F1F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DEE8ED',
  },

  customerEmoji: {
    fontSize: 22,
  },

  customerName: {
    marginLeft: 13,
    fontSize: 16,
    fontWeight: '700',
    color: '#103851',
  },

  customerDetail: {
    marginLeft: 13,
    marginTop: 3,
    fontSize: 12,
    color: '#58717F',
  },

  infoBox: {
    backgroundColor: '#F1F9F9',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#DEE8ED',
  },

  infoLabel: {
    fontSize: 12,
    color: '#58717F',
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#103851',
  },

  /* Problem */
  problemBox: {
    backgroundColor: '#F1F9F9',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 11,
    padding: 15,
  },

  problemText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#58717F',
  },

  /* Priority */
  priorityBadge: {
    backgroundColor: '#F1F9F9',
    borderWidth: 1,
    borderColor: '#0EA5C6',
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 20,
  },

  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0EA5C6',
  },

  /* Update Button */
  updateButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#087F80',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  updateButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  updateArrow: {
    fontSize: 21,
    color: '#FFFFFF',
    marginLeft: 10,
  },
});