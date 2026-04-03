# 🚀 BestBill: Full Development & Deployment Guide

This guide explains how to manage your daily workflow, from your local computer to your live production environment on Google Cloud Platform (GCP).

---

## 🏗️ 1. Local Development Environment
Use this environment to build and test new features safely WITHOUT affecting your live users.

### **Prerequisites**
- **Node.js** (v18+)
- **Local PostgreSQL** (Running on port 5432)
- **Database**: `bestbill` (must be created manually or via pgAdmin before running the script)

### **Initial Setup (First time only)**
Connect your local backend to your local database:
1.  Navigate to `backend` and run:
    ```bash
    npm run db:init
    ```
    *This creates all tables and a Super Admin account:*
    - **Email**: `admin@bestbill.com`
    - **Password**: `admin123`

### **Starting the Servers**
Open two terminal windows:

**Terminal 1: Backend**
```bash
cd backend
npm run dev
```
- Available at: `http://localhost:8080/api`
- Uses `.env` for local Postgres credentials.

**Terminal 2: Frontend**
```bash
cd frontend
npm run dev
```
- Available at: `http://localhost:5173`
- Uses `.env.development` to connect to your local backend.

---

## 🛠️ 2. Development Workflow (Making Changes)

### **Step 1: Code & Test Locally**
1.  Modify your code in `backend` or `frontend`.
2.  Your local servers will auto-refresh.
3.  Test your changes thoroughly in the browser at `http://localhost:5173`.
4.  **Check for errors**: Check the terminal output and the browser console (F12).

### **Step 2: Verify API Connectivity**
If your frontend isn't loading data, ensure your **local backend** is actually returning data from your **local Postgres**. 

---

## 🚢 3. Pushing Changes to Production (GCP)

Once you've tested your features locally and are ready to go live!

### **Deploying Backend Changes**
1.  Ensure you have `gcloud` CLI installed and authenticated.
2.  Navigate to the **root** or the `backend` folder.
3.  Run the deployment command:
    ```bash
    gcloud run deploy bestbill-backend --source backend --region us-central1
    ```
    *This will build a new Docker image and deploy it. Since your GCP environment variables are already set in Cloud Run, it will automatically connect to Cloud SQL.*

### **Deploying Frontend Changes**
Since the frontend is a React (Vite) app, it must be **built** before deployment.
1.  Navigate to the `frontend` folder.
2.  Run the build command:
    ```bash
    npm run build
    ```
    *Vite will use `.env.production` to point to your live GCP backend URL.*
3.  Deploy the generated `dist` folder to your hosting provider (Firebase, Netlify, Vercel, or a static bucket).

---

## 🚦 4. Key Rules to Remember

| Topic | **Development (Local)** | **Production (GCP)** |
| :--- | :--- | :--- |
| **API URL** | `http://localhost:8080/api` | `https://bestbill-backend...run.app/api` |
| **Database** | Local PC (Postgres) | Cloud SQL (Postgres) |
| **Env Files** | `.env` / `.env.development` | Cloud Run Config / `.env.production` |
| **`npm run db:init`** | **YES** (Run this to sync schema) | **NO** (Never run this on prod) |

> [!IMPORTANT]
> **Schema Changes**: If you add a new table or column locally, you must manually apply that same SQL change to your **Cloud SQL** instance (e.g., via Cloud Shell or a pgAdmin connection) or add a migration to your code.

---

## 🏁 Summary Checklist
1.  **Work Locally**: Start backend and frontend.
2.  **Test**: Verify logic in browserdev tools.
3.  **Build**: Run `npm run build` for frontend.
4.  **Deploy**: Use `gcloud run deploy` for backend.
