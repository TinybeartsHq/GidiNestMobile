# Face ID Setup Guide for iOS

## ✅ Configuration Complete!

Face ID support has been configured in your app. Here's everything you need to know:

---

## 📱 **Step 1: iOS Device Setup**

### Enable Face ID on Your iPhone/iPad:

1. **Open Settings** → **Face ID & Passcode**
2. **Enter your device passcode**
3. **Tap "Set Up Face ID"**
4. **Follow the on-screen instructions:**
   - Position your face within the frame
   - Move your head in a circle
   - Complete the second scan
   - Tap **Done**

### Verify Face ID is Working:
- Try unlocking your device with Face ID
- Make sure Face ID is enabled in Settings

---

## 🔧 **Step 2: App Configuration**

### ✅ Already Configured:

1. **app.json** - Added iOS Face ID permission:
   ```json
   "ios": {
     "infoPlist": {
       "NSFaceIDUsageDescription": "GidiNest uses Face ID to provide secure and convenient authentication for your account."
     }
   }
   ```

2. **expo-local-authentication plugin** - Added to plugins array

3. **Biometric utilities** - Already implemented in `src/utils/biometric.ts`

---

## 🚀 **Step 3: Rebuild the App**

Since we updated `app.json`, you need to rebuild the native iOS app:

### For Development (Expo Go):
```bash
# This won't work - Expo Go doesn't support custom native code
# You need to create a development build
```

### For Development Build:
```bash
# Install EAS CLI (if not already installed)
npm install -g eas-cli

# Login to Expo
eas login

# Create a development build
eas build --profile development --platform ios

# Or run on simulator
npx expo run:ios
```

### For Production:
```bash
eas build --profile production --platform ios
```

---

## 📲 **Step 4: Enable Face ID in App**

### In the App:

1. **Sign in** with your email and password (or passcode)
2. **Go to Profile** → **Security Settings**
3. **Find "Biometric Authentication"** section
4. **Toggle the switch** to enable Face ID
5. **Authenticate** with Face ID when prompted
6. **Done!** Face ID is now enabled

---

## 🎯 **How Face ID Works in Your App**

### Login Flow:

1. **User opens app** → Sees PasscodeAuth screen
2. **Face ID icon appears** on the numpad (if enabled)
3. **User taps Face ID icon** → iOS Face ID prompt appears
4. **User authenticates** → App automatically signs in using stored passcode
5. **Success!** → Navigate to MainApp

### Security:

- ✅ Face ID authenticates locally on device
- ✅ Passcode is stored securely in iOS Keychain (SecureStore)
- ✅ Passcode is never exposed - only used for API authentication
- ✅ Falls back to manual passcode entry if Face ID fails

---

## 🔍 **Testing Face ID**

### Test Scenarios:

1. **Enable Face ID:**
   - Go to Security Settings
   - Toggle biometric switch ON
   - Authenticate with Face ID
   - ✅ Should see success message

2. **Login with Face ID:**
   - Logout from app
   - Open app again
   - Tap Face ID icon on PasscodeAuth screen
   - Authenticate with Face ID
   - ✅ Should auto-login

3. **Face ID Failure:**
   - Try Face ID with wrong face
   - ✅ Should show error
   - ✅ Can still use manual passcode entry

4. **Disable Face ID:**
   - Go to Security Settings
   - Toggle biometric switch OFF
   - ✅ Face ID icon should disappear from login screen

---

## 🐛 **Troubleshooting**

### Face ID Not Working?

1. **Check Device Settings:**
   - Settings → Face ID & Passcode
   - Make sure Face ID is enabled
   - Check if app is listed under "Use Face ID For"

2. **Check App Permissions:**
   - First time using Face ID, iOS will ask for permission
   - Make sure you tap "Allow" or "OK"

3. **Rebuild App:**
   - If you just added the configuration, rebuild the app:
   ```bash
   npx expo run:ios
   ```

4. **Check Console Logs:**
   - Look for biometric errors in console
   - Check if `isBiometricAvailable()` returns `true`

5. **Test on Physical Device:**
   - Face ID doesn't work in iOS Simulator
   - Must test on real iPhone/iPad with Face ID

### Common Issues:

| Issue | Solution |
|-------|----------|
| Face ID option not showing | Enable in Security Settings first |
| "Biometric not available" | Check device has Face ID enabled in Settings |
| Permission denied | Rebuild app with new config |
| Works on device but not simulator | Face ID requires physical device |

---

## 📋 **Code Locations**

### Key Files:

- **Configuration:** `app.json` (iOS Face ID permission)
- **Biometric Utils:** `src/utils/biometric.ts`
- **Security Settings:** `src/screens/profile/SecuritySettingsScreen.tsx`
- **Passcode Auth:** `src/screens/auth/PasscodeAuthScreen.tsx`

### How It Works:

1. **SecuritySettingsScreen** - User toggles Face ID ON/OFF
2. **Stores flag** in SecureStore: `biometric_enabled = 'true'`
3. **PasscodeAuthScreen** - Shows Face ID icon if enabled
4. **User taps icon** → Calls `authenticateWithBiometric()`
5. **iOS prompts** Face ID authentication
6. **On success** → Uses stored passcode to sign in via API

---

## ✅ **Checklist**

- [x] iOS Face ID permission added to `app.json`
- [x] `expo-local-authentication` plugin configured
- [x] Biometric utilities implemented
- [x] Security Settings screen has toggle
- [x] PasscodeAuth screen shows Face ID icon
- [ ] **Rebuild app** (required after config changes)
- [ ] **Test on physical iOS device**
- [ ] **Enable Face ID in Security Settings**
- [ ] **Test login with Face ID**

---

## 🎉 **You're All Set!**

Once you rebuild the app and enable Face ID in Security Settings, users can:

1. ✅ Quick login with Face ID (no typing!)
2. ✅ Secure authentication (Face ID + stored passcode)
3. ✅ Fallback to manual passcode if needed
4. ✅ Enable/disable anytime in Settings

**Note:** Face ID requires a physical iOS device with Face ID capability. It won't work in the iOS Simulator.


