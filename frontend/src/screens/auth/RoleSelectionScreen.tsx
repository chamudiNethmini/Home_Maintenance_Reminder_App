import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  Brand,
  colors,
  Icon,
} from '../../components/provider/ProviderUI';

import type {
  RootStackParamList,
  UserRole,
} from '../../navigation/rootTypes';

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    'RoleSelection'
  >;

type RoleOption = {
  role: UserRole;
  title: string;
  description: string;

  icon:
    | 'home-outline'
    | 'construct-outline'
    | 'shield-checkmark-outline';
};

const roles: RoleOption[] = [
  {
    role: 'homeowner',
    title: 'Homeowner',
    description: 'Care for your home',
    icon: 'home-outline',
  },
  {
    role: 'technician',
    title: 'Technician',
    description: 'Keep things running',
    icon: 'construct-outline',
  },
  {
    role: 'provider',
    title: 'Warranty Provider',
    description: 'Review, verify & support',
    icon: 'shield-checkmark-outline',
  },
];

export default function RoleSelectionScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.page,
        {
          paddingTop: insets.top + 28,
          paddingBottom: insets.bottom + 28,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.intro}>
          <Brand large />

          <Text style={styles.heading}>
            Welcome Back!
          </Text>

          <Text style={styles.subtitle}>
            A little care. A better home.
            {'\n'}
            Choose your role to continue with FixMate.
          </Text>
        </View>

        <View style={styles.roleSection}>
          <Text style={styles.caption}>
            LOGIN AS
          </Text>

          {roles.map((item) => (
            <Pressable
              key={item.role}
              accessibilityRole="button"
              accessibilityLabel={`Continue as ${item.title}`}
              onPress={() =>
                navigation.navigate(
                  'Login',
                  {
                    role: item.role,
                  },
                )
              }
              style={({ pressed }) => [
                styles.roleCard,

                pressed &&
                  styles.pressed,
              ]}
            >
              <View style={styles.iconBox}>
                <Icon
                  name={item.icon}
                  size={28}
                  color={colors.teal}
                />
              </View>

              <View style={styles.roleText}>
                <Text style={styles.roleTitle}>
                  {item.title}
                </Text>

                <Text
                  style={
                    styles.roleDescription
                  }
                >
                  {item.description}
                </Text>
              </View>

              <Icon
                name="chevron-forward"
                size={22}
                color={colors.teal}
              />
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    justifyContent: 'center',

    backgroundColor:
      colors.background,

    paddingHorizontal: 24,
  },

  content: {
    width: '100%',
    maxWidth: 470,

    alignSelf: 'center',

    gap: 30,
  },

  intro: {
    alignItems: 'center',

    gap: 13,
  },

  heading: {
    fontSize: 32,

    fontWeight: '800',

    color: colors.navy,
  },

  subtitle: {
    color: colors.muted,

    fontSize: 14,

    lineHeight: 21,

    textAlign: 'center',
  },

  roleSection: {
    gap: 12,
  },

  caption: {
    color: colors.muted,

    fontSize: 10,

    fontWeight: '700',

    letterSpacing: 1.2,
  },

  roleCard: {
    minHeight: 88,

    flexDirection: 'row',

    alignItems: 'center',

    gap: 14,

    backgroundColor:
      colors.white,

    borderWidth: 1,

    borderColor:
      colors.border,

    borderRadius: 18,

    paddingHorizontal: 18,

    paddingVertical: 16,
  },

  pressed: {
    opacity: 0.75,
  },

  iconBox: {
    width: 48,

    height: 48,

    borderRadius: 14,

    backgroundColor:
      '#F1F9F9',

    borderWidth: 1,

    borderColor:
      '#CEDCE3',

    alignItems: 'center',

    justifyContent: 'center',
  },

  roleText: {
    flex: 1,

    gap: 4,
  },

  roleTitle: {
    color: colors.navy,

    fontSize: 17,

    fontWeight: '700',
  },

  roleDescription: {
    color: colors.muted,

    fontSize: 13,
  },
});