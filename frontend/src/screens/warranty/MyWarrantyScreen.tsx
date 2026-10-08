import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import { db } from '../../config/firebase';
import { useAuth } from '../../components/auth/AuthContext';
import {
  getHomeownerAppliances,
} from '../../services/homeownerApplianceService';

import type {
  HomeownerScreenProps,
} from '../../navigation/homeownerTypes';

type WarrantyStatus = 'Active' | 'Expiring Soon' | 'Expired';

type WarrantyItem = {
  warrantyId: string;
  applianceId: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  expiry: string;
  status: WarrantyStatus;
  icon: string;
  purchaseDate: string;
  warrantyPeriod: string;
};

const filters = ['All', 'Active', 'Expiring', 'Expired'] as const;

function parseDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());

  if (!match) {
    throw new Error('A saved warranty has an invalid date.');
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error('A saved warranty has an invalid date.');
  }

  return date;
}

function displayDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function calculateStatus(expiry: Date): WarrantyStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (expiry < today) return 'Expired';

  const threshold = new Date(today);
  threshold.setDate(threshold.getDate() + 30);

  return expiry <= threshold ? 'Expiring Soon' : 'Active';
}

function calculatePeriod(purchase: Date, expiry: Date): string {
  const months =
    (expiry.getFullYear() - purchase.getFullYear()) * 12 +
    expiry.getMonth() -
    purchase.getMonth();

  if (expiry.getDate() === purchase.getDate() && months > 0) {
    if (months % 12 === 0) {
      const years = months / 12;
      return `${years} ${years === 1 ? 'Year' : 'Years'}`;
    }

    return `${months} ${months === 1 ? 'Month' : 'Months'}`;
  }

  const start = Date.UTC(
    purchase.getFullYear(),
    purchase.getMonth(),
    purchase.getDate(),
  );

  const end = Date.UTC(
    expiry.getFullYear(),
    expiry.getMonth(),
    expiry.getDate(),
  );

  const days = Math.round((end - start) / 86400000);
  return `${days} ${days === 1 ? 'Day' : 'Days'}`;
}

export default function MyWarrantyScreen({
  navigation,
}: HomeownerScreenProps<'MyWarranty'>) {
  const { user } = useAuth();

  const [warranties, setWarranties] = useState<WarrantyItem[]>([]);
  const [selectedFilter, setSelectedFilter] =
    useState<(typeof filters)[number]>('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      setLoading(true);
      setError('');
      setWarranties([]);

      const loadWarranties = async () => {
        try {
          if (!user?.uid) {
            throw new Error('Please log in to view warranties.');
          }

          const [appliances, warrantySnapshot] = await Promise.all([
            getHomeownerAppliances(),
            getDocs(
              query(
                collection(db, 'homeownerWarranties'),
                where('customerId', '==', user.uid),
              ),
            ),
          ]);

          const applianceMap = new Map(
            appliances.map((appliance) => [
              appliance.id,
              appliance,
            ] as const),
          );

          const items: WarrantyItem[] = [];

          for (const document of warrantySnapshot.docs) {
            const data = document.data();

            const applianceId =
              typeof data.applianceId === 'string'
                ? data.applianceId
                : '';

            const appliance = applianceMap.get(applianceId);

            if (!appliance) continue;

            const purchaseValue =
              typeof data.purchaseDate === 'string'
                ? data.purchaseDate
                : appliance.purchaseDate;

            const expiryValue =
              typeof data.expiryDate === 'string'
                ? data.expiryDate
                : '';

            const purchase = parseDate(purchaseValue);
            const expiry = parseDate(expiryValue);

            if (expiry < purchase) {
              throw new Error(
                `Invalid warranty dates for ${appliance.name}.`,
              );
            }

            const savedPeriod =
              typeof data.warrantyPeriod === 'string'
                ? data.warrantyPeriod.trim()
                : '';

            items.push({
              warrantyId: document.id,
              applianceId: appliance.id,
              name: appliance.name,
              brand: appliance.brand,
              model: appliance.model,
              serialNumber: appliance.serialNumber,
              expiry: displayDate(expiry),
              status: calculateStatus(expiry),
              icon:
                appliance.category === 'Laundry'
                  ? '▥'
                  : appliance.category === 'Cooling'
                    ? '▣'
                    : '▤',
              purchaseDate: displayDate(purchase),
              warrantyPeriod:
                savedPeriod || calculatePeriod(purchase, expiry),
            });
          }

          items.sort((a, b) => a.name.localeCompare(b.name));

          if (active) setWarranties(items);
        } catch (cause) {
          if (active) {
            setError(
              cause instanceof Error
                ? cause.message
                : 'Could not load warranties.',
            );
          }
        } finally {
          if (active) setLoading(false);
        }
      };

      void loadWarranties();

      return () => {
        active = false;
      };
    }, [user?.uid, refreshKey]),
  );

  const filteredWarranties = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return warranties.filter((warranty) => {
      const matchesSearch =
        `${warranty.name} ${warranty.brand} ${warranty.model}`
          .toLowerCase()
          .includes(searchValue);

      const matchesFilter =
        selectedFilter === 'All' ||
        (selectedFilter === 'Expiring'
          ? warranty.status === 'Expiring Soon'
          : warranty.status === selectedFilter);

      return matchesSearch && matchesFilter;
    });
  }, [warranties, search, selectedFilter]);

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
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.title}>My Warranty</Text>

          <View style={styles.profileBox}>
            <Text style={styles.profileText}>K</Text>
            <Text style={styles.profileName}>Kavi</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Your appliance protection at a glance
        </Text>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="⌕  Search warranties"
          placeholderTextColor="#8CA0AA"
          style={styles.searchInput}
        />

        <View style={styles.filterRow}>
          {filters.map((filter) => (
            <Pressable
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.selectedFilter,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter &&
                    styles.selectedFilterText,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </View>

        {loading && (
          <Text style={styles.emptyText}>
            Loading warranties...
          </Text>
        )}

        {!!error && (
          <View>
            <Text style={[styles.emptyText, { color: '#E64646' }]}>
              {error}
            </Text>

            <Pressable
              onPress={() => setRefreshKey((value) => value + 1)}
              style={styles.filterButton}
            >
              <Text style={styles.filterText}>Try Again</Text>
            </Pressable>
          </View>
        )}

        {!loading && !error &&
          filteredWarranties.map((warranty) => (
            <Pressable
              key={warranty.warrantyId}
              style={styles.card}
              onPress={() => {
                navigation.navigate('WarrantyDetails', {
                  applianceId: warranty.applianceId,
                  name: warranty.name,
                  brand: warranty.brand,
                  model: warranty.model,
                  serialNumber: warranty.serialNumber,
                  expiry: warranty.expiry,
                  status: warranty.status,
                  icon: warranty.icon,
                  purchaseDate: warranty.purchaseDate,
                  warrantyPeriod: warranty.warrantyPeriod,
                });
              }}
            >
              <View style={styles.applianceIcon}>
                <Text style={styles.applianceIconText}>
                  {warranty.icon}
                </Text>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.applianceName}>
                  {warranty.name}
                </Text>

                <Text style={styles.model}>
                  Model {warranty.model}
                </Text>

                <Text style={styles.expiry}>
                  Expires {warranty.expiry}
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  warranty.status === 'Active' &&
                    styles.activeBadge,
                  warranty.status === 'Expiring Soon' &&
                    styles.expiringBadge,
                  warranty.status === 'Expired' &&
                    styles.expiredBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    warranty.status === 'Active' &&
                      styles.activeText,
                    warranty.status === 'Expiring Soon' &&
                      styles.expiringText,
                    warranty.status === 'Expired' &&
                      styles.expiredText,
                  ]}
                >
                  {warranty.status}
                </Text>
              </View>
            </Pressable>
          ))}

        {!loading && !error && filteredWarranties.length === 0 && (
          <Text style={styles.emptyText}>
            {warranties.length === 0
              ? 'No saved warranties yet. Add a warranty for your appliance.'
              : 'No warranties found'}
          </Text>
        )}

        <Pressable
          style={styles.addButton}
          onPress={() => navigation.navigate('MyAppliances')}
        >
          <Text style={styles.addButtonText}>
            ＋ Add Warranty
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
    marginBottom: 12,
  },
  searchInput: {
    height: 46,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    paddingHorizontal: 14,
    color: '#103851',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterButton: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
  },
  selectedFilter: {
    backgroundColor: '#0EA5C6',
    borderColor: '#0EA5C6',
  },
  filterText: {
    color: '#58717F',
    fontSize: 11,
  },
  selectedFilterText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  card: {
    minHeight: 94,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DEE8ED',
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  applianceIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#DDF4FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applianceIconText: {
    color: '#0EA5C6',
    fontSize: 20,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  applianceName: {
    color: '#103851',
    fontWeight: '700',
    fontSize: 14,
  },
  model: {
    color: '#58717F',
    fontSize: 11,
    marginTop: 3,
  },
  expiry: {
    color: '#8CA0AA',
    fontSize: 10,
    marginTop: 5,
  },
  statusBadge: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  activeBadge: {
    borderColor: '#38C88A',
  },
  expiringBadge: {
    borderColor: '#F5A623',
  },
  expiredBadge: {
    borderColor: '#FF5C5C',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '600',
  },
  activeText: {
    color: '#20A86B',
  },
  expiringText: {
    color: '#D88900',
  },
  expiredText: {
    color: '#E64646',
  },
  emptyText: {
    color: '#58717F',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 16,
  },
  addButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: '#0EA5C6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  addButtonText: {
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