# iOS Face ID Rebuild Instructions

## ✅ Configuration Verified

Your `app.json` and `Info.plist` are correctly configured with Face ID permissions:
- ✅ `app.json` has `NSFaceIDUsageDescription` in `ios.infoPlist`
- ✅ `app.json` has `expo-local-authentication` plugin configured
- ✅ `ios/GidiNest/Info.plist` has `NSFaceIDUsageDescription` entry

## 🔧 Rebuild Required

The app needs to be rebuilt to apply the Face ID permission. Here are your options:

### Option 1: Using Expo CLI (Recommended for Development)

```bash
# Clean and rebuild iOS app
npx expo run:ios

# Or specify a device/simulator
npx expo run:ios --device

# Or clean build first (recommended)
npx expo run:ios --clean
```

### Option 2: Using Xcode (For More Control)

1. **Open the workspace in Xcode:**
   ```bash
   open ios/GidiNest.xcworkspace
   ```

2. **In Xcode:**
   - Select your target device/simulator
   - Press `Cmd + Shift + K` to clean build folder
   - Press `Cmd + R` to build and run

3. **Verify Info.plist:**
   - In Xcode, navigate to `GidiNest` → `Info.plist`
   - Confirm `NSFaceIDUsageDescription` is present
   - Value should be: "GidiNest uses Face ID to provide secure and convenient authentication for your account."

### Option 3: Using EAS Build (For Production/TestFlight)

```bash
# Development build
eas build --profile development --platform ios

# Production build
eas build --profile production --platform ios
```

## ⚠️ Important Notes

1. **Physical Device Required**: Face ID only works on real iOS devices, not the simulator
2. **Clean Build Recommended**: Use `--clean` flag or clean in Xcode to ensure fresh build
3. **First Time Permission**: iOS will ask for Face ID permission the first time you use it

## 🧪 After Rebuild

1. **Install the new build** on your iOS device
2. **Open the app** and sign in
3. **Go to Profile** → **Security Settings**
4. **Toggle "Biometric Authentication"** ON
5. **Authenticate with Face ID** when prompted
6. ✅ Should work without the "missing_usage_description" error

## 🐛 If Still Not Working

1. **Verify Info.plist in Xcode:**
   - Open `ios/GidiNest/Info.plist`
   - Check that `NSFaceIDUsageDescription` exists
   - Check the value is correct

2. **Clean everything:**
   ```bash
   cd ios
   rm -rf build
   rm -rf Pods
   rm Podfile.lock
   cd ..
   npx expo prebuild --clean
   npx expo run:ios --clean
   ```

3. **Check device settings:**
   - Settings → Face ID & Passcode
   - Make sure Face ID is enabled
   - Try unlocking device with Face ID first

4. **Check app permissions:**
   - Settings → Face ID & Passcode → "Use Face ID For"
   - Make sure your app is listed and enabled

## ✅ Quick Command

```bash
# One command to clean and rebuild
npx expo run:ios --clean
```

After rebuilding, Face ID should work correctly! 🎉

