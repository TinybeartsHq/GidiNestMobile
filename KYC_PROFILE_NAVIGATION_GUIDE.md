# KYC & Profile Screens - Navigation Guide

This guide shows you where and how to access all the KYC verification and profile management screens in the GidiNest mobile app.

---

## 📍 Screen Locations & Access Points

### 1. ProfileEditScreen
**File**: `src/screens/profile/ProfileEditScreen.tsx`
**Route Name**: `ProfileEdit`
**Access From**:
- **ProfileScreen** → "Edit Profile" button (line 88)
  - Location: Account Settings section
  - Icon: 'account-edit'
  - Navigate: `navigation.navigate('EditProfile')`
  - ⚠️ **NOTE**: There's a route name mismatch - ProfileScreen navigates to `'EditProfile'` but AppNavigator registers it as `'ProfileEdit'`. This needs to be fixed!

**Features**:
- Edit first name, last name, phone number
- Update date of birth with DateTimePicker
- Edit address (street, city, state, country)
- Form validation
- Success/error alerts

---

### 2. VerificationStatusScreen
**File**: `src/screens/kyc/VerificationStatusScreen.tsx`
**Route Name**: `VerificationStatus`
**Access From**:

#### Direct Navigation:
- **BVNVerificationScreen** → After successful BVN submission (line 50)
- **NINVerificationScreen** → After successful NIN submission (line 83)
- **TierInfoScreen** → "Verify to Upgrade" buttons (line 194)

#### Should Be Added To:
- **ProfileScreen** → Add "Verification Status" button in Account Settings
- **DashboardScreen** → Add verification status card or quick link
- **SecuritySettingsScreen** → Add verification status section

**Features**:
- View BVN verification status (verified/not verified)
- View NIN verification status (verified/not verified)
- Account info card (tier, wallet status, profile details)
- Masked number display for security (****1234)
- Navigate to BVN/NIN verification screens from unverified cards
- Pull-to-refresh

---

### 3. BVNVerificationScreen
**File**: `src/screens/kyc/BVNVerificationScreen.tsx`
**Route Name**: `BVNVerification`
**Access From**:

#### Current Entry Points:
- **SelectVerificationMethodScreen** → BVN method card button (line 60)
- **VerificationStatusScreen** → "Verify BVN" button on unverified card (line 161)
- **ProfileNavigator.tsx** → Also registered (potential duplicate)

**Features**:
- 11-digit BVN input with validation
- Character counter (X/11 digits)
- Green checkmark when complete
- Benefits card with 4 key benefits
- Security info card
- Navigates to VerificationStatus after success

---

### 4. NINVerificationScreen
**File**: `src/screens/kyc/NINVerificationScreen.tsx`
**Route Name**: `NINVerification`
**Access From**:

#### Current Entry Points:
- **SelectVerificationMethodScreen** → NIN method card button (line 63)
- **VerificationStatusScreen** → "Verify NIN" button on unverified card (line 161)
- **ProfileNavigator.tsx** → Also registered (potential duplicate)

**Features**:
- 11-digit NIN input with validation
- First name and last name inputs
- Date of birth picker
- ISO date formatting for API
- Benefits card with 4 key benefits
- Security info card
- Navigates to VerificationStatus after success

---

### 5. TierInfoScreen
**File**: `src/screens/kyc/TierInfoScreen.tsx`
**Route Name**: `TierInfo`
**Access From**:

#### Currently NOT accessible from any screen!
#### Should Be Added To:
- **ProfileScreen** → Add "Account Tier Info" button
- **DashboardScreen** → Add tier badge that's clickable
- **VerificationStatusScreen** → Add "View Tier Info" button
- **TransactionsScreen** → Add "View Limits" button when approaching limits

**Features**:
- Current tier display with colored badges (Blue/Purple/Gold)
- Transaction limits (daily, cumulative, wallet balance)
- Expandable tier cards for all tiers (Tier 1, 2, 3)
- Features list for each tier
- Requirements list for each tier
- Verification status card (BVN, NIN, Wallet)
- Upgrade options with "Verify to Upgrade" buttons
- Pull-to-refresh

---

## 🔧 Issues to Fix

### 1. Route Name Mismatch
**File**: `src/screens/profile/ProfileScreen.tsx` (line 88)
**Current**: `navigation.navigate('EditProfile')`
**Should Be**: `navigation.navigate('ProfileEdit')`
**Reason**: AppNavigator registers the screen as `'ProfileEdit'` not `'EditProfile'`

### 2. Duplicate Screen Registrations
**Issue**: BVN and NIN verification screens are registered in TWO places:
- `src/navigation/AppNavigator.tsx` (lines 106-107) - imports from `/screens/kyc/`
- `src/navigation/ProfileNavigator.tsx` (lines 40-41) - imports from `/screens/profile/`

**Two versions exist**:
- `/src/screens/profile/BVNVerificationScreen.tsx` (old)
- `/src/screens/profile/NINVerificationScreen.tsx` (old)
- `/src/screens/kyc/BVNVerificationScreen.tsx` (new - we just created)
- `/src/screens/kyc/NINVerificationScreen.tsx` (new - we just created)

**Recommendation**:
- Remove old screens from `/screens/profile/` folder
- Remove registration from ProfileNavigator.tsx
- Keep only the new screens in `/screens/kyc/` folder

### 3. Missing TierInfoScreen Access
**Issue**: TierInfoScreen is registered but has NO entry points in the app!

**Recommended Entry Points**:
```typescript
// In ProfileScreen.tsx - Add to Account Settings section:
{
  icon: 'trophy',
  label: 'Account Tier',
  onPress: () => navigation.navigate('TierInfo'),
}

// In DashboardScreen.tsx - Make tier badge clickable:
<Pressable onPress={() => navigation.navigate('TierInfo')}>
  <Text>Tier {userTier}</Text>
</Pressable>

// In VerificationStatusScreen.tsx - Add after account info card:
<Button onPress={() => navigation.navigate('TierInfo')}>
  View Tier Information
</Button>
```

---

## 🎯 Recommended User Flows

### Flow 1: Profile Management
```
ProfileScreen
  → Click "Edit Profile"
  → ProfileEditScreen
  → Update information
  → Save (navigates back to ProfileScreen)
```

### Flow 2: BVN Verification
```
ProfileScreen or Dashboard
  → Click "Verification Status" (needs to be added)
  → VerificationStatusScreen
  → Click "Verify BVN" on unverified card
  → BVNVerificationScreen
  → Enter BVN
  → Submit (navigates back to VerificationStatusScreen)
```

### Flow 3: NIN Verification
```
ProfileScreen or Dashboard
  → Click "Verification Status" (needs to be added)
  → VerificationStatusScreen
  → Click "Verify NIN" on unverified card
  → NINVerificationScreen
  → Enter NIN, Name, DOB
  → Submit (navigates back to VerificationStatusScreen)
```

### Flow 4: Tier Upgrade
```
DashboardScreen
  → Click on Tier badge (needs to be added)
  → TierInfoScreen
  → View current tier and limits
  → Expand higher tier card
  → Click "Verify to Upgrade"
  → VerificationStatusScreen
  → Complete BVN/NIN verification
```

---

## 📝 Quick Setup Checklist

To make all screens accessible, add these navigation buttons:

### In ProfileScreen.tsx:
```typescript
// Add to Account Settings section (around line 88)
{
  icon: 'shield-check',
  label: 'Verification Status',
  onPress: () => navigation.navigate('VerificationStatus'),
},
{
  icon: 'trophy',
  label: 'Account Tier',
  onPress: () => navigation.navigate('TierInfo'),
},
// Fix existing Edit Profile button
{
  icon: 'account-edit',
  label: 'Edit Profile',
  onPress: () => navigation.navigate('ProfileEdit'), // Changed from 'EditProfile'
},
```

### In DashboardScreen.tsx:
```typescript
// Make tier badge clickable (find tier display section)
<Pressable
  onPress={() => navigation.navigate('TierInfo')}
  style={styles.tierBadge}
>
  <Text style={styles.tierText}>Tier {currentTier}</Text>
  <MaterialCommunityIcons name="chevron-right" size={16} />
</Pressable>
```

### In VerificationStatusScreen.tsx:
```typescript
// Add button after Account Info Card (around line 304)
<Pressable
  style={[styles.tierInfoButton, { backgroundColor: palette.primary }]}
  onPress={() => navigation.navigate('TierInfo')}
>
  <MaterialCommunityIcons name="trophy" size={20} color="#FFFFFF" />
  <Text style={styles.tierInfoButtonText}>View Tier Information</Text>
</Pressable>
```

---

## 🚀 All Registered Routes

Here are all the routes registered in AppNavigator.tsx:

| Route Name | Component | File Path |
|------------|-----------|-----------|
| `ProfileEdit` | ProfileEditScreen | `src/screens/profile/ProfileEditScreen.tsx` |
| `VerificationStatus` | VerificationStatusScreen | `src/screens/kyc/VerificationStatusScreen.tsx` |
| `BVNVerification` | BVNVerificationScreen | `src/screens/kyc/BVNVerificationScreen.tsx` |
| `NINVerification` | NINVerificationScreen | `src/screens/kyc/NINVerificationScreen.tsx` |
| `TierInfo` | TierInfoScreen | `src/screens/kyc/TierInfoScreen.tsx` |

---

## 📱 Testing Your Navigation

### Quick Test Commands:
```typescript
// Test from any screen with navigation prop:
navigation.navigate('ProfileEdit')
navigation.navigate('VerificationStatus')
navigation.navigate('BVNVerification')
navigation.navigate('NINVerification')
navigation.navigate('TierInfo')
```

### Using React Navigation Devtools:
If you have navigation devtools installed, you can test navigate to these screens directly from the debug menu.

---

**Last Updated**: November 12, 2025
**Status**: All screens created and registered ✅
**Next Steps**: Add entry points and fix route name mismatch
