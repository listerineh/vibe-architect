# GitHub Actions Secrets Setup

This document explains how to configure the required secrets for CI/CD workflows.

## 📋 Required Secrets

### Backend Deployment (Cloud Run)

Navigate to: **Settings → Secrets and variables → Actions → New repository secret**

#### 1. `GCP_PROJECT_ID`
- **Description**: Your Google Cloud Project ID
- **How to get**: 
  ```bash
  gcloud config get-value project
  ```
- **Example**: `vibe-architect-676ae`

#### 2. `GCP_SA_KEY`
- **Description**: Service Account JSON key for Cloud Run deployment
- **How to create**:
  ```bash
  # Create service account
  gcloud iam service-accounts create github-actions \
    --display-name="GitHub Actions"
  
  # Grant necessary roles
  gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.admin"
  
  gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"
  
  gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"
  
  # Create and download key
  gcloud iam service-accounts keys create key.json \
    --iam-account=github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com
  
  # Copy the entire contents of key.json and paste as secret
  cat key.json
  ```
- **Format**: Entire JSON file content

#### 3. `GEMINI_API_KEY`
- **Description**: Google AI Studio API key for Gemini
- **How to get**: https://aistudio.google.com/app/apikey
- **Example**: `AIzaSy...`

#### 4. `FIREBASE_STORAGE_BUCKET`
- **Description**: Firebase Storage bucket name
- **How to get**: Firebase Console → Storage
- **Example**: `vibe-architect-676ae.firebasestorage.app`

#### 5. `CORS_ORIGINS`
- **Description**: Allowed CORS origins (comma-separated)
- **Example**: `https://your-app.vercel.app,https://vibe-architect.com`

---

### Frontend Deployment (Vercel)

#### 1. `VERCEL_TOKEN`
- **Description**: Vercel authentication token
- **How to create**:
  1. Go to https://vercel.com/account/tokens
  2. Click "Create Token"
  3. Name it "GitHub Actions"
  4. Copy the token
- **Example**: `vercel_abc123...`

#### 2. `VERCEL_ORG_ID`
- **Description**: Your Vercel organization/team ID
- **How to get**:
  ```bash
  # Install Vercel CLI
  npm i -g vercel
  
  # Login and link project
  cd frontend
  vercel link
  
  # Get org ID from .vercel/project.json
  cat .vercel/project.json
  ```
- **Example**: `team_abc123...`

#### 3. `VERCEL_PROJECT_ID`
- **Description**: Your Vercel project ID
- **How to get**: Same as above, from `.vercel/project.json`
- **Example**: `prj_abc123...`

---

## 🔐 Security Best Practices

### Service Account Permissions
- ✅ Use least privilege principle
- ✅ Create dedicated service account for CI/CD
- ✅ Rotate keys periodically
- ❌ Don't use personal credentials
- ❌ Don't commit keys to repository

### Secret Management
- ✅ Use GitHub encrypted secrets
- ✅ Limit secret access to necessary workflows
- ✅ Review secret usage regularly
- ❌ Don't log secrets in workflow output
- ❌ Don't expose secrets in error messages

---

## 🧪 Testing Workflows

### Test Backend Deployment
```bash
# Make a change in backend/
echo "# Test" >> backend/README.md
git add backend/README.md
git commit -m "test: trigger backend deployment"
git push origin main
```

### Test Frontend Deployment
```bash
# Make a change in frontend/
echo "# Test" >> frontend/README.md
git add frontend/README.md
git commit -m "test: trigger frontend deployment"
git push origin main
```

### Monitor Workflows
- Go to: **Actions** tab in GitHub repository
- Click on the running workflow
- View logs in real-time

---

## 🐛 Troubleshooting

### Backend Deployment Fails

**Issue**: Authentication error
```
Solution: Verify GCP_SA_KEY is valid JSON and has correct permissions
```

**Issue**: Image push fails
```
Solution: Check service account has roles/storage.admin
```

**Issue**: Cloud Run deployment fails
```
Solution: Verify service account has roles/run.admin
```

### Frontend Deployment Fails

**Issue**: Vercel authentication error
```
Solution: Regenerate VERCEL_TOKEN and update secret
```

**Issue**: Project not found
```
Solution: Verify VERCEL_PROJECT_ID matches your project
```

**Issue**: Build fails
```
Solution: Check build logs and ensure all env vars are set
```

---

## 📊 Workflow Status Badges

Add these to your README.md:

```markdown
[![Deploy Backend](https://github.com/YOUR_USERNAME/VibeArchitect/actions/workflows/deploy-backend.yml/badge.svg)](https://github.com/YOUR_USERNAME/VibeArchitect/actions/workflows/deploy-backend.yml)

[![Deploy Frontend](https://github.com/YOUR_USERNAME/VibeArchitect/actions/workflows/deploy-frontend.yml/badge.svg)](https://github.com/YOUR_USERNAME/VibeArchitect/actions/workflows/deploy-frontend.yml)
```

---

## 🔄 Workflow Triggers

### Backend (`deploy-backend.yml`)
Triggers on push to `main` when changes are made to:
- `backend/**`
- `prompts/**`
- `.github/workflows/deploy-backend.yml`

### Frontend (`deploy-frontend.yml`)
Triggers on push to `main` when changes are made to:
- `frontend/**`
- `.github/workflows/deploy-frontend.yml`

---

## 📝 Next Steps

1. ✅ Configure all required secrets in GitHub
2. ✅ Test each workflow individually
3. ✅ Monitor first deployments
4. ✅ Add status badges to README
5. ✅ Set up notifications (optional)

---

**Need help?** Check the [GitHub Actions documentation](https://docs.github.com/en/actions) or [Vercel CLI documentation](https://vercel.com/docs/cli).
