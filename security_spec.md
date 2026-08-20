# Security Specification - Mobile Store Manager SaaS

## Data Invariants
1. A Product must belong to a Store.
2. A Sale must belong to a Store and be created by an authenticated user linked to that Store.
3. Users can only access data if their `storeId` matches the Store they are trying to access (except Superadmins).
4. Subscriptions are managed at the Store level.
5. Critical fields like `ownerId` in a Store doc cannot be changed after creation.

## The Dirty Dozen Payloads (Rejection Targets)
1. **Identity Spoofing**: Attempt to create a Store with someone else's `ownerId`.
2. **Cross-Tenant Read**: Attempt to read products from `store_A` while being a member of `store_B`.
3. **Privilege Escalation**: A `cashier` attempting to update `subscriptionStatus` of their Store.
4. **Invalid IMEI**: Attempt to add an IMEI that doesn't follow the numeric pattern.
5. **State Shortcutting**: Attempt to set `subscriptionStatus` to `active` without a payment record (this should be handled by server, but client rules should block direct update if not admin).
6. **Negative Price**: Attempt to create a Product with a negative `sellingPrice`.
7. **Negative Stock**: Attempt to set `stock` to a negative value.
8. **Unauthorized Customer Debt**: Attempt to update a customer's `debt` field by a non-authorized role.
9. **POI Leak**: Unauthorized read of `users` collection for PII.
10. **Ghost Field**: Adding `isVerified: true` to a Store doc.
11. **Immutable Field Update**: Changing `createdAt` on a Sale.
12. **Unverified Email**: Writing data with an unverified email (if enforced).

## Security Rules Helpers (Phase 3)
```javascript
function isValidId(id) { return id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$'); }
function incoming() { return request.resource.data; }
function existing() { return resource.data; }
function isSignedIn() { return request.auth != null; }
function isVerified() { return isSignedIn() && request.auth.token.email_verified == true; }
function isOwner(storeId) { return isSignedIn() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.storeId == storeId && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner'; }
function isManager(storeId) { return isSignedIn() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.storeId == storeId && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['owner', 'manager']; }
function isMember(storeId) { return isSignedIn() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.storeId == storeId; }
function isSuperAdmin() { return isSignedIn() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superadmin'; }
```
