# GidiNest V2 Authentication API Migration Guide

This guide will help you migrate from V1 authentication APIs to the new V2 system.

## 📋 Table of Contents

1. [Overview](#overview)
2. [What's New in V2](#whats-new-in-v2)
3. [Breaking Changes](#breaking-changes)
4. [Step-by-Step Migration](#step-by-step-migration)
5. [API Changes](#api-changes)
6. [Redux Store Changes](#redux-store-changes)
7. [Component Updates](#component-updates)
8. [Testing Checklist](#testing-checklist)

---

## Overview

V2 brings significant improvements to authentication:
- **Simplified Registration**: Single-step signup (no more OTP flow)
- **Passcode Support**: 6-digit passcode for quick login
- **PIN Management**: 4-digit transaction PIN with full CRUD
- **Automatic Token Refresh**: 1-hour access tokens with automatic renewal
- **24-Hour Restrictions**: Security feature for passcode/PIN changes
- **Better Session Management**: Device tracking and remote logout

---

## What's New in V2

### ✨ New Features

1. **Single-Step Registration**
   - V1: `register/initiate` → `verify-otp` → `complete`
   - V2: Single `signup` endpoint

2. **Passcode Authentication**
   - Setup 6-digit passcode for quick login
   - Change passcode with automatic restrictions
   - Verify passcode for sensitive operations

3. **PIN Management**
   - Complete CRUD for transaction PINs
   - Status checking endpoint
   - 24-hour restrictions on changes

4. **Automatic Token Refresh**
   - Access tokens expire in 1 hour (down from 14 days)
   - Automatic refresh in background
   - Token rotation for enhanced security

5. **Security Enhancements**
   - 24-hour transaction limits after passcode/PIN changes
   - Device tracking and session management
   - Better validation rules

---

## Breaking Changes

### 🚨 Important: Read Before Migrating

1. **Registration Flow Changed**
   ```typescript
   // V1 (3 steps)
   registerUser() → verifyOtp() → finalizeSignup()

   // V2 (1 step)
   signUpUser()
   ```

2. **Login Credentials Changed**
   ```typescript
   // V1
   { login_type: 'password', login_with: 'email', email, password }

   // V2
   { email, password } // or { email, passcode }
   ```

3. **Token Structure Changed**
   ```typescript
   // V1
   { token: { access, refresh } }

   // V2
   { tokens: { access_token, refresh_token, expires_in } }
   ```

4. **User Object Changes**
   ```typescript
   // New fields in V2
   {
     has_passcode: boolean,
     has_pin: boolean,
     is_restricted: boolean,
     account_tier: string,
     // ... other fields
   }
   ```

---

## Step-by-Step Migration

### Step 1: Update Environment Variables

Ensure your API base URL is set correctly:

```bash
# .env
EXPO_PUBLIC_API_URL=https://api.gidinest.com/api
```

### Step 2: Install Dependencies

```bash
npm install expo-device expo-location
```

### Step 3: Update Redux Store

The V2 slice has been added to your store. Both V1 and V2 are available during migration:

```typescript
// src/redux/rootReducer.ts
{
  auth: authReducer,     // V1 - Legacy
  authV2: authReducerV2, // V2 - New (already added)
}
```

### Step 4: Update Authentication Screens

#### Sign Up Screen

```typescript
// Before (V1)
import { registerUser, verifyOtp, finalizeSignup } from '../redux/auth';

// After (V2)
import { signUpUser } from '../redux/auth/indexV2';
// or
import { useAuthV2 } from '../hooks/useAuthV2';

// Usage
const { signUp } = useAuthV2();

await signUp({
  email: 'user@example.com',
  password: 'password',
  password_confirmation: 'password',
  first_name: 'John',
  last_name: 'Doe',
  phone: '08012345678',
});
```

#### Sign In Screen

```typescript
// Before (V1)
import { loginUser } from '../redux/auth';

// After (V2)
import { signInUser } from '../redux/auth/indexV2';
// or
import { useAuthV2 } from '../hooks/useAuthV2';

// Password Login
await signIn({ email, password });

// Passcode Login (new!)
await signIn({ email, passcode: '123456' });
```

#### Logout

```typescript
// Before (V1)
import { logout } from '../redux/auth';
dispatch(logout());

// After (V2)
import { logoutUser } from '../redux/auth/indexV2';
// or
const { logout } = useAuthV2();
await logout(); // Now invalidates server session
```

### Step 5: Add Passcode Management

```typescript
import { usePasscode } from '../hooks/useAuthV2';

const { setup, verify, change, hasPasscode, loading } = usePasscode();

// Setup passcode
await setup({
  passcode: '123456',
  passcode_confirmation: '123456',
});

// Verify passcode
await verify({ passcode: '123456' });

// Change passcode (applies 24h restriction)
await change({
  old_passcode: '123456',
  new_passcode: '654321',
  new_passcode_confirmation: '654321',
});
```

### Step 6: Add PIN Management

```typescript
import { usePin } from '../hooks/useAuthV2';

const { setup, verify, change, checkStatus, hasPin, loading } = usePin();

// Setup PIN
await setup({
  pin: '1234',
  pin_confirmation: '1234',
});

// Verify PIN before transaction
await verify({ pin: '1234' });

// Change PIN (applies 24h restriction)
await change({
  old_pin: '1234',
  new_pin: '5678',
  new_pin_confirmation: '5678',
});

// Check if PIN is set
await checkStatus();
```

### Step 7: Add Restriction Handling

```typescript
import { useRestriction } from '../hooks/useAuthV2';
import RestrictionBanner from '../components/RestrictionBanner';

const { isRestricted, getRestrictionInfo } = useRestriction();

// Show banner when restricted
{isRestricted && <RestrictionBanner />}

// Or get detailed info
const info = getRestrictionInfo();
if (info) {
  console.log(info.formattedLimit); // "₦10,000"
  console.log(info.message); // "Transaction limit restricted to ₦10,000 for 2h 30m"
}
```

### Step 8: Update Transaction Validation

```typescript
import { validateTransactionRestriction } from '../utils/restrictionHelpers';

// Before processing a transaction
const { isValid, error, warning } = validateTransactionRestriction(
  amount, // in kobo
  isRestricted,
  restrictedUntil,
  restrictedLimit
);

if (!isValid) {
  Alert.alert('Transaction Blocked', error);
  return;
}

if (warning) {
  Alert.alert('Warning', warning);
}
```

---

## API Changes

### Authentication Endpoints

| V1 Endpoint | V2 Endpoint | Changes |
|-------------|-------------|---------|
| `POST /onboarding/login` | `POST /v2/auth/signin` | Simplified request body, added passcode support |
| `POST /onboarding/register/initiate` | `POST /v2/auth/signup` | Single-step registration |
| `POST /onboarding/register/verify-otp` | ❌ Removed | No longer needed |
| `POST /onboarding/register/complete` | ❌ Removed | No longer needed |
| ❌ Not available | `POST /v2/auth/refresh` | New token refresh endpoint |
| ❌ Not available | `POST /v2/auth/logout` | New logout with session invalidation |

### New Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v2/auth/passcode/setup` | POST | Set up 6-digit passcode |
| `/v2/auth/passcode/verify` | POST | Verify passcode |
| `/v2/auth/passcode/change` | PUT | Change passcode |
| `/v2/auth/pin/setup` | POST | Set up 4-digit PIN |
| `/v2/auth/pin/verify` | POST | Verify PIN |
| `/v2/auth/pin/change` | PUT | Change PIN |
| `/v2/auth/pin/status` | GET | Check if PIN is set |

---

## Redux Store Changes

### State Structure

```typescript
// V2 Auth State
interface AuthState {
  user: User | null;
  tokens: Tokens | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // New in V2
  hasPasscode: boolean;
  hasPin: boolean;
  isRestricted: boolean;
  restrictedUntil: string | null;
  restrictedLimit: number | null;
  passcodeLoading: boolean;
  pinLoading: boolean;
  successMessage: string | null;
}
```

### Selectors

```typescript
// Access V2 state
const authState = useSelector((state: RootState) => state.authV2);

// Or use the hook
const { user, isAuthenticated, hasPasscode, hasPin, isRestricted } = useAuthV2();
```

---

## Component Updates

### Required Updates

1. **All Auth Screens**: Update to use V2 hooks
2. **Transaction Screens**: Add restriction validation
3. **Profile Screen**: Add passcode/PIN management options
4. **Dashboard**: Add restriction banner if restricted

### Optional Updates

1. **Settings Screen**: Add biometric toggle (future feature)
2. **Security Screen**: Consolidate passcode/PIN management
3. **Transaction History**: Show restriction notices

---

## Testing Checklist

### ✅ Authentication Flow

- [ ] Sign up with new single-step flow
- [ ] Sign in with password
- [ ] Sign in with passcode (after setup)
- [ ] Logout (verify session invalidated)
- [ ] Token refresh works automatically
- [ ] Auth state persists after app restart

### ✅ Passcode

- [ ] Setup 6-digit passcode
- [ ] Login with passcode
- [ ] Change passcode
- [ ] Verify 24-hour restriction applied after change
- [ ] Restriction expires after 24 hours

### ✅ PIN

- [ ] Setup 4-digit PIN
- [ ] Verify PIN before transaction
- [ ] Change PIN
- [ ] Verify 24-hour restriction applied after change
- [ ] Check PIN status

### ✅ Restrictions

- [ ] Restriction banner shows when active
- [ ] Transaction validation blocks amounts > ₦10,000
- [ ] Countdown timer updates
- [ ] Restriction automatically lifts after 24 hours

### ✅ Error Handling

- [ ] Invalid credentials show error
- [ ] Network errors handled gracefully
- [ ] Token expiry triggers refresh
- [ ] Failed refresh logs user out

---

## Troubleshooting

### Common Issues

**Issue**: "No refresh token available"
```typescript
// Solution: Ensure tokens are stored after login
await SecureStore.setItemAsync('accessToken', access_token);
await SecureStore.setItemAsync('refreshToken', refresh_token);
```

**Issue**: "401 Unauthorized" on every request
```typescript
// Solution: Check if API base URL includes /api
// Correct: https://api.gidinest.com/api
// Wrong: https://api.gidinest.com (missing /api)
```

**Issue**: Restriction not showing
```typescript
// Solution: Ensure Redux store includes authV2
// Check: src/redux/rootReducer.ts should have authV2: authReducerV2
```

**Issue**: Passcode/PIN setup not working
```typescript
// Solution: Ensure user is authenticated
// V2 passcode/PIN endpoints require auth token
const token = await SecureStore.getItemAsync('accessToken');
if (!token) {
  // User needs to login first
}
```

---

## Migration Timeline

### Phase 1: Preparation (Week 1)
- ✅ Install V2 dependencies
- ✅ Add V2 Redux slice to store
- ✅ Test V2 APIs in isolation

### Phase 2: Core Migration (Week 2)
- [ ] Update signup screen
- [ ] Update signin screen
- [ ] Update logout flow
- [ ] Test authentication flow

### Phase 3: New Features (Week 3)
- [ ] Add passcode setup
- [ ] Add PIN management
- [ ] Implement restriction UI
- [ ] Update transaction validation

### Phase 4: Testing & Cleanup (Week 4)
- [ ] End-to-end testing
- [ ] Fix bugs
- [ ] Remove V1 code (optional)
- [ ] Update documentation

---

## Support

If you encounter issues during migration:

1. Check the `BACKEND_REQUIREMENTS.md` for API documentation
2. Review existing V2 implementations:
   - `src/services/authV2Service.ts` - API calls
   - `src/redux/auth/authSliceV2.ts` - Redux logic
   - `src/hooks/useAuthV2.ts` - React hooks
   - `src/screens/auth/PasscodeSetupScreen.tsx` - Example usage
3. Test API endpoints directly using curl or Postman
4. Check browser console / React Native debugger for errors

---

## Next Steps

After completing migration:

1. **Test thoroughly** on both iOS and Android
2. **Monitor errors** in production
3. **Gather user feedback** on new features
4. **Plan V1 removal** once V2 is stable
5. **Consider OAuth** implementation (Google/Apple Sign In)

---

**Status**: V2 API fully integrated and ready for testing
**Last Updated**: November 11, 2025
