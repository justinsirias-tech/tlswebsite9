# Deploying to Google Cloud Run (Serverless)

This guide walks you through deploying **That Laundry Shop** website to **Google Cloud Run** using containerization. Google Cloud Build compiles the project directly in the cloud, so you do **not** need Docker installed locally.

---

## Prerequisites

1. **Google Cloud SDK (gcloud CLI)**: Install it on your computer ([Download Link](https://cloud.google.com/sdk/docs/install)).
2. **Billing**: Ensure billing is enabled for your Google Cloud Project.
3. **Authentication**: Run the following command in your terminal to log in to GCP:
   ```bash
   gcloud auth login
   ```

---

## Deployment Steps

### Step 1: Set your GCP Project ID
Set the active project in your `gcloud` terminal. Replace `[PROJECT_ID]` with your actual Google Cloud Project ID (e.g., `tls-web-eb387`):
```bash
gcloud config set project [PROJECT_ID]
```

### Step 2: Enable Google Cloud APIs
Enable the Artifact Registry, Cloud Run, and Cloud Build APIs:
```bash
gcloud services enable artifactregistry.googleapis.com run.googleapis.com cloudbuild.googleapis.com
```

### Step 3: Create Artifact Registry Repository
Create a Docker registry repository in your preferred region (e.g., `us-central1`):
```bash
gcloud artifacts repositories create tls-repo \
    --repository-format=docker \
    --location=us-central1 \
    --description="Docker repository for That Laundry Shop website"
```

### Step 4: Build Container image using Google Cloud Build
Submit the project codebase to Google Cloud Build. This uploads the code, builds the container using the optimized `Dockerfile`, and pushes it to your Artifact Registry:
```bash
gcloud builds submit --tag us-central1-docker.pkg.dev/[PROJECT_ID]/tls-repo/tlswebsite:latest
```

### Step 5: Deploy to Google Cloud Run
Deploy the newly built container image to Cloud Run. Make sure to attach the environment variables (like your database connection and SMTP details):
```bash
gcloud run deploy tls-website \
    --image us-central1-docker.pkg.dev/[PROJECT_ID]/tls-repo/tlswebsite:latest \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars DATABASE_URL="postgresql://postgres:%40K0tApq9R%40(CEQk%22@34.10.25.133:5432/tls_web_test",JWT_SECRET="tls-secret-key-2026",SMTP_HOST="smtp.gmail.com",SMTP_PORT="587",SMTP_USER="thatlaundryshopbooking@gmail.com",SMTP_PASS="fpgs roze tduz vakx"
```

---

## Custom Domain Binding (Optional)

Once deployed, Google Cloud Run will provide you with a temporary HTTPS URL (e.g., `https://tls-website-xxxxx-uc.a.run.app`). 

To map your custom domain (e.g., `www.thatlaundryshop.com`):
1. Go to the **Google Cloud Console** > **Cloud Run**.
2. Click **Manage Custom Domains** at the top.
3. Click **Add Mapping**, select your Service (`tls-website`), enter your domain name, and follow the instructions to add the DNS `CNAME` / `TXT` verification records in your domain provider (e.g., GoDaddy, Namecheap, Cloudflare).
