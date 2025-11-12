# KYC & Profile Implementation Plan

## ✅ Completed Infrastructure

### Redux & Services
- ✅ Created `accountService.ts` with all API calls
- ✅ Created `accountSlice.ts` with 8 async thunks
- ✅ Created `useAccount()` hook
- ✅ Added account reducer to root reducer

## 📋 Screens to Implement

### 1. Profile Edit Screen (`ProfileEditScreen.tsx`)

**Location**: `src/screens/profile/ProfileEditScreen.tsx`

**Features**:
- Edit first name, last name, phone
- Edit date of birth (date picker)
- Edit address, city, state, country
- Save button with loading state
- Display current values from `profile` state
- Success/error toast messages

**Hook Usage**:
```typescript
const { profile, profileLoading, updateProfile, getProfile } = useAccount();
```

**Navigation**:
- Called from ProfileScreen with navigation button
- Returns to ProfileScreen on save

---

### 2. BVN Verification Screen (`BVNVerificationScreen.tsx`)

**Location**: `src/screens/kyc/BVNVerificationScreen.tsx`

**Features**:
- Input field for 11-digit BVN number
- Validation (must be exactly 11 digits)
- Submit button with loading state
- Info card explaining BVN benefits:
  - Unlock higher transaction limits
  - Increase account tier
  - Access more features
- Success screen after verification
- Error handling with retry

**Hook Usage**:
```typescript
const { verifyBVN, verificationLoading, verificationError, getProfile } = useAccount();
```

**API**:
```typescript
POST /api/v1/account/bvn-update
Body: { bvn: "12345678901" }
```

**Flow**:
1. User enters BVN
2. Press submit
3. Show loading
4. On success: Show success screen, update profile
5. On error: Show error, allow retry

---

### 3. NIN Verification Screen (`NINVerificationScreen.tsx`)

**Location**: `src/screens/kyc/NINVerificationScreen.tsx`

**Features**:
- Input field for 11-digit NIN number
- Input fields for: first name, last name
- Date of birth picker
- Submit button with loading state
- Info card explaining NIN benefits
- Success screen after verification
- Error handling with retry

**Hook Usage**:
```typescript
const { verifyNIN, verificationLoading, verificationError, getProfile } = useAccount();
```

**API**:
```typescript
POST /api/v1/account/nin-update
Body: {
  nin: "12345678901",
  firstname: "John",
  lastname: "Doe",
  dob: "1990-01-01T00:00:00"
}
```

**Note**: Date must be in ISO format with time component

---

### 4. Verification Status Screen (`VerificationStatusScreen.tsx`)

**Location**: `src/screens/kyc/VerificationStatusScreen.tsx`

**Features**:
- Display BVN verification status
  - ✅ Verified (show verified name, DOB, BVN number masked)
  - ❌ Not Verified (show "Verify BVN" button)
- Display NIN verification status
  - ✅ Verified (show verified name, DOB, NIN number masked)
  - ❌ Not Verified (show "Verify NIN" button)
- Display account information:
  - Current account tier
  - Has virtual wallet (Yes/No)
  - Profile name
  - Profile DOB
- Pull-to-refresh functionality
- Navigate to BVN/NIN verification screens

**Hook Usage**:
```typescript
const { verificationStatus, verificationLoading, getVerificationStatus } = useAccount();
```

**API**:
```typescript
GET /api/v1/account/verification-status
```

**Response Structure**:
```typescript
{
  bvn: {
    verified: true,
    bvn_number: "***********",
    verified_name: "John Doe",
    dob: "1990-01-01"
  },
  nin: {
    verified: false
  },
  account_info: {
    account_tier: "TIER_1",
    has_virtual_wallet: true,
    profile_name: "John Doe",
    profile_dob: "1990-01-01"
  }
}
```

---

### 5. Tier Information Screen (`TierInfoScreen.tsx`)

**Location**: `src/screens/kyc/TierInfoScreen.tsx`

**Features**:
- Display current tier with badge
- Show tier limits:
  - Daily transaction limit
  - Cumulative transaction limit
  - Wallet balance limit
- List tier features (bullet points)
- List tier requirements (bullet points)
- Display all tiers (Tier 1, 2, 3) in expandable cards
- Show verification status:
  - Has BVN (✅/❌)
  - Has NIN (✅/❌)
  - Has Virtual Wallet (✅/❌)
- Display upgrade options (if can_upgrade)
- Pull-to-refresh

**Hook Usage**:
```typescript
const { tierInfo, tierInfoLoading, getTierInfo } = useAccount();
```

**API**:
```typescript
GET /api/v1/account/tier-info
```

**Response Structure**:
```typescript
{
  current_tier: {
    name: "TIER_1",
    daily_transaction_limit: 50000,
    cumulative_transaction_limit: 300000,
    wallet_balance_limit: 300000,
    features: ["Basic transactions", "Savings goals"],
    requirements: ["Phone number", "Email"],
    is_current: true,
    can_upgrade: true
  },
  all_tiers: {
    tier_1: {...},
    tier_2: {...},
    tier_3: {...}
  },
  verification_status: {
    has_bvn: false,
    has_nin: false,
    has_virtual_wallet: true
  },
  upgrade_options: ["Verify BVN to upgrade to Tier 2"]
}
```

---

### 6. Embedly Sync Screen (Optional) (`EmbeldySyncScreen.tsx`)

**Location**: `src/screens/kyc/EmbeldySyncScreen.tsx`

**Features**:
- Explanation of what Embedly sync does
- "Sync Now" button with loading state
- Display last sync result:
  - Message
  - Whether changes were made
  - List of changes
  - Updated verification status
- Success/error handling

**Hook Usage**:
```typescript
const { syncWithEmbedly, syncLoading, lastSyncMessage, clearSync } = useAccount();
```

**API**:
```typescript
POST /api/v1/account/sync-embedly
```

**Response**:
```typescript
{
  success: true,
  data: {
    message: "Sync completed successfully",
    updated: true,
    changes: ["BVN status updated", "Tier upgraded to TIER_2"],
    current_status: {
      account_tier: "TIER_2",
      has_bvn: true,
      has_nin: false,
      has_virtual_wallet: true
    }
  }
}
```

---

### 7. Wallet Creation Screen (Optional) (`WalletCreationScreen.tsx`)

**Location**: `src/screens/wallet/WalletCreationScreen.tsx`

**Features**:
- Only shown if user doesn't have a wallet
- Explanation of virtual wallet benefits
- "Create Wallet" button with loading state
- Display created wallet details on success:
  - Account name
  - Account number
  - Bank name
  - Bank code
  - Initial balance (0.00)
  - Currency (NGN)
- Error handling with retry

**Hook Usage**:
```typescript
const { createWallet, walletCreationLoading, error, getProfile } = useAccount();
```

**API**:
```typescript
POST /api/v1/account/create-wallet
```

**Response**:
```typescript
{
  success: true,
  data: {
    message: "Wallet created successfully",
    wallet: {
      account_name: "John Doe",
      account_number: "1234567890",
      bank: "Providus Bank",
      bank_code: "101",
      balance: 0.00,
      currency: "NGN"
    }
  }
}
```

---

## 🎨 UI Design Guidelines

### Color Scheme
- **Success**: Green (`#22C55E`)
- **Warning**: Yellow/Amber (`#F59E0B`)
- **Error**: Red (`#EF4444`)
- **Info**: Blue (`#3B82F6`)
- **Primary**: Use `palette.primary` from theme

### Components to Reuse
- `RestrictionBanner` pattern for info cards
- `Button` from react-native-paper
- `TextInput` with validation
- `MaterialCommunityIcons` for icons
- `SafeAreaView` for screen layout
- `ScrollView` for scrollable content

### Common Patterns

**Input Field**:
```typescript
<TextInput
  label="BVN Number"
  value={bvn}
  onChangeText={setBVN}
  keyboardType="numeric"
  maxLength={11}
  style={styles.input}
/>
```

**Info Card**:
```typescript
<View style={[styles.infoCard, { backgroundColor: featureTint }]}>
  <MaterialCommunityIcons name="information-outline" size={20} color="#3B82F6" />
  <Text style={styles.infoText}>
    Verify your BVN to unlock higher transaction limits and access more features.
  </Text>
</View>
```

**Status Badge**:
```typescript
<View style={[styles.badge, { backgroundColor: verified ? '#22C55E20' : '#EF444420' }]}>
  <MaterialCommunityIcons
    name={verified ? "check-circle" : "close-circle"}
    size={16}
    color={verified ? '#22C55E' : '#EF4444'}
  />
  <Text style={[styles.badgeText, { color: verified ? '#22C55E' : '#EF4444' }]}>
    {verified ? 'Verified' : 'Not Verified'}
  </Text>
</View>
```

---

## 🔗 Navigation Integration

### Add Routes to AppNavigator

```typescript
// In AppNavigator.tsx
import ProfileEditScreen from '../screens/profile/ProfileEditScreen';
import BVNVerificationScreen from '../screens/kyc/BVNVerificationScreen';
import NINVerificationScreen from '../screens/kyc/NINVerificationScreen';
import VerificationStatusScreen from '../screens/kyc/VerificationStatusScreen';
import TierInfoScreen from '../screens/kyc/TierInfoScreen';

// Add to Stack.Navigator
<Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
<Stack.Screen name="BVNVerification" component={BVNVerificationScreen} />
<Stack.Screen name="NINVerification" component={NINVerificationScreen} />
<Stack.Screen name="VerificationStatus" component={VerificationStatusScreen} />
<Stack.Screen name="TierInfo" component={TierInfoScreen} />
```

### Add Navigation Buttons

**In ProfileScreen**:
```typescript
// Add "Edit Profile" button
<Pressable onPress={() => navigation.navigate('ProfileEdit')}>
  <Text>Edit Profile</Text>
</Pressable>

// Add "Verification Status" button
<Pressable onPress={() => navigation.navigate('VerificationStatus')}>
  <Text>Verification Status</Text>
</Pressable>

// Add "Account Tier" button
<Pressable onPress={() => navigation.navigate('TierInfo')}>
  <Text>Account Tier</Text>
</Pressable>
```

**In DashboardScreen** (for KYC banner):
```typescript
{walletNotFound && (
  <Pressable onPress={() => navigation.navigate('VerificationStatus')}>
    <Text>Complete verification to activate your wallet</Text>
  </Pressable>
)}
```

---

## 🧪 Testing Checklist

### Profile Management
- [ ] Load profile data on screen mount
- [ ] Update profile with valid data
- [ ] Validate required fields
- [ ] Handle API errors gracefully
- [ ] Show success message on save

### BVN Verification
- [ ] Validate 11-digit BVN number
- [ ] Submit BVN for verification
- [ ] Handle success (show success screen, update profile)
- [ ] Handle errors (invalid BVN, API error)
- [ ] Allow retry on failure

### NIN Verification
- [ ] Validate 11-digit NIN number
- [ ] Validate required fields (name, DOB)
- [ ] Format DOB correctly (ISO with time)
- [ ] Submit NIN for verification
- [ ] Handle success/errors
- [ ] Allow retry on failure

### Verification Status
- [ ] Display BVN status correctly
- [ ] Display NIN status correctly
- [ ] Navigate to verification screens
- [ ] Pull-to-refresh updates data
- [ ] Handle API errors

### Tier Information
- [ ] Display current tier correctly
- [ ] Show all tier details (limits, features)
- [ ] Display verification status
- [ ] Show upgrade options when available
- [ ] Pull-to-refresh updates data

### Wallet Creation
- [ ] Only show when wallet doesn't exist
- [ ] Create wallet successfully
- [ ] Display wallet details
- [ ] Update profile after creation
- [ ] Handle creation errors

---

## 📦 Priority Order

1. **High Priority** (Core Features):
   - Profile Edit Screen
   - Verification Status Screen
   - BVN Verification Screen
   - NIN Verification Screen

2. **Medium Priority** (Enhanced Features):
   - Tier Information Screen

3. **Low Priority** (Optional):
   - Embedly Sync Screen
   - Wallet Creation Screen (can be automated)

---

## 🚀 Implementation Tips

1. **Start with ProfileEditScreen** - It's the simplest and will help you understand the pattern

2. **Reuse Patterns** - Use the same layout and styles as WithdrawScreen and WithdrawalStatusScreen

3. **Error Handling** - Always show detailed error messages from the API

4. **Loading States** - Use loading indicators for all API calls

5. **Success Feedback** - Show success screens or toasts after successful operations

6. **Navigation** - After successful verification, navigate to VerificationStatus screen to show updated status

7. **Pull-to-Refresh** - Add pull-to-refresh to all screens that fetch data

8. **Dark Mode** - Use `useThemeMode()` hook and `palette` colors for dark mode support

9. **Responsive Layout** - Use ScrollView for long content, SafeAreaView for proper spacing

10. **Validation** - Validate inputs before submitting (BVN/NIN must be 11 digits)

---

## 📝 Example Screen Structure

```typescript
export default function ProfileEditScreen() {
  const { profile, profileLoading, updateProfile, error } = useAccount();
  const { palette } = useThemeMode();
  const navigation = useNavigation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  // ... other fields

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name);
      setLastName(profile.last_name);
      // ... set other fields
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        // ... other fields
      }).unwrap();

      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', error || 'Failed to update profile');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <TextInput label="First Name" value={firstName} onChangeText={setFirstName} />
        <TextInput label="Last Name" value={lastName} onChangeText={setLastName} />
        {/* ... other inputs */}

        <Button
          mode="contained"
          onPress={handleSave}
          loading={profileLoading}
          disabled={profileLoading}
        >
          Save Changes
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
```

---

## ✅ Ready to Implement!

All the infrastructure is in place:
- ✅ API service functions
- ✅ Redux slice with async thunks
- ✅ Custom useAccount() hook
- ✅ TypeScript interfaces

You can now create the screens following the patterns from:
- `WithdrawScreen.tsx` - for forms and validation
- `WithdrawalStatusScreen.tsx` - for success/failure states
- `ProfileScreen.tsx` - for navigation and layout

Good luck! 🚀
