# Shared authentication integration

Startup uses the existing RoleSelectionScreen and LoginScreen. AuthContext supplies one Firebase auth listener, restores users/{uid}, and calls the existing loginUser/logoutUser services. Selected-role validation completes before mounting protected routes. RootNavigator exposes only the authenticated role's navigator. Invalid/missing profiles show an error rather than opening provider screens.

Provider login opens ProviderHome -> Dashboard. Logout removes the provider navigator and its cached request data and returns to shared role selection/login. Root navigation handles the auth transition automatically, without a second NavigationContainer or manual login reset.

Create Warranty Request moved from WarrantyProviderEntryScreen to Dashboard Quick Actions. The legacy entry source and parameter type are retained, but the screen is not registered. Its former /provider-entry URL is an alias for shared role selection when signed out. Provider URLs otherwise retain their existing paths. Authenticated direct URLs work for that role; a signed-out protected URL goes to shared authentication, then Dashboard after login (no deferred deep-link replay).

ProviderModuleProvider receives the authenticated UID. Existing services filter requests/notifications by that UID, and new appliance-linked warranties and warranty requests use it as providerId. Notification status updates retain the request's providerId. Legacy null/other-provider records are not migrated or shown in this provider's filtered list. Profile displays Firebase displayName/email with shared profile fallbacks and uses the shared logout service.

## Changed files
- App.tsx
- src/navigation/RootNavigator.tsx
- src/navigation/ProviderNavigator.tsx
- src/navigation/rootTypes.ts
- src/navigation/providerLinking.ts
- src/screens/auth/LoginScreen.tsx (UI retained; delegates login transition to session state)
- src/screens/provider/ProviderDashboardScreen.tsx
- src/screens/provider/ProviderProfileScreen.tsx
- src/screens/provider/WarrantyProviderEntryScreen.tsx
- src/services/authService.ts (extracts existing profile lookup for reuse during restoration)
- tests/providerWorkflow.test.mjs

Added: src/components/auth/AuthContext.tsx, src/navigation/rootLinking.ts, AUTH_INTEGRATION.md.

Firebase initialization, Firestore CRUD services, document review, verification, finalized views, request route parameters, and bottom tabs remain in place.

## Integration requirements
- A valid Firebase Auth account needs users/{uid} with role: "provider" (or the existing homeowner/technician roles).
- Deployed Firestore rules must permit that authenticated account to read its profile and perform its authorized module operations. Navigation guards are not a replacement for Firestore rules; no rules were changed/deployed here.
- Request-level customer IDs remain until the customer module supplies shared customer identities.
- The technician module is still unconnected; its authenticated placeholder includes logout. The shared homeowner screen is preserved.
- Current providerId equality queries and client sorting need no new composite index. Enabling server-side createdAt sorting together with providerId may require the existing optional composite index.

## Manual test
1. From frontend run npx expo start --clear. Use Expo Go on Android/iOS or press w for web.
2. In a signed-out session, shared role selection must appear. Choose Warranty Provider and log in with a real provider account. Wrong credentials or a mismatched selected role must not open the provider dashboard.
3. Confirm Dashboard counts, recent requests, and all three Quick Actions. Use Create Warranty Request to submit valid details. Confirm success and inspect appliances, warranties, and warrantyRequests in Firestore; the latter two must use the signed-in UID as providerId.
4. Refresh Requests and reopen the created request. Save details, select all document confirmations, save verification, and confirm a status change. Reload and check persistence and the linked notification.
5. Open approved/rejected requests from Requests and Notifications; they must remain read-only. Pending/more-information requests retain the editable flow.
6. On web, navigate tabs and detail URLs, use browser back/forward, and refresh a provider route while signed in.
7. Open Profile, check identity, and log out. Browser back/direct provider URLs must not reveal provider data while signed out. Log in again and confirm Dashboard opens. Restart while signed in to check restoration.

Automated tests use mocked services; they do not create live records or establish successful real-account login.

## Validation completed
- npm run typecheck: passed.
- npm run test:provider: 22 tests passed, including shared profile/role validation and root linking scope.
- npx expo install --check: dependencies up to date.
- npx expo export --platform all --output-dir dist --no-bytecode --max-workers 1: web, Android and iOS JavaScript exports passed. This does not constitute a device runtime test or native binary build.
- One top-level NavigationContainer, one auth listener and one Firebase initialization confirmed by source audit.
- Live sign-in, logout and Firestore writes still require the manual test above with a real account; none were performed in this integration task.
