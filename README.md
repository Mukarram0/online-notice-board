# Online Notice Board Management System (MERN Stack)

A clean, modern, and centralized web-based College Notice Board Management System built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). Developed as an MCA academic project with a focus on understandable architecture, clean code, role-based access control, and department-specific visibility.

---

## 1. Project Introduction

In traditional college campuses, physical notice boards are scattered across departments, leading to delayed communications, clutter, paper waste, and missed deadlines.

The **Online Notice Board Management System** digitizes campus communications. It provides a structured, role-based workflow where faculty members create notices, administrators review and approve them, and students view verified announcements relevant to their department or the entire institution.

---

## 2. Project Objectives

- **Centralized Communication:** Provide a single digital portal for all official college announcements.
- **Strict Role-Based Approval Workflow:** Ensure notices pass through administrative review before being published to students.
- **Department-Based Isolation:** Filter notices so students see announcements intended for their department or institution-wide, avoiding clutter and unauthorized access.
- **Simplicity and Maintainability:** Built with clean, beginner-friendly JavaScript, minimal folders, and no unnecessary third-party abstractions—ideal for an MCA viva demonstration.

---

## 3. Technology Stack

### Frontend
- **React.js (v18)** – Component-based User Interface
- **Vite** – Ultra-fast development server and production build tool
- **Tailwind CSS** – Professional, clean academic styling and responsive layouts
- **React Router DOM (v6)** – Client-side routing and protected routes
- **Axios** – HTTP client with Bearer token request interceptor
- **React Context API** – Lightweight global state for user authentication

### Backend
- **Node.js** – Server-side JavaScript runtime
- **Express.js** – RESTful API server framework
- **JWT (jsonwebtoken)** – Stateless token-based user authentication
- **bcryptjs** – Secure password hashing (10 salt rounds)
- **Helmet & CORS** – HTTP security headers and cross-origin resource sharing
- **express-rate-limit** – Protection against login brute-force attempts

### Database
- **MongoDB** – NoSQL document database
- **Mongoose** – Object Data Modeling (ODM) schema library for MongoDB

---

## 4. Main Functionality & Notice Workflow

The application implements a strict 4-step lifecycle:

```
[Faculty] Creates Notice (Saved as Draft)
         │
         ▼
[Faculty] Submits Draft for Approval (Status: pending_approval)
         │
         ▼
[Admin] Reviews in Pending Queue
         ├── Reject (with mandatory Feedback Reason ➜ Faculty edits & resets to Draft)
         └── Approve (Status: published, sets approvedBy & publishedAt)
         │
         ▼
[Student] Views Published Notices (Filtered by Student's Department + ALL)
```

1. **Faculty Creation:** Faculty writes a notice, chooses category, priority, and audience (ALL or Department-specific). They can save as a **Draft** or submit directly for approval.
2. **Draft Editing:** Authors can edit their draft notices anytime before submission.
3. **Admin Review Queue:** Administrators inspect pending notices and can either **Approve** (instantly published) or **Reject** with a mandatory constructive reason.
4. **Resubmission:** When faculty edits a rejected notice, the system automatically resets its status back to **Draft** so it can be updated and submitted again.
5. **Direct Publishing:** Administrators can create and publish announcements directly without needing secondary approval.
6. **Student Notice Board:** Students view published notices with keyword search, category filters, priority badges, and full notice reader view.

---

## 5. User Roles and Privileges

| Role | Initial Status | Capabilities | Restrictions |
|---|---|---|---|
| **Administrator** | Active (via seed script) | Full portal control: approve/reject notices, publish directly, view user list, activate/deactivate faculty & student accounts, view dashboard metrics. | Cannot delete/deactivate own admin account. |
| **Faculty / Staff** | Pending (requires Admin activation) | Create notice drafts, edit draft/rejected notices, submit for approval, track status of authored notices, view published campus notices. | Cannot approve or publish notices. Cannot edit other faculty's notices. Cannot log in until activated. |
| **Student** | Active (immediate demo policy) | View published notices for own department and ALL, search by keyword/title, filter by category, view notice details. | Cannot create, edit, delete, approve, or reject notices. |

---

## 6. Folder Structure

The project uses a minimal, clean, and intuitive structure:

```
online-notice-board/
├── backend/
│   ├── config/
│   │   └── db.js                  # Mongoose connection configuration
│   ├── models/
│   │   ├── User.js                # User Mongoose schema
│   │   └── Notice.js              # Notice Mongoose schema
│   ├── controllers/
│   │   ├── authController.js      # Register, Login, Me logic
│   │   ├── noticeController.js    # CRUD, submit, approve, reject logic
│   │   └── adminController.js     # Admin stats & user activation logic
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth routes
│   │   ├── noticeRoutes.js        # /api/notices routes
│   │   └── adminRoutes.js         # /api/admin routes
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT protect & role authorization
│   ├── seedAdmin.js               # Secure administrator account seeder
│   ├── server.js                  # Express application entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Role-aware navigation header
│   │   │   └── ProtectedRoute.jsx # Route guard based on auth and role
│   │   ├── pages/
│   │   │   ├── Login.jsx          # User login
│   │   │   ├── Register.jsx       # Student & faculty onboarding
│   │   │   ├── AdminDashboard.jsx # Admin metrics & quick actions
│   │   │   ├── FacultyDashboard.jsx # Faculty notice stats & drafts
│   │   │   ├── StudentDashboard.jsx # Student notice board & search
│   │   │   ├── NoticeBoard.jsx    # Campus notice browser
│   │   │   ├── NoticeDetails.jsx  # Full notice reader & action modal
│   │   │   ├── CreateNotice.jsx   # Authoring & editing form
│   │   │   ├── MyNotices.jsx      # Author submission tracker
│   │   │   ├── PendingNotices.jsx # Admin approval queue
│   │   │   └── ManageUsers.jsx    # User activation & directory
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global JWT state management
│   │   ├── api.js                 # Axios instance with Bearer interceptor
│   │   ├── App.jsx                # Router configuration & route definitions
│   │   ├── main.jsx               # React DOM entry
│   │   └── index.css              # Tailwind CSS directives
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── README.md                      # Comprehensive documentation
├── PROJECT_EXPLANATION.md         # Viva & conceptual presentation guide
└── .gitignore                     # Git ignore rules
```

---

## 7. Database Design

Only **two** MongoDB collections are used:

### 1. `users` Collection
- `name` (String, required): Full name
- `email` (String, required, unique, lowercase): Login email
- `password` (String, required): bcrypt-hashed password (never plaintext)
- `role` (String, enum: `['admin', 'faculty', 'student']`)
- `department` (String, required): e.g. `Computer Science`, `Administration`
- `status` (String, enum: `['active', 'pending', 'inactive']`)
- `timestamps`: `createdAt`, `updatedAt`

### 2. `notices` Collection
- `title` (String, required, max 200 chars)
- `content` (String, required)
- `category` (String, enum: `['Academic', 'Examination', 'Events', 'General', 'Placement', 'Administration']`)
- `priority` (String, enum: `['Low', 'Normal', 'High']`, default: `Normal`)
- `targetDepartment` (String, default: `'ALL'`): `'ALL'` indicates institution-wide, or a specific department name
- `createdBy` (ObjectId, ref: `User`): Faculty or Admin author
- `status` (String, enum: `['draft', 'pending_approval', 'rejected', 'published']`)
- `rejectionReason` (String, default: `''`): Constructive feedback from admin
- `approvedBy` (ObjectId, ref: `User`, default: `null`): Admin reviewer
- `publishedAt` (Date, default: `null`): Approval timestamp
- `timestamps`: `createdAt`, `updatedAt`

---

## 8. Installation & Prerequisites

### Prerequisites
- **Node.js** (v18.x or v20.x or v22.x)
- **MongoDB** (Local instance running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

---

## 9. Environment Configuration

1. In the `backend` directory, create a `.env` file (or copy from `.env.example`):

```bash
cd backend
copy .env.example .env
```

2. Configure the following variables in `backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/online_notice_board
JWT_SECRET=super_secret_jwt_key_for_mca_project_2026
PORT=5000
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@college.edu
ADMIN_PASSWORD=Admin@12345
```

---

## 10. How to Create the Initial Administrator

Public registration intentionally disallows creating administrator accounts for security.

Run the secure admin seeder script:

```powershell
# From the backend directory:
cd d:\Third_sem\online-notice-board\backend
node seedAdmin.js
```

This creates an active Administrator account using the credentials defined in `.env`:
- **Email:** `admin@college.edu`
- **Password:** `Admin@12345`

---

## 11. How to Run the Application

Open **two** terminal windows (PowerShell in VS Code):

### Terminal 1: Backend Server

```powershell
cd d:\Third_sem\online-notice-board\backend
npm start
```

The Express server will connect to MongoDB and start on `http://localhost:5000`.

### Terminal 2: Frontend Client

```powershell
cd d:\Third_sem\online-notice-board\frontend
npm run dev
```

The Vite development server will start on `http://localhost:5173`. Open this URL in your web browser.

---

## 12. Complete Demonstration Walkthrough for Viva

To demonstrate the full lifecycle during an MCA presentation:

1. **Step 1 – Seed Administrator:**
   Run `node seedAdmin.js` in the backend.
2. **Step 2 – Faculty Registers:**
   Open `http://localhost:5173/register`. Register as a **Faculty** member (e.g. `Dr. Ramesh`, Department: `Computer Science`).
   - Notice the system displays a banner: **"Your faculty account is pending administrator activation."**
   - Try to log in immediately with the faculty credentials: login is blocked with HTTP 403 Forbidden.
3. **Step 3 – Admin Activates Faculty:**
   Log in as Administrator (`admin@college.edu` / `Admin@12345`).
   - Navigate to **Manage Users** (`/admin/users`).
   - Find `Dr. Ramesh` under **Pending Activation** and click **✓ Activate Account**.
   - Logout from Administrator.
4. **Step 4 – Faculty Creates Notice:**
   Log in as `Dr. Ramesh`.
   - Go to **Create Notice** (`/create-notice`).
   - Create a notice:
     - Title: `MCA Mini-Project Synopsis Guidelines`
     - Category: `Academic`
     - Priority: `High`
     - Target Audience: `Department-Specific` ➜ `Computer Science`
   - Click **Save as Draft**.
   - Review it in **My Notices**, then click **Submit for Approval**.
   - Status transitions to `Pending Approval`. Logout.
5. **Step 5 – Admin Reviews & Approves Notice:**
   Log in as Administrator.
   - Go to **Pending Notices** (`/admin/pending`).
   - Inspect the submitted notice and click **✓ Approve**.
   - Status transitions to `Published`, and the admin's name and publication timestamp are attached. Logout.
6. **Step 6 – Student Views Notice:**
   Open `/register` and register as a **Student** with department `Computer Science`.
   - The student is logged in immediately.
   - Open **Notice Board** (`/notices` or `/student`).
   - The Computer Science notice is clearly visible.
   - Test the keyword search bar by searching for `Synopsis`.
   - Click **Read →** to view the full announcement details and verify that it displays the author and approval information.

---

## 13. REST API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register Student (active) or Faculty (pending) |
| `POST` | `/api/auth/login` | Public (Rate-limited) | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `GET` | `/api/notices` | Authenticated | Get notices (filtered by department visibility) |
| `GET` | `/api/notices/:id` | Authenticated | View notice details (with visibility enforcement) |
| `POST` | `/api/notices` | Faculty / Admin | Create notice (Draft / Submit / Direct Publish) |
| `GET` | `/api/notices/mine` | Faculty / Admin | Get notices authored by logged-in user |
| `PUT` | `/api/notices/:id` | Faculty Creator / Admin | Edit notice (resets rejected notices to draft) |
| `DELETE` | `/api/notices/:id` | Admin / Faculty Creator | Delete notice (Admin: any notice; Faculty: own drafts) |
| `PATCH` | `/api/notices/:id/submit` | Faculty Creator | Submit draft notice for admin approval |
| `PATCH` | `/api/notices/:id/approve` | Admin Only | Approve pending notice and publish |
| `PATCH` | `/api/notices/:id/reject` | Admin Only | Reject notice with required feedback reason |
| `GET` | `/api/admin/dashboard` | Admin Only | Metrics (users, notices, pending review queue) |
| `GET` | `/api/admin/users` | Admin Only | Retrieve list of all registered accounts |
| `PATCH` | `/api/admin/users/:id/status` | Admin Only | Activate or deactivate user accounts |

---

## 14. License & Academic Disclaimer

Developed solely for educational demonstration purposes as part of the MCA degree curriculum.
