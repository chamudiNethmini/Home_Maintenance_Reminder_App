# FixMate — Warranty Provider & Communication Module

## Scope

Provider-only local preview. No authentication UI, registration, password reset, file upload, chat, realtime messaging, backend server, or Admin SDK is added. Existing Firebase configuration and credentials are unchanged.

The shared authentication team can mount ProviderNavigator under its existing NavigationContainer, with ProviderModuleProvider around the module. Do not nest a second NavigationContainer. Role entry is a navigation shortcut, not authentication or authorization.

## Run

From the frontend directory:

```powershell
npm run web -- --clear
# Or start Expo and scan its QR code in Expo Go:
npm start -- --clear
npm run typecheck
npm run test:provider
npx expo install --check
```

The workflow tests use the existing Node 22+ development tooling; there is no Node application server.

## Navigation

WarrantyProviderEntry → ProviderHome (Dashboard / Requests / Notifications / Profile tabs).

Requests or a dashboard request card → CustomerApplianceInfo → DocumentReview → WarrantyVerification → StatusUpdate → Notifications or Requests.

All request detail routes carry requestId. The root App wraps this module in one NavigationContainer and SafeAreaProvider. Profile is a small sample provider summary, not an account/authentication implementation.

## Working interactions

- Three role cards; Warranty Provider is selected and opens the dashboard. Other roles are intentionally disabled.
- Counts derive from the same local request state displayed in the request list.
- Case-insensitive search by request ID, customer, appliance or brand; status filters and date sorting; reset and empty state.
- Editable customer/appliance/warranty fields. Save and Continue validate required fields, email and actual calendar dates. Continue saves before advancing.
- Document cards for warranty card and receipt. Sample documents show an explicit sample preview. Real HTTPS document URLs open with Linking. Missing documents are shown; no upload controls.
- Review checkbox changes document verification state. Eligibility checks use warranty dates, receipt availability, model coverage and document verification.
- Approve is blocked until eligibility passes. Reject and Request Information work locally. Status and notes are retained across screens.
- Status Update requires explicit confirmation. A status or note change creates one unread provider notification; an identical update does not duplicate it.
- Individual/bulk mark-read, unread tab badge, notification-to-request navigation. No customer message is transmitted.
- Local state resets when the app reloads. Document content, people and request records are sample data.

## Logo and prototype limitation

The resumed workspace does not contain assets/fixmate-logo.png, and no prototype screenshots were supplied with the text request. The UI follows the written light/teal/rounded-card brief using an icon-and-wordmark fallback.

Once the logo asset is supplied, replace the fallback in Brand in src/components/provider/ProviderUI.tsx with a React Native Image using require('../../../assets/fixmate-logo.png'). Do not add that static require until the file exists, because Metro will fail to bundle.

## Firestore preparation

Prepared client services use the existing db export for these collections:

| Collection | Service |
| --- | --- |
| warrantyRequests | warrantyRequestService.ts |
| warranties | warrantyService.ts |
| appliances | applianceService.ts |
| warrantyDocuments | warrantyDocumentService.ts |
| providerNotifications | providerNotificationService.ts |

Domain types use ISO strings for timestamps and YYYY-MM-DD strings for calendar dates. providerFirestore normalizes top-level Firestore Timestamps and writes timestamp fields as Timestamps. Status changes use a transaction to update the request and create a provider notification with server timestamps.

These services are not connected to the local preview or invoked at startup. No production Firestore data was changed or seeded. Customer details in the preview are joined sample data; the customer record source belongs to the team's shared/customer module.

Before integrating live screens:
- Use the authenticated provider ID supplied by the shared auth module; never use provider-demo as a production identity.
- Apply provider ownership/security rules for reads and writes, including linked appliances, warranties and documents. Existing rules were not modified.
- Fetch and validate the latest record schema and eligibility before calling the prepared status-update service. The preview's eligibility checks alone are not server-side authorization.
- Add cursor pagination beyond the service's 100-record read cap and join request relations to the customer source.
- Replace sample document content with actual uploaded-file HTTPS URLs.
- Decide with the customer-module owner how customer-visible notification records are delivered. This module only writes provider notification records when live services are explicitly called.

## Created files

- src/screens/provider/WarrantyProviderEntryScreen.tsx
- src/screens/provider/ProviderDashboardScreen.tsx
- src/screens/provider/WarrantyRequestsScreen.tsx
- src/screens/provider/CustomerApplianceInfoScreen.tsx
- src/screens/provider/DocumentReviewScreen.tsx
- src/screens/provider/WarrantyVerificationScreen.tsx
- src/screens/provider/StatusUpdateScreen.tsx
- src/screens/provider/ProviderNotificationsScreen.tsx
- src/screens/provider/ProviderProfileScreen.tsx
- src/navigation/ProviderNavigator.tsx
- src/navigation/providerTypes.ts
- src/components/provider/ProviderContext.tsx
- src/components/provider/ProviderUI.tsx
- src/components/provider/RequestCard.tsx
- src/types/provider.ts
- src/utils/providerMockData.ts
- src/utils/providerWorkflow.ts
- src/services/providerFirestore.ts
- src/services/warrantyRequestService.ts
- src/services/applianceService.ts
- src/services/warrantyDocumentService.ts
- src/services/providerNotificationService.ts
- tests/providerWorkflow.test.mjs
- PROVIDER_MODULE.md

## Modified files

- App.tsx: replaces the temporary connection-test entry point with the provider navigator.
- app.json: changes the display name to FixMate; keeps Android, iOS and web.
- package.json: adds test:provider.
- tsconfig.json: excludes generated dist bundles from application typechecking.
- src/services/warrantyService.ts: fills the existing empty service stub.

## Dependencies

The preceding setup installed these packages; all were already present when this implementation resumed, so no further project package installation or lockfile change was needed:

- @react-navigation/native ^7.5.0
- @react-navigation/native-stack ^7.20.0
- @react-navigation/bottom-tabs ^7.20.0
- react-native-screens ~4.26.0
- react-native-safe-area-context ~5.7.0
- @expo/vector-icons ^15.0.2

Browser QA used a temporary Playwright installation outside the repository, not an application dependency.

## Validation

- TypeScript passes.
- Expo online dependency compatibility check passes.
- Seven workflow tests pass: filtering, approval prerequisites, atomic local request/notification update, duplicate prevention, missing receipt, expired warranty, read states and date validation.
- Android, iOS and web JavaScript exports pass with --no-bytecode. Native device execution and Hermes bytecode compilation are not claimed.
- Headless Edge: mobile entry/dashboard; full search → edit/save/date validation → two document previews → review → approval → confirmed status change → notification → mark-all-read flow passed with no browser exceptions.
- Desktop viewport has no horizontal overflow; mobile and desktop screenshots were visually inspected.

Nothing was committed or pushed.
