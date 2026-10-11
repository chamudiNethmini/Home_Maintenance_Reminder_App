# Warranty Provider module — Firestore integration

## What changed

The existing screens, styling and navigation flow are preserved. The route parameter is now warrantyRequestId. Dashboard, Requests, Customer & Appliance Information, Document Review, Warranty Verification, Status Update and Notifications use the existing Firebase JS SDK db instance.

There is no mock data fallback. The old providerMockData.ts and local status/notification reducers are removed. No login, chat, file upload, server, Admin SDK or new package was added. Firebase configuration and .env are unchanged.

## Data behavior

- All accessible warrantyRequests are read, without a 100-record cap. Counts and filters derive from those records.
- Requests and notifications sort by createdAt descending after timestamp normalization. Missing dates remain visible as “Date unavailable”.
- Appliance names are joined from appliances, with applianceName on the request as a fallback. A failed appliance lookup does not remove its request from dashboard counts.
- Customer contact fields are on warrantyRequests, as confirmed by the user: customerName, customerPhone, customerEmail. Reading also supports a legacy nested customer object.
- Detail saves atomically update request contact fields, appliance details and warranty details. They do not replace a concurrent request status/notes change.
- Document metadata comes from warrantyDocuments where warrantyRequestId equals the selected ID. View opens its actual HTTPS fileUrl. Missing URLs are shown, not replaced with sample files.
- Document verification writes lowercase pending / verified / rejected.
- Request statuses persist as pending / approved / rejected / more_information_required. The UI retains readable labels.
- Status updates and their provider notification commit together in a transaction with serverTimestamp(). Identical status/notes updates do not duplicate notifications.
- Approval re-reads the linked warranty, appliance and known document records. Missing modelCovered is unknown, not automatically covered. Required documents need URLs and verified states.
- Mark-read and mark-all-read persist to Firestore. There is no realtime chat or customer-message delivery.
- Reads reject cache-only snapshots, so an offline empty cache is not presented as an empty server collection.
- Loading, retry/error, empty, saving and confirmed-success states are included. Success is shown only after the write promise resolves. Refresh errors are reported separately from a committed write.
- Refresh buttons reload externally created data; provider actions refresh the shared request/notification state.

## Schema and types

The normalized TypeScript domain uses ISO timestamps and YYYY-MM-DD dates. FirestoreWarrantyRequest describes Timestamp fields. The mapping adapter explicitly accepts Firestore Timestamps, dates, legacy strings and missing timestamps without any.

warrantyRequests:
- customerId, applianceId, warrantyId
- providerId: string or null until assigned
- customerName, customerPhone, customerEmail, applianceName
- status (canonical lowercase value), notes
- createdAt and updatedAt (Firestore Timestamp)

appliances:
- customerId, name, brand, model, serialNumber, purchaseDate

warranties:
- applianceId, purchaseDate, expiryDate, status, modelCovered (boolean)

warrantyDocuments:
- warrantyRequestId, type (warranty_card or purchase_receipt; display labels are also readable)
- fileName, fileUrl (HTTPS or null), verificationStatus

providerNotifications:
- providerId, warrantyRequestId, customerName, title, message, isRead, createdAt

No separate customers or users collection is assumed. Contact edits update this request's snapshot only.

## CRUD methods

| Service | Implemented exports |
| --- | --- |
| warrantyRequestService | createWarrantyRequest, getWarrantyRequests, getWarrantyRequestById, updateWarrantyRequest, updateWarrantyRequestStatus, deleteWarrantyRequest |
| applianceService | getApplianceById, updateAppliance |
| warrantyService | getWarrantyById, updateWarranty |
| warrantyDocumentService | getDocumentsByWarrantyRequest, updateDocumentVerificationStatus, updateDocumentsVerificationStatus |
| providerNotificationService | createProviderNotification, getProviderNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteProviderNotification |

Additional request helpers: getRequestSummaries, getWarrantyCaseById, saveWarrantyCaseDetails.

updateWarrantyRequest accepts contact fields, applianceName and notes. Use updateWarrantyRequestStatus for status changes, so the server timestamp and notification stay consistent. Service callers pass readable status labels (e.g. Approved); persistence is canonical lowercase. Request deletion deletes only that request, not unrelated appliance/warranty documents.

## Authentication, rules and customer-module dependencies

ProviderModuleProvider accepts an optional providerId prop. Once the authentication team has a verified provider mapping, supply it here. Do not assume the role-entry selection is authentication.

Until then, the service's documented TODO fallback reads all accessible warrantyRequests and providerNotifications. There is no fake provider account ID in the UI. Filtering is not a substitute for deployed Firestore rules.

The repository's firebase/firestore.rules currently denies all access. It was not changed or deployed. The connected project's live read check succeeded, so local rules are not evidence of its deployed write permissions. Ask the shared auth/security owner to establish appropriate provider read/write access; do not open production rules to run these tests.

The customer module must supply correct linked IDs, request contact fields, uploaded-file HTTPS URLs and a reliable modelCovered value or coverage-policy integration. Provider notifications currently describe the request's activity; a customer-visible delivery contract still belongs to the shared/customer integration.

## Indexes

No new composite index is required by the default queries:
- unfiltered request/notification collection reads;
- equality on providerId when provided;
- equality on warrantyDocuments.warrantyRequestId;
- single-field IN on providerNotifications.warrantyRequestId for optional development cleanup.

Keep the automatic single-field indexes enabled.

getWarrantyRequests(providerId, true) optionally enables server-side orderBy(createdAt, desc). Combining that option with providerId may require a composite index on warrantyRequests: providerId ascending, createdAt descending. The default stays client-sorted to include legacy records without createdAt. [Firebase documents that orderBy excludes records missing that field](https://firebase.google.com/docs/firestore/query-data/order-limit-data).

Transactions read before writing and keep related changes atomic. [Firebase transaction documentation](https://firebase.google.com/docs/firestore/manage-data/transactions).

## Exact development CRUD test steps

Use a dedicated development Firebase project with appropriate write permissions. This work did not seed or modify your live database.

1. Start from frontend:

```powershell
npm run web -- --clear
```

Open the browser developer console. The optional tools register asynchronously in development builds only:

```javascript
const fm = globalThis.fixmateProviderDev;
console.log(fm.projectId);
```

If fm is undefined, wait for the app to finish loading and try again. These tools use src/config/firebase.ts; they do not initialize another Firebase app.

2. CREATE the small development dataset explicitly:

```javascript
await fm.seed({
  projectId: fm.projectId,
  confirm: 'CREATE DEVELOPMENT TEST DATA'
});
```

This creates exactly three requests (pending, approved, rejected), three appliances, three warranties, six document metadata records and two notifications. IDs start with fixmate-dev-. Creation is atomic and refuses to overwrite any existing sample ID.

The helper does not upload files. To test real file opening, optionally pass warrantyCardUrl and purchaseReceiptUrl with HTTPS URLs of your existing test files, or set those fileUrl fields in the Firebase console. Without URLs, metadata still appears and the UI explains that the file is missing; approval remains blocked until review is complete.

3. READ:

```javascript
await fm.readRequests();
await fm.getRequest('fixmate-dev-request-1');
await fm.getDocuments('fixmate-dev-request-1');
await fm.readNotifications();
```

Press Refresh on Dashboard/Requests/Notifications. Counts must reflect the real collection (the sample adds one of each main status). Search for fixmate-dev-request-1 and open it.

4. UPDATE through the existing screens:

- Edit the phone or appliance model and Save. Reload the app, reopen the same request, and confirm the value persists.
- Open actual document URLs, verify each document or use the checklist. Reload and confirm verificationStatus persisted.
- Approve, Reject, or Request Information. Check the request in the Firebase console for canonical status, notes and timestamp.
- On Status Update choose another status, enter notes, confirm and submit. Reload to verify persistence.
- Mark one notification and then all notifications read. Reload and verify the badges/read state.

For an explicit service-level CRUD request, create a disposable request referencing the sample relations:

```javascript
const original = await fm.getRequest('fixmate-dev-request-1');
const { id, createdAt, updatedAt, ...payload } = original;
const testId = await fm.createRequest({
  ...payload, status: 'Pending', notes: 'Temporary CRUD test'
});
await fm.updateRequest(testId, { notes: 'Details update verified' });
await fm.updateStatus(testId, 'More Information Required', 'Please provide a receipt');
await fm.getRequest(testId);
```

The disposable request has no uploaded documents; do not approve it until its own required document records exist.

5. CREATE / READ / UPDATE / DELETE a disposable notification:

```javascript
const notificationId = await fm.createNotification({
  providerId: original.providerId,
  warrantyRequestId: testId,
  customerName: original.customerName,
  title: 'Development CRUD test',
  message: 'Temporary notification',
  isRead: false
});
await fm.markRead(notificationId);
(await fm.readNotifications()).find(n => n.id === notificationId);
await fm.deleteNotification(notificationId);
```

6. DELETE the disposable request and its remaining test notifications:

```javascript
const testNotifications = (await fm.readNotifications())
  .filter(n => n.warrantyRequestId === testId);
for (const notification of testNotifications) {
  await fm.deleteNotification(notification.id);
}
await fm.deleteRequest(testId);
await fm.getRequest(testId); // null
```

7. Optional sample-dataset cleanup:

```javascript
await fm.cleanup({
  projectId: fm.projectId,
  confirm: 'DELETE DEVELOPMENT TEST DATA'
});
```

Cleanup only targets the reserved sample paths and marked notifications for those sample requests, and refuses records without the expected development marker. It does not delete arbitrary records. Reload the UI after cleanup.

Remove src/dev/providerFirestoreTools.ts and its development-only registration effect from App.tsx when no longer needed. No seed or cleanup operation runs on app startup.

## Validation performed

- TypeScript passes.
- Expo dependency compatibility check passes; no packages installed.
- Twelve tests pass using an in-memory Firebase SDK test double, not a live database. They cover mapping, all-record reads, relations, canonical transactional writes, failure behavior, document/read-state writes, CRUD targeting and seed guards.
- Android, iOS and web JavaScript exports pass with --no-bytecode. No physical-device/Hermes execution claim is made.
- Live web READ calls succeeded and returned zero requests and zero notifications; the empty state rendered without browser exceptions.
- No Firestore write channel was opened during that check. Live CREATE, UPDATE and DELETE have not been tested. The optional helper was not invoked to seed the live project.

## Files modified

- App.tsx
- src/components/provider/ProviderContext.tsx
- src/components/provider/ProviderUI.tsx
- src/components/provider/RequestCard.tsx
- src/navigation/providerTypes.ts
- src/screens/provider/WarrantyProviderEntryScreen.tsx
- src/screens/provider/ProviderDashboardScreen.tsx
- src/screens/provider/WarrantyRequestsScreen.tsx
- src/screens/provider/CustomerApplianceInfoScreen.tsx
- src/screens/provider/DocumentReviewScreen.tsx
- src/screens/provider/WarrantyVerificationScreen.tsx
- src/screens/provider/StatusUpdateScreen.tsx
- src/screens/provider/ProviderNotificationsScreen.tsx
- src/screens/provider/ProviderProfileScreen.tsx
- src/services/providerFirestore.ts
- src/services/warrantyRequestService.ts
- src/services/applianceService.ts
- src/services/warrantyService.ts
- src/services/warrantyDocumentService.ts
- src/services/providerNotificationService.ts
- src/types/provider.ts
- src/utils/providerWorkflow.ts
- tests/providerWorkflow.test.mjs
- PROVIDER_MODULE.md

## Files created

- src/components/provider/ProviderDataState.tsx
- src/utils/providerFirestoreMapping.ts
- src/utils/useProviderData.ts
- src/dev/providerFirestoreTools.ts

## File removed

- src/utils/providerMockData.ts

Nothing was committed or pushed.
