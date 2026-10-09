import React, { useEffect, useRef, useState } from 'react';

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
import DateTimePicker from '@react-native-community/datetimepicker';

import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

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
      'jan',
      'feb',
      'mar',
      'apr',
      'may',
      'jun',
      'jul',
      'aug',
      'sep',
      'oct',
      'nov',
      'dec',
    ];

    const monthIndex = months.indexOf(
      named[2].toLowerCase(),
    );

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

    const [year, month, day] = formatted
      .split('-')
      .map(Number);

    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date;
    }
  } catch {
    // The field stays empty until a date is selected.
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

function showMessage(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function AddWarrantyScreen({
  route,
  navigation,
}: HomeownerScreenProps<'AddWarranty'>) {
  const isEdit = route.params.mode === 'edit';

  const {
    applianceId,
    applianceName,
    brand,
    model,
    purchaseDate,
    serialNumber,
  } = route.params;

  const [warrantyPeriod, setWarrantyPeriod] =
    useState('');

  const [expiryDate, setExpiryDate] = useState('');

  const [showExpiryCalendar, setShowExpiryCalendar] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [loadingWarranty, setLoadingWarranty] =
    useState(isEdit);

  const [loadError, setLoadError] = useState('');

  const savingRef = useRef(false);

  useEffect(() => {
    let active = true;

    setWarrantyPeriod('');
    setExpiryDate('');
    setLoadError('');
    setShowExpiryCalendar(false);

    if (!isEdit) {
      setLoadingWarranty(false);
      return;
    }

    setLoadingWarranty(true);

    const loadWarranty = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          throw new Error('Please log in first.');
        }

        const customerId = user.uid;

        const warrantyId =
          `${customerId}_${encodeURIComponent(applianceId)}`;

        const snapshot = await getDoc(
          doc(db, 'homeownerWarranties', warrantyId),
        );

        if (!active) {
          return;
        }

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

        if (
          data.customerId !== customerId ||
          data.applianceId !== applianceId
        ) {
          throw new Error(
            'You cannot edit this warranty.',
          );
        }

        setWarrantyPeriod(
          typeof data.warrantyPeriod === 'string'
            ? data.warrantyPeriod
            : '',
        );

        setExpiryDate(
          typeof data.expiryDate === 'string'
            ? data.expiryDate
            : '',
        );
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : 'Could not load warranty.',
          );
        }
      } finally {
        if (active) {
          setLoadingWarranty(false);
        }
      }
    };

    void loadWarranty();

    return () => {
      active = false;
    };
  }, [applianceId, isEdit]);

  const busy =
    saving || loadingWarranty || !!loadError;

  const validateWarrantyFields = () => {
    if (
      !applianceName.trim() ||
      !brand.trim() ||
      !model.trim() ||
      !serialNumber.trim() ||
      !purchaseDate.trim()
    ) {
      showMessage(
        'Appliance details required',
        'Please complete the appliance details on the appliance page first.',
      );

      return false;
    }

    if (!warrantyPeriod.trim()) {
      showMessage(
        'Warranty period required',
        'Please enter the warranty period.',
      );

      return false;
    }

    if (!expiryDate.trim()) {
      showMessage(
        'Expiry date required',
        'Please enter or select the warranty expiry date.',
      );

      return false;
    }

    return true;
  };

  const handleUploadDocuments = async () => {
    if (
      busy ||
      savingRef.current ||
      !validateWarrantyFields()
    ) {
      return;
    }

    savingRef.current = true;
    setSaving(true);

    try {
      const warrantyId =
        await saveHomeownerWarranty({
          applianceId,
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
      savingRef.current = false;
      setSaving(false);
    }
  };

  const handleSaveWarranty = async () => {
    if (
      busy ||
      savingRef.current ||
      !validateWarrantyFields()
    ) {
      return;
    }

    savingRef.current = true;
    setSaving(true);

    try {
      await saveHomeownerWarranty({
        applianceId,
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
              onPress: () =>
                navigation.navigate('MyWarranty'),
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
      savingRef.current = false;
      setSaving(false);
    }
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

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.subtitle}>
            {isEdit
              ? 'Update warranty information'
              : 'Register appliance warranty information'}
          </Text>

          {loadingWarranty && (
            <Text style={styles.subtitle}>
              Loading saved warranty...
            </Text>
          )}

          {!!loadError && (
            <Text style={styles.errorText}>
              {loadError}
            </Text>
          )}

          <Text style={styles.label}>
            Appliance Name *
          </Text>

          <TextInput
            value={applianceName}
            style={styles.input}
            editable={false}
          />

          <Text style={styles.label}>Brand *</Text>

          <TextInput
            value={brand}
            style={styles.input}
            editable={false}
          />

          <Text style={styles.label}>Model *</Text>

          <TextInput
            value={model}
            style={styles.input}
            editable={false}
          />

          <Text style={styles.label}>
            Purchase Date *
          </Text>

          <TextInput
            value={purchaseDate}
            style={styles.input}
            editable={false}
          />

          <Text style={styles.label}>
            Warranty Period *
          </Text>

          <TextInput
            value={warrantyPeriod}
            onChangeText={setWarrantyPeriod}
            placeholder="Enter warranty period"
            placeholderTextColor="#8CA0AA"
            style={styles.input}
            editable={!busy}
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
                style={styles.webDateText}
                editable={!busy}
              />

              <Ionicons
                name="calendar-outline"
                size={22}
                color="#087F80"
              />
            </View>
          ) : (
            <View style={styles.dateInput}>
              <TextInput
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="DD / MM / YYYY"
                placeholderTextColor="#8CA0AA"
                style={styles.webDateText}
                editable={!busy}
              />

              <Pressable
                disabled={busy}
                onPress={() =>
                  setShowExpiryCalendar(true)
                }
                hitSlop={10}
                accessibilityLabel="Choose warranty expiry date"
              >
                <Ionicons
                  name="calendar-outline"
                  size={22}
                  color="#087F80"
                />
              </Pressable>
            </View>
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
                    setExpiryDate(
                      formatDisplayDate(date),
                    );
                  }
                }}
              />
            )}

          <Pressable
            style={[
              styles.uploadButton,
              busy && styles.disabledButton,
            ]}
            disabled={busy}
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
              busy && styles.disabledButton,
            ]}
            onPress={handleSaveWarranty}
            disabled={busy}
          >
            <Text style={styles.saveText}>
              {saving
                ? 'Saving...'
                : loadingWarranty
                  ? 'Loading...'
                  : isEdit
                    ? 'Save Changes'
                    : 'Save Warranty'}
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

  webDateText: {
    flex: 1,
    color: '#103851',
    fontSize: 13,
    marginRight: 8,
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

  bottomNavButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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

  errorText: {
    color: '#E64646',
    fontSize: 13,
    marginBottom: 16,
  },
});