# GCP Deployment Commands

Use these commands in the Google Cloud Shell to deploy updates to your Cloud Run services. 
Make sure you run these commands from the root of your project folder (e.g., `~/BestBill`).

## Deploy Frontend

To deploy updates made to your frontend code, run:

```bash
gcloud run deploy bestbill-frontend \
  --source frontend \
  --region us-central1 \
  --allow-unauthenticated
```

## Deploy Backend

To deploy updates made to your backend code, run:

```bash
gcloud run deploy bestbill-backend \
  --source backend \
  --region us-central1 \
  --allow-unauthenticated
```

---
**Note:** If you navigate into the folders directly (e.g., `cd frontend`), you must change the `--source` flag to a dot (`.`) like this: `--source .`
