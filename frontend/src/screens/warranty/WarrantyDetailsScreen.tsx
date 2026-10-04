import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function WarrantyDetailsScreen() {
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

          <Text style={styles.title}>Warranty Details</Text>
          <Text style={styles.headerIcon}>♧</Text>
        </View>

        <View style={styles.applianceCard}>
          <View style={styles.applianceIcon}>
            <Text style={styles.applianceIconText}>▣</Text>
          </View>

          <View style={styles.applianceInfo}>
            <Text style={styles.applianceName}>Samsung Refrigerator</Text>
            <Text style={styles.model}>Samsung • RT38</Text>
          </View>

          <View style={styles.activeBadge}>
            <Text style={styles.activeText}>Active</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Warranty Information</Text>

        <InfoRow label="Purchase Date" value="15 Mar 2026" />
        <InfoRow label="Warranty Period" value="2 Years" />
        <InfoRow label="Expiry Date" value="15 Mar 2028" />

        <Text style={styles.sectionTitle}>Documents</Text>

        <DocumentRow title="Warranty Card" />
        <DocumentRow title="Purchase Receipt" />

        <Pressable style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Warranty</Text>
        </Pressable>

        <Pressable style={styles.reminderButton}>
          <Text style={styles.reminderButtonText}>Set Expiry Reminder</Text>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function DocumentRow({ title }: { title: string }) {
  return (
    <View style={styles.documentRow}>
      <Text style={styles.documentIcon}>▧</Text>
      <Text style={styles.documentTitle}>{title}</Text>
      <Pressable>
        <Text style={styles.viewText}>View</Text>
      </Pressable>
    </View>
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
    marginBottom: 18,
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
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 9,
    paddingHorizontal: 12,
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
  },
  documentRow: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 9,
    paddingHorizontal: 12,
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
  },
  viewText: {
    color: '#0EA5C6',
    fontSize: 11,
    fontWeight: '700',
  },
  editButton: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0EA5C6',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  editButtonText: {
    color: '#0EA5C6',
    fontWeight: '700',
  },
  reminderButton: {
    height: 46,
    borderRadius: 10,
    backgroundColor: '#0EA5C6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  reminderButtonText: {
    color: '#FFFFFF',
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