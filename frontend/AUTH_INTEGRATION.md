# Shared login / provider integration

## Behavior
- App mounts the existing shared RoleSelectionScreen and LoginScreen through RootNavigator. One AuthContext listener restores Firebase sessions and validates users/{uid}.role using the shared authService lookup.
- LoginScreen retains its UI and calls the existing loginUser through the context. Selected-role validation completes before protected screens mount. Navigation changes automatically with auth state.
- Authenticated providers start at ProviderHome / Dashboard. Profile shows Firebase displayName/email (shared profile fallbacks) and UID; logout reuses logoutUser and returns to shared role selection/login.
- Create Warranty Request is now a compact Dashboard Quick Action, beside View All Requests and Notifications.
- WarrantyProviderEntryScreen source/type remain for compatibility but it is not registered or used at startup. Its creation button was removed. /provider-entry aliases shared role selection when signed out.
- Existing provider URLs are nested under the guarded ProviderFlow without changing their paths. Protected URLs while signed out show authentication; successful login opens Dashboard rather than replaying an unauthenticated URL.
- ProviderModuleProvider receives authenticatedProviderId separately from its optional query-filter providerId. The UID is exposed to the existing creation flow so new warranties/requests use it. Existing collection queries keep their prior scope (all records allowed by deployed Firestore rules), avoiding disappearance of older null-provider records. No migration, reassignment, rules edits, or collection mutations were performed during integration.
- Existing request CRUD, verification, document confirmation, notification actions, and finalized read-only handling are preserved.

## Files modified
- App.tsx
- src/navigation/RootNavigator.tsx
- src/navigation/ProviderNavigator.tsx
- src/navigation/rootTypes.ts
- src/navigation/providerLinking.ts
- src/screens/auth/LoginScreen.tsx
- src/screens/provider/ProviderDashboardScreen.tsx
- src/screens/provider/ProviderProfileScreen.tsx
- src/screens/provider/WarrantyProviderEntryScreen.tsx
- src/components/provider/ProviderContext.tsx
- src/services/authService.ts
- tests/providerWorkflow.test.mjs

Added: src/components/auth/AuthContext.tsx, src/navigation/rootLinking.ts, AUTH_INTEGRATION.md.

## Remaining integration dependencies
- Each account requires users/{Firebase UID} with role provider/homeowner/technician. Firestore rules must grant the intended profile and module permissions. UI auth guards do not replace those rules.
- TODO: confirm shared-queue versus provider-assigned request visibility with the team before enabling optional provider-only query filtering. Legacy records must not be reassigned automatically.
- Customer identities remain request-level until the customer schema is integrated.
- The technician module remains unconnected, with a signed-in notice and shared logout action. The existing homeowner screen is unchanged.
- No new composite indexes are required for the current queries.

## Test the complete flow
1. From frontend run npx expo start --clear; scan with Expo Go or press w for web.
2. Signed out: confirm the shared role chooser appears and has no Create Warranty Request button. Choose Warranty Provider and log in with a real matching account. Invalid credentials or selecting a mismatched role must not open provider screens.
3. Confirm Dashboard statistics and previous accessible data, then use Quick Actions -> Create Warranty Request. Submit valid details. Verify appliances/warranties/warrantyRequests records in Firestore and the signed-in provider UID on the new warranty and request. No files are uploaded.
4. Refresh Requests and open the new record. Save customer/appliance information, confirm all three document checkboxes, perform verification, and update status. Reload to check persistence.
5. Open Notifications and its View request action. Approved/rejected records remain read-only; pending/more-information records retain the editable workflow.
6. Open Profile and confirm name/email/UID. Log out; shared authentication returns. Browser back or a protected URL while signed out must not reveal provider screens.
7. Log in again, then restart/reload while signed in to test session restoration. Test provider URL refresh and browser back/forward on web; repeat navigation on Android/iOS.

TypeScript, Expo dependency check, and all 22 regression tests passed. Tests use mocks; real-account login and live Firestore writes were not performed by the agent.

Web, Android and iOS JavaScript exports also passed using npx expo export --platform all --output-dir dist --no-bytecode --max-workers 1. These are bundle checks, not live device/authentication tests.
