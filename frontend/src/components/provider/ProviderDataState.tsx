import { ActivityIndicator, Text, View } from 'react-native';
import { Button, colors, Notice, ui } from './ProviderUI';
export function LoadingState({ text = 'Loading from Firestore…' }: { text?: string }) {
  return <View accessibilityLiveRegion="polite" style={ui.row}><ActivityIndicator color={colors.teal} /><Text style={ui.subtitle}>{text}</Text></View>;
}
export function ErrorState({ error, retry }: { error: string; retry: () => Promise<unknown> }) {
  return <View style={{ gap: 12 }}><Notice error text={error} /><Button title="Retry" kind="secondary" onPress={() => { void retry(); }} /></View>;
}
export function MutationState({ pending, error, success }: { pending: boolean; error: string; success: string }) {
  return <View style={{ gap: 10 }}>{pending && <LoadingState text="Saving to Firestore…" />}{!!error && <Notice error text={error} />}{!!success && <Notice text={success} />}</View>;
}
