# Complete Deployment Guide (100% Free Hosting)
## Online Notice Board Management System (MERN Stack)

This step-by-step guide walks you through deploying your **MERN Stack** project online for free so anyone (examiners, professors, classmates) can access your live website from any device.

---

### Deployment Architecture:

| Component | Free Cloud Host | Setup Time | What It Hosts |
|---|---|---|---|
| **Database** | **MongoDB Atlas** | ~3 mins | Cloud MongoDB database cluster |
| **Backend API** | **Render.com** | ~3 mins | Node.js + Express REST API |
| **Frontend Client** | **Vercel.com** | ~2 mins | React.js + Vite responsive web app |

---

## STEP 1: Set Up Cloud MongoDB Database (MongoDB Atlas)

*Your local database on `localhost:27017` cannot be reached from the cloud, so we use MongoDB's official free cloud tier.*

1. Visit **[mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)** and sign up for a free account.
2. Click **Create** under the **M0 Free Cluster** option (Free Shared).
3. Select any nearby AWS region (e.g. Mumbai, Singapore, Frankfurt) and click **Create Deployment**.
4. **Create a Database User:**
   - Username: `admin` (or your choice)
   - Password: Choose a password (e.g. `NoticeBoard2026`)
   - Click **Create Database User**. *(Save this password!)*
5. **Set Network Access (IP Whitelist):**
   - In the left sidebar, click **Network Access** under Security.
   - Click **+ Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`) so Render and Vercel can connect.
   - Click **Confirm**.
6. **Get Your Connection String:**
   - In the left sidebar, click **Database**.
   - Click **Connect** next to your cluster.
   - Select **Drivers** (Node.js).
   - Copy the connection string. It looks like:
     ```
     mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     ```
   - Replace `<password>` with your real password and append `/online_notice_board` before the `?`:
     ```
     mongodb+srv://admin:NoticeBoard2026@cluster0.abcde.mongodb.net/online_notice_board?retryWrites=true&w=majority
     ```

---

## STEP 2: Push Your Project to GitHub

1. Open PowerShell and navigate to the project directory:
   ```powershell
   cd d:\Third_sem\online-notice-board
   ```
2. Initialize git and commit:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit of Online Notice Board Management System"
   ```
3. Create a **New Repository** on **[GitHub.com](https://github.com/new)** (e.g. `online-notice-board`).
4. Link and push to GitHub:
   ```powershell
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/online-notice-board.git
   git push -u origin main
   ```

---

## STEP 3: Deploy Backend on Render.com (Free)

1. Sign up / Log in to **[Render.com](https://render.com/)** using your GitHub account.
2. Click **New +** at the top right and select **Web Service**.
3. Choose **Build and deploy from a Git repository**, and select your `online-notice-board` repository.
4. Configure the settings:
   - **Name:** `online-notice-board-api` (or any unique name)
   - **Region:** Any (e.g. Singapore / Frankfurt)
   - **Branch:** `main`
   - **Root Directory:** `backend` *(Important!)*
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Scroll down to **Environment Variables** and add the following keys:
   | Key | Value |
   |---|---|
   | `MONGO_URI` | *(Your MongoDB Atlas connection string from Step 1)* |
   | `JWT_SECRET` | `super_secret_jwt_key_for_mca_project_2026` |
   | `PORT` | `5000` |
   | `CLIENT_URL` | `*` |
   | `ADMIN_EMAIL` | `admin@college.edu` |
   | `ADMIN_PASSWORD` | `Admin@12345` |
6. Click **Deploy Web Service**.
7. Wait 2 minutes. Once deployed, Render will display your live backend URL at the top:
   ```
   https://online-notice-board-api.onrender.com
   ```
   *(Test it by opening it in your browser; it should show: "Online Notice Board Management System API is running smoothly.")*

---

## STEP 4: Seed the Administrator Account in Cloud Database

To initialize your cloud database with the default Admin (`admin@college.edu` / `Admin@12345`):

### Option A (Quickest – Run from your local terminal):
In your local `d:\Third_sem\online-notice-board\backend\.env` file, temporarily update `MONGO_URI` to your MongoDB Atlas connection string, then run:
```powershell
cd d:\Third_sem\online-notice-board\backend
node seedAdmin.js
```
You will see: `Administrator account seeded successfully!`.

### Option B (From Render Dashboard):
In Render, open your deployed Web Service, click **Shell** in the left menu, and run:
```bash
node seedAdmin.js
```

---

## STEP 5: Deploy Frontend on Vercel.com (Free)

1. Sign up / Log in to **[Vercel.com](https://vercel.com/)** using your GitHub account.
2. Click **Add New...** ➜ **Project**.
3. Find your `online-notice-board` repository and click **Import**.
4. Configure Project:
   - **Root Directory:** Click **Edit** and select `frontend` *(Important!)*
   - **Framework Preset:** `Vite` (automatically detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Expand **Environment Variables** and add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-backend-name.onrender.com/api` *(Your Render backend URL from Step 3 + `/api`)*
   - *Example:* `https://online-notice-board-api.onrender.com/api`
6. Click **Deploy**.
7. In ~30 seconds, Vercel gives you your live production URL:
   ```
   https://online-notice-board-frontend.vercel.app
   ```

---

## Verification Checklist for Your Deployed Site

1. Open your live Vercel URL in your browser.
2. **Test Admin Login:** Log in with `admin@college.edu` / `Admin@12345`.
3. **Test Notice Creation:** Create and publish an institutional announcement.
4. **Test Faculty Registration:** Register a faculty member, then log in as Admin to activate their account.
5. **Test Student Registration & Search:** Register as a student and test real-time keyword search.

---

### Need Help or Alternative Options?
- If you prefer a single unified service (serving both React frontend and Express backend from one Render URL), let me know and I can show you how to configure Express to serve the static frontend bundle directly!
