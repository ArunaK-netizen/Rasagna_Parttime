# EAS Build Setup for CI/CD

This project now uses **EAS (Expo Application Services)** to build production APKs in GitHub Actions.

## Prerequisites

1. **EAS Account** (free tier available)
   - Sign up at [https://expo.dev](https://expo.dev)
   - Create a new project or link your existing one

2. **Link your Expo project**
   ```bash
   cd mobile
   npx eas-cli login
   npx eas-cli project:init
   ```
   This creates/updates `eas.json` and stores your project ID.

## GitHub Actions Setup

You need to add an `EAS_TOKEN` secret to your GitHub repository:

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   - **Name**: `EAS_TOKEN`
   - **Value**: Get this from Expo CLI:
     ```bash
     npx eas-cli secrets:create --scope project --name EAS_TOKEN
     ```
     Or manually create a token at [https://expo.dev/settings/tokens](https://expo.dev/settings/tokens)

## Build Profiles

The workflow uses the `production` profile from `eas.json`:
- **Distribution**: `store` (production-ready)
- **Android buildType**: `apk` (produces unsigned APK for testing/signing)
- **Auto increment**: Enabled (version code auto-increments)

## What Happens on Push

1. On push to `main`, GitHub Actions triggers the build
2. EAS CLI builds the APK on Expo's infrastructure
3. Built APK is downloaded and uploaded as a release artifact
4. APK is released to GitHub Releases as `latest`

## Local Testing (Optional)

To test the build locally before committing:
```bash
cd mobile
eas build --platform android --profile production --local
```

This requires Docker or a local Android build environment setup.

## Troubleshooting

### Build fails with "EAS_TOKEN not set"
- Ensure the `EAS_TOKEN` secret is added to GitHub Actions secrets (see above)

### Build times out
- EAS builds typically take 10–15 minutes; GitHub Actions has a 6-hour timeout
- Check the EAS dashboard at [https://expo.dev](https://expo.dev) for detailed build logs

### APK not embedded with JS bundle
- This shouldn't happen with EAS—it's Expo's managed service and automatically embeds the bundle
- If you see "Unable to load script" on the device, check:
  - `MainApplication.kt` has `getUseDeveloperSupport() = BuildConfig.DEBUG`
  - The built APK contains `assets/index.android.bundle` (can unzip APK to verify)

## Next Steps

- Commit and push the updated workflow to trigger the first EAS build
- Monitor the build in GitHub Actions or at [https://expo.dev](https://expo.dev)
- Download the APK from GitHub Releases and test on a device
