# GitHub Actions Secrets Configuration

## Required Secrets for Firebase Deployment

This repository requires the following secret to be configured in GitHub repository settings:

### `FIREBASE_SERVICE_ACCOUNT`
- **Purpose**: Service account key for Firebase deployment authentication
- **Format**: JSON string containing Firebase service account credentials
- **Location**: Repository Settings > Secrets and variables > Actions > Repository secrets

## Setting Up the Secret

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`target-nexus-game`)
3. Go to Project Settings > Service Accounts
4. Click "Generate new private key"
5. Copy the entire JSON content
6. In GitHub repository, go to Settings > Secrets and variables > Actions
7. Click "New repository secret"
8. Name: `FIREBASE_SERVICE_ACCOUNT`
9. Value: Paste the JSON content from step 5

## Troubleshooting

### Common Issues:
- **"Context access might be invalid"**: Ensure the secret name exactly matches `FIREBASE_SERVICE_ACCOUNT`
- **"NEXUSTARGETKEY" errors**: This was an old secret reference that has been removed
- **Empty service account file**: Verify the JSON is valid and complete

### Workflow Status:
- ✅ deploy.yml - Active and working
- ❌ firebase-hosting.yml - Removed (was duplicate and causing conflicts)

## Verification

After configuring the secret, the workflow should:
1. ✅ Create service account file successfully
2. ✅ Deploy to Firebase without authentication errors
3. ✅ Clean up temporary files

## Current Configuration

- **Firebase Project**: `target-nexus-game`
- **Deployment URL**: https://target-game.web.app
- **Workflow File**: `.github/workflows/deploy.yml`
- **Auto-deploy**: Enabled on push to `main` branch