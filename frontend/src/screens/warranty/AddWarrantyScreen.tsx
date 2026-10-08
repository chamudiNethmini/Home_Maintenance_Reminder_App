import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import {
  saveHomeownerWarranty,
} from '../../services/homeownerWarrantyService';

import type {
  HomeownerScreenProps,
} from '../../navigation/homeownerTypes';

function toDatabaseDate(value: string): string {
  const cleaned = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  const numeric =
    /^(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})$/.exec(cleaned);

  if (numeric) {
    return (
      `${numeric[3]}-` +
      `${numeric[2].padStart(2, '0')}-` +
      `${numeric[1].padStart(2, '0')}`
    );
  }

  const named =
    /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/.exec(cleaned);

  if (named) {
    const months = [
      'jan', 'feb', 'mar', 'apr', 'may', 'jun',
      'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
    ];

    const monthIndex =
      months.indexOf(named[2].toLowerCase());

    if (monthIndex >= 0) {
      return (
        `${named[3]}-` +
        `${String(monthIndex + 1).padStart(2, '0')}-` +
        `${named[1].padStart(2, '0')}`
      );
    }
  }

  throw new Error(
    'Please enter dates as DD/MM/YYYY or YYYY-MM-DD.',
  );
}

function getCalendarDate(value: string): Date {
  try {
    const formatted = toDatabaseDate(value);

    const [year, month, day] =
      formatted.split('-').map(Number);

    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date;
    }
  } catch {
    // Use today's date when the input cannot be parsed.
  }

  return new Date();
}

function formatDisplayDate(date: Date): string {
  return (
    `${String(date.getDate()).padStart(2, '0')} / ` +
    `${String(date.getMonth() + 1).padStart(2, '0')} / ` +
    `${date.getFullYear()}`
  );
}

export default function AddWarrantyScreen({
  route,
  navigation,
}: HomeownerScreenProps<'AddWarranty'>) {
  const isEdit = route.params.mode === 'edit';

  const [applianceName, setApplianceName] =
    useState(route.params.applianceName);

  const [brand, setBrand] =
    useState(route.params.brand);

  const [model, setModel] =
    useState(route.params.model);

  const [purchaseDate, setPurchaseDate] =
    useState(route.params.purchaseDate);

  const [warrantyPeriod, setWarrantyPeriod] =
    useState('2 Years');

  const [expiryDate, setExpiryDate] =
    useState('15 / 03 / 2028');

  const [showExpiryCalendar, setShowExpiryCalendar] =
    useState(false);

  const [serialNumber] =
    useState(route.params.serialNumber);

  const [saving, setSaving] = useState(false);

  const showMessage = (
    title: string,
    message: string,
  ) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const validateWarrantyFields = () => {
    if (
      !applianceName.trim() ||
      !brand.trim() ||
      !model.trim() ||
      !serialNumber.trim() ||
      !purchaseDate.trim() ||
      !warrantyPeriod.trim() ||
      !expiryDate.trim()
    ) {
      showMessage(
        'Required fields',
        'Please fill all warranty details before continuing.',
      );

      return false;
    }

    return true;
  };

  const handleUploadDocuments = async () => {
    if (saving || !validateWarrantyFields()) {
      return;
    }

    setSaving(true);

    try {
      const warrantyId = await saveHomeownerWarranty({
        applianceId: route.params.applianceId,
        purchaseDate: toDatabaseDate(purchaseDate),
        expiryDate: toDatabaseDate(expiryDate),
        warrantyPeriod: warrantyPeriod.trim(),
      });

      navigation.navigate('UploadDocuments', {
        warrantyId,
      });
    } catch (cause) {
      showMessage(
        'Could not save warranty',
        cause instanceof Error
          ? cause.message
          : 'Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWarranty = async () => {
    if (saving || !validateWarrantyFields()) {
      return;
    }

    setSaving(true);

    try {
      await saveHomeownerWarranty({
        applianceId: route.params.applianceId,
        purchaseDate: toDatabaseDate(purchaseDate),
        expiryDate: toDatabaseDate(expiryDate),
        warrantyPeriod: warrantyPeriod.trim(),
      });

      const title = isEdit
        ? '😊 Successfully Updated'
        : '😊 Successfully Added';

      const message = isEdit
        ? 'Warranty updated successfully!'
        : 'Warranty added successfully!';

      if (Platform.OS === 'web') {
        window.alert(`${title}\n\n${message}`);
        navigation.navigate('MyWarranty');
      } else {
        Alert.alert(
          title,
          message,
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('MyWarranty');
              },
            },
          ],
          { cancelable: false },
        );
      }
    } catch (cause) {
      showMessage(
        'Could not save warranty',
        cause instanceof Error
          ? cause.message
          : 'Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={saving}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.title}>
            {isEdit ? 'Edit Warranty' : 'Add Warranty'}
          </Text>

          <View style={styles.profileBox}>
            <Text style={styles.profileText}>K</Text>
            <Text style={styles.profileName}>Kavi</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          {isEdit
            ? 'Update warranty information'
            : 'Register appliance warranty information'}
        </Text>

        <Text style={styles.label}>
          Appliance Name *
        </Text>

        <TextInput
          value={applianceName}
          onChangeText={setApplianceName}
          placeholder="Enter appliance name"
          placeholderTextColor="#8CA0AA"
          style={styles.input}
          editable={!saving}
        />

        <Text style={styles.label}>Brand *</Text>

        <TextInput
          value={brand}
          onChangeText={setBrand}
          placeholder="Enter brand"
          placeholderTextColor="#8CA0AA"
          style={styles.input}
          editable={!saving}
        />

        <Text style={styles.label}>Model *</Text>

        <TextInput
          value={model}
          onChangeText={setModel}
          placeholder="Enter model number"
          placeholderTextColor="#8CA0AA"
          style={styles.input}
          editable={!saving}
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
          editable={!saving}
        />

        <Text style={styles.label}>
          Warranty Period *
        </Text>

        <TextInput
          value={warrantyPeriod}
          onChangeText={setWarrantyPeriod}
          placeholder="Example: 2 Years"
          placeholderTextColor="#8CA0AA"
          style={styles.input}
          editable={!saving}
        />

        <Text style={styles.label}>
          Warranty Expiry Date *
        </Text>

        {Platform.OS === 'web' ? (
          <View style={styles.dateInput}>
            <TextInput
              value={expiryDate}
              onChangeText={setExpiryDate}
              placeholder="DD / MM / YYYY"
              placeholderTextColor="#8CA0AA"
              style={{
                flex: 1,
                color: '#103851',
                fontSize: 13,
              }}
              editable={!saving}
            />

            <Ionicons
              name="calendar-outline"
              size={22}
              color="#087F80"
            />
          </View>
        ) : (
          <Pressable
            style={styles.dateInput}
            onPress={() => setShowExpiryCalendar(true)}
            disabled={saving}
          >
            <Text style={styles.dateText}>
              {expiryDate || 'DD / MM / YYYY'}
            </Text>

            <Ionicons
              name="calendar-outline"
              size={22}
              color="#087F80"
            />
          </Pressable>
        )}

        {showExpiryCalendar &&
          Platform.OS !== 'web' && (
            <DateTimePicker
              value={getCalendarDate(expiryDate)}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowExpiryCalendar(false);

                if (event.type === 'set' && date) {
                  setExpiryDate(formatDisplayDate(date));
                }
              }}
            />
          )}

        <Pressable
          style={styles.uploadButton}
          disabled={saving}
          onPress={handleUploadDocuments}
        >
          <Text style={styles.uploadIcon}>▧</Text>

          <Text style={styles.uploadText}>
            {isEdit
              ? 'Update Document'
              : 'Upload Document'}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.saveButton,
            saving && { opacity: 0.6 },
          ]}
          onPress={handleSaveWarranty}
          disabled={saving}
        >
          <Text style={styles.saveText}>
            {saving
              ? 'Saving...'
              : isEdit
                ? 'Save Changes'
                : 'Save Warranty'}
          </Text>
        </Pressable>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Text style={styles.bottomItem}>
          ⌂{'\n'}Home
        </Text>

        <Text style={styles.bottomItem}>
          ▦{'\n'}Appliances
        </Text>

        <Text style={styles.bottomItem}>
          □{'\n'}Calendar
        </Text>

        <Text
          style={[
            styles.bottomItem,
            styles.activeBottomItem,
          ]}
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
  profileBox: {
    alignItems: 'center',
  },
  profileText: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0EA5C6',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingTop: 6,
    fontWeight: '700',
  },
  profileName: {
    color: '#58717F',
    fontSize: 9,
    marginTop: 2,
  },
  subtitle: {
    color: '#58717F',
    fontSize: 13,
    marginBottom: 16,
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
  dateInput: {
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DEE8ED',
    paddingHorizontal: 13,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    color: '#103851',
    fontSize: 13,
  },
  uploadButton: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0EA5C6',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  uploadIcon: {
    color: '#0EA5C6',
    fontSize: 18,
    marginRight: 8,
  },
  uploadText: {
    color: '#0EA5C6',
    fontWeight: '600',
  },
  saveButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: '#0EA5C6',
    alignItems: 'center',
    justifyContent: 'center',
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