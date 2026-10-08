import React, { useCallback, useState } from 'react';

import {
  Alert,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import { auth, db } from '../../config/firebase';

import type {
  HomeownerScreenProps,
} from '../../navigation/homeownerTypes';

type WarrantyFile = {
  id: string;
  fileName: string;
  fileUrl: string;
};

function showMessage(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function WarrantyDetailsScreen({
  route,
  navigation,
}: HomeownerScreenProps<'WarrantyDetails'>) {
  const [documents, setDocuments] = useState<WarrantyFile[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [documentError, setDocumentError] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadDocuments = async () => {
        setLoadingDocuments(true);
        setDocumentError('');
        setDocuments([]);

        try {
          const user = auth.currentUser;

          if (!user) {
            throw new Error('Please log in first.');
          }

          const customerId = user.uid;

          const warrantyQuery = query(
            collection(db, 'homeownerWarranties'),
            where('customerId', '==', customerId),
            where('applianceId', '==', route.params.applianceId),
          );

          const snapshot = await getDocs(warrantyQuery);

          if (!active || auth.currentUser?.uid !== customerId) {
            return;
          }

          if (snapshot.empty) {
            throw new Error('Warranty record was not found.');
          }

          if (snapshot.size > 1) {
            throw new Error(
              'Multiple warranty records exist for this appliance. Please check the records.',
            );
          }

          const data = snapshot.docs[0].data();
          const storedFiles: unknown[] = Array.isArray(data.documents)
            ? data.documents
            : [];

          const files: WarrantyFile[] = [];

          storedFiles.forEach((value, index) => {
            if (!value || typeof value !== 'object') return;

            const file = value as Record<string, unknown>;

            if (
              typeof file.fileUrl !== 'string' ||
              !file.fileUrl.startsWith('https://')
            ) {
              return;
            }

            files.push({
              id:
                typeof file.id === 'string'
                  ? file.id
                  : `document_${index}`,
              fileName:
                typeof file.fileName === 'string'
                  ? file.fileName
                  : `Document ${index + 1}`,
              fileUrl: file.fileUrl,
            });
          });

          setDocuments(files);
        } catch (cause) {
          if (active) {
            setDocumentError(
              cause instanceof Error
                ? cause.message
                : 'Could not load documents.',
            );
          }
        } finally {
          if (active) {
            setLoadingDocuments(false);
          }
        }
      };

      void loadDocuments();

      return () => {
        active = false;
      };
    }, [route.params.applianceId]),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.title}>Warranty Details</Text>
          <Text style={styles.headerIcon}>♧</Text>
        </View>

        <View style={styles.applianceCard}>
          <View style={styles.applianceIcon}>
            <Text style={styles.applianceIconText}>
              {route.params.icon}
            </Text>
          </View>

          <View style={styles.applianceInfo}>
            <Text style={styles.applianceName}>
              {route.params.name}
            </Text>

            <Text style={styles.model}>
              {route.params.model}
            </Text>
          </View>

          <View style={styles.activeBadge}>
            <Text style={styles.activeText}>
              {route.params.status}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Warranty Information
        </Text>

        <InfoRow
          label="Purchase Date"
          value={route.params.purchaseDate}
        />

        <InfoRow
          label="Warranty Period"
          value={route.params.warrantyPeriod}
        />

        <InfoRow
          label="Expiry Date"
          value={route.params.expiry}
        />

        <Text style={styles.sectionTitle}>Documents</Text>

        {loadingDocuments ? (
          <Text style={styles.infoLabel}>Loading documents...</Text>
        ) : documentError ? (
          <Text style={styles.infoLabel}>{documentError}</Text>
        ) : documents.length === 0 ? (
          <Text style={styles.infoLabel}>
            No documents uploaded for this warranty.
          </Text>
        ) : (
          documents.map((document) => (
            <DocumentRow
              key={document.id}
              title={document.fileName}
              uri={document.fileUrl}
            />
          ))
        )}

        <Pressable
          style={styles.editButton}
          onPress={() => {
            navigation.navigate('AddWarranty', {
              applianceId: route.params.applianceId,
              applianceName: route.params.name,
              brand: route.params.brand,
              model: route.params.model,
              serialNumber: route.params.serialNumber,
              purchaseDate: route.params.purchaseDate,
              mode: 'edit',
            });
          }}
        >
          <Text style={styles.editButtonText}>Edit Warranty</Text>
        </Pressable>

    <Pressable
  style={styles.reminderButton}
  onPress={() => {
    navigation.navigate('SetExpiryReminder', {
      applianceId: route.params.applianceId,
      applianceName: route.params.name,
      expiry: route.params.expiry,
    });
  }}
>
  <Text style={styles.reminderButtonText}>
    Set Expiry Reminder
  </Text>
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

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function DocumentRow({
  title,
  uri,
}: {
  title: string;
  uri: string;
}) {
  const handleView = async () => {
    try {
      if (Platform.OS === 'web') {
        const opened = window.open(
          uri,
          '_blank',
          'noopener,noreferrer',
        );

        // Some browsers return null even when the tab opens.
        // Do not treat that return value as an upload failure.
        void opened;
      } else {
        await Linking.openURL(uri);
      }
    } catch {
      showMessage(
        'Could not open document',
        'Please try again.',
      );
    }
  };

  return (
    <View style={styles.documentRow}>
      <Text style={styles.documentIcon}>▧</Text>

      <Text style={styles.documentTitle} numberOfLines={1}>
        {title}
      </Text>

      <Pressable
        onPress={() => {
          void handleView();
        }}
        accessibilityRole="button"
        accessibilityLabel={`View ${title}`}
        hitSlop={10}
      >
        <Text style={styles.viewText}>View</Text>
      </Pressable>
    </View>
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
    fontSize: 20,
    fontWeight: '700',
  },
  headerIcon: {
    color: '#58717F',
    fontSize: 22,
  },
  applianceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DEE8ED',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  applianceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#DDF4FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applianceIconText: {
    color: '#0EA5C6',
    fontSize: 22,
  },
  applianceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  applianceName: {
    color: '#103851',
    fontSize: 14,
    fontWeight: '700',
  },
  model: {
    color: '#58717F',
    fontSize: 11,
    marginTop: 4,
  },
  activeBadge: {
    backgroundColor: '#DDF7ED',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  activeText: {
    color: '#20A86B',
    fontSize: 10,
    fontWeight: '700',
  },
  sectionTitle: {
    color: '#103851',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  infoRow: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 9,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#58717F',
    fontSize: 11,
  },
  infoValue: {
    color: '#103851',
    fontSize: 12,
    fontWeight: '700',
  },
  documentRow: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 9,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  documentIcon: {
    color: '#0EA5C6',
    fontSize: 16,
  },
  documentTitle: {
    flex: 1,
    color: '#103851',
    fontSize: 12,
    marginLeft: 8,
  },
  viewText: {
    color: '#0EA5C6',
    fontSize: 11,
    fontWeight: '700',
  },
  editButton: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0EA5C6',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  editButtonText: {
    color: '#0EA5C6',
    fontWeight: '700',
  },
  reminderButton: {
    height: 46,
    borderRadius: 10,
    backgroundColor: '#0EA5C6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  reminderButtonText: {
    color: '#FFFFFF',
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