import { useState } from 'react';
import { View } from 'react-native';
import { Badge, Button, Card, Field, Notice, Page, Section, Step, ui } from '../../components/provider/ProviderUI';
import { useProviderModule } from '../../components/provider/ProviderContext';
import type { WarrantyCase } from '../../types/provider';
import type { ProviderScreenProps } from '../../navigation/providerTypes';
import { validDate } from '../../utils/providerWorkflow';
export default function CustomerApplianceInfoScreen(props: ProviderScreenProps<'CustomerApplianceInfo'>) {
  const { state } = useProviderModule();
  const item = state.cases.find(entry => entry.request.id === props.route.params.requestId);
  return item ? <InfoForm key={item.request.id} item={item} {...props} /> : <Page title="Request unavailable"><Notice error text="This warranty request could not be found." /></Page>;
}
function InfoForm({ item, navigation }: ProviderScreenProps<'CustomerApplianceInfo'> & { item: WarrantyCase }) {
  const { saveCase } = useProviderModule();
  const [customer, setCustomer] = useState(item.customer), [appliance, setAppliance] = useState(item.appliance), [warranty, setWarranty] = useState(item.warranty);
  const [message, setMessage] = useState(''), [error, setError] = useState(false);
  function save() {
    if ([customer.name, customer.phone, customer.email, appliance.name, appliance.brand, appliance.model, appliance.serialNumber].some(value => !value.trim())) {
      setError(true); setMessage('Please complete all customer and appliance fields.'); return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) { setError(true); setMessage('Enter a valid email address.'); return false; }
    if (!validDate(appliance.purchaseDate) || !validDate(warranty.expiryDate) || warranty.expiryDate < appliance.purchaseDate) {
      setError(true); setMessage('Use valid YYYY-MM-DD dates. Expiry must be on or after purchase.'); return false;
    }
    const currentStatus = warranty.expiryDate < new Date().toISOString().slice(0, 10) ? 'Expired' : warranty.status === 'Expired' ? 'Active' : warranty.status;
    saveCase({ ...item, customer: { ...customer, name: customer.name.trim(), phone: customer.phone.trim(), email: customer.email.trim() }, appliance, warranty: { ...warranty, purchaseDate: appliance.purchaseDate, status: currentStatus } });
    setError(false); setMessage('Customer and warranty details saved locally.'); return true;
  }
  return <Page title="Customer & Appliance Information" subtitle={item.request.id}><Step index={1} />
    <Section title="Customer information"><Card>
      <Field label="Name" value={customer.name} onChangeText={name => setCustomer({ ...customer, name })} />
      <Field label="Phone" keyboardType="phone-pad" value={customer.phone} onChangeText={phone => setCustomer({ ...customer, phone })} />
      <Field label="Email" keyboardType="email-address" autoCapitalize="none" value={customer.email} onChangeText={email => setCustomer({ ...customer, email })} />
    </Card></Section>
    <Section title="Appliance information"><Card>
      <Field label="Appliance name" value={appliance.name} onChangeText={name => setAppliance({ ...appliance, name })} />
      <Field label="Brand" value={appliance.brand} onChangeText={brand => setAppliance({ ...appliance, brand })} />
      <Field label="Model" value={appliance.model} onChangeText={model => setAppliance({ ...appliance, model })} />
      <Field label="Serial number" value={appliance.serialNumber} onChangeText={serialNumber => setAppliance({ ...appliance, serialNumber })} />
      <Field label="Purchase date (YYYY-MM-DD)" value={appliance.purchaseDate} onChangeText={purchaseDate => setAppliance({ ...appliance, purchaseDate })} />
      <Field label="Warranty expiry date (YYYY-MM-DD)" value={warranty.expiryDate} onChangeText={expiryDate => setWarranty({ ...warranty, expiryDate })} />
      <Badge status={warranty.expiryDate < new Date().toISOString().slice(0, 10) ? 'Expired' : warranty.status === 'Expired' ? 'Active' : warranty.status} />
    </Card></Section>
    {!!message && <Notice text={message} error={error} />}
    <View style={ui.row}><Button title="Save" kind="secondary" icon="save-outline" onPress={save} /><Button title="Continue" icon="arrow-forward" onPress={() => { if (save()) navigation.navigate('DocumentReview', { requestId: item.request.id }); }} /></View>
  </Page>;
}
