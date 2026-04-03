# BestBill Environment & Workflow Guide

Your development environment is now decoupled from production. Use this guide to manage your daily workflow.

## 🏗️ Development Workflow

1.  **Start Local Database** (Docker required):
    ```powershell
    docker-compose up -d
    ```
2.  **Start Backend** (Local):
    ```powershell
    cd backend
    npm run dev
    ```
3.  **Start Frontend** (Local):
    ```powershell
    cd frontend
    npm run dev
    ```
    *Note: The frontend will automatically use VITE_API_URL from `.env.development`.*

---

## 🚀 Deployment Workflow

Once you have tested your features locally and are ready to go live:

1.  **Backend**: Push your code to your repo/GCP.
    ```powershell
    gcloud run deploy bestbill-backend --source .
    ```
2.  **Frontend**: Vite will use `.env.production` during the build process.
    ```powershell
    cd frontend
    npm run build
    # After build, deploy the dist folder as you normally do
    ```

---

## 🔧 Environment Configuration

| Feature | Development (Local) | Production (GCP) |
| :--- | :--- | :--- |
| **API URL** | `http://localhost:8080/api` | `https://bestbill-backend...run.app/api` |
| **Database** | Local PostgreSQL (Local/Docker) | Cloud SQL |
| **Storage** | GCS (via local key) | GCS (via Service Account) |

> [!TIP]
> Always verify that your `.env` files (especially `backend/.env`) contain the correct local credentials before starting the dev server.
