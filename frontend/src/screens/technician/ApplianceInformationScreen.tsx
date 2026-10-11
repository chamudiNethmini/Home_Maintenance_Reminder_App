import React, { useEffect, useState } from 'react';

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';

import {
  useNavigation,
  NavigationProp,
  useRoute,
} from '@react-navigation/native';

import type { RouteProp } from '@react-navigation/native';

import {
  doc,
  getDoc,
} from 'firebase/firestore';

import { db } from '../../config/firebase';

import type { TechnicianStackParamList } from '../../navigation/technicianTypes';

type Navigation =
  NavigationProp<TechnicianStackParamList>;

type ApplianceInformationRouteProp =
  RouteProp<
    TechnicianStackParamList,
    'ApplianceInformation'
  >;

type ServiceRequestData = {
  requestId?: string;
  applianceId?: string;
  applianceName?: string;
  customerId?: string;
  customerName?: string;
  problemDescription?: string;
  status?: string;
  priority?: string;
  createdAt?: unknown;
};

type ApplianceData = {
  applianceName?: string;
  name?: string;
  model?: string;
  brand?: string;
  serialNumber?: string;
  serialNo?: string;
};

export default function ApplianceInformationScreen() {
  const navigation =
    useNavigation<Navigation>();

  const route =
    useRoute<ApplianceInformationRouteProp>();

  const { serviceRequestId } =
    route.params;

  const [request, setRequest] =
    useState<ServiceRequestData | null>(null);

  const [appliance, setAppliance] =
    useState<ApplianceData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState('');

  useEffect(() => {
    async function loadServiceRequest() {
      try {
        setLoading(true);
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

        const requestData =
          requestSnapshot.data() as ServiceRequestData;

        setRequest(requestData);

        if (requestData.applianceId) {
          const applianceRef = doc(
            db,
            'appliances',
            requestData.applianceId,
          );

          const applianceSnapshot =
            await getDoc(applianceRef);

          if (applianceSnapshot.exists()) {
            setAppliance(
              applianceSnapshot.data() as ApplianceData,
            );
          }
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Could not load service request details.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadServiceRequest();
  }, [serviceRequestId]);

  const applianceName =
    request?.applianceName ||
    appliance?.applianceName ||
    appliance?.name ||
    'Appliance';

  const model =
    appliance?.model ||
    appliance?.brand ||
    'Not available';

  const serialNumber =
    appliance?.serialNumber ||
    appliance?.serialNo ||
    'Not available';

  const customerName =
    request?.customerName ||
    'Not available';

  const problemDescription =
    request?.problemDescription ||
    'No problem description available';

  const priority =
    request?.priority
      ? request.priority.charAt(0).toUpperCase() +
        request.priority.slice(1)
      : 'Not available';

  const requestDate =
    request?.createdAt &&
    typeof request.createdAt === 'string'
      ? request.createdAt
      : 'Not available';

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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color="#0EA5C6"
            />

            <Text style={styles.loadingText}>
              Loading request details...
            </Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {errorMessage}
            </Text>
          </View>
        ) : (
          <>
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
                  {applianceName}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>
                  Model
                </Text>

                <Text style={styles.value}>
                  {model}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>
                  Serial Number
                </Text>

                <Text style={styles.value}>
                  {serialNumber}
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
                  {customerName}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>
                  Phone
                </Text>

                <Text style={styles.value}>
                  Not available
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>
                  Address
                </Text>

                <Text style={styles.value}>
                  Not available
                </Text>
              </View>
            </View>

            {/* Problem Description */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Problem Description
              </Text>

              <Text style={styles.description}>
                {problemDescription}
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
                  {requestDate}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>
                  Priority
                </Text>

                <View style={styles.priorityBadge}>
                  <Text style={styles.priorityText}>
                    {priority}
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
          </>
        )}
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

  /* Loading */

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#58717F',
  },

  /* Error */

  errorBox: {
    backgroundColor: '#FFF1F1',
    borderWidth: 1,
    borderColor: '#F2CACA',
    borderRadius: 14,
    padding: 15,
    marginBottom: 15,
  },

  errorText: {
    color: '#B42318',
    fontSize: 13,
    lineHeight: 19,
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