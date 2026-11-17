# Single-Site Free Deployment Guide (One Website / One URL)
## Online Notice Board Management System (MERN Stack)

You can deploy the **entire MERN Stack application onto ONE SINGLE SITE** on **Render.com**.

In this unified setup:
- **One single URL:** e.g. `https://online-notice-board.onrender.com`
- When you open this URL, it loads your **React Frontend**.
- All backend REST API endpoints run on the **same domain** under `/api/`.
- **Zero CORS issues** and **zero separate hosting platforms** needed!

---

### What You Need (Both are 100% Free):
1. **MongoDB Atlas:** Free cloud database for storing users & notices.
2. **Render.com:** Hosts both your Express Backend & React Frontend together on a single website.

---

## STEP 1: Set Up Free Cloud MongoDB (MongoDB Atlas)

*Cloud servers cannot connect to your personal laptop's `localhost:27017`, so we use MongoDB's free cloud database.*

1. Visit **[mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)** and create a free account.
2. Click **Create** under the **M0 Free** cluster option.
3. Choose any region (e.g. AWS Mumbai, Singapore, or Frankfurt) and click **Create Deployment**.
4. **Create a Database User:**
   - Username: `admin` (or your choice)
   - Password: Choose a password (e.g. `NoticeBoard2026`)
   - Click **Create Database User**. *(Remember this password!)*
5. **Enable Network Access (Allow from anywhere):**
   - In the left sidebar, click **Network Access** under Security.
   - Click **+ Add IP Address** ➜ Click **Allow Access from Anywhere** (`0.0.0.0/0`).
   - Click **Confirm**.
6. **Copy Your Connection String:**
   - In the left sidebar, click **Database** ➜ Click **Connect** next to your cluster.
   - Choose **Drivers** (Node.js).
   - Copy the connection URI:
     ```
     mongodb+srv://admin:NoticeBoard2026@cluster0.abcde.mongodb.net/online_notice_board?retryWrites=true&w=majority
     ```
   *(Make sure you replace your password and put `/online_notice_board` before the `?`).*

---

## STEP 2: Push Your Project to GitHub

1. Create a new empty repository on **[GitHub.com/new](https://github.com/new)** named `online-notice-board`.
2. Open PowerShell in your project folder and run:
   ```powershell
   cd d:\Third_sem\online-notice-board
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/online-notice-board.git
   git branch -M main
   git push -u origin main
   ```

---

## STEP 3: Deploy Everything on Render as ONE SINGLE SITE

1. Go to **[Render.com](https://render.com/)** and log in with GitHub.
2. Click **New +** at the top right and select **Web Service**.
3. Choose **Build and deploy from a Git repository**, and select your `online-notice-board` repo.
4. Configure the Web Service:
   - **Name:** `online-notice-board` (or any name you like)
   - **Region:** Any (e.g. Singapore / Frankfurt)
   - **Branch:** `main`
   - **Root Directory:** *(Leave blank / empty)*
   - **Runtime:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Scroll down to **Environment Variables** and add:
   | Key | Value |
   |---|---|
   | `MONGO_URI` | *(Your MongoDB Atlas connection string from Step 1)* |
   | `JWT_SECRET` | `super_secret_jwt_key_for_mca_project_2026` |
   | `ADMIN_EMAIL` | `admin@college.edu` |
   | `ADMIN_PASSWORD` | `Admin@12345` |
6. Click **Deploy Web Service**.

Render will now:
- Install backend dependencies
- Install frontend dependencies
- Build the production React application
- Start the Express server
- Expose both the **React Web Application** and the **Express API** on your single URL!

---

## STEP 4: Seed the Administrator Account

Once your Render service finishes deploying (you will see *"Your service is live"* in the logs):
1. In Render, click **Shell** in the left menu.
2. Run:
   ```bash
   npm run seed
   ```
3. You will see:
   `Administrator account seeded successfully! [Email: admin@college.edu, Role: admin]`

---

## STEP 5: Open Your Live Website!

Click the live URL at the top of your Render dashboard (e.g. `https://online-notice-board.onrender.com`):

- **Login Page:** `https://online-notice-board.onrender.com/login`
- **Notice Board:** `https://online-notice-board.onrender.com/notices`
- **Admin Dashboard:** `https://online-notice-board.onrender.com/admin`

You now have a **single live link** to share with your professors and external examiner!
