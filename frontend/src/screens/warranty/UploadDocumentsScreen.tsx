import React, { useRef, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';

import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import {
  doc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from '../../config/firebase';

import {
  uploadHomeownerDocument,
  type SelectedWarrantyDocument,
} from '../../services/homeownerDocumentService';

import type {
  HomeownerScreenProps,
} from '../../navigation/homeownerTypes';

type DocumentKind =
  | 'warranty_card'
  | 'purchase_receipt';

type DocumentItem = SelectedWarrantyDocument & {
  documentType: DocumentKind;
  fileUrl?: string;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

function showMessage(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

function inferMimeType(name: string): string {
  const extension =
    name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';

    case 'png':
      return 'image/png';

    case 'webp':
      return 'image/webp';

    case 'pdf':
      return 'application/pdf';

    default:
      return 'application/octet-stream';
  }
}

function documentLabel(kind: DocumentKind): string {
  return kind === 'warranty_card'
    ? 'Warranty Card'
    : 'Purchase Receipt';
}

export default function UploadDocumentsScreen({
  route,
  navigation,
}: HomeownerScreenProps<'UploadDocuments'>) {
  const [documents, setDocuments] =
    useState<DocumentItem[]>([]);

  const [uploading, setUploading] = useState(false);
  const [selecting, setSelecting] = useState(false);

  const [menuDocumentId, setMenuDocumentId] =
    useState<string | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const busy = useRef(false);
  const pickerBusy = useRef(false);
  const sequence = useRef(0);

  const disabled =
    uploading || selecting || deletingId !== null;

  const newId = () => {
    sequence.current += 1;

    return `${Date.now()}_${sequence.current}`;
  };

  const addSelection = (
    kind: DocumentKind,
    file: SelectedWarrantyDocument,
  ) => {
    if (!ALLOWED_TYPES.includes(file.mimeType)) {
      showMessage(
        'Unsupported file',
        'Please choose a JPG, PNG, WEBP image or PDF.',
      );
      return;
    }

    if (
      file.size !== undefined &&
      file.size > MAX_FILE_SIZE
    ) {
      showMessage(
        'File too large',
        'Each document must be 5 MB or less.',
      );
      return;
    }

    setMenuDocumentId(null);

    setDocuments((previous) => [
      ...previous.filter(
        (item) => item.documentType !== kind,
      ),
      { ...file, documentType: kind },
    ]);
  };

  const takePhoto = async (kind: DocumentKind) => {
    if (busy.current || pickerBusy.current) {
      return;
    }

    setMenuDocumentId(null);
    pickerBusy.current = true;
    setSelecting(true);

    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        showMessage(
          'Permission required',
          'Camera permission allow pannunga.',
        );
        return;
      }

      const result =
        await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.8,
        });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        const name =
          asset.fileName ||
          `${kind}_${Date.now()}.jpg`;

        addSelection(kind, {
          id: newId(),
          name,
          uri: asset.uri,
          mimeType:
            asset.mimeType || inferMimeType(name),
          size: asset.fileSize,
        });
      }
    } catch (cause) {
      showMessage(
        'Camera error',
        cause instanceof Error
          ? cause.message
          : 'Please try again.',
      );
    } finally {
      pickerBusy.current = false;
      setSelecting(false);
    }
  };

  const chooseFile = async (kind: DocumentKind) => {
    if (busy.current || pickerBusy.current) {
      return;
    }

    setMenuDocumentId(null);
    pickerBusy.current = true;
    setSelecting(true);

    try {
      const result =
        await DocumentPicker.getDocumentAsync({
          type: ALLOWED_TYPES,
          copyToCacheDirectory: true,
          multiple: false,
        });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];

        addSelection(kind, {
          id: newId(),
          name: file.name,
          uri: file.uri,
          mimeType:
            file.mimeType ||
            inferMimeType(file.name),
          size: file.size,
        });
      }
    } catch (cause) {
      showMessage(
        'File selection failed',
        cause instanceof Error
          ? cause.message
          : 'Please try again.',
      );
    } finally {
      pickerBusy.current = false;
      setSelecting(false);
    }
  };

  const deleteDocument = async (
    selected: DocumentItem,
  ) => {
    if (busy.current || pickerBusy.current) {
      return;
    }

    busy.current = true;
    setDeletingId(selected.id);
    setMenuDocumentId(null);

    try {
      // Selected files that have not been uploaded
      // only need to be removed from this screen.
      if (selected.fileUrl) {
        const customerId = auth.currentUser?.uid;
        const warrantyId = route.params?.warrantyId;

        if (!customerId) {
          throw new Error('Please log in first.');
        }

        if (!warrantyId) {
          throw new Error('Warranty record was not found.');
        }

        const warrantyRef = doc(
          db,
          'homeownerWarranties',
          warrantyId,
        );

        await runTransaction(db, async (transaction) => {
          const snapshot =
            await transaction.get(warrantyRef);

          if (auth.currentUser?.uid !== customerId) {
            throw new Error(
              'Your session changed. Please log in again.',
            );
          }

          if (!snapshot.exists()) {
            throw new Error(
              'Warranty record was not found.',
            );
          }

          const data = snapshot.data();

          if (data.customerId !== customerId) {
            throw new Error(
              'You cannot update this warranty.',
            );
          }

          const storedDocuments: unknown[] =
            Array.isArray(data.documents)
              ? data.documents
              : [];

          const remainingDocuments =
            storedDocuments.filter((value) => {
              if (!value || typeof value !== 'object') {
                return true;
              }

              const stored =
                value as Record<string, unknown>;

              return stored.id !== selected.id;
            });

          transaction.update(warrantyRef, {
            documents: remainingDocuments,
            updatedAt: serverTimestamp(),
          });
        });
      }

      setDocuments((previous) =>
        previous.filter(
          (item) => item.id !== selected.id,
        ),
      );
    } catch (cause) {
      showMessage(
        'Could not delete document',
        cause instanceof Error
          ? cause.message
          : 'Please try again.',
      );
    } finally {
      busy.current = false;
      setDeletingId(null);
    }
  };

  const handleUpload = async () => {
    if (busy.current || pickerBusy.current) {
      return;
    }

    const warrantyId = route.params?.warrantyId;

    if (!warrantyId) {
      showMessage(
        'Warranty required',
        'Open Upload Document from the Add Warranty form.',
      );
      return;
    }

    const card = documents.find(
      (item) =>
        item.documentType === 'warranty_card',
    );

    const receipt = documents.find(
      (item) =>
        item.documentType === 'purchase_receipt',
    );

    if (!card && !receipt) {
      showMessage(
        'Documents required',
        'Warranty card and purchase receipt are required.',
      );
      return;
    }

    if (!card) {
      showMessage(
        'Warranty card required',
        'Please select your warranty card before uploading.',
      );
      return;
    }

    if (!receipt) {
      showMessage(
        'Purchase receipt required',
        'Purchase receipt is required. Please select it before uploading.',
      );
      return;
    }

    const customerId = auth.currentUser?.uid;

    if (!customerId) {
      showMessage(
        'Login required',
        'Please log in first.',
      );
      return;
    }

    setMenuDocumentId(null);
    busy.current = true;
    setUploading(true);

    try {
      const selectedDocuments = [card, receipt];

      for (const document of selectedDocuments) {
        // Retry only files that did not finish uploading.
        if (document.fileUrl) {
          continue;
        }

        const saved = await uploadHomeownerDocument(
          warrantyId,
          document,
        );

        setDocuments((previous) =>
          previous.map((item) =>
            item.id === document.id
              ? {
                  ...item,
                  fileUrl: saved.fileUrl,
                }
              : item,
          ),
        );
      }

      const warrantyRef = doc(
        db,
        'homeownerWarranties',
        warrantyId,
      );

      await runTransaction(db, async (transaction) => {
        const snapshot =
          await transaction.get(warrantyRef);

        if (auth.currentUser?.uid !== customerId) {
          throw new Error(
            'Your session changed. Please log in again.',
          );
        }

        if (!snapshot.exists()) {
          throw new Error(
            'Warranty record was not found.',
          );
        }

        const data = snapshot.data();

        if (data.customerId !== customerId) {
          throw new Error(
            'You cannot update this warranty.',
          );
        }

        const storedDocuments: unknown[] =
          Array.isArray(data.documents)
            ? data.documents
            : [];

        const updatedDocuments =
          storedDocuments.map((value) => {
            if (!value || typeof value !== 'object') {
              return value;
            }

            const stored =
              value as Record<string, unknown>;

            const selected = selectedDocuments.find(
              (item) => item.id === stored.id,
            );

            return selected
              ? {
                  ...stored,
                  documentType: selected.documentType,
                }
              : stored;
          });

        for (const selected of selectedDocuments) {
          const found =
            updatedDocuments.some((value) => {
              if (
                !value ||
                typeof value !== 'object'
              ) {
                return false;
              }

              const stored =
                value as Record<string, unknown>;

              return (
                stored.id === selected.id &&
                typeof stored.fileUrl === 'string' &&
                stored.fileUrl.startsWith('https://')
              );
            });

          if (!found) {
            throw new Error(
              `${documentLabel(selected.documentType)} was not saved. Please retry.`,
            );
          }
        }

        transaction.update(warrantyRef, {
          documents: updatedDocuments,
          updatedAt: serverTimestamp(),
        });
      });

      if (Platform.OS === 'web') {
        window.alert(
          'Documents uploaded successfully!',
        );
        navigation.goBack();
      } else {
        Alert.alert(
          'Upload successful',
          'Warranty card and purchase receipt uploaded successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
          { cancelable: false },
        );
      }
    } catch (cause) {
      showMessage(
        'Upload failed',
        cause instanceof Error
          ? cause.message
          : 'Please try again.',
      );
    } finally {
      busy.current = false;
      setUploading(false);
    }
  };

  const openDocument = async (
    document: DocumentItem,
  ) => {
    if (busy.current || pickerBusy.current) {
      return;
    }

    setMenuDocumentId(null);

    if (!document.fileUrl) {
      showMessage(
        'Not uploaded yet',
        'Click Upload Documents first.',
      );
      return;
    }

    try {
      if (Platform.OS === 'web') {
        window.open(
          document.fileUrl,
          '_blank',
          'noopener,noreferrer',
        );
      } else {
        await Linking.openURL(document.fileUrl);
      }
    } catch {
      showMessage(
        'Could not open document',
        'Please try again.',
      );
    }
  };

  const renderDocumentSection = (
    kind: DocumentKind,
  ) => {
    const selected = documents.find(
      (item) => item.documentType === kind,
    );

    return (
      <View key={kind}>
        <Text style={styles.sectionTitle}>
          {documentLabel(kind)} *
        </Text>

        <View style={styles.uploadBox}>
          <Pressable
            style={styles.uploadOption}
            disabled={disabled}
            onPress={() => {
              void takePhoto(kind);
            }}
          >
            <Text style={styles.optionIcon}>▧</Text>

            <Text style={styles.optionTitle}>
              Take Photo
            </Text>

            <Text style={styles.optionSubtitle}>
              Use camera
            </Text>
          </Pressable>

          <Pressable
            style={styles.uploadOption}
            disabled={disabled}
            onPress={() => {
              void chooseFile(kind);
            }}
          >
            <Text style={styles.optionIcon}>⌁</Text>

            <Text style={styles.optionTitle}>
              Choose File
            </Text>

            <Text style={styles.optionSubtitle}>
              From device
            </Text>
          </Pressable>
        </View>

        {selected ? (
          <View style={styles.documentWrapper}>
            <View
              style={[
                styles.documentCard,
                styles.documentCardWithMenu,
              ]}
            >
              <Pressable
                style={styles.documentOpenButton}
                disabled={disabled}
                onPress={() => {
                  void openDocument(selected);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Open ${documentLabel(kind)}`}
              >
                <View style={styles.fileIcon}>
                  <Text style={styles.fileIconText}>
                    ▧
                  </Text>
                </View>

                <View style={styles.documentInfo}>
                  <Text
                    style={styles.documentName}
                    numberOfLines={2}
                  >
                    {selected.name}
                  </Text>

                  <Text style={styles.documentType}>
                    {deletingId === selected.id
                      ? 'Deleting...'
                      : selected.fileUrl
                        ? 'Uploaded successfully'
                        : 'Selected — not uploaded yet'}
                  </Text>
                </View>

                {selected.fileUrl && (
                  <Text style={styles.successIcon}>
                    ✓
                  </Text>
                )}
              </Pressable>

              <Pressable
                style={styles.menuButton}
                disabled={disabled}
                onPress={() => {
                  if (busy.current || pickerBusy.current) {
                    return;
                  }

                  setMenuDocumentId((previous) =>
                    previous === selected.id
                      ? null
                      : selected.id,
                  );
                }}
                accessibilityRole="button"
                accessibilityLabel={`${documentLabel(kind)} options`}
                accessibilityState={{
                  expanded: menuDocumentId === selected.id,
                  disabled,
                }}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={22}
                  color="#087F80"
                />
              </Pressable>
            </View>

            {menuDocumentId === selected.id && (
              <View style={styles.documentMenu}>
                <Pressable
                  style={styles.deleteButton}
                  disabled={disabled}
                  onPress={() => {
                    void deleteDocument(selected);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${documentLabel(kind)}`}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color="#E64646"
                  />

                  <Text style={styles.deleteText}>
                    Delete
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.emptyText}>
            No {documentLabel(kind).toLowerCase()} selected.
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaProvider style={styles.safeArea}>
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'right', 'bottom', 'left']}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            disabled={disabled}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.title}>
            Upload Documents
          </Text>

          <Text style={styles.notification}>♧</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>
            Warranty card and purchase receipt are both required.
          </Text>

          {renderDocumentSection('warranty_card')}

          {renderDocumentSection('purchase_receipt')}

          <Pressable
            style={[
              styles.uploadButton,
              disabled && styles.disabledButton,
            ]}
            disabled={disabled}
            onPress={() => {
              void handleUpload();
            }}
          >
            <Text style={styles.uploadButtonText}>
              {uploading
                ? 'Uploading...'
                : 'Upload Documents'}
            </Text>
          </Pressable>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            style={styles.navigationItem}
            disabled={disabled}
            onPress={() =>
              navigation.navigate('Dashboard')
            }
          >
            <Ionicons
              name="home-outline"
              size={22}
              color="#58717F"
            />

            <Text style={styles.navigationText}>
              Home
            </Text>
          </Pressable>

          <Pressable
            style={styles.navigationItem}
            disabled={disabled}
            onPress={() =>
              navigation.navigate('MyAppliances')
            }
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
            disabled={disabled}
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
            disabled={disabled}
            onPress={() =>
              navigation.navigate('Profile')
            }
          >
            <Ionicons
              name="person-outline"
              size={22}
              color="#58717F"
            />

            <Text style={styles.navigationText}>
              Profile
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F8FA',
  },

  scroll: {
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
    marginRight: 8,
    color: '#103851',
    fontSize: 20,
    fontWeight: '700',
  },

  notification: {
    color: '#58717F',
    fontSize: 22,
  },

  subtitle: {
    color: '#58717F',
    fontSize: 13,
    marginBottom: 20,
  },

  uploadBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  uploadOption: {
    width: '47%',
    height: 105,
    borderRadius: 12,
    backgroundColor: '#DDF4FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionIcon: {
    color: '#0EA5C6',
    fontSize: 25,
    marginBottom: 6,
  },

  optionTitle: {
    color: '#103851',
    fontSize: 12,
    fontWeight: '700',
  },

  optionSubtitle: {
    color: '#58717F',
    fontSize: 10,
    marginTop: 3,
  },

  sectionTitle: {
    color: '#103851',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },

  documentCard: {
    minHeight: 65,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  fileIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F1F9F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  fileIconText: {
    color: '#0EA5C6',
    fontSize: 18,
  },

  documentInfo: {
    flex: 1,
    marginLeft: 10,
  },

  documentName: {
    color: '#103851',
    fontSize: 12,
    fontWeight: '600',
  },

  documentType: {
    color: '#58717F',
    fontSize: 10,
    marginTop: 3,
  },

  successIcon: {
    color: '#20A86B',
    fontSize: 20,
    fontWeight: '700',
  },

  emptyText: {
    color: '#58717F',
    fontSize: 12,
    marginBottom: 24,
  },

  uploadButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: '#0EA5C6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },

  uploadButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
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

  disabledButton: {
    opacity: 0.6,
  },

  documentWrapper: {
    marginBottom: 24,
  },

  documentCardWithMenu: {
    marginBottom: 0,
  },

  documentOpenButton: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuButton: {
    width: 44,
    height: 44,
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  documentMenu: {
    alignSelf: 'flex-end',
    minWidth: 130,
    marginTop: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 10,
  },

  deleteButton: {
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  deleteText: {
    color: '#E64646',
    fontSize: 13,
    fontWeight: '600',
  },
});