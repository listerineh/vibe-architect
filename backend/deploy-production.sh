#!/bin/bash

# VibeArchitect Backend - Production Deployment to Cloud Run
# This script deploys the backend using Vertex AI (no API key needed)

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   VibeArchitect Backend - Cloud Run Deployment            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
PROJECT_ID="bwai-2026-494322"
REGION="us-central1"
SERVICE_NAME="vibe-architect-backend"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Error: gcloud CLI not found${NC}"
    echo -e "${YELLOW}Install it with: brew install google-cloud-sdk${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Error: Docker is not running${NC}"
    echo -e "${YELLOW}Please start Docker Desktop${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Configuration:${NC}"
echo -e "  Project ID: ${GREEN}${PROJECT_ID}${NC}"
echo -e "  Region: ${GREEN}${REGION}${NC}"
echo -e "  Service: ${GREEN}${SERVICE_NAME}${NC}"
echo -e "  Image: ${GREEN}${IMAGE_NAME}${NC}"
echo ""

# Set the project
echo -e "${BLUE}🔧 Setting GCP project...${NC}"
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo -e "${BLUE}🔌 Enabling required APIs...${NC}"
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable aiplatform.googleapis.com

# Configure Docker for GCR
echo -e "${BLUE}🐳 Configuring Docker for GCR...${NC}"
gcloud auth configure-docker --quiet

# Build the Docker image
echo -e "${BLUE}🏗️  Building Docker image...${NC}"
docker build -t ${IMAGE_NAME}:latest .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker image built successfully${NC}"

# Push to Container Registry
echo -e "${BLUE}📤 Pushing image to GCR...${NC}"
docker push ${IMAGE_NAME}:latest

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker push failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Image pushed to GCR${NC}"

# Get Firebase Storage Bucket
FIREBASE_BUCKET="vibe-architect-676ae.firebasestorage.app"

# Get Vercel frontend URL (you'll need to update this after frontend deployment)
echo -e "${YELLOW}⚠️  Note: Update CORS_ORIGINS with your Vercel URL after frontend deployment${NC}"
CORS_ORIGINS="http://localhost:3000"

# Deploy to Cloud Run
echo -e "${BLUE}🚀 Deploying to Cloud Run...${NC}"
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME}:latest \
  --region ${REGION} \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0 \
  --set-env-vars "ENVIRONMENT=production" \
  --set-env-vars "GCP_PROJECT_ID=${PROJECT_ID}" \
  --set-env-vars "GCP_LOCATION=${REGION}" \
  --set-env-vars "VERTEX_AI_MODEL=gemini-2.5-flash" \
  --set-env-vars "FIREBASE_STORAGE_BUCKET=${FIREBASE_BUCKET}" \
  --set-env-vars "CORS_ORIGINS=${CORS_ORIGINS}" \
  --set-env-vars "LOG_LEVEL=INFO" \
  --set-env-vars "USE_MOCK=false"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Cloud Run deployment failed${NC}"
    exit 1
fi

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
  --region ${REGION} \
  --format 'value(status.url)')

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          🎉 Deployment Successful!                         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Deployment Details:${NC}"
echo -e "  Service URL: ${GREEN}${SERVICE_URL}${NC}"
echo -e "  Region: ${GREEN}${REGION}${NC}"
echo -e "  Image: ${GREEN}${IMAGE_NAME}:latest${NC}"
echo ""
echo -e "${BLUE}🔍 Next Steps:${NC}"
echo -e "  1. Test the API: ${YELLOW}curl ${SERVICE_URL}/${NC}"
echo -e "  2. View logs: ${YELLOW}gcloud run services logs read ${SERVICE_NAME} --region ${REGION}${NC}"
echo -e "  3. Update frontend CORS: Add ${GREEN}${SERVICE_URL}${NC} to frontend env"
echo -e "  4. Update CORS_ORIGINS: Redeploy with Vercel URL"
echo ""
echo -e "${BLUE}📚 Useful Commands:${NC}"
echo -e "  View service: ${YELLOW}gcloud run services describe ${SERVICE_NAME} --region ${REGION}${NC}"
echo -e "  Update service: ${YELLOW}./deploy-production.sh${NC}"
echo -e "  Delete service: ${YELLOW}gcloud run services delete ${SERVICE_NAME} --region ${REGION}${NC}"
echo ""

# Test the deployment
echo -e "${BLUE}🧪 Testing deployment...${NC}"
sleep 5
RESPONSE=$(curl -s ${SERVICE_URL}/)
echo -e "${GREEN}Response: ${RESPONSE}${NC}"
echo ""
