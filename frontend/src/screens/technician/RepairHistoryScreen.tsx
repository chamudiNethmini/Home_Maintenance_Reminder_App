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
} from '@react-navigation/native';

import type { TechnicianStackParamList } from '../../navigation/technicianTypes';

import { useAuth } from '../../components/auth/AuthContext';

import {
  getRepairHistory,
} from '../../services/repairHistoryService';

import type { RepairHistory } from '../../types/repairHistory';

type Navigation =
  NavigationProp<TechnicianStackParamList>;

export default function RepairHistoryScreen() {
  const navigation =
    useNavigation<Navigation>();

  const { user } = useAuth();

  const [repairHistory, setRepairHistory] =
    useState<RepairHistory[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState('');

  useEffect(() => {
    async function loadRepairHistory() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage('');

        const history =
          await getRepairHistory(user.uid);

        setRepairHistory(history);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Could not load repair history.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadRepairHistory();
  }, [user?.uid]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>
              Home
              <Text style={styles.brandCare}>
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

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={
            styles.contentContainer
          }
          showsVerticalScrollIndicator={false}
        >

          {/* Page Header */}
          <View style={styles.pageHeader}>
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

            <View>
              <Text style={styles.pageTitle}>
                Repair History
              </Text>

              <Text style={styles.pageSubtitle}>
                View your completed repair records
              </Text>
            </View>
          </View>

          {/* Section Title */}
          <Text style={styles.historySectionTitle}>
            Completed Repairs
          </Text>

          {/* Loading */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color="#25A9CD"
              />

              <Text style={styles.loadingText}>
                Loading repair history...
              </Text>
            </View>
          ) : null}

          {/* Error */}
          {!loading && errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {/* Empty */}
          {!loading &&
          !errorMessage &&
          repairHistory.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>
                📋
              </Text>

              <Text style={styles.emptyTitle}>
                No Repair History
              </Text>

              <Text style={styles.emptyText}>
                Completed repairs will appear here.
              </Text>
            </View>
          ) : null}

          {/* Repair History */}
          {!loading &&
          !errorMessage &&
          repairHistory.map((repair) => (
            <View
              key={repair.id}
              style={styles.historyCard}
            >
              <View style={styles.historyDot} />

              <View style={styles.historyDetails}>
                <Text style={styles.historyDate}>
                  {repair.completedDate}
                </Text>

                <Text
                  style={styles.historyDescription}
                >
                  {repair.repairNotes ||
                    'Repair completed'}
                </Text>

                <Text style={styles.requestId}>
                  Request ID: {repair.serviceRequestId}
                </Text>
              </View>

              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>
                  Completed
                </Text>
              </View>
            </View>
          ))}

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6F7',
  },

  container: {
    flex: 1,
    backgroundColor: '#F4F8FA',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },

  /* Header */
  header: {
    backgroundColor: '#FFFFFF',
    minHeight: 92,
    paddingHorizontal: 25,
    paddingTop: 18,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brandName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#243B53',
  },

  brandCare: {
    color: '#25A9CD',
  },

  tagline: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  profileCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#27A9D0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileEmoji: {
    fontSize: 26,
  },

  /* Content */
  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 25,
  },

  /* Page Header */
  pageHeader: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DEE8ED',
    marginBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  backArrow: {
    fontSize: 43,
    lineHeight: 43,
    color: '#103851',
    fontWeight: '300',
  },

  pageTitle: {
    fontSize: 27,
    fontWeight: '700',
    color: '#103851',
  },

  pageSubtitle: {
    fontSize: 12,
    color: '#58717F',
    marginTop: 3,
  },

  /* History */
  historySectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#103851',
    marginBottom: 12,
  },

  historyCard: {
    minHeight: 105,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DEE8ED',
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  historyDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#25A9CD',
    marginRight: 15,
  },

  historyDetails: {
    flex: 1,
  },

  historyDate: {
    fontSize: 14,
    color: '#58717F',
    marginBottom: 6,
  },

  historyDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#103851',
    marginBottom: 5,
  },

  requestId: {
    fontSize: 11,
    color: '#8A9BA5',
  },

  completedBadge: {
    minWidth: 92,
    height: 38,
    borderRadius: 20,
    backgroundColor: '#087F80',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginLeft: 8,
  },

  completedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Loading */
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
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

  /* Empty */
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DEE8ED',
    alignItems: 'center',
    paddingVertical: 35,
    paddingHorizontal: 20,
  },

  emptyIcon: {
    fontSize: 38,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#103851',
    marginBottom: 5,
  },

  emptyText: {
    fontSize: 13,
    color: '#58717F',
    textAlign: 'center',
  },
});