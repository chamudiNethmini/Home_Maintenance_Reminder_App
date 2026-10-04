import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type DocumentItem = {
  name: string;
  type: string;
};

export default function UploadDocumentsScreen() {
  const [documents] = useState<DocumentItem[]>([
    {
      name: 'warranty_card.jpg',
      type: 'Warranty Card',
    },
    {
      name: 'purchase_receipt.pdf',
      type: 'Purchase Receipt',
    },
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.title}>Upload Documents</Text>

          <Text style={styles.notification}>♧</Text>
        </View>

        <Text style={styles.subtitle}>
          Upload warranty card and purchase receipt
        </Text>

        <View style={styles.uploadBox}>
          <Pressable style={styles.uploadOption}>
            <Text style={styles.optionIcon}>▧</Text>
            <Text style={styles.optionTitle}>Take Photo</Text>
            <Text style={styles.optionSubtitle}>Use camera</Text>
          </Pressable>

          <Pressable style={styles.uploadOption}>
            <Text style={styles.optionIcon}>⌁</Text>
            <Text style={styles.optionTitle}>Choose File</Text>
            <Text style={styles.optionSubtitle}>From device</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Uploaded Documents</Text>

        {documents.map((document) => (
          <View key={document.name} style={styles.documentCard}>
            <View style={styles.fileIcon}>
              <Text style={styles.fileIconText}>▧</Text>
            </View>

            <View style={styles.documentInfo}>
              <Text style={styles.documentName}>{document.name}</Text>
              <Text style={styles.documentType}>{document.type}</Text>
            </View>

            <Text style={styles.successIcon}>✓</Text>
          </View>
        ))}

        <Pressable style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>Upload Documents</Text>
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