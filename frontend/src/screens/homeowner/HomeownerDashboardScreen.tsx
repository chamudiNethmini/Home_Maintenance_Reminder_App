import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Exact FixMate colour palette
const COLORS = {
  background: '#F4F8FA',
  white: '#FFFFFF',
  teal: '#087F80',
  cyan: '#0EA5C6',
  heading: '#103851',
  secondary: '#58717F',
  border: '#DEE8ED',
  preview: '#F1F9F9',
  illustrationLine: '#CEDCE3',
};

export default function HomeownerDashboardScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 18,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.smallHeading}>
              HOME MAINTENANCE
            </Text>

            <Text style={styles.greeting}>
              Good Morning, Chamudi!
            </Text>

            <Text style={styles.subtitle}>
              Here's what's happening with your home today.
            </Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton}>
              <Ionicons
                name="notifications-outline"
                size={23}
                color={COLORS.heading}
              />
            </Pressable>

            <Pressable style={styles.profileButton}>
              <Ionicons
                name="person-outline"
                size={22}
                color={COLORS.white}
              />
            </Pressable>
          </View>
        </View>

        {/* Welcome / Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              Keep Your Home{'\n'}Running Smoothly
            </Text>

            <Text style={styles.heroDescription}>
              Stay ahead of appliance maintenance and keep everything in
              perfect condition.
            </Text>
          </View>

          <View style={styles.heroIllustration}>
            <View style={styles.homeCircle}>
              <Ionicons
                name="home-outline"
                size={45}
                color={COLORS.cyan}
              />
            </View>
          </View>
        </View>

        {/* Maintenance Alert */}
        <View style={styles.alertCard}>
          <View style={styles.alertIconContainer}>
            <Ionicons
              name="time-outline"
              size={25}
              color={COLORS.cyan}
            />
          </View>

          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>
              Maintenance Reminder
            </Text>

            <Text style={styles.alertText}>
              You have maintenance tasks that need your attention.
            </Text>
          </View>

          <Pressable style={styles.reviewButton}>
            <Text style={styles.reviewButtonText}>
              Review
            </Text>
          </Pressable>
        </View>

        {/* Upcoming Maintenance */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Upcoming Maintenance
          </Text>

          <Pressable>
            <Text style={styles.seeAll}>
              See All
            </Text>
          </Pressable>
        </View>

        {/* Maintenance Card 1 */}
        <View style={styles.maintenanceCard}>
          <View style={styles.applianceIcon}>
            <Ionicons
              name="snow-outline"
              size={25}
              color={COLORS.cyan}
            />
          </View>

          <View style={styles.maintenanceInformation}>
            <Text style={styles.maintenanceTitle}>
              AC Filter Cleaning
            </Text>

            <Text style={styles.maintenanceSubtitle}>
              Living Room Air Conditioner
            </Text>
          </View>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              Soon
            </Text>
          </View>
        </View>

        {/* Maintenance Card 2 */}
        <View style={styles.maintenanceCard}>
          <View style={styles.applianceIcon}>
            <Ionicons
              name="water-outline"
              size={25}
              color={COLORS.cyan}
            />
          </View>

          <View style={styles.maintenanceInformation}>
            <Text style={styles.maintenanceTitle}>
              Filter Cleaning
            </Text>

            <Text style={styles.maintenanceSubtitle}>
              Washing Machine
            </Text>
          </View>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              Upcoming
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Quick Actions
          </Text>
        </View>

        <View style={styles.quickActionsGrid}>
          {/* Add Appliance */}
          <Pressable style={styles.quickActionCard}>
            <View style={styles.quickActionIcon}>
              <Ionicons
                name="add-circle-outline"
                size={28}
                color={COLORS.teal}
              />
            </View>

            <Text style={styles.quickActionTitle}>
              Add Appliance
            </Text>

            <Text style={styles.quickActionDescription}>
              Register a new appliance
            </Text>
          </Pressable>

          {/* Calendar */}
          <Pressable style={styles.quickActionCard}>
            <View style={styles.quickActionIcon}>
              <Ionicons
                name="calendar-outline"
                size={27}
                color={COLORS.teal}
              />
            </View>

            <Text style={styles.quickActionTitle}>
              Calendar
            </Text>

            <Text style={styles.quickActionDescription}>
              View maintenance plans
            </Text>
          </Pressable>

          {/* Appliances */}
          <Pressable style={styles.quickActionCard}>
            <View style={styles.quickActionIcon}>
              <Ionicons
                name="apps-outline"
                size={27}
                color={COLORS.teal}
              />
            </View>

            <Text style={styles.quickActionTitle}>
              My Appliances
            </Text>

            <Text style={styles.quickActionDescription}>
              Manage your appliances
            </Text>
          </Pressable>

          {/* Reminders */}
          <Pressable style={styles.quickActionCard}>
            <View style={styles.quickActionIcon}>
              <Ionicons
                name="notifications-outline"
                size={27}
                color={COLORS.teal}
              />
            </View>

            <Text style={styles.quickActionTitle}>
              Reminders
            </Text>

            <Text style={styles.quickActionDescription}>
              Manage maintenance alerts
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View
        style={[
          styles.bottomNavigation,
          {
            paddingBottom:
              Math.max(insets.bottom, 10),
          },
        ]}
      >
        {/* Home */}
        <Pressable style={styles.navigationItem}>
          <Ionicons
            name="home"
            size={22}
            color={COLORS.teal}
          />

          <Text style={styles.activeNavigationText}>
            Home
          </Text>
        </Pressable>

        {/* Appliances */}
        <Pressable style={styles.navigationItem}>
          <Ionicons
            name="apps-outline"
            size={22}
            color={COLORS.secondary}
          />

          <Text style={styles.navigationText}>
            Appliances
          </Text>
        </Pressable>

        {/* Calendar */}
        <Pressable style={styles.navigationItem}>
          <Ionicons
            name="calendar-outline"
            size={22}
            color={COLORS.secondary}
          />

          <Text style={styles.navigationText}>
            Calendar
          </Text>
        </Pressable>

        {/* Profile */}
        <Pressable style={styles.navigationItem}>
          <Ionicons
            name="person-outline"
            size={22}
            color={COLORS.secondary}
          />

          <Text style={styles.navigationText}>
            Profile
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 105,
  },

  // Header

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
  },

  headerText: {
    flex: 1,
    paddingRight: 10,
  },

  smallHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.teal,
    letterSpacing: 1.2,
    marginBottom: 5,
  },

  greeting: {
    fontSize: 25,
    fontWeight: '800',
    color: COLORS.heading,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.secondary,
  },

  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Hero

  heroCard: {
    minHeight: 150,
    backgroundColor: COLORS.preview,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroContent: {
    flex: 1,
    paddingRight: 10,
  },

  heroTitle: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: '800',
    color: COLORS.heading,
  },

  heroDescription: {
    marginTop: 9,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.secondary,
  },

  heroIllustration: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  homeCircle: {
    width: 85,
    height: 85,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.illustrationLine,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Alert

  alertCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },

  alertIconContainer: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: COLORS.preview,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  alertContent: {
    flex: 1,
  },

  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.heading,
  },

  alertText: {
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.secondary,
    marginTop: 3,
  },

  reviewButton: {
    marginLeft: 8,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 9,
  },

  reviewButtonText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },

  // Section Header

  sectionHeader: {
    marginTop: 25,
    marginBottom: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.heading,
  },

  seeAll: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.teal,
  },

  // Maintenance Cards

  maintenanceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },

  applianceIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: COLORS.preview,
    borderWidth: 1,
    borderColor: COLORS.illustrationLine,
    alignItems: 'center',
    justifyContent: 'center',
  },

  maintenanceInformation: {
    flex: 1,
    marginLeft: 11,
  },

  maintenanceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.heading,
  },

  maintenanceSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: COLORS.secondary,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.preview,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.teal,
  },

  // Quick Actions

  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },

  quickActionCard: {
    width: '48%',
    minHeight: 125,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.preview,
    borderWidth: 1,
    borderColor: COLORS.illustrationLine,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },

  quickActionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.heading,
    textAlign: 'center',
  },

  quickActionDescription: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 14,
    color: COLORS.secondary,
    textAlign: 'center',
  },

  // Bottom navigation

  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 68,
    paddingTop: 9,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  navigationItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },

  activeNavigationText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.teal,
  },

  navigationText: {
    fontSize: 10,
    color: COLORS.secondary,
  },
});