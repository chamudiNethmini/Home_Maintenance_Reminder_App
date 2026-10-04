import React, { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type WarrantyStatus = 'Active' | 'Expiring Soon' | 'Expired';

type Warranty = {
  name: string;
  model: string;
  expiry: string;
  status: WarrantyStatus;
  icon: string;
};

const warranties: Warranty[] = [
  {
    name: 'Samsung Refrigerator',
    model: 'Model RT38',
    expiry: 'Expires 15 Mar 2028',
    status: 'Active',
    icon: '▣',
  },
  {
    name: 'LG Washing Machine',
    model: 'Model FHT207',
    expiry: 'Expires 20 Oct 2026',
    status: 'Expiring Soon',
    icon: '▥',
  },
  {
    name: 'Sony TV',
    model: 'Model KD-55X80',
    expiry: 'Expired 10 Jan 2024',
    status: 'Expired',
    icon: '▤',
  },
];

const filters = ['All', 'Active', 'Expiring', 'Expired'] as const;

export default function MyWarrantyScreen() {
  const [selectedFilter, setSelectedFilter] =
    useState<(typeof filters)[number]>('All');
  const [search, setSearch] = useState('');

  const filteredWarranties = useMemo(() => {
    return warranties.filter((warranty) => {
      const matchesSearch = warranty.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        selectedFilter === 'All' ||
        (selectedFilter === 'Expiring'
          ? warranty.status === 'Expiring Soon'
          : warranty.status === selectedFilter);

      return matchesSearch && matchesFilter;
    });
  }, [search, selectedFilter]);

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
                  selectedFilter === filter && styles.selectedFilterText,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </View>

        {filteredWarranties.map((warranty) => (
          <Pressable key={warranty.name} style={styles.card}>
            <View style={styles.applianceIcon}>
              <Text style={styles.applianceIconText}>{warranty.icon}</Text>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.applianceName}>{warranty.name}</Text>
              <Text style={styles.model}>{warranty.model}</Text>
              <Text style={styles.expiry}>{warranty.expiry}</Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                warranty.status === 'Active' && styles.activeBadge,
                warranty.status === 'Expiring Soon' && styles.expiringBadge,
                warranty.status === 'Expired' && styles.expiredBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  warranty.status === 'Active' && styles.activeText,
                  warranty.status === 'Expiring Soon' && styles.expiringText,
                  warranty.status === 'Expired' && styles.expiredText,
                ]}
              >
                {warranty.status}
              </Text>
            </View>
          </Pressable>
        ))}

        {filteredWarranties.length === 0 && (
          <Text style={styles.emptyText}>No warranties found</Text>
        )}

        <Pressable style={styles.addButton}>
          <Text style={styles.addButtonText}>＋ Add Warranty</Text>
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