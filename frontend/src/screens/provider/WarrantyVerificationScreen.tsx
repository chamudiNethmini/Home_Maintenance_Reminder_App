import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Badge, Button, Card, Check, Detail, Field, Notice, Page, Step, ui } from '../../components/provider/ProviderUI';
import { ErrorState, LoadingState, MutationState } from '../../components/provider/ProviderDataState';
import { useProviderModule } from '../../components/provider/ProviderContext';
import { useWarrantyCase, useProviderMutation } from '../../utils/useProviderData';
import { updateWarrantyRequestStatus } from '../../services/warrantyRequestService';
import { eligibility } from '../../utils/providerWorkflow';
import type { ProviderScreenProps } from '../../navigation/providerTypes';
import type { RequestStatus } from '../../types/provider';
export default function WarrantyVerificationScreen({ route, navigation }: ProviderScreenProps<'WarrantyVerification'>) {
  const { item, loading, error, reload } = useWarrantyCase(route.params.warrantyRequestId);
  const { refreshRequests, refreshNotifications } = useProviderModule();
  const mutation = useProviderMutation(), [notes, setNotes] = useState('');
  useEffect(() => { if (item) setNotes(item.request.notes); }, [item?.request.id, item?.request.notes]);
  if (!item) return <Page title="Warranty Verification">{loading ? <LoadingState /> : <ErrorState error={error || 'Request not found.'} retry={reload} />}</Page>;
  const checks = eligibility(item), canApprove = checks.every(check => check.checked);
  function select(status: RequestStatus) {
    void mutation.run(async () => {
      await updateWarrantyRequestStatus(route.params.warrantyRequestId, status, notes);
      await Promise.all([reload(), refreshRequests(), refreshNotifications()]);
    }, 'Decision saved to Firestore: ' + status + '.');
  }
  return <Page title="Warranty Verification" subtitle={item.request.id}><Step index={3} />{!!error && <ErrorState error={error} retry={reload} />}
    <Card><Detail label="Product model" value={item.appliance.brand + ' ' + item.appliance.model} /><Detail label="Serial number" value={item.appliance.serialNumber} /><Detail label="Customer name" value={item.customer.name || item.customer.id} /><Badge status={item.request.status} /></Card>
    <Card><Text style={ui.sectionTitle}>Eligibility checks</Text>{checks.map(check => <Check key={check.label} {...check} />)}</Card>
    {!canApprove && <Notice text="Approval requires all eligibility checks. Missing model coverage is not assumed to be valid." />}
    <Field label="Verification notes" multiline editable={!mutation.pending} value={notes} onChangeText={setNotes} placeholder="Record your findings or explain what information is needed..." />
    <View style={ui.row}><Button title="Approve" icon="checkmark-circle-outline" disabled={!canApprove || mutation.pending || loading} onPress={() => select('Approved')} /><Button title="Reject" kind="danger" disabled={mutation.pending || loading} onPress={() => select('Rejected')} /><Button title="Request Information" kind="secondary" disabled={mutation.pending || loading} onPress={() => select('More Information Required')} /></View>
    <MutationState {...mutation} />
    <Button title="Continue to Status Update" icon="arrow-forward" disabled={mutation.pending || loading} onPress={() => navigation.navigate('StatusUpdate', { warrantyRequestId: item.request.id })} />
  </Page>;
}
