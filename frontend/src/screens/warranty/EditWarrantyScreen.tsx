import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function EditWarrantyScreen() {
  const [applianceName, setApplianceName] =
    useState('Samsung Refrigerator');
  const [brand, setBrand] = useState('Samsung');
  const [model, setModel] = useState('RT38');
  const [purchaseDate, setPurchaseDate] =
    useState('15 / 03 / 2026');
  const [period, setPeriod] = useState('2 Years');
  const [expiryDate, setExpiryDate] =
    useState('15 / 03 / 2028');

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

          <Text style={styles.title}>Edit Warranty</Text>
          <Text style={styles.headerIcon}>♧</Text>
        </View>

        <Text style={styles.subtitle}>
          Update warranty information
        </Text>

        <Text style={styles.label}>Appliance Name *</Text>
        <TextInput
          value={applianceName}
          onChangeText={setApplianceName}
          style={styles.input}
        />

        <Text style={styles.label}>Brand *</Text>
        <TextInput
          value={brand}
          onChangeText={setBrand}
          style={styles.input}
        />

        <Text style={styles.label}>Model (Optional)</Text>
        <TextInput
          value={model}
          onChangeText={setModel}
          style={styles.input}
        />

        <Text style={styles.label}>Purchase Date</Text>
        <TextInput
          value={purchaseDate}
          onChangeText={setPurchaseDate}
          style={styles.input}
        />

        <Text style={styles.label}>Warranty Period</Text>
        <TextInput
          value={period}
          onChangeText={setPeriod}
          style={styles.input}
        />

        <Text style={styles.label}>Warranty Expiry Date</Text>
        <TextInput
          value={expiryDate}
          onChangeText={setExpiryDate}
          style={styles.input}
        />

        <Pressable style={styles.documentButton}>
          <Text style={styles.documentIcon}>▧</Text>
          <Text style={styles.documentButtonText}>
            Update Documents
          </Text>
        </Pressable>

        <Pressable style={styles.saveButton}>
          <Text style={styles.saveText}>Save Changes</Text>
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
    paddingBottom: 110,
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
  subtitle: {
    color: '#58717F',
    fontSize: 13,
    marginBottom: 18,
  },
  label: {
    color: '#103851',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DEE8ED',
    paddingHorizontal: 13,
    color: '#103851',
    fontSize: 13,
    marginBottom: 14,
  },
  documentButton: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0EA5C6',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  documentIcon: {
    color: '#0EA5C6',
    fontSize: 17,
    marginRight: 8,
  },
  documentButtonText: {
    color: '#0EA5C6',
    fontWeight: '700',
  },
  saveButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: '#0EA5C6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 14,
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