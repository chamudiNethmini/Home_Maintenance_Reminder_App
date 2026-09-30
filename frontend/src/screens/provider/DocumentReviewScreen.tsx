import { isFinalized } from '../../utils/providerWorkflow';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, Check, colors, Icon, Notice, Page, ui } from '../../components/provider/ProviderUI';
import { ErrorState, LoadingState, MutationState } from '../../components/provider/ProviderDataState';
import { useWarrantyRequest, useProviderMutation } from '../../utils/useProviderData';
import { confirmWarrantyDocumentsReviewed } from '../../services/warrantyRequestService';
import type { ProviderScreenProps } from '../../navigation/providerTypes';

export default function DocumentReviewScreen({ route, navigation }: ProviderScreenProps<'DocumentReview'>) {
  const { item, loading, error, reload } = useWarrantyRequest(route.params.warrantyRequestId);
  const mutation = useProviderMutation();
  const [review, setReview] = useState({ requestId: '', warrantyCardUploaded: false, purchaseReceiptUploaded: false, documentsReviewed: false });
  if (!item || loading || error) return <Page title="Document Review">{loading ? <LoadingState /> : <ErrorState error={error || 'Request not found.'} retry={reload} />}</Page>;
  if (isFinalized(item.status)) return <Page title="Finalized Request"><Card><Text>This warranty request has already been {item.status.toLowerCase()}.</Text><Button title="View finalized request" onPress={() => navigation.replace('CustomerApplianceInfo', { warrantyRequestId: item.id })} /></Card></Page>;
  const request = item;
  const confirmations = review.requestId === request.id ? review : { requestId: request.id, warrantyCardUploaded: false, purchaseReceiptUploaded: false, documentsReviewed: false };
  const confirmed = confirmations.warrantyCardUploaded && confirmations.purchaseReceiptUploaded && confirmations.documentsReviewed;
  function toggle(field: 'warrantyCardUploaded' | 'purchaseReceiptUploaded' | 'documentsReviewed') {
    if (mutation.pending) return;
    setReview({ ...confirmations, [field]: !confirmations[field] });
    mutation.clear();
  }
  async function continueReview() {
    if (!confirmed || mutation.pending || loading || error) return;
    const saved = await mutation.run(async () => { await confirmWarrantyDocumentsReviewed(request.id, confirmations); }, 'Document review saved.');
    if (saved) navigation.navigate('WarrantyVerification', { warrantyRequestId: request.id });
  }
  return <Page title="Document Review" subtitle="Review the document confirmations and make sure everything looks correct.">
    <Text selectable style={ui.caption}>REQUEST · {request.id}</Text>
    <View style={styles.documents}>
      {([
        { title: 'Warranty Card', caption: 'WARRANTY CARD', checked: confirmations.warrantyCardUploaded, icon: 'shield-checkmark-outline' },
        { title: 'Purchase Receipt', caption: 'RECEIPT', checked: confirmations.purchaseReceiptUploaded, icon: 'receipt-outline' },
      ] as const).map(document => <View key={document.title} style={styles.documentCard}>
        <View style={styles.preview} accessibilityLabel={document.title + ' illustration'}>
          <View style={styles.paper}>
            <View style={styles.paperHeader} />
            <Icon name={document.icon} size={30} />
            <View style={styles.line} /><View style={[styles.line, { width: '70%' }]} /><View style={styles.line} />
          </View>
          <Text style={styles.previewCaption}>{document.caption}</Text>
        </View>
        <Text style={[ui.label, { fontWeight: '700' }]}>{document.title}</Text>
        <View style={styles.status}>
          <Icon name={document.checked ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={document.checked ? colors.teal : colors.muted} />
          <Text style={[styles.statusText, { color: document.checked ? colors.teal : colors.muted }]}>{document.checked ? 'Confirmed' : 'Not confirmed'}</Text>
        </View>
        <Button title="View" disabled onPress={() => {}} />
      </View>)}
    </View>
    <Text style={ui.subtitle}>Documents are managed by the customer module. File viewing is unavailable here.</Text>
    <View style={styles.checklist}>
      <Check label="Warranty card uploaded" checked={confirmations.warrantyCardUploaded} onPress={mutation.pending ? undefined : () => toggle('warrantyCardUploaded')} />
      <Check label="Purchase receipt uploaded" checked={confirmations.purchaseReceiptUploaded} onPress={mutation.pending ? undefined : () => toggle('purchaseReceiptUploaded')} />
      <Check label="All documents look correct" checked={confirmations.documentsReviewed} onPress={mutation.pending ? undefined : () => toggle('documentsReviewed')} />
    </View>
    {!confirmed && <Notice text="Select all three confirmations before continuing. Your review is saved only when you press Continue." />}
    <MutationState {...mutation} />
    <Button title="Continue" disabled={!confirmed || mutation.pending || loading || !!error} onPress={() => { void continueReview(); }} />
  </Page>;
}

const styles = StyleSheet.create({
  documents: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  documentCard: { flexGrow: 1, flexBasis: 140, minWidth: 140, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 12, gap: 12 },
  preview: { minHeight: 145, backgroundColor: '#F1F9F9', borderRadius: 10, alignItems: 'center', justifyContent: 'center', padding: 12, gap: 8 },
  paper: { width: 62, height: 84, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 4, alignItems: 'center', padding: 7, gap: 5 },
  paperHeader: { width: '100%', height: 6, backgroundColor: colors.cyan, borderRadius: 2 },
  line: { width: '100%', height: 3, borderRadius: 2, backgroundColor: '#CEDCE3' },
  previewCaption: { fontSize: 9, letterSpacing: 0.5, color: colors.navy, fontWeight: '700', textAlign: 'center' },
  status: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusText: { fontSize: 12, flexShrink: 1 },
  checklist: { gap: 8 },
});
