import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, colors, Icon, ui } from '../../components/provider/ProviderUI';
import type { ProviderScreenProps } from '../../navigation/providerTypes';
export default function WarrantyProviderEntryScreen({ navigation }: ProviderScreenProps<'WarrantyProviderEntry'>) {
  const insets = useSafeAreaInsets();
  return <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: colors.background, padding: 24, paddingTop: 28 + insets.top, paddingBottom: 28 + insets.bottom, justifyContent: 'center' }}>
    <View style={{ width: '100%', maxWidth: 470, alignSelf: 'center', gap: 28 }}>
      <View style={{ alignItems: 'center', gap: 14 }}><Brand large /><Text style={[ui.heading, { fontSize: 34 }]}>Welcome Back!</Text><Text style={[ui.subtitle, { textAlign: 'center' }]}>A little care. A better home.{"\n"}Choose your role to continue with FixMate.</Text></View>
      <View style={{ gap: 12 }}><Text style={ui.caption}>LOGIN AS</Text>
        {(['Homeowner', 'Technician', 'Warranty Provider'] as const).map((role, i) => <Pressable key={role} accessibilityRole="button" accessibilityLabel={role} accessibilityState={{ selected: i === 2, disabled: i !== 2 }} disabled={i !== 2} onPress={() => navigation.navigate('ProviderHome', { screen: 'Dashboard' })} style={({ pressed }) => [ui.card, { flexDirection: 'row', alignItems: 'center', minHeight: 90, borderColor: i === 2 ? colors.teal : colors.border, borderWidth: i === 2 ? 2 : 1, backgroundColor: i === 2 ? '#EAF7F5' : 'white', opacity: pressed ? 0.8 : 1 }]}>
          <Icon name={i === 0 ? 'home-outline' : i === 1 ? 'construct-outline' : 'shield-checkmark-outline'} size={28} />
          <View style={{ flex: 1, gap: 5 }}><Text style={ui.sectionTitle}>{role}</Text><Text style={ui.subtitle}>{i === 0 ? 'Care for your home' : i === 1 ? 'Keep things running' : 'Review, verify & support'}</Text></View>
          {i === 2 && <Icon name="checkmark-circle" size={26} />}
        </Pressable>)}
      </View>
      <Text style={[ui.subtitle, { textAlign: 'center', fontSize: 12 }]}>Warranty Provider workspace. Other roles are managed by the wider FixMate team. Selecting a role does not sign you in.</Text>
    </View>
  </ScrollView>;
}
