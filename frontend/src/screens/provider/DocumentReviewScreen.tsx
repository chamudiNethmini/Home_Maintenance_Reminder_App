import { isFinalized } from '../../utils/providerWorkflow';
import { useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Button, Card, Check, colors, Icon, Notice, Page, ui } from '../../components/provider/ProviderUI';
import { ErrorState, LoadingState, MutationState } from '../../components/provider/ProviderDataState';
import { useWarrantyRequest, useProviderMutation } from '../../utils/useProviderData';
import { confirmWarrantyDocumentsReviewed } from '../../services/warrantyRequestService';
import type { ProviderScreenProps } from '../../navigation/providerTypes';

type ViewDocument = {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
};

export default function DocumentReviewScreen({ route, navigation }: ProviderScreenProps<'DocumentReview'>) {
  const { item, loading, error, reload } = useWarrantyRequest(route.params.warrantyRequestId);
  const mutation = useProviderMutation();
  const [review, setReview] = useState({ requestId: '', warrantyCardUploaded: false, purchaseReceiptUploaded: false, documentsReviewed: false });

  // Document viewing only.
  const [viewerTitle, setViewerTitle] = useState('');
  const [viewerVisible, setViewerVisible] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState('');
  const [documents, setDocuments] = useState<ViewDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<ViewDocument | null>(null);
  const [imageError, setImageError] = useState('');

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

  async function viewDocuments(title: string) {
    setViewerTitle(title);
    setViewerVisible(true);
    setDocumentsLoading(true);
    setDocumentsError('');
    setImageError('');
    setSelectedDocument(null);
    setDocuments([]);

    try {
      // Read the saved link directly; the existing provider
      // mapper may not return homeownerWarrantyId.
      const requestSnapshot = await getDoc(
        doc(db, 'warrantyRequests', request.id),
      );

      if (!requestSnapshot.exists()) {
        throw new Error('Warranty request was not found.');
      }

      const requestData = requestSnapshot.data();
      const homeownerWarrantyId = requestData.homeownerWarrantyId;

      if (
        typeof homeownerWarrantyId !== 'string' ||
        !homeownerWarrantyId.trim()
      ) {
        throw new Error('This request has no linked homeowner warranty.');
      }

      const warrantySnapshot = await getDoc(
        doc(db, 'homeownerWarranties', homeownerWarrantyId),
      );

      if (!warrantySnapshot.exists()) {
        throw new Error('The linked warranty was not found.');
      }

      const warrantyData = warrantySnapshot.data();

      if (
        warrantyData.customerId !== requestData.customerId ||
        warrantyData.applianceId !== requestData.applianceId
      ) {
        throw new Error('The request and warranty details do not match.');
      }

      const savedDocuments: unknown[] = Array.isArray(warrantyData.documents)
        ? warrantyData.documents
        : [];

      const uploadedDocuments: ViewDocument[] = [];

      savedDocuments.forEach((value, index) => {
        if (!value || typeof value !== 'object') return;

        const document = value as Record<string, unknown>;

        // Show only the document type selected by the provider.
        const requiredType =
          title === 'Warranty Card'
            ? 'warranty_card'
            : 'purchase_receipt';

        if (document.documentType !== requiredType) {
          return;
        }

        if (
          typeof document.fileUrl !== 'string' ||
          !document.fileUrl.startsWith('https://')
        ) {
          return;
        }

        uploadedDocuments.push({
          id: typeof document.id === 'string'
            ? document.id
            : String(index),
          fileName: typeof document.fileName === 'string'
            ? document.fileName
            : `Document ${index + 1}`,
          fileUrl: document.fileUrl,
          mimeType: typeof document.mimeType === 'string'
            ? document.mimeType
            : '',
        });
      });

      setDocuments(uploadedDocuments);
    } catch (viewError) {
      setDocumentsError(
        viewError instanceof Error
          ? viewError.message
          : 'Could not load documents.',
      );
    } finally {
      setDocumentsLoading(false);
    }
  }

  async function openDocumentLink(document: ViewDocument) {
    setImageError('');

    try {
      await Linking.openURL(document.fileUrl);
    } catch {
      setImageError('Could not open the document. Please try again.');
    }
  }

  function selectDocument(document: ViewDocument) {
    setImageError('');

    const imageDocument =
      document.mimeType.startsWith('image/') ||
      /\.(jpe?g|png|webp)(?:[?#]|$)/i.test(document.fileUrl);

    if (imageDocument) {
      setSelectedDocument(document);
    } else {
      void openDocumentLink(document);
    }
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
        <Button
          title="View"
          disabled={documentsLoading}
          onPress={() => { void viewDocuments(document.title); }}
        />
      </View>)}
    </View>
    <Text style={ui.subtitle}>Documents are managed by the customer module. Select View to open the uploaded files.</Text>
    <View style={styles.checklist}>
      <Check label="Warranty card uploaded" checked={confirmations.warrantyCardUploaded} onPress={mutation.pending ? undefined : () => toggle('warrantyCardUploaded')} />
      <Check label="Purchase receipt uploaded" checked={confirmations.purchaseReceiptUploaded} onPress={mutation.pending ? undefined : () => toggle('purchaseReceiptUploaded')} />
      <Check label="All documents look correct" checked={confirmations.documentsReviewed} onPress={mutation.pending ? undefined : () => toggle('documentsReviewed')} />
    </View>
    {!confirmed && <Notice text="Select all three confirmations before continuing. Your review is saved only when you press Continue." />}
    <MutationState {...mutation} />
    <Button title="Continue" disabled={!confirmed || mutation.pending || loading || !!error} onPress={() => { void continueReview(); }} />

    <Modal
      visible={viewerVisible}
      animationType="slide"
      onRequestClose={() => setViewerVisible(false)}
    >
      <View style={styles.viewer}>
        <Text style={styles.viewerTitle}>{viewerTitle}</Text>

        {documentsLoading ? (
          <View style={styles.viewerContent}>
            <LoadingState />
          </View>
        ) : documentsError ? (
          <View style={styles.viewerContent}>
            <ErrorState
              error={documentsError}
              retry={() => viewDocuments(viewerTitle)}
            />
          </View>
        ) : selectedDocument ? (
          <View style={styles.viewerContent}>
            <Text style={ui.label}>{selectedDocument.fileName}</Text>
            <Image
              key={selectedDocument.fileUrl}
              source={{ uri: selectedDocument.fileUrl }}
              style={styles.fullImage}
              resizeMode="contain"
              accessibilityLabel={selectedDocument.fileName}
              onError={() => setImageError('Image could not load. Try Open in browser.')}
            />
            {!!imageError && <Notice text={imageError} />}
            <Button
              title="Open in browser"
              onPress={() => { void openDocumentLink(selectedDocument); }}
            />
            <Button
              title="Back to files"
              onPress={() => {
                setSelectedDocument(null);
                setImageError('');
              }}
            />
          </View>
        ) : (
          <ScrollView
            style={styles.viewerContent}
            contentContainerStyle={styles.fileList}
          >
            <Text style={ui.subtitle}>
              Select the uploaded file for {viewerTitle.toLowerCase()}.
            </Text>

            {documents.length === 0 && (
              <Notice text="No uploaded document links were found for this warranty." />
            )}

            {documents.map((document, index) => (
              <View key={`${document.id}-${index}`} style={styles.fileRow}>
                <Text style={ui.label}>{document.fileName}</Text>
                <Button
                  title="Open"
                  onPress={() => selectDocument(document)}
                />
              </View>
            ))}

            {!!imageError && <Notice text={imageError} />}
          </ScrollView>
        )}

        <Button
          title="Close"
          onPress={() => setViewerVisible(false)}
        />
      </View>
    </Modal>
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

  // Document viewer styles only.
  viewer: { flex: 1, backgroundColor: '#F4F8FA', paddingHorizontal: 20, paddingTop: 54, paddingBottom: 32, gap: 14 },
  viewerTitle: { fontSize: 20, fontWeight: '700', color: colors.navy },
  viewerContent: { flex: 1, gap: 12 },
  fullImage: { flex: 1, width: '100%', minHeight: 100 },
  fileList: { gap: 12, paddingBottom: 20 },
  fileRow: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, gap: 10 },
});