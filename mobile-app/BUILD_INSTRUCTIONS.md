# 🔨 DailyMood AI - Mobile App Build Instructions

## 🚀 **QUICK START**

### **Prerequisites:**
- Node.js 16+ 
- React Native CLI
- Xcode 14+ (for iOS)
- Android Studio (for Android)
- CocoaPods (for iOS dependencies)

### **Installation:**
```bash
# Install dependencies
npm install

# iOS specific setup
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator  
npm run android
```

---

## 📱 **DEVELOPMENT BUILDS**

### **iOS Development:**
```bash
# Install iOS dependencies
cd ios
pod install
cd ..

# Run on iOS simulator
npx react-native run-ios

# Run on specific device
npx react-native run-ios --device "iPhone 14 Pro"

# Debug mode with logs
npx react-native run-ios --verbose
```

### **Android Development:**
```bash
# Ensure Android emulator is running or device connected
adb devices

# Run on Android
npx react-native run-android

# Run with specific variant
npx react-native run-android --variant=debug

# Clean and rebuild
cd android
./gradlew clean
cd ..
npx react-native run-android
```

---

## 🏗️ **PRODUCTION BUILDS**

### **iOS Production Build:**
```bash
# Clean previous builds
npx react-native clean

# Install latest dependencies
cd ios && pod install && cd ..

# Archive for App Store (using Xcode)
1. Open ios/DailyMoodAI.xcworkspace in Xcode
2. Select "Any iOS Device" as target
3. Product → Archive
4. Upload to App Store Connect

# Or use command line:
cd ios
xcodebuild -workspace DailyMoodAI.xcworkspace \
           -scheme DailyMoodAI \
           -configuration Release \
           -archivePath build/DailyMoodAI.xcarchive \
           archive
```

### **Android Production Build:**
```bash
# Generate signed APK
cd android
./gradlew assembleRelease

# Generate signed App Bundle (recommended for Play Store)
./gradlew bundleRelease

# Output files location:
# APK: android/app/build/outputs/apk/release/app-release.apk
# AAB: android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🔧 **ENVIRONMENT SETUP**

### **Environment Variables:**
Create `.env` file in root:
```
SUPABASE_URL=https://ctmgjkwctnndlpkpxvqv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=your_openai_key_here
APP_ENV=development
```

### **iOS Configuration:**
- **Bundle ID:** com.dailymood.ai
- **Deployment Target:** iOS 13.0
- **Signing:** Configure in Xcode project settings

### **Android Configuration:**
- **Package Name:** com.dailymood.ai  
- **Min SDK:** 24 (Android 7.0)
- **Target SDK:** 33 (Android 13)
- **Signing:** Configure keystore in android/app/build.gradle

---

## 📋 **TESTING**

### **Unit Tests:**
```bash
npm test
```

### **Integration Tests:**
```bash
# iOS
npm run test:ios

# Android  
npm run test:android
```

### **E2E Tests:**
```bash
# Setup Detox (if implemented)
npm run e2e:ios
npm run e2e:android
```

---

## 🐛 **TROUBLESHOOTING**

### **Common iOS Issues:**

**CocoaPods Issues:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
```

**Build Cache Issues:**
```bash
npx react-native clean
cd ios
xcodebuild clean -workspace DailyMoodAI.xcworkspace -scheme DailyMoodAI
```

**Metro Cache Issues:**
```bash
npx react-native start --reset-cache
```

### **Common Android Issues:**

**Gradle Issues:**
```bash
cd android
./gradlew clean
```

**ADB Issues:**
```bash
adb kill-server
adb start-server
```

**React Native Cache:**
```bash
rm -rf node_modules
npm install
npx react-native start --reset-cache
```

---

## 🔐 **SIGNING & CERTIFICATES**

### **iOS Code Signing:**
1. **Apple Developer Account** required ($99/year)
2. **Certificates:** Development & Distribution
3. **Provisioning Profiles:** Match bundle ID
4. **Configure in Xcode:** Signing & Capabilities tab

### **Android App Signing:**
```bash
# Generate keystore
keytool -genkeypair -v -storetype PKCS12 \
        -keystore dailymood-upload-key.keystore \
        -alias dailymood-key-alias \
        -keyalg RSA -keysize 2048 -validity 10000

# Configure in android/gradle.properties:
DAILYMOOD_UPLOAD_STORE_FILE=dailymood-upload-key.keystore
DAILYMOOD_UPLOAD_KEY_ALIAS=dailymood-key-alias  
DAILYMOOD_UPLOAD_STORE_PASSWORD=your_password
DAILYMOOD_UPLOAD_KEY_PASSWORD=your_password
```

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **Pre-Deploy:**
- [ ] Update version numbers
- [ ] Test on multiple devices
- [ ] Check all app store assets
- [ ] Verify environment variables
- [ ] Run production builds locally

### **iOS Deployment:**
- [ ] Archive succeeds without warnings
- [ ] Upload to TestFlight
- [ ] Internal testing complete
- [ ] App Store Connect metadata complete
- [ ] Submit for review

### **Android Deployment:**
- [ ] Generate signed AAB
- [ ] Upload to Google Play Console
- [ ] Internal testing track
- [ ] Store listing complete
- [ ] Release to production

---

## 📊 **MONITORING & ANALYTICS**

### **Crash Reporting:**
- **iOS:** Implement Crashlytics or Bugsnag
- **Android:** Google Play Console crash reports

### **Analytics:**
- **User Events:** Firebase Analytics
- **Performance:** React Native Performance
- **App Store:** App Store Connect Analytics

### **Health Monitoring:**
```typescript
// Add to App.tsx
import crashlytics from '@react-native-firebase/crashlytics';

// Log errors
crashlytics().recordError(error);

// Track user actions  
crashlytics().log('User completed mood entry');
```

---

## 🔄 **CI/CD PIPELINE**

### **Automated Builds:**
```yaml
# .github/workflows/build.yml
name: Build and Test
on: [push, pull_request]
jobs:
  ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
      - run: npm install
      - run: cd ios && pod install
      - run: npm run ios:build
      
  android:
    runs-on: ubuntu-latest  
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
      - run: npm install
      - run: npm run android:build
```

### **Automated Deployment:**
- **iOS:** Fastlane for App Store uploads
- **Android:** Google Play Console API
- **TestFlight:** Automatic beta distribution

---

## 🎯 **PERFORMANCE OPTIMIZATION**

### **Bundle Size:**
```bash
# Analyze bundle
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android-bundle.js --verbose

# iOS bundle analysis in Xcode Build Phases
```

### **Optimization Tips:**
- Use Hermes JavaScript engine (Android)
- Enable ProGuard/R8 (Android)
- Optimize images and assets
- Code splitting and lazy loading
- Remove unused dependencies

---

## 📝 **VERSION MANAGEMENT**

### **Version Bumping:**
```bash
# Update version in package.json, app.json, iOS/Android configs
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0  
npm version major  # 1.0.0 → 2.0.0
```

### **Release Notes:**
- Keep changelog.md updated
- Document breaking changes
- Include new features and bug fixes

---

## 🆘 **SUPPORT RESOURCES**

- **React Native Docs:** https://reactnative.dev
- **iOS Development:** https://developer.apple.com
- **Android Development:** https://developer.android.com
- **Supabase Docs:** https://supabase.com/docs
- **Community:** Stack Overflow, React Native Discord

**Your mobile app is ready to build and deploy! 🚀**


