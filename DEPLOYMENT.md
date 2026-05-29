# 🚀 VibeArchitect - Deployment Guide

Complete guide to deploy VibeArchitect to production.

## 🤖 Automated Deployment (Recommended)

VibeArchitect includes **GitHub Actions workflows** for automatic deployment:

- **Backend**: Auto-deploys to Cloud Run when changes are pushed to `backend/` or `prompts/`
- **Frontend**: Auto-deploys to Vercel when changes are pushed to `frontend/`

### Quick Setup

1. **Configure GitHub Secrets**: Follow [`.github/SETUP_SECRETS.md`](.github/SETUP_SECRETS.md)
2. **Push to main branch**: Workflows trigger automatically
3. **Monitor deployments**: Check the Actions tab

**That's it!** No manual deployment needed. 🎉

For manual deployment or first-time setup, continue reading below.

---

## 📋 Architecture

```
Frontend (Vercel)
    ↓ HTTPS
Backend (Cloud Run)
    ↓
Firebase (Auth + Firestore + Storage)
```

---

## 🔧 Prerequisites

### 1. Install Required Tools

```bash
# Google Cloud SDK
brew install google-cloud-sdk

# Docker
brew install docker

# Vercel CLI (optional)
npm install -g vercel
```

### 2. Authenticate with Google Cloud

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### 3. Enable Required APIs

```bash
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable storage.googleapis.com
```

---

## 🎯 Backend Deployment (Cloud Run)

### Option 1: Quick Deploy (Recommended)

```bash
cd backend
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Deploy

```bash
cd backend

# Build Docker image
docker build -t gcr.io/YOUR_PROJECT_ID/vibe-architect-backend:latest .

# Push to Container Registry
docker push gcr.io/YOUR_PROJECT_ID/vibe-architect-backend:latest

# Deploy to Cloud Run
gcloud run deploy vibe-architect-backend \
  --image gcr.io/YOUR_PROJECT_ID/vibe-architect-backend:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0
```

### Configure Environment Variables

After deployment, set environment variables in Cloud Run console:

```bash
gcloud run services update vibe-architect-backend \
  --region us-central1 \
  --set-env-vars \
GEMINI_API_KEY=your-api-key,\
FIREBASE_STORAGE_BUCKET=your-bucket.firebasestorage.app,\
CORS_ORIGINS=https://your-vercel-app.vercel.app,\
ENVIRONMENT=production,\
LOG_LEVEL=INFO
```

Or use the Cloud Run console:
1. Go to [Cloud Run Console](https://console.cloud.google.com/run)
2. Click on `vibe-architect-backend`
3. Click "Edit & Deploy New Revision"
4. Add environment variables in "Variables & Secrets" tab

### Get Backend URL

```bash
gcloud run services describe vibe-architect-backend \
  --region us-central1 \
  --format 'value(status.url)'
```

Save this URL - you'll need it for the frontend!

---

## 🌐 Frontend Deployment (Vercel)

### 1. Install Vercel CLI (if not installed)

```bash
npm install -g vercel
```

### 2. Deploy to Vercel

```bash
cd frontend
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No
- **Project name?** vibe-architect
- **Directory?** `./`
- **Build command?** `npm run build`
- **Output directory?** `.next`

### 3. Configure Environment Variables

Add these in Vercel dashboard or via CLI:

```bash
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://your-cloud-run-url.run.app

vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
# Enter: your-firebase-api-key

vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
# Enter: your-project.firebaseapp.com

vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
# Enter: your-project-id

vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
# Enter: your-project.firebasestorage.app

vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
# Enter: your-sender-id

vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
# Enter: your-app-id
```

### 4. Redeploy with Environment Variables

```bash
vercel --prod
```

---

## 🔐 Security Configuration

### 1. Update CORS Origins

Update backend environment variable with your Vercel URL:

```bash
gcloud run services update vibe-architect-backend \
  --region us-central1 \
  --update-env-vars CORS_ORIGINS=https://your-app.vercel.app
```

### 2. Firebase Security Rules

Update Firestore rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/projects/{projectId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Update Storage rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/projects/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 📊 Monitoring & Logs

### Backend Logs (Cloud Run)

```bash
# View logs
gcloud run services logs read vibe-architect-backend \
  --region us-central1 \
  --limit 50

# Stream logs
gcloud run services logs tail vibe-architect-backend \
  --region us-central1
```

Or use [Cloud Logging Console](https://console.cloud.google.com/logs)

### Frontend Logs (Vercel)

View logs in Vercel dashboard:
- Go to your project
- Click "Deployments"
- Click on a deployment
- View "Functions" or "Build" logs

---

## 💰 Cost Optimization

### Cloud Run (Backend)

- **Free tier**: 2 million requests/month
- **Pricing after**: ~$0.00002400 per request
- **Memory**: 2Gi (adjust if needed)
- **Min instances**: 0 (scales to zero when not in use)
- **Max instances**: 10 (prevents runaway costs)

### Firebase

- **Firestore**: 50K reads/day free
- **Storage**: 5GB storage, 1GB/day download free
- **Auth**: Unlimited free

### Vercel

- **Free tier**: 100GB bandwidth/month
- **Serverless functions**: 100 hours/month

**Estimated monthly cost for low traffic**: **$0-5/month** 🎉

---

## 🔄 CI/CD (Optional)

### Automatic Deployment with Cloud Build

1. Connect your GitHub repo to Cloud Build
2. Create trigger in Cloud Build console
3. Use `cloudbuild.yaml` for automatic deploys

```bash
gcloud builds submit --config cloudbuild.yaml
```

---

## 🧪 Testing Production

### Backend Health Check

```bash
curl https://your-backend-url.run.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "v0.2.2-alpha"
}
```

### Frontend

Visit: `https://your-app.vercel.app`

Test:
1. Sign in with Google
2. Create a project
3. Download the generated ZIP
4. Check "My Projects" page

---

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check logs
gcloud run services logs read vibe-architect-backend --region us-central1 --limit 100

# Common issues:
# - Missing environment variables
# - Invalid Firebase credentials
# - CORS configuration
```

### Frontend can't connect to backend

1. Check CORS_ORIGINS includes your Vercel URL
2. Verify NEXT_PUBLIC_API_URL is correct
3. Check browser console for errors

### Firebase permission denied

1. Verify Firebase security rules
2. Check user is authenticated
3. Verify service account has correct permissions

---

## 📝 Maintenance

### Update Backend

```bash
cd backend
./deploy.sh
```

### Update Frontend

```bash
cd frontend
vercel --prod
```

### View Costs

```bash
# Cloud Run costs
gcloud billing accounts list
```

Or visit:
- [GCP Billing](https://console.cloud.google.com/billing)
- [Vercel Usage](https://vercel.com/dashboard/usage)

---

## 🎉 Success!

Your VibeArchitect is now live! 🚀

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.run.app
- **Monitoring**: [Cloud Console](https://console.cloud.google.com)

---

## 📞 Support

Issues? Check:
- [Cloud Run Docs](https://cloud.google.com/run/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
