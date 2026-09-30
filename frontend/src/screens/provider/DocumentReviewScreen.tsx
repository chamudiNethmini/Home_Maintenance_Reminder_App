import { useState } from 'react';
import { Linking, Modal, ScrollView, Text, View } from 'react-native';
import { Badge, Button, Card, Check, colors, Icon, Notice, Page, Section, Step, ui } from '../../components/provider/ProviderUI';
import { useProviderModule } from '../../components/provider/ProviderContext';
import type { WarrantyDocument } from '../../types/provider';
import type { ProviderScreenProps } from '../../navigation/providerTypes';
export default function DocumentReviewScreen({ route, navigation }: ProviderScreenProps<'DocumentReview'>) {
  const { state, saveCase } = useProviderModule();
  const item = state.cases.find(entry => entry.request.id === route.params.requestId);
  const [preview, setPreview] = useState<WarrantyDocument | null>(null), [error, setError] = useState('');
  if (!item) return <Page title="Document Review"><Notice error text="Request not found." /></Page>;
  const card = item.documents.some(doc => doc.type === 'Warranty Card'), receipt = item.documents.some(doc => doc.type === 'Purchase Receipt');
  const verified = card && receipt && item.documents.every(doc => doc.verificationStatus === 'Verified');
  async function viewDocument(doc: WarrantyDocument) {
    setError('');
    if (!doc.fileUrl) { setPreview(doc); return; }
    try {
      if (!doc.fileUrl.startsWith('https://')) throw new Error('The document needs a secure HTTPS file URL.');
      await Linking.openURL(doc.fileUrl);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not open the document.'); }
  }
  return <Page title="Document Review" subtitle={item.request.id}><Step index={2} />
    <Section title="Customer documents">{(['Warranty Card', 'Purchase Receipt'] as const).map(type => {
      const doc = item.documents.find(document => document.type === type);
      return <Card key={type}><View style={ui.between}><View style={ui.row}><Icon name="document-text-outline" size={28} /><Text style={ui.sectionTitle}>{type}</Text></View><Badge status={doc?.verificationStatus ?? 'Missing'} /></View>
        <Text style={ui.subtitle}>{doc?.fileName ?? 'This document has not been provided.'}</Text>
        {doc ? <Button title="View" kind="secondary" icon="open-outline" onPress={() => { void viewDocument(doc); }} /> : <Notice text="Request this document from the customer during verification." />}
      </Card>;
    })}</Section>
    <Card><Text style={ui.sectionTitle}>Review checklist</Text><Check label="Warranty card uploaded" checked={card} /><Check label="Purchase receipt uploaded" checked={receipt} /><Check label="All documents look correct" checked={verified} onPress={() => {
      if (!card || !receipt) { setError('Both documents must be present before marking them correct.'); return; }
      setError(''); saveCase({ ...item, documents: item.documents.map(doc => ({ ...doc, verificationStatus: verified ? 'Pending' : 'Verified' })) });
    }} /></Card>
    {!!error && <Notice text={error} error />}
    <Notice text="Preview documents are sample records. Production document URLs will open the files already uploaded by customers." />
    <Button title="Continue" icon="arrow-forward" onPress={() => navigation.navigate('WarrantyVerification', { requestId: item.request.id })} />
    <Modal visible={!!preview} transparent animationType="fade" onRequestClose={() => setPreview(null)}>
      <View style={{ flex: 1, backgroundColor: '#102F45BB', justifyContent: 'center', padding: 24 }}><View style={{ width: '100%', maxWidth: 620, maxHeight: '85%', alignSelf: 'center', backgroundColor: 'white', borderRadius: 20, padding: 24, gap: 16 }}>
        <Text style={ui.sectionTitle}>{preview?.fileName}</Text><Badge status="Sample preview" /><ScrollView><Text selectable style={[ui.body, { color: colors.navy }]}>{preview?.sampleText ?? 'No preview is available for this file.'}</Text></ScrollView><Button title="Close preview" onPress={() => setPreview(null)} />
      </View></View>
    </Modal>
  </Page>;
}
