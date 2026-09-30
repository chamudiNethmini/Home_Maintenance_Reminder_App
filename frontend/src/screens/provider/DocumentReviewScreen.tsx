import { useState } from 'react';
import { Linking, Text, View } from 'react-native';
import { Badge, Button, Card, Check, Icon, Notice, Page, Section, Step, ui } from '../../components/provider/ProviderUI';
import { ErrorState, LoadingState, MutationState } from '../../components/provider/ProviderDataState';
import { useRequestDocuments, useProviderMutation } from '../../utils/useProviderData';
import { updateDocumentVerificationStatus, updateDocumentsVerificationStatus } from '../../services/warrantyDocumentService';
import type { WarrantyDocument } from '../../types/provider';
import type { ProviderScreenProps } from '../../navigation/providerTypes';
export default function DocumentReviewScreen({ route, navigation }: ProviderScreenProps<'DocumentReview'>) {
  const { item, loading, error, reload } = useRequestDocuments(route.params.warrantyRequestId);
  const mutation = useProviderMutation(), [viewError, setViewError] = useState('');
  if (!item) return <Page title="Document Review">{loading ? <LoadingState /> : <ErrorState error={error || 'Request not found.'} retry={reload} />}</Page>;
  const card = item.documents.some(doc => doc.type === 'Warranty Card' && !!doc.fileUrl), receipt = item.documents.some(doc => doc.type === 'Purchase Receipt' && !!doc.fileUrl);
  const verified = card && receipt && item.documents.every(doc => doc.verificationStatus === 'Verified');
  async function viewDocument(document: WarrantyDocument) {
    setViewError('');
    try {
      if (!document.fileUrl || !document.fileUrl.startsWith('https://')) throw new Error('This document needs a valid HTTPS file URL from the customer module.');
      await Linking.openURL(document.fileUrl);
    } catch (cause) { setViewError(cause instanceof Error ? cause.message : 'Could not open the document.'); }
  }
  function review(document: WarrantyDocument, status: WarrantyDocument['verificationStatus']) {
    void mutation.run(async () => { await updateDocumentVerificationStatus(document.id, status); await reload(); }, 'Document verification saved to Firestore.');
  }
  return <Page title="Document Review" subtitle={item.request.id}><Step index={2} />
    {!!error && <ErrorState error={error} retry={reload} />}
    <Section title="Customer documents">
      {!item.documents.length && <Notice text="No documents have been uploaded for this warranty request." />}
      {item.documents.map(document => <Card key={document.id}><View style={ui.between}><View style={ui.row}><Icon name="document-text-outline" size={28} /><Text style={ui.sectionTitle}>{document.type}</Text></View><Badge status={document.verificationStatus} /></View>
        <Text style={ui.subtitle}>{document.fileName || 'Unnamed document'}</Text><Text selectable style={ui.subtitle}>{document.fileUrl || 'File URL not provided'}</Text>
        <View style={ui.row}><Button title="View" kind="secondary" icon="open-outline" disabled={!document.fileUrl} onPress={() => { void viewDocument(document); }} />
          <Button title={document.verificationStatus === 'Verified' ? 'Reset review' : 'Verify'} kind="secondary" disabled={mutation.pending || loading || !document.fileUrl} onPress={() => review(document, document.verificationStatus === 'Verified' ? 'Pending' : 'Verified')} />
          <Button title="Reject document" kind="danger" disabled={mutation.pending || loading} onPress={() => review(document, 'Rejected')} /></View>
      </Card>)}
    </Section>
    <Card><Text style={ui.sectionTitle}>Review checklist</Text><Check label="Warranty card uploaded" checked={card} /><Check label="Purchase receipt uploaded" checked={receipt} /><Check label="All documents look correct" checked={verified} onPress={() => {
      if (mutation.pending || loading) return;
      void mutation.run(async () => {
        if (!card || !receipt) throw new Error('Both documents need file URLs before marking them correct.');
        await updateDocumentsVerificationStatus(item.documents, verified ? 'Pending' : 'Verified'); await reload();
      }, 'Document checklist saved to Firestore.');
    }} /></Card>
    <MutationState {...mutation} />{!!viewError && <Notice text={viewError} error />}
    <Button title="Continue" icon="arrow-forward" disabled={mutation.pending || loading} onPress={() => navigation.navigate('WarrantyVerification', { warrantyRequestId: item.request.id })} />
  </Page>;
}
