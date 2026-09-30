import { Text, View } from 'react-native';
import { Button, Card, colors, Icon, Page, Section, ui } from '../../components/provider/ProviderUI';
import { useProviderModule } from '../../components/provider/ProviderContext';
import { RequestCard } from '../../components/provider/RequestCard';
import type { ProviderTabProps } from '../../navigation/providerTypes';
import { ErrorState, LoadingState } from '../../components/provider/ProviderDataState';
export default function ProviderDashboardScreen({ navigation }: ProviderTabProps<'Dashboard'>) {
  const { state, requestsLoading, requestsError, requestsWarning, refreshRequests } = useProviderModule();
  return <Page singleLineTitle title="Welcome, Warranty Provider" action={<Button title="Refresh" kind="secondary" disabled={requestsLoading} onPress={() => { void refreshRequests(); }} />} subtitle="Here’s what’s happening with your warranty requests.">
    <View style={[ui.card, { backgroundColor: colors.navy, borderColor: colors.navy, padding: 24 }]}><View style={ui.between}><Text style={{ color: '#A7E3DD', fontWeight: '700', letterSpacing: 1, fontSize: 11 }}>YOUR WORKSPACE</Text><Icon name="shield-checkmark-outline" color="#9DE4DD" size={28} /></View><Text style={{ color: 'white', fontSize: 23, fontWeight: '700' }}>Every request deserves{"\n"}a little peace of mind.</Text><Text style={{ color: '#C7DCE4', lineHeight: 21 }}>Review documents, verify coverage and keep customers informed.</Text></View>
    {requestsLoading && <LoadingState />}{!!requestsError && <ErrorState error={requestsError} retry={refreshRequests} />}{!!requestsWarning && <ErrorState error={requestsWarning} retry={refreshRequests} />}
    {!requestsLoading && !requestsError && <View style={[ui.row, { alignItems: 'stretch' }]}>{(['Pending', 'Approved', 'Rejected'] as const).map(status => <View key={status} style={{ flex: 1, minWidth: 92 }}><Card><View style={{ alignItems: 'center' }}><Text style={{ fontSize: 30, color: colors.navy, fontWeight: '800', textAlign: 'center' }}>{state.requests.filter(item => item.request.status === status).length}</Text><Text style={[ui.subtitle, { textAlign: 'center' }]}>{status}</Text></View></Card></View>)}</View>}
    <Section title="Quick Actions"><View style={ui.row}><Button title="View All Requests" icon="file-tray-full-outline" onPress={() => navigation.navigate('Requests')} /><Button title="Notifications" icon="notifications-outline" kind="secondary" onPress={() => navigation.navigate('Notifications')} /></View></Section>
    {!requestsLoading && !requestsError && <Section title="Recent Warranty Requests">{!state.requests.length && <Card><Text style={ui.body}>No warranty requests have been submitted yet.</Text></Card>}{[...state.requests].sort((a, b) => b.request.createdAt.localeCompare(a.request.createdAt)).slice(0, 3).map(item => <RequestCard key={item.request.id} item={item} onView={() => navigation.navigate('CustomerApplianceInfo', { warrantyRequestId: item.request.id })} />)}</Section>}
  </Page>;
}
