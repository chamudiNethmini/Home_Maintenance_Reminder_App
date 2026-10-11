import { useState } from 'react';
import { View } from 'react-native';
import { Badge, Button, Card, Check, Detail, Notice, Field, Page, Section, Step, ui } from '../../components/provider/ProviderUI';
import { ErrorState, LoadingState, MutationState } from '../../components/provider/ProviderDataState';
import { useProviderModule } from '../../components/provider/ProviderContext';
import { useWarrantyDetails, useProviderMutation } from '../../utils/useProviderData';
import { saveWarrantyCaseDetails } from '../../services/warrantyRequestService';
import type { WarrantyCase } from '../../types/provider';
import type { ProviderScreenProps } from '../../navigation/providerTypes';
import { validDate, isFinalized } from '../../utils/providerWorkflow';
export default function CustomerApplianceInfoScreen(props: ProviderScreenProps<'CustomerApplianceInfo'>) {
  const { item, loading, error, reload } = useWarrantyDetails(props.route.params.warrantyRequestId);
  if (!item || loading || error) return <Page title="Customer & Appliance Information">{loading ? <LoadingState /> : <ErrorState error={error || 'Request not found.'} retry={reload} />}</Page>;
  return <InfoForm key={item.request.id} item={item} {...props} />;
}
function InfoForm({ item, navigation }: ProviderScreenProps<'CustomerApplianceInfo'> & { item: WarrantyCase }) {
  const { refreshRequests } = useProviderModule();
  const mutation = useProviderMutation();
  const [customer, setCustomer] = useState(item.customer), [appliance, setAppliance] = useState(item.appliance), [warranty, setWarranty] = useState(item.warranty);
  const finalized = isFinalized(item.request.status);
  function save() {
    return mutation.run(async () => {
      if ([customer.name, customer.phone, customer.email, appliance.name, appliance.brand, appliance.model, appliance.serialNumber].some(value => !value.trim())) throw new Error('Please complete all customer and appliance fields.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) throw new Error('Enter a valid email address.');
      if (!validDate(appliance.purchaseDate) || !validDate(warranty.expiryDate) || warranty.expiryDate < appliance.purchaseDate) throw new Error('Use valid YYYY-MM-DD dates. Expiry must be on or after purchase.');
      const status = warranty.expiryDate < new Date().toISOString().slice(0, 10) ? 'Expired' : warranty.status === 'Expired' ? 'Active' : warranty.status;
      await saveWarrantyCaseDetails({ ...item, customer: { ...customer, name: customer.name.trim(), phone: customer.phone.trim(), email: customer.email.trim() }, appliance, warranty: { ...warranty, purchaseDate: appliance.purchaseDate, status } });
      await refreshRequests();
    }, 'Customer and warranty details saved to Firestore.');
  }
  return <Page title={finalized ? "Finalized Request" : "Customer & Appliance Information"} subtitle={item.request.id}>
    {finalized ? <Card><Notice text={`This warranty request has already been ${item.request.status.toLowerCase()}.`} /><Badge status={item.request.status} /><Detail label="Request ID" value={item.request.id} /><Detail label="Warranty ID" value={item.warranty.id} /><Field label="Verification notes" multiline editable={false} value={item.request.verificationNotes || item.request.notes || "No notes recorded"} /><Check label="Warranty card uploaded" checked={item.request.warrantyCardUploaded} /><Check label="Purchase receipt uploaded" checked={item.request.purchaseReceiptUploaded} /><Check label="Documents reviewed" checked={item.request.documentsReviewed} />{item.request.verifiedAt && <Detail label="Verified at" value={new Date(item.request.verifiedAt).toLocaleString()} />}{item.request.updatedAt && <Detail label="Updated at" value={new Date(item.request.updatedAt).toLocaleString()} />}</Card> : <Step index={1} />}
    <Section title="Customer information"><Card>
      <Field editable={!finalized && !mutation.pending} label="Name" value={customer.name} onChangeText={name => setCustomer({ ...customer, name })} />
      <Field editable={!finalized && !mutation.pending} label="Phone" keyboardType="phone-pad" value={customer.phone} onChangeText={phone => setCustomer({ ...customer, phone })} />
      <Field editable={!finalized && !mutation.pending} label="Email" keyboardType="email-address" autoCapitalize="none" value={customer.email} onChangeText={email => setCustomer({ ...customer, email })} />
    </Card></Section>
    <Section title="Appliance information"><Card>
      <Field editable={!finalized && !mutation.pending} label="Appliance name" value={appliance.name} onChangeText={name => setAppliance({ ...appliance, name })} />
      <Field editable={!finalized && !mutation.pending} label="Brand" value={appliance.brand} onChangeText={brand => setAppliance({ ...appliance, brand })} />
      <Field editable={!finalized && !mutation.pending} label="Model" value={appliance.model} onChangeText={model => setAppliance({ ...appliance, model })} />
      <Field editable={!finalized && !mutation.pending} label="Serial number" value={appliance.serialNumber} onChangeText={serialNumber => setAppliance({ ...appliance, serialNumber })} />
      <Field editable={!finalized && !mutation.pending} label="Purchase date (YYYY-MM-DD)" value={appliance.purchaseDate} onChangeText={purchaseDate => setAppliance({ ...appliance, purchaseDate })} />
      <Field editable={!finalized && !mutation.pending} label="Warranty expiry date (YYYY-MM-DD)" value={warranty.expiryDate} onChangeText={expiryDate => setWarranty({ ...warranty, expiryDate })} />
      <Badge status={warranty.expiryDate < new Date().toISOString().slice(0, 10) ? 'Expired' : warranty.status === 'Expired' ? 'Active' : warranty.status} />
    </Card></Section>
    {!finalized && <MutationState {...mutation} />}
    {!finalized && <View style={ui.row}><Button disabled={mutation.pending} title="Save" kind="secondary" icon="save-outline" onPress={() => { void save(); }} /><Button disabled={mutation.pending} title="Continue" icon="arrow-forward" onPress={() => { void save().then(saved => { if (saved) navigation.navigate('DocumentReview', { warrantyRequestId: item.request.id }); }); }} /></View>}
  </Page>;
}
