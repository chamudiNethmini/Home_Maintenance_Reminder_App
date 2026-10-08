import React, { useRef, useState } from 'react';
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

import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import {
  uploadHomeownerDocument,
  type SelectedWarrantyDocument,
} from '../../services/homeownerDocumentService';

import type {
  HomeownerScreenProps,
} from '../../navigation/homeownerTypes';

type DocumentItem = SelectedWarrantyDocument & {
  fileUrl?: string;
};

function showMessage(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

function inferMimeType(name: string): string {
  const extension = name.split('.').pop()?.toLowerCase();

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

export default function UploadDocumentsScreen({
  route,
  navigation,
}: HomeownerScreenProps<'UploadDocuments'>) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const busy = useRef(false);
  const sequence = useRef(0);

  const newId = () => {
    sequence.current += 1;
    return `${Date.now()}_${sequence.current}`;
  };

  const takePhoto = async () => {
    if (busy.current) return;

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

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const name =
          asset.fileName || `warranty_photo_${Date.now()}.jpg`;
        const id = newId();

        setDocuments((previous) => [
          ...previous,
          {
            id,
            name,
            uri: asset.uri,
            mimeType: asset.mimeType || inferMimeType(name),
            size: asset.fileSize,
          },
        ]);
      }
    } catch (cause) {
      showMessage(
        'Camera error',
        cause instanceof Error
          ? cause.message
          : 'Please try again.',
      );
    }
  };

  const chooseFile = async () => {
    if (busy.current) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'application/pdf',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        const id = newId();

        setDocuments((previous) => [
          ...previous,
          {
            id,
            name: file.name,
            uri: file.uri,
            mimeType: file.mimeType || inferMimeType(file.name),
            size: file.size,
          },
        ]);
      }
    } catch (cause) {
      showMessage(
        'File selection failed',
        cause instanceof Error
          ? cause.message
          : 'Please try again.',
      );
    }
  };

  const handleUpload = async () => {
    if (busy.current) return;

    const warrantyId = route.params?.warrantyId;

    if (!warrantyId) {
      showMessage(
        'Warranty required',
        'Open Upload Document from the Add Warranty form.',
      );
      return;
    }

    if (documents.length === 0) {
      showMessage(
        'No document selected',
        'Please select a photo or file first.',
      );
      return;
    }

    busy.current = true;
    setUploading(true);

    try {
      for (const document of documents) {
        // Keep successful uploads when retrying after a failure.
        if (document.fileUrl) continue;

        const saved = await uploadHomeownerDocument(
          warrantyId,
          document,
        );

        setDocuments((previous) =>
          previous.map((item) =>
            item.id === document.id
              ? { ...item, fileUrl: saved.fileUrl }
              : item,
          ),
        );
      }

      // All uploads and Firestore writes have completed.
      if (Platform.OS === 'web') {
        window.alert('Documents uploaded successfully!');
        navigation.goBack();
      } else {
        Alert.alert(
          'Upload successful',
          'Documents uploaded successfully!',
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

  const openDocument = async (document: DocumentItem) => {
    if (!document.fileUrl) {
      showMessage(
        'Not uploaded yet',
        'Click Upload Documents first.',
      );
      return;
    }

    try {
      await Linking.openURL(document.fileUrl);
    } catch {
      showMessage(
        'Could not open document',
        'Please try again.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            disabled={uploading}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.title}>Upload Documents</Text>
          <Text style={styles.notification}>♧</Text>
        </View>

        <Text style={styles.subtitle}>
          Upload warranty card and purchase receipt
        </Text>

        <View style={styles.uploadBox}>
          <Pressable
            style={styles.uploadOption}
            disabled={uploading}
            onPress={takePhoto}
          >
            <Text style={styles.optionIcon}>▧</Text>
            <Text style={styles.optionTitle}>Take Photo</Text>
            <Text style={styles.optionSubtitle}>Use camera</Text>
          </Pressable>

          <Pressable
            style={styles.uploadOption}
            disabled={uploading}
            onPress={chooseFile}
          >
            <Text style={styles.optionIcon}>⌁</Text>
            <Text style={styles.optionTitle}>Choose File</Text>
            <Text style={styles.optionSubtitle}>From device</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Uploaded Documents</Text>

        {documents.map((document) => (
          <Pressable
            key={document.id}
            style={styles.documentCard}
            onPress={() => {
              void openDocument(document);
            }}
          >
            <View style={styles.fileIcon}>
              <Text style={styles.fileIconText}>▧</Text>
            </View>

            <View style={styles.documentInfo}>
              <Text style={styles.documentName}>
                {document.name}
              </Text>

              <Text style={styles.documentType}>
                {document.fileUrl
                  ? 'Uploaded successfully'
                  : 'Selected — not uploaded yet'}
              </Text>
            </View>

            <Text style={styles.successIcon}>
              {document.fileUrl ? '✓' : '…'}
            </Text>
          </Pressable>
        ))}

        <Pressable
          style={[
            styles.uploadButton,
            uploading && { opacity: 0.6 },
          ]}
          disabled={uploading}
          onPress={handleUpload}
        >
          <Text style={styles.uploadButtonText}>
            {uploading ? 'Uploading...' : 'Upload Documents'}
          </Text>
        </Pressable>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Text style={styles.bottomItem}>⌂{'\n'}Home</Text>
        <Text style={styles.bottomItem}>▦{'\n'}Appliances</Text>
        <Text style={styles.bottomItem}>□{'\n'}Calendar</Text>
        <Text
          style={[styles.bottomItem, styles.activeBottomItem]}
        >
          ♙{'\n'}Profile
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F8FA',
  },
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    marginBottom: 24,
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
    marginBottom: 10,
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