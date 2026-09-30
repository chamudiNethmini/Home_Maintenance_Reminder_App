import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Badge, Button, Card, Check, colors, Field, Notice, Page, Step, ui } from '../../components/provider/ProviderUI';
import { useProviderModule } from '../../components/provider/ProviderContext';
import { statuses } from '../../utils/providerWorkflow';
import type { ProviderScreenProps } from '../../navigation/providerTypes';
import type { RequestStatus } from '../../types/provider';
export default function StatusUpdateScreen({ route, navigation }: ProviderScreenProps<'StatusUpdate'>) {
  const { state, changeStatus } = useProviderModule();
  const item = state.cases.find(entry => entry.request.id === route.params.requestId);
  const [status, setStatus] = useState<RequestStatus>(item?.request.status ?? 'Pending');
  const [notes, setNotes] = useState(item?.request.notes ?? ''), [confirmed, setConfirmed] = useState(false), [message, setMessage] = useState(''), [error, setError] = useState(false);
  if (!item) return <Page title="Status Update"><Notice text="Request not found." error /></Page>;
  return <Page title="Status Update" subtitle={item.request.id}><Step index={4} /><Card><Text style={ui.label}>Current status</Text><Badge status={item.request.status} /></Card>
    <Card><Text style={ui.sectionTitle}>Select new status</Text>{statuses.map(value => <Pressable accessibilityRole="radio" accessibilityState={{ checked: status === value }} key={value} onPress={() => { setStatus(value); setConfirmed(false); setMessage(''); }} style={[ui.button, { justifyContent: 'flex-start', borderWidth: 1, borderColor: status === value ? colors.teal : colors.border, backgroundColor: status === value ? '#E4F4F1' : 'white' }]}><Text style={[ui.body, { fontWeight: status === value ? '700' : '400' }]}>{status === value ? '◉  ' : '○  '}{value}</Text></Pressable>)}</Card>
    <Field label="Status update notes" multiline value={notes} onChangeText={value => { setNotes(value); setConfirmed(false); setMessage(''); }} placeholder="Add a clear reason for the status update..." />
    <Check label="I confirm that the request status and notes are correct." checked={confirmed} onPress={() => setConfirmed(!confirmed)} />
    <Button title="Update Status" icon="checkmark-circle-outline" disabled={!confirmed} onPress={() => {
      try { changeStatus(item.request.id, status, notes); setError(false); setMessage('Status updated successfully. Changes are saved for this preview session.'); setConfirmed(false); }
      catch (cause) { setError(true); setMessage(cause instanceof Error ? cause.message : 'Could not update the status.'); }
    }} />
    {!!message && <Notice text={message} error={error} />}
    <View style={ui.row}><Button title="View Notifications" kind="secondary" onPress={() => navigation.navigate('ProviderHome', { screen: 'Notifications' })} /><Button title="Back to Requests" kind="secondary" onPress={() => navigation.navigate('ProviderHome', { screen: 'Requests' })} /></View>
  </Page>;
}
