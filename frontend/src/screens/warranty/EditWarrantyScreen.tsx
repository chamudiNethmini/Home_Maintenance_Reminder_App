import React, { useState } from 'react';

import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import type {
  HomeownerScreenProps,
} from '../../navigation/homeownerTypes';

function showMessage(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function EditWarrantyScreen({
  navigation,
}: HomeownerScreenProps<'EditWarranty'>) {
  const [applianceName, setApplianceName] =
    useState('Samsung Refrigerator');

  const [brand, setBrand] = useState('Samsung');

  const [model, setModel] = useState('RT38');

  const [purchaseDate, setPurchaseDate] =
    useState('15 / 03 / 2026');

  const [period, setPeriod] = useState('2 Years');

  const [expiryDate, setExpiryDate] =
    useState('15 / 03 / 2028');

  const handleSaveChanges = () => {
    if (
      !applianceName.trim() ||
      !brand.trim() ||
      !purchaseDate.trim() ||
      !period.trim() ||
      !expiryDate.trim()
    ) {
      showMessage(
        'Required fields',
        'Please complete all required fields.',
      );
      return;
    }

    showMessage(
      'Warranty update',
      'To save changes to the database, open My Warranty, select your warranty, and press Edit Warranty.',
    );
  };

  const handleUpdateDocuments = () => {
    showMessage(
      'Select your warranty',
      'Open My Warranty, select your warranty, press Edit Warranty, and then Update Document.',
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
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.title}>
            Edit Warranty
          </Text>

          <Ionicons
            name="notifications-outline"
            size={22}
            color="#58717F"
          />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.subtitle}>
            Update warranty information
          </Text>

          <Text style={styles.label}>
            Appliance Name *
          </Text>

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

          <Text style={styles.label}>
            Model (Optional)
          </Text>

          <TextInput
            value={model}
            onChangeText={setModel}
            style={styles.input}
          />

          <Text style={styles.label}>
            Purchase Date *
          </Text>

          <TextInput
            value={purchaseDate}
            onChangeText={setPurchaseDate}
            placeholder="DD / MM / YYYY"
            placeholderTextColor="#8CA0AA"
            style={styles.input}
          />

          <Text style={styles.label}>
            Warranty Period *
          </Text>

          <TextInput
            value={period}
            onChangeText={setPeriod}
            placeholder="Enter warranty period"
            placeholderTextColor="#8CA0AA"
            style={styles.input}
          />

          <Text style={styles.label}>
            Warranty Expiry Date *
          </Text>

          <TextInput
            value={expiryDate}
            onChangeText={setExpiryDate}
            placeholder="DD / MM / YYYY"
            placeholderTextColor="#8CA0AA"
            style={styles.input}
          />

          <Pressable
            style={styles.documentButton}
            onPress={handleUpdateDocuments}
          >
            <Text style={styles.documentIcon}>▧</Text>

            <Text style={styles.documentButtonText}>
              Update Documents
            </Text>
          </Pressable>

          <Pressable
            style={styles.saveButton}
            onPress={handleSaveChanges}
          >
            <Text style={styles.saveText}>
              Save Changes
            </Text>
          </Pressable>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            style={styles.navigationItem}
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
    paddingTop: 12,
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
    paddingVertical: 4,
  },

  navigationText: {
    fontSize: 10,
    color: '#58717F',
  },
});