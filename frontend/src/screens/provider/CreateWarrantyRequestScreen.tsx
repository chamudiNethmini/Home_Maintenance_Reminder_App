import { useState } from 'react';
import { Button, Card, Field, Notice, Page, Section } from '../../components/provider/ProviderUI';
import { MutationState } from '../../components/provider/ProviderDataState';
import { useProviderModule } from '../../components/provider/ProviderContext';
import type { ProviderScreenProps } from '../../navigation/providerTypes';
import { createWarrantyCase } from '../../services/createWarrantyCase';
import { useProviderMutation } from '../../utils/useProviderData';
import { requestFieldLabels, validateWarrantyRequestForm, type WarrantyRequestForm } from '../../utils/warrantyRequestForm';

const emptyForm: WarrantyRequestForm = { customerName: '', customerPhone: '', customerEmail: '', applianceName: '', brand: '', model: '', serialNumber: '', purchaseDate: '', warrantyExpiryDate: '', notes: '' };

export default function CreateWarrantyRequestScreen({ navigation }: ProviderScreenProps<'CreateWarrantyRequest'>) {
  const [form, setForm] = useState<WarrantyRequestForm>(emptyForm), [validation, setValidation] = useState('');
  const { providerId, refreshRequests, setCreatedRequestId } = useProviderModule();
  const mutation = useProviderMutation();
  const field = (key: keyof WarrantyRequestForm) => <Field key={key} label={requestFieldLabels[key] + (key === 'notes' ? ' (optional)' : ' *')}
    value={form[key]} editable={!mutation.pending} multiline={key === 'notes'}
    keyboardType={key === 'customerEmail' ? 'email-address' : key === 'customerPhone' ? 'phone-pad' : 'default'}
    autoCapitalize={key === 'customerEmail' ? 'none' : 'sentences'}
    placeholder={key === 'purchaseDate' || key === 'warrantyExpiryDate' ? 'YYYY-MM-DD' : undefined}
    onChangeText={value => { setForm(current => ({ ...current, [key]: value })); setValidation(''); mutation.clear(); }} />;
  async function submit() {
    const cleaned = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()])) as WarrantyRequestForm;
    const error = validateWarrantyRequestForm(cleaned);
    setValidation(error);
    if (error) return;
    const saved = await mutation.run(async () => {
      const result = await createWarrantyCase(cleaned, { providerId });
      setCreatedRequestId(result.warrantyRequestId);
      // Refresh errors are displayed in the list, separately from the committed creation.
      void refreshRequests();
    }, 'Warranty request created successfully');
    if (saved) navigation.replace('ProviderHome', { screen: 'Requests' });
  }
  return <Page title="Create Warranty Request" subtitle="Add customer and appliance details to submit a warranty request. Fields marked * are required.">
    <Section title="Customer Information"><Card>{(['customerName', 'customerPhone', 'customerEmail'] as const).map(field)}</Card></Section>
    <Section title="Appliance Information"><Card>{(['applianceName', 'brand', 'model', 'serialNumber', 'purchaseDate', 'warrantyExpiryDate'] as const).map(field)}</Card></Section>
    <Section title="Warranty Request"><Card>{field('notes')}</Card></Section>
    {!!validation && <Notice error text={validation} />}
    <MutationState {...mutation} />
    <Button title={mutation.pending ? 'Creating request…' : 'Create Warranty Request'} disabled={mutation.pending} onPress={() => { void submit(); }} />
  </Page>;
}
