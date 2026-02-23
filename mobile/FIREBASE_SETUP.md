# Firebase Setup for React Native (Expo)

You pasted the configuration block for the **Firebase Web JS SDK**, but this project uses **React Native Firebase** (`@react-native-firebase/app`, `@react-native-firebase/auth`, etc.).

React Native Firebase requires **native configuration files** instead of the web configuration object. To set this up properly for your Expo project, please follow these steps:

### 1. Download Android Configuration (`google-services.json`)
1. Go to your [Firebase Console](https://console.firebase.google.com/): Project `rasagnaparttime`.
2. Add an Android app.
3. Use the Android package name from your `app.json`: `com.blackdevil007.parttime`.
4. Download the `google-services.json` file.
5. Place it in the root of your project directory (`h:\Coding\Projects\Rasagna_Parttime\mobile\google-services.json`).

### 2. Download iOS Configuration (`GoogleService-Info.plist`)
1. Go back to your Firebase Console and add an iOS app.
2. Provide your iOS Bundle ID (you might need to add `"bundleIdentifier": "com.blackdevil007.parttime"` to the `"ios"` section in `app.json` if you haven't yet).
3. Download the `GoogleService-Info.plist` file.
4. Place it in the root of your project directory (`h:\Coding\Projects\Rasagna_Parttime\mobile\GoogleService-Info.plist`).

### 3. I will update `app.json` for you
Once you confirm you have downloaded these files (or at least the `google-services.json` for Android), let me know. I will then update your `app.json` to include the necessary `@react-native-firebase` plugins and file paths so Expo handles the native setup automatically.

*Note: If you also plan to release the app on the Web, we can still use your web credentials to configure a conditional Firebase initialization in the code.*