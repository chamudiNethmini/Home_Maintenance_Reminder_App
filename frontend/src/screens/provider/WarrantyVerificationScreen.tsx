import { isFinalized } from '../../utils/providerWorkflow';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Badge, Button, Card, Check, Detail, Field, Notice, Page, Step, ui } from '../../components/provider/ProviderUI';
import { ErrorState, LoadingState, MutationState } from '../../components/provider/ProviderDataState';
import { useWarrantyCase, useProviderMutation } from '../../utils/useProviderData';
import { saveWarrantyVerification } from '../../services/warrantyRequestService';
import { eligibility } from '../../utils/providerWorkflow';
import type { ProviderScreenProps } from '../../navigation/providerTypes';
import type { RequestStatus } from '../../types/provider';
export default function WarrantyVerificationScreen({ route, navigation }: ProviderScreenProps<'WarrantyVerification'>) {
  const { item, loading, error, reload } = useWarrantyCase(route.params.warrantyRequestId);
  const mutation = useProviderMutation(), [notes, setNotes] = useState(''), [modelSerialConfirmed, setModelSerialConfirmed] = useState(false);
  useEffect(() => { if (item) { setNotes(item.request.verificationNotes || item.request.notes); setModelSerialConfirmed(item.request.modelSerialConfirmed); } }, [item?.request.id, item?.request.verificationNotes, item?.request.notes, item?.request.modelSerialConfirmed]);
  if (!item || loading || error) return <Page title="Warranty Verification">{loading ? <LoadingState /> : <ErrorState error={error || 'Request not found.'} retry={reload} />}</Page>;
  if (isFinalized(item.request.status)) return <Page title="Finalized Request"><Card><Text>This warranty request has already been {item.request.status.toLowerCase()}.</Text><Button title="View finalized request" onPress={() => navigation.replace('CustomerApplianceInfo', { warrantyRequestId: item.request.id })} /></Card></Page>;
  const currentRequest = item.request;
  const checks = eligibility(item), canApprove = checks.every(check => check.checked) && modelSerialConfirmed;
  function select(status: RequestStatus) {
    void mutation.run(async () => {
      await saveWarrantyVerification(currentRequest.id, notes, modelSerialConfirmed);
      navigation.navigate('StatusUpdate', { warrantyRequestId: currentRequest.id, pendingDecision: status === 'Approved' ? 'approved' : status === 'Rejected' ? 'rejected' : 'more_information_required', verificationNotes: notes });
    }, 'Verification saved. Confirm the selected status to apply it.');
  }
  return <Page title="Warranty Verification" subtitle={item.request.id}><Step index={3} />{!!error && <ErrorState error={error} retry={reload} />}
    <Card><Text style={ui.sectionTitle}>Request and warranty details</Text>
      <Detail label="Customer" value={item.customer.name || item.customer.id} />
      <Detail label="Brand" value={item.appliance.brand} /><Detail label="Product model" value={item.appliance.model} />
      <Detail label="Serial number" value={item.appliance.serialNumber} />
      <Detail label="Purchase date" value={item.warranty.purchaseDate || 'Unavailable'} />
      <Detail label="Warranty expiry" value={item.warranty.expiryDate || 'Unavailable'} />
      <Detail label="Warranty status" value={item.warranty.status} /><Detail label="Request status" value={item.request.status} />
    </Card>
    <Card><Text style={ui.sectionTitle}>Automatic eligibility checks</Text>{checks.map(check => <Check key={check.label} {...check} />)}
      <Text style={ui.subtitle}>These checks use the saved warranty expiry date and upload/review flags on the request.</Text>
    </Card>
    <Card><Text style={ui.sectionTitle}>Provider review</Text>
      <Check label="Model/serial details match" checked={modelSerialConfirmed} onPress={mutation.pending ? undefined : () => setModelSerialConfirmed(value => !value)} />
      <Text style={ui.subtitle}>Manual check: compare the appliance details with the warranty card and purchase receipt.</Text>
    </Card>
    {!canApprove && <Notice text="Approval is unavailable until every automatic check passes and model/serial details are manually confirmed." />}
    <Field label="Verification notes" multiline editable={!mutation.pending} value={notes} onChangeText={setNotes} placeholder="Record your findings or explain what information is needed..." />
    <View style={ui.row}><Button title="Approve" icon="checkmark-circle-outline" disabled={!canApprove || mutation.pending || loading} onPress={() => select('Approved')} /><Button title="Reject" kind="danger" disabled={mutation.pending || loading} onPress={() => select('Rejected')} /><Button title="Request More Information" kind="secondary" disabled={mutation.pending || loading} onPress={() => select('More Information Required')} /></View>
    <MutationState {...mutation} />
  </Page>;
}
