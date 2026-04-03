# BestBill - Local Start & Live Deployment Guide

Even without an AI assistant, you have full control over this application. Here is your complete, permanent guide on how to start the project locally and how to put it on the public internet.

---

## 1. How to Start the Project Locally (On Your PC)

Whenever you restart your computer and want to run the BestBill system, follow these steps:

### Prerequisites:
Make sure **PostgreSQL** is running in the background on your computer.

### Step 1: Start the Backend (Server)
1. Open a new terminal (Command Prompt or PowerShell).
2. Navigate to the backend folder:
   ```bash
   cd C:\Users\shubh\Desktop\BestBill\backend
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
   *(It should say "Server running on port 5000")*

### Step 2: Start the Frontend (Website)
1. Open a **second** terminal window.
2. Navigate to the frontend folder:
   ```bash
   cd C:\Users\shubh\Desktop\BestBill\frontend
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```
   *(It will provide a local network link)*

4. **Done!** Open your browser and go to `http://localhost:5173`.

---

## 2. How to Make It "Live" (Deploy to the Internet)

If you want the software to be accessible from anywhere in the world on a public URL, you need to host it on cloud servers. Here is the standard architecture:

### Step A: Host the Database (PostgreSQL)
You cannot use your laptop's database for the public internet.
1. Create a free managed database on platforms like **Supabase.com**, **Neon.tech**, or **Render.com**.
2. Run your `schema.sql` file on their query runner to build the tables.
3. They will give you a **Connection URL/Credentials**.

### Step B: Host the Backend (Node.js)
1. Upload your code to a private GitHub repository.
2. Sign up on **Render.com** (or Heroku).
3. Create a new "Web Service" and link your GitHub repo.
4. Set the Root Directory to `backend`.
5. Set the Build Command: `npm install`
6. Set the Start Command: `node src/index.js`
7. In the settings, add all your Environment Variables from your local `.env` file (`DB_HOST`, `DB_USER`, `JWT_SECRET`, `SMS_API_KEY`, etc.). Make sure to use the new Database credentials from Step A.
8. Render will give you a live URL like `https://bestbill-api.onrender.com`.

### Step C: Host the Frontend (React site)
1. Before deploying, you MUST change the API URL in your frontend so it talks to the public backend instead of your laptop.
   - Go to `frontend/src/services/api.js`
   - Change `baseURL: 'http://localhost:5000/api'` to your new live backend URL (e.g., `baseURL: 'https://bestbill-api.onrender.com/api'`).
2. Go to **Vercel.com** or **Netlify.com**.
3. Create a new project, link your GitHub repo, and select the `frontend` folder.
4. The Build Command is `npm run build`.
5. Deploy it! They will give you a public URL (which you can change to a custom domain like `bestbill.in`).

---

## 3. Alternative: Deploy using VPS (Hostinger, DigitalOcean, AWS)

If you purchase a Virtual Private Server (VPS), you can host everything on one machine using the Docker configuration we created earlier.

1. Install Docker and Docker Compose on your cloud Linux server.
2. Upload your `BestBill` folder to the server.
3. Make sure to update your production `.env` files.
4. Run the master startup command:
   ```bash
   docker-compose up -d --build
   ```
5. Docker will automatically launch the Database, Backend, and Frontend. You then just need to configure a web server (like Nginx) to point a domain name to your frontend's port.

---

## Troubleshooting List (If things break locally)
*   **"Address already in use (EADDRINUSE)"**: You have a zombie Node process running. Open Task Manager and force quit all `node.js` tasks, then try running `npm run dev` again.
*   **"Connection Refused" (Database)**: Your PostgreSQL service stopped. Open "Services" in Windows and restart `postgresql-x64-16`.
*   **Failed SMS**: Check your Fast2SMS wallet balance directly on their portal. Ensure DLT settings haven't changed.
