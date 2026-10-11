import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, Card, colors, Field, Notice, Page, ui } from '../../components/provider/ProviderUI';
import { useProviderModule } from '../../components/provider/ProviderContext';
import { RequestCard } from '../../components/provider/RequestCard';
import { filterRequests, statuses } from '../../utils/providerWorkflow';
import type { RequestStatus } from '../../types/provider';
import type { ProviderTabProps } from '../../navigation/providerTypes';
import { ErrorState, LoadingState } from '../../components/provider/ProviderDataState';
export default function WarrantyRequestsScreen({ navigation }: ProviderTabProps<'Requests'>) {
  const { state, requestsLoading, requestsError, requestsWarning, refreshRequests, createdRequestId, setCreatedRequestId } = useProviderModule();
  const [search, setSearch] = useState(''), [status, setStatus] = useState<RequestStatus | 'All'>('All');
  const [filterOpen, setFilterOpen] = useState(false), [newest, setNewest] = useState(true);
  useEffect(() => { if (createdRequestId) { setSearch(''); setStatus('All'); setNewest(true); } }, [createdRequestId]);
  const results = filterRequests(state.requests, search, status).sort((a, b) => newest ? b.request.createdAt.localeCompare(a.request.createdAt) : a.request.createdAt.localeCompare(b.request.createdAt));
  return <Page title="Warranty Requests" action={<Button title="Refresh" kind="secondary" disabled={requestsLoading} onPress={() => { void refreshRequests(); }} />} subtitle="A clear view of every customer request.">
    {!!createdRequestId && <Card><Notice text="Warranty request created successfully" /><Text selectable style={ui.subtitle}>Request ID: {createdRequestId}</Text><Button title="Dismiss confirmation" kind="secondary" onPress={() => setCreatedRequestId(null)} /></Card>}
    <View style={[ui.row, { alignItems: 'flex-end' }]}><Field label="Search requests" value={search} onChangeText={setSearch} placeholder="Request ID, customer or appliance" /><Button title="Filter" icon="options-outline" kind="secondary" onPress={() => setFilterOpen(!filterOpen)} /></View>
    <View style={ui.row}>{(['All', ...statuses] as const).map(value => <Pressable accessibilityRole="button" accessibilityState={{ selected: status === value }} key={value} onPress={() => setStatus(value)} style={[ui.button, { backgroundColor: status === value ? colors.teal : 'white', borderWidth: 1, borderColor: colors.border }]}><Text style={{ color: status === value ? 'white' : colors.navy, fontWeight: '600' }}>{value}</Text></Pressable>)}</View>
    {filterOpen && <Card><Text style={ui.sectionTitle}>Sort by submitted date</Text><View style={ui.row}><Button title={newest ? '✓ Newest first' : 'Newest first'} kind="secondary" onPress={() => setNewest(true)} /><Button title={!newest ? '✓ Oldest first' : 'Oldest first'} kind="secondary" onPress={() => setNewest(false)} /><Button title="Reset filters" kind="secondary" onPress={() => { setSearch(''); setStatus('All'); setNewest(true); }} /></View></Card>}
    {requestsLoading && <LoadingState />}{!!requestsError && <ErrorState error={requestsError} retry={refreshRequests} />}{!!requestsWarning && <ErrorState error={requestsWarning} retry={refreshRequests} />}
    {!requestsLoading && !requestsError && <><Text style={ui.caption}>{results.length} REQUEST{results.length === 1 ? '' : 'S'}</Text>
    {results.length ? results.map(item => <RequestCard key={item.request.id} item={item} onView={() => navigation.navigate('CustomerApplianceInfo', { warrantyRequestId: item.request.id })} />) : <Card><Text style={ui.body}>{state.requests.length ? 'No matching requests. Try another search or status.' : 'No warranty requests have been submitted yet.'}</Text></Card>}</>}
  </Page>;
}
