import React, {
  useCallback,
  useRef,
  useState,
} from 'react';

import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

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

import {
  getWarrantyProviders,
  submitHomeownerWarrantyRequest,
  type WarrantyProviderOption,
} from '../../services/homeownerWarrantyRequestService';

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
  const [documents, setDocuments] =
    useState<WarrantyFile[]>([]);

  const [loadingDocuments, setLoadingDocuments] =
    useState(true);

  const [documentError, setDocumentError] =
    useState('');

  const [providers, setProviders] =
    useState<WarrantyProviderOption[]>([]);

  const [providerId, setProviderId] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [requestNotes, setRequestNotes] = useState('');

  const [loadingProviders, setLoadingProviders] =
    useState(false);

  const [sendingRequest, setSendingRequest] =
    useState(false);

  const [requestExists, setRequestExists] =
    useState(false);

  const loadingProvidersRef = useRef(false);
  const sendingRequestRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadDocuments = async () => {
        setLoadingDocuments(true);
        setDocumentError('');
        setDocuments([]);
        setRequestExists(false);

        try {
          const user = auth.currentUser;

          if (!user) {
            throw new Error('Please log in first.');
          }

          const customerId = user.uid;

          const warrantyQuery = query(
            collection(db, 'homeownerWarranties'),
            where('customerId', '==', customerId),
            where(
              'applianceId',
              '==',
              route.params.applianceId,
            ),
          );

          const snapshot = await getDocs(warrantyQuery);

          if (
            !active ||
            auth.currentUser?.uid !== customerId
          ) {
            return;
          }

          if (snapshot.empty) {
            throw new Error(
              'Warranty record was not found.',
            );
          }

          if (snapshot.size > 1) {
            throw new Error(
              'Multiple warranty records exist for this appliance. Please check the records.',
            );
          }

          const data = snapshot.docs[0].data();

          setRequestExists(
            typeof data.warrantyRequestId === 'string' &&
              data.warrantyRequestId.length > 0,
          );

          const storedFiles: unknown[] =
            Array.isArray(data.documents)
              ? data.documents
              : [];

          const files: WarrantyFile[] = [];

          storedFiles.forEach((value, index) => {
            if (!value || typeof value !== 'object') {
              return;
            }

            const file =
              value as Record<string, unknown>;

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

  const loadProviders = async () => {
    if (loadingProvidersRef.current) {
      return;
    }

    loadingProvidersRef.current = true;
    setLoadingProviders(true);

    try {
      const items = await getWarrantyProviders();

      setProviders(items);

      setProviderId((current) => {
        if (
          items.some(
            (provider) => provider.id === current,
          )
        ) {
          return current;
        }

        return items.length === 1
          ? items[0].id
          : '';
      });

      if (items.length === 0) {
        showMessage(
          'No provider found',
          'A warranty provider account must be registered first.',
        );
      }
    } catch (error) {
      showMessage(
        'Could not load providers',
        error instanceof Error
          ? error.message
          : 'Please try again.',
      );
    } finally {
      loadingProvidersRef.current = false;
      setLoadingProviders(false);
    }
  };

  const sendWarrantyRequest = async () => {
    if (sendingRequestRef.current || requestExists) {
      return;
    }

    if (!providerId) {
      showMessage(
        'Provider required',
        'Please choose a warranty provider.',
      );
      return;
    }

    if (!customerPhone.trim()) {
      showMessage(
        'Phone number required',
        'Please enter your phone number.',
      );
      return;
    }

    if (!requestNotes.trim()) {
      showMessage(
        'Description required',
        'Please describe the problem or warranty request.',
      );
      return;
    }

    sendingRequestRef.current = true;
    setSendingRequest(true);

    try {
      await submitHomeownerWarrantyRequest({
        applianceId: route.params.applianceId,
        providerId,
        customerPhone,
        notes: requestNotes,
      });

      setRequestExists(true);
      setRequestNotes('');

      showMessage(
        'Request sent',
        'Your warranty request and provider notification were saved successfully.',
      );
    } catch (error) {
      showMessage(
        'Request failed',
        error instanceof Error
          ? error.message
          : 'Please try again.',
      );
    } finally {
      sendingRequestRef.current = false;
      setSendingRequest(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'bottom', 'left', 'right']}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>
              ‹
            </Text>
          </Pressable>

          <Text style={styles.title}>
            Warranty Details
          </Text>

          <Text style={styles.headerIcon}>
            ♧
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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

          <Text style={styles.sectionTitle}>
            Documents
          </Text>

          {loadingDocuments ? (
            <Text style={styles.infoLabel}>
              Loading documents...
            </Text>
          ) : documentError ? (
            <Text style={styles.infoLabel}>
              {documentError}
            </Text>
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
            <Text style={styles.editButtonText}>
              Edit Warranty
            </Text>
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

          <Text style={styles.requestTitle}>
            Submit Warranty Request
          </Text>

          {requestExists ? (
            <View style={styles.requestNotice}>
              <Text style={styles.infoValue}>
                A warranty request has already been submitted.
              </Text>
            </View>
          ) : (
            <>
              <Pressable
                style={styles.editButton}
                disabled={
                  loadingProviders || sendingRequest
                }
                onPress={() => {
                  void loadProviders();
                }}
              >
                <Text style={styles.editButtonText}>
                  {loadingProviders
                    ? 'Loading...'
                    : 'Choose Warranty Provider'}
                </Text>
              </Pressable>

              {providers.map((provider) => (
                <Pressable
                  key={provider.id}
                  disabled={sendingRequest}
                  style={[
                    styles.infoRow,
                    styles.providerRow,
                    providerId === provider.id &&
                      styles.selectedProvider,
                  ]}
                  onPress={() =>
                    setProviderId(provider.id)
                  }
                >
                  <Text
                    style={styles.providerName}
                    numberOfLines={2}
                  >
                    {provider.name}
                  </Text>

                  <Text style={styles.viewText}>
                    {providerId === provider.id
                      ? '✓ Selected'
                      : 'Select'}
                  </Text>
                </Pressable>
              ))}

              <TextInput
                value={customerPhone}
                onChangeText={setCustomerPhone}
                editable={!sendingRequest}
                keyboardType="phone-pad"
                placeholder="Your phone number"
                placeholderTextColor="#58717F"
                style={styles.requestInput}
              />

              <TextInput
                value={requestNotes}
                onChangeText={setRequestNotes}
                editable={!sendingRequest}
                placeholder="Describe the problem / warranty request"
                placeholderTextColor="#58717F"
                multiline
                textAlignVertical="top"
                style={[
                  styles.requestInput,
                  styles.requestDescription,
                ]}
              />

              <Pressable
                style={[
                  styles.reminderButton,
                  (sendingRequest ||
                    loadingDocuments ||
                    !!documentError) &&
                    styles.disabledButton,
                ]}
                disabled={
                  sendingRequest ||
                  loadingDocuments ||
                  !!documentError
                }
                onPress={() => {
                  void sendWarrantyRequest();
                }}
              >
                <Text style={styles.reminderButtonText}>
                  {sendingRequest
                    ? 'Sending...'
                    : 'Send Warranty Request'}
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>

        <View style={styles.bottomBar}>
  <Pressable
    style={styles.navigationItem}
    onPress={() => navigation.navigate('Dashboard')}
  >
    <Ionicons
      name="home-outline"
      size={22}
      color="#58717F"
    />
    <Text style={styles.navigationText}>Home</Text>
  </Pressable>

  <Pressable
    style={styles.navigationItem}
    onPress={() => navigation.navigate('MyAppliances')}
  >
    <Ionicons
      name="apps-outline"
      size={22}
      color="#58717F"
    />
    <Text style={styles.navigationText}>
      Appliances
    </Text>
  </Pressable>

  <Pressable
    style={styles.navigationItem}
    onPress={() =>
      navigation.navigate('MaintenanceCalendar')
    }
  >
    <Ionicons
      name="calendar-outline"
      size={22}
      color="#58717F"
    />
    <Text style={styles.navigationText}>
      Calendar
    </Text>
  </Pressable>

  <Pressable
    style={styles.navigationItem}
    onPress={() => navigation.navigate('Profile')}
  >
    <Ionicons
      name="person-outline"
      size={22}
      color="#58717F"
    />
    <Text style={styles.navigationText}>Profile</Text>
  </Pressable>
</View>
      </SafeAreaView>
    </SafeAreaProvider>
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
      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text style={styles.infoValue}>
        {value}
      </Text>
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
        window.open(
          uri,
          '_blank',
          'noopener,noreferrer',
        );
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
      <Text style={styles.documentIcon}>
        ▧
      </Text>

      <Text
        style={styles.documentTitle}
        numberOfLines={1}
      >
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
        <Text style={styles.viewText}>
          View
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F8FA',
  },

  scrollView: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#F4F8FA',
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
    lineHeight: 30,
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
    marginRight: 8,
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
    minHeight: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
    flexShrink: 1,
    marginLeft: 8,
  },

  documentRow: {
    minHeight: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
    marginRight: 12,
  },

  viewText: {
    color: '#0EA5C6',
    fontSize: 11,
    fontWeight: '700',
  },

  editButton: {
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0EA5C6',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 20,
  },

  editButtonText: {
    color: '#0EA5C6',
    fontWeight: '700',
    textAlign: 'center',
  },

  reminderButton: {
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: '#0EA5C6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
  },

  reminderButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },

  bottomBar: {
  minHeight: 68,
  paddingTop: 9,
  paddingBottom: 9,
  backgroundColor: '#FFFFFF',
  borderTopWidth: 1,
  borderTopColor: '#DEE8ED',
  flexDirection: 'row',
  justifyContent: 'space-around',
},

navigationItem: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 3,
},

navigationText: {
  fontSize: 10,
  color: '#58717F',
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

  requestTitle: {
    color: '#103851',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 10,
  },

  providerRow: {
    marginTop: 8,
  },

  selectedProvider: {
    borderColor: '#0EA5C6',
  },

  providerName: {
    flex: 1,
    marginRight: 10,
    color: '#103851',
    fontSize: 12,
    fontWeight: '700',
  },

  requestInput: {
    minHeight: 46,
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    color: '#103851',
    fontSize: 13,
  },

  requestDescription: {
    minHeight: 90,
  },

  requestNotice: {
    padding: 14,
    backgroundColor: '#DDF7ED',
    borderRadius: 10,
  },

  disabledButton: {
    opacity: 0.6,
  },
});