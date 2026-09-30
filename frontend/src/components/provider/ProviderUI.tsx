import type { ComponentProps, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
export const colors = { navy: '#103851', teal: '#087F80', cyan: '#0EA5C6', background: '#F4F8FA', border: '#DEE8ED', muted: '#58717F', white: '#FFFFFF', danger: '#AC3546' };
export function Icon({ name, color = colors.teal, size = 22 }: { name: ComponentProps<typeof Ionicons>['name']; color?: string; size?: number }) { return <Ionicons name={name} size={size} color={color} />; }
export function Brand({ large = false }: { large?: boolean }) {
  // Replace the fallback with Image + require('../../../assets/fixmate-logo.png') when the asset is supplied.
  return <View accessibilityLabel="FixMate" style={[ui.brand, large && { flexDirection: 'column', gap: 12 }]}><View style={{ width: large ? 80 : 46, height: large ? 80 : 46, borderRadius: large ? 24 : 14, backgroundColor: '#DDF2EF', alignItems: 'center', justifyContent: 'center' }}><Icon name="home-outline" size={large ? 44 : 28} /></View><View><Text style={[ui.brandName, large && { fontSize: 32 }]}>Fix<Text style={{ color: colors.teal }}>Mate</Text></Text>{!large && <Text style={ui.caption}>WARRANTY PROVIDER</Text>}</View></View>;
}
export function Page({ children, title, subtitle, action }: { children: ReactNode; title: string; subtitle?: string; action?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingTop: 18 + insets.top, paddingBottom: 32 + insets.bottom, flexGrow: 1 }}>
      <View style={ui.content}><View style={ui.between}><Brand /><View style={ui.demo}><Text style={ui.demoText}>LOCAL PREVIEW</Text></View></View>
        <View style={ui.between}><View style={{ flex: 1, gap: 7 }}><Text accessibilityRole="header" style={ui.heading}>{title}</Text>{subtitle && <Text style={ui.subtitle}>{subtitle}</Text>}</View>{action}</View>{children}
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}
export function Card({ children }: { children: ReactNode }) { return <View style={ui.card}>{children}</View>; }
export function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) { return <View style={{ gap: 14 }}><View style={ui.between}><Text accessibilityRole="header" style={ui.sectionTitle}>{title}</Text>{action}</View>{children}</View>; }
export function Button({ title, onPress, kind = 'primary', disabled = false, icon }: { title: string; onPress: () => void; kind?: 'primary' | 'secondary' | 'danger'; disabled?: boolean; icon?: ComponentProps<typeof Ionicons>['name'] }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [ui.button, { backgroundColor: kind === 'primary' ? colors.teal : kind === 'danger' ? '#FFF0F2' : '#EFF6F8', opacity: disabled ? 0.45 : pressed ? 0.75 : 1 }]}>{icon && <Icon name={icon} size={19} color={kind === 'primary' ? 'white' : colors.teal} />}<Text style={{ fontWeight: '700', color: kind === 'primary' ? 'white' : kind === 'danger' ? colors.danger : colors.navy }}>{title}</Text></Pressable>;
}
export function Badge({ status }: { status: string }) {
  const palette = ['Approved', 'Active', 'Verified', 'Read'].includes(status) ? ['#E0F4EB', '#196342'] : ['Rejected', 'Expired'].includes(status) ? ['#FCEAED', '#A52F45'] : status === 'More Information Required' ? ['#EAEFFC', '#405BA1'] : ['#FFF2D6', '#805C14'];
  return <View style={[ui.badge, { backgroundColor: palette[0] }]}><Text style={{ color: palette[1], fontSize: 12, fontWeight: '700' }}>{status}</Text></View>;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) { return <View style={{ gap: 7, flexGrow: 1 }}><Text style={ui.label}>{label}</Text><TextInput placeholderTextColor="#71838E" accessibilityLabel={label} {...props} style={[ui.input, props.multiline && { minHeight: 108, textAlignVertical: 'top' }, props.style]} /></View>; }
export function Check({ label, checked, onPress }: { label: string; checked: boolean; onPress?: () => void }) {
  const content = <><Icon name={checked ? 'checkbox' : 'square-outline'} color={checked ? colors.teal : colors.muted} /><Text style={[ui.body, { flex: 1 }]}>{label}</Text></>;
  return onPress ? <Pressable accessibilityRole="checkbox" accessibilityLabel={label} accessibilityState={{ checked }} onPress={onPress} style={ui.check}>{content}</Pressable> : <View style={ui.check}>{content}</View>;
}
export function Notice({ text, error = false }: { text: string; error?: boolean }) { return <View style={[ui.notice, error && { backgroundColor: '#FCEAED' }]}><Icon name={error ? 'alert-circle-outline' : 'information-circle-outline'} color={error ? colors.danger : colors.teal} /><Text accessibilityLiveRegion="polite" style={[ui.body, { flex: 1 }]}>{text}</Text></View>; }
export function Detail({ label, value }: { label: string; value: string }) { return <View style={ui.between}><Text style={ui.subtitle}>{label}</Text><Text style={[ui.body, { flex: 1, textAlign: 'right', fontWeight: '600' }]}>{value}</Text></View>; }
export function Step({ index }: { index: number }) { return <View style={{ gap: 10 }}><Text style={ui.caption}>STEP {index} OF 4 · {['CUSTOMER & APPLIANCE', 'DOCUMENT REVIEW', 'VERIFICATION', 'STATUS UPDATE'][index - 1]}</Text><View style={ui.row}>{[1, 2, 3, 4].map(step => <View key={step} style={{ flex: 1, height: 4, borderRadius: 4, backgroundColor: step <= index ? colors.teal : colors.border }} />)}</View></View>; }
export const ui = StyleSheet.create({
  content: { width: '100%', maxWidth: 960, alignSelf: 'center', gap: 26 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 }, brandName: { fontSize: 22, fontWeight: '800', color: colors.navy },
  demo: { backgroundColor: '#E4F1F2', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 7 }, demoText: { fontSize: 9, color: colors.teal, fontWeight: '800', letterSpacing: 1 },
  heading: { fontSize: 28, fontWeight: '800', color: colors.navy, letterSpacing: -0.7 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21 }, body: { color: colors.navy, fontSize: 15, lineHeight: 23 },
  caption: { color: colors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.2 }, label: { color: colors.navy, fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.navy },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  card: { backgroundColor: colors.white, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 20, gap: 16 },
  button: { minHeight: 48, paddingHorizontal: 18, paddingVertical: 13, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  input: { backgroundColor: 'white', borderColor: '#CEDCE3', borderWidth: 1, borderRadius: 12, minHeight: 48, paddingHorizontal: 14, paddingVertical: 12, color: colors.navy, fontSize: 15 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  check: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingVertical: 8 },
  notice: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: '#E8F5F4', padding: 16, borderRadius: 14 },
});
