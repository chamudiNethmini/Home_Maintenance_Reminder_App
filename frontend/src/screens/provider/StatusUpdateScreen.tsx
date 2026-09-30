import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Badge, Button, Card, Check, colors, Field, Page, Step, ui } from '../../components/provider/ProviderUI';
import { ErrorState, LoadingState, MutationState } from '../../components/provider/ProviderDataState';
import { useProviderModule } from '../../components/provider/ProviderContext';
import { useWarrantyRequest, useProviderMutation } from '../../utils/useProviderData';
import { updateWarrantyRequestStatus } from '../../services/warrantyRequestService';
import { statuses } from '../../utils/providerWorkflow';
import type { ProviderScreenProps } from '../../navigation/providerTypes';
import type { RequestStatus } from '../../types/provider';
export default function StatusUpdateScreen({ route, navigation }: ProviderScreenProps<'StatusUpdate'>) {
  const { item, loading, error, reload } = useWarrantyRequest(route.params.warrantyRequestId);
  const { refreshRequests, refreshNotifications } = useProviderModule();
  const mutation = useProviderMutation();
  const [status, setStatus] = useState<RequestStatus>('Pending'), [notes, setNotes] = useState(''), [confirmed, setConfirmed] = useState(false);
  useEffect(() => { if (item) { setStatus(item.status); setNotes(item.notes); setConfirmed(false); } }, [item?.id, item?.updatedAt]);
  if (!item) return <Page title="Status Update">{loading ? <LoadingState /> : <ErrorState error={error || 'Request not found.'} retry={reload} />}</Page>;
  return <Page title="Status Update" subtitle={item.id}><Step index={4} />{!!error && <ErrorState error={error} retry={reload} />}<Card><Text style={ui.label}>Current status</Text><Badge status={item.status} /></Card>
    <Card><Text style={ui.sectionTitle}>Select new status</Text>{statuses.map(value => <Pressable disabled={mutation.pending || loading} accessibilityRole="radio" accessibilityState={{ checked: status === value, disabled: mutation.pending || loading }} key={value} onPress={() => { setStatus(value); setConfirmed(false); mutation.clear(); }} style={[ui.button, { justifyContent: 'flex-start', borderWidth: 1, borderColor: status === value ? colors.teal : colors.border, backgroundColor: status === value ? '#E4F4F1' : 'white' }]}><Text style={[ui.body, { fontWeight: status === value ? '700' : '400' }]}>{status === value ? '◉  ' : '○  '}{value}</Text></Pressable>)}</Card>
    <Field label="Status update notes" multiline editable={!mutation.pending} value={notes} onChangeText={value => { setNotes(value); setConfirmed(false); mutation.clear(); }} placeholder="Add a clear reason for the status update..." />
    <Check label="I confirm that the request status and notes are correct." checked={confirmed} onPress={() => { if (!mutation.pending && !loading) setConfirmed(!confirmed); }} />
    <Button title="Update Status" icon="checkmark-circle-outline" disabled={!confirmed || mutation.pending || loading} onPress={() => {
      void mutation.run(async () => { await updateWarrantyRequestStatus(item.id, status, notes); setConfirmed(false); await Promise.all([reload(), refreshRequests(), refreshNotifications()]); }, 'Status updated successfully in Firestore.');
    }} />
    <MutationState {...mutation} />
    <View style={ui.row}><Button title="View Notifications" kind="secondary" disabled={mutation.pending} onPress={() => navigation.navigate('ProviderHome', { screen: 'Notifications' })} /><Button title="Back to Requests" kind="secondary" disabled={mutation.pending} onPress={() => navigation.navigate('ProviderHome', { screen: 'Requests' })} /></View>
  </Page>;
}
