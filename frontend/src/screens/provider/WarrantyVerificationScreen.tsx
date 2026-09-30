import { useState } from 'react';
import { Text, View } from 'react-native';
import { Badge, Button, Card, Check, Detail, Field, Notice, Page, Step, ui } from '../../components/provider/ProviderUI';
import { useProviderModule } from '../../components/provider/ProviderContext';
import { eligibility } from '../../utils/providerWorkflow';
import type { ProviderScreenProps } from '../../navigation/providerTypes';
import type { RequestStatus } from '../../types/provider';
export default function WarrantyVerificationScreen({ route, navigation }: ProviderScreenProps<'WarrantyVerification'>) {
  const { state, changeStatus } = useProviderModule();
  const item = state.cases.find(entry => entry.request.id === route.params.requestId);
  const [notes, setNotes] = useState(item?.request.notes ?? ''), [message, setMessage] = useState(''), [error, setError] = useState(false);
  if (!item) return <Page title="Warranty Verification"><Notice error text="Request not found." /></Page>;
  const checks = eligibility(item), canApprove = checks.every(check => check.checked);
  function select(status: RequestStatus) {
    try { changeStatus(route.params.requestId, status, notes); setError(false); setMessage('Local decision saved: ' + status + '. A notification has been added.'); }
    catch (cause) { setError(true); setMessage(cause instanceof Error ? cause.message : 'Could not update the request.'); }
  }
  return <Page title="Warranty Verification" subtitle={item.request.id}><Step index={3} /><Card><Detail label="Product model" value={item.appliance.brand + ' ' + item.appliance.model} /><Detail label="Serial number" value={item.appliance.serialNumber} /><Detail label="Customer name" value={item.customer.name} /><Badge status={item.request.status} /></Card>
    <Card><Text style={ui.sectionTitle}>Eligibility checks</Text>{checks.map(check => <Check key={check.label} {...check} />)}</Card>
    {!canApprove && <Notice text="Approval requires all eligibility checks. Review the documents or request missing information." />}
    <Field label="Verification notes" multiline value={notes} onChangeText={setNotes} placeholder="Record your findings or explain what information is needed..." />
    <View style={ui.row}><Button title="Approve" icon="checkmark-circle-outline" disabled={!canApprove} onPress={() => select('Approved')} /><Button title="Reject" kind="danger" onPress={() => select('Rejected')} /><Button title="Request Information" kind="secondary" onPress={() => select('More Information Required')} /></View>
    {!!message && <Notice text={message} error={error} />}
    <Button title="Continue to Status Update" icon="arrow-forward" onPress={() => navigation.navigate('StatusUpdate', { requestId: item.request.id })} />
  </Page>;
}
