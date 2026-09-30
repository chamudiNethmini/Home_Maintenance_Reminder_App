import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon, Button, Card, Check, Detail, Field, Page, Step, ui } from '../../components/provider/ProviderUI';
import { ErrorState, LoadingState, MutationState } from '../../components/provider/ProviderDataState';
import { useProviderModule } from '../../components/provider/ProviderContext';
import { useWarrantyCase, useProviderMutation } from '../../utils/useProviderData';
import { updateWarrantyRequestStatus } from '../../services/warrantyRequestService';
import { eligibility, isFinalized, requestStatus, statuses } from '../../utils/providerWorkflow';
import type { ProviderScreenProps } from '../../navigation/providerTypes';
import type { RequestStatus } from '../../types/provider';

const palette: Record<RequestStatus, { background: string; text: string; border: string }> = {
  Pending: { background: '#FFF2D6', text: '#805C14', border: '#E9D6A4' },
  Approved: { background: '#0EA5C6', text: '#103851', border: '#087F80' },
  Rejected: { background: '#FCEAED', text: '#A52F45', border: '#E8BBC3' },
  'More Information Required': { background: '#F5F8FA', text: '#425C6C', border: '#CEDCE3' },
};
export default function StatusUpdateScreen({ route, navigation }: ProviderScreenProps<'StatusUpdate'>) {
  const { item, loading, error, reload } = useWarrantyCase(route.params.warrantyRequestId);
  const { refreshRequests, refreshNotifications } = useProviderModule();
  const mutation = useProviderMutation();
  const [status, setStatus] = useState<RequestStatus>('Pending'), [notes, setNotes] = useState(''), [confirmed, setConfirmed] = useState(false);
  useEffect(() => { if (item) { setStatus(route.params.pendingDecision ? requestStatus(route.params.pendingDecision) : item.request.status); setNotes(route.params.verificationNotes ?? item.request.verificationNotes ?? item.request.notes); setConfirmed(false); } }, [item?.request.id, item?.request.updatedAt, route.params.pendingDecision, route.params.verificationNotes]);
  if (!item || loading || error) return <Page title="Status Update">{loading ? <LoadingState /> : <ErrorState error={error || 'Request not found.'} retry={reload} />}</Page>;
  if (isFinalized(item.request.status)) return <Page title="Finalized Request"><Card><Text>This warranty request has already been {item.request.status.toLowerCase()}.</Text><Button title="View finalized request" onPress={() => navigation.replace('CustomerApplianceInfo', { warrantyRequestId: item.request.id })} /></Card></Page>;
  const currentRequest = item.request;
  const canApprove = eligibility(item).every(check => check.checked) && currentRequest.modelSerialConfirmed;
  async function confirmStatus() {
    const saved = await mutation.run(async () => {
      await updateWarrantyRequestStatus(currentRequest.id, status, notes);
      await Promise.all([refreshRequests(), refreshNotifications()]);
    }, 'Warranty status updated successfully');
    if (saved) navigation.replace('ProviderHome', { screen: 'Requests' });
  }
  return <Page title="Status Update" subtitle={currentRequest.id}><Step index={4} />{!!error && <ErrorState error={error} retry={reload} />}
    <Card><Text style={ui.sectionTitle}>Confirm request status</Text><Detail label="Warranty request ID" value={currentRequest.id} /><Detail label="Previous status" value={currentRequest.status} /><Detail label="Selected new status" value={status} /></Card>
    <Card><Text style={ui.sectionTitle}>Select new status</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel="Select new status" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {statuses.map(value => {
          const disabled = mutation.pending || loading || (value === 'Approved' && !canApprove);
          const selected = status === value, color = palette[value];
          return <Pressable key={value} disabled={disabled} accessibilityRole="radio" accessibilityLabel={value} accessibilityState={{ checked: selected, disabled }}
            onPress={() => { setStatus(value); setConfirmed(false); mutation.clear(); }}
            style={({ pressed }) => ({ flexBasis: '45%', flexGrow: 1, minHeight: 64, paddingHorizontal: 10, paddingVertical: 12, borderRadius: 12,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
              borderWidth: 2, borderColor: selected ? color.text : color.border, backgroundColor: color.background,
              opacity: disabled ? 0.45 : pressed ? 0.8 : 1 })}>
            {selected && <Icon name="checkmark-circle" size={18} color={color.text} />}
            <Text style={{ flexShrink: 1, textAlign: 'center', color: color.text, fontSize: 14, lineHeight: 20, fontWeight: selected ? '700' : '600' }}>{value === 'More Information Required' ? 'More Information' : value}</Text>
          </Pressable>;
        })}
      </View>
      {!canApprove && <Text style={ui.subtitle}>Approval requires a valid warranty period, both document confirmations, a completed document review, and confirmed model/serial details.</Text>}
    </Card>
    <Field label="Verification notes" multiline editable={!mutation.pending} value={notes} onChangeText={value => { setNotes(value); setConfirmed(false); mutation.clear(); }} placeholder="Add verification findings or explain the decision..." />
    <Check label="I confirm this warranty status update" checked={confirmed} onPress={() => { if (!mutation.pending && !loading) setConfirmed(!confirmed); }} />
    <Button title="Update Status" icon="checkmark-circle-outline" disabled={!confirmed || mutation.pending || loading} onPress={() => { void confirmStatus(); }} />
    <MutationState {...mutation} />
  </Page>;
}
