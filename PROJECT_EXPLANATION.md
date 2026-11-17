# MCA Project Viva & Technical Explanation Guide
## Online Notice Board Management System (MERN Stack)

This document is specifically crafted for an **MCA student preparing for a project viva and technical demonstration**. It breaks down each layer, concept, workflow, and design decision into simple, explainable language.

---

## 1. What is the Online Notice Board Management System?

The **Online Notice Board Management System** is a responsive, web-based digital portal designed to replace traditional wooden or glass physical notice boards found in educational institutions. 

In a traditional setup, faculty members print circulars, obtain physical signatures from department heads or principals, and pin papers to notice boards. This leads to physical clutter, delayed distribution, paper waste, and students missing crucial deadlines.

This system digitizes the entire lifecycle:
1. **Faculty members** draft notices online and submit them for review.
2. **Administrators** verify, approve, or reject submissions with constructive feedback.
3. **Students** log in and see filtered, verified announcements strictly relevant to their department or the entire college.

---

## 2. Why is this project needed? (Problem Statement & Solution)

### Problems with Physical Notice Boards:
- **Geographic Fragmentation:** A student must walk to multiple departmental notice boards (exam cell, library, sports, placement cell) to check for updates.
- **Unauthorized Posters:** Anyone can pin or tear down paper notices on physical boards.
- **No Revision History or Feedback:** If a notice contains an error, it must be completely reprinted and signed again.
- **Information Overload:** Students are inundated with notices from other departments that do not apply to them.

### Digital Solution:
- **Centralized Database:** Single authoritative source of announcements.
- **Editorial Governance:** Notices cannot reach students without administrative review and approval.
- **Targeted Audiences:** Students only receive announcements meant for their department or institution-wide (`targetDepartment: ALL`).
- **Audit Traceability:** Every published notice clearly displays the author's name, department, approver's name, and timestamp.

---

## 3. What is the MERN Stack?

MERN is an acronym for four full-stack JavaScript technologies:

1. **M – MongoDB:** A document-oriented NoSQL database. Instead of rows and columns (like SQL), it stores data as JSON-like documents with dynamic schemas.
2. **E – Express.js:** A fast, minimalist web framework running on top of Node.js. It handles HTTP routing, request parsing, authentication middleware, and business logic.
3. **R – React.js:** A declarative, component-based frontend JavaScript library developed by Meta. It manages the user interface, renders interactive components, and updates the DOM efficiently using a Virtual DOM.
4. **N – Node.js:** A JavaScript runtime environment built on Google Chrome's V8 engine. It allows developers to run JavaScript on the server side outside of a web browser.

> **Key Advantage for Viva:** All layers—from database querying to backend server logic and frontend UI rendering—use **one unified language: JavaScript**.

---

## 4. How React Communicates with Express

Communication between React (running in the user's browser) and Express (running on the backend server) happens via **Asynchronous HTTP REST API calls**:

1. **The HTTP Client (Axios):** React uses Axios (in `src/api.js`) to send asynchronous HTTP requests (`GET`, `POST`, `PUT`, `PATCH`) to Express endpoints.
2. **Bearer Token Authentication:** Every time React makes a request to a protected endpoint, an **Axios Request Interceptor** automatically extracts the user's JSON Web Token (JWT) from browser `localStorage` and attaches it in the request header:
   ```http
   Authorization: Bearer <jwt_token_string>
   ```
3. **Data Format:** Data sent to Express (payloads) and returned from Express (responses) is serialized in standard **JSON** (JavaScript Object Notation).
4. **CORS (Cross-Origin Resource Sharing):** Because React runs on `http://localhost:5173` and Express runs on `http://localhost:5000`, the Express backend uses the `cors` package to explicitly whitelist requests coming from the Vite client origin.

---

## 5. How Express Communicates with MongoDB & What is Mongoose?

- **MongoDB** is the database engine listening on TCP port `27017`.
- **Mongoose** is an **Object Data Modeling (ODM)** library for MongoDB and Node.js.

### Why Mongoose is Needed:
MongoDB by itself is schema-less, meaning you could insert anything into a collection. Mongoose provides:
1. **Strict Schemas:** Enforces data types, required fields, default values, and enum constraints (e.g. `role` can only be `admin`, `faculty`, or `student`).
2. **Model Abstraction:** Provides high-level JavaScript objects (e.g. `User.find()`, `Notice.create()`, `Notice.findByIdAndUpdate()`) that translate JavaScript objects into MongoDB binary JSON (BSON) operations.
3. **Document References (`populate`):** Automatically joins related documents using `ObjectId` references (similar to a SQL foreign key join, e.g. linking `createdBy` and `approvedBy` to the `User` collection).

---

## 6. What is JWT (JSON Web Token)?

A **JSON Web Token (JWT)** is a compact, URL-safe standard (RFC 7519) used for securely transmitting information between client and server as a JSON object.

### Structure of a JWT:
A token consists of three parts separated by dots (`.`):
`header.payload.signature`

1. **Header:** Contains the token type (`JWT`) and signing algorithm (`HS256`).
2. **Payload:** Contains identity claims:
   ```json
   {
     "id": "6724...",
     "role": "faculty",
     "department": "Computer Science"
   }
   ```
3. **Signature:** A cryptographic hash computed using the header, payload, and a secret key stored on the server (`JWT_SECRET`). If a malicious user attempts to tamper with their role in the payload, the server detects that the signature no longer matches and rejects the request.

### Statelessness:
Unlike traditional session cookies that require the server to store active session IDs in server memory or Redis, JWT is **stateless**. The server validates the token mathematically without querying a session store on every request.

---

## 7. How Registration and Login Work

### User Registration Workflow (`POST /api/auth/register`):
1. User enters: `name`, `email`, `password`, `department`, and `role`.
2. **Security Barrier:** The backend enforces that the submitted role can ONLY be `student` or `faculty`. Requests attempting to supply `admin` are immediately rejected with HTTP 400.
3. **Password Hashing:** Passwords are never stored in plaintext. The backend generates a cryptographic salt using `bcryptjs` and hashes the password:
   ```js
   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash(password, salt);
   ```
4. **Initial Account Status:**
   - **Student:** Account is created with `status: 'active'`. A JWT token is generated immediately.
   - **Faculty:** Account is created with `status: 'pending'`. No token is issued until an Administrator reviews and activates the account.

### User Login Workflow (`POST /api/auth/login`):
1. User provides `email` and `password`.
2. Backend queries `User.findOne({ email })`.
3. Backend verifies password using `bcrypt.compare(enteredPassword, user.password)`.
4. Backend checks user status:
   - If `status === 'pending'` ➜ returns HTTP 403: *"Your account is pending administrator activation."*
   - If `status === 'inactive'` ➜ returns HTTP 403: *"Your account has been deactivated."*
5. If valid and active, signs a JWT token with a 7-day expiration and returns user info.

---

## 8. Authentication Middleware & Role-Based Access Control (RBAC)

Two Express middleware functions in `middleware/authMiddleware.js` protect our API routes:

### 1. `protect` Middleware:
- Reads the `Authorization` header.
- Extracts the Bearer token.
- Verifies the signature using `jwt.verify(token, process.env.JWT_SECRET)`.
- Finds the user in MongoDB by `decoded.id` (omitting the password field).
- Confirms that the user's account status is still `'active'`.
- Attaches the authenticated user object to `req.user` and calls `next()`.

### 2. `authorize(...roles)` Middleware:
- Checks if the authenticated user's role is included in the allowed roles:
  ```js
  router.patch('/:id/approve', protect, authorize('admin'), approveNotice);
  ```
- If a Student attempts to hit an endpoint wrapped in `authorize('admin')`, the middleware halts the request and returns HTTP 403 Forbidden.

---

## 9. The Notice Lifecycle: Step-by-Step

### Phase A: Notice Creation
- **Faculty:** Composes a notice. They can click:
  - **Save as Draft:** Status is set to `'draft'`.
  - **Submit for Approval:** Status is set directly to `'pending_approval'`.
- **Administrator:** Can compose and click **Publish Directly**, which immediately sets status to `'published'`, records `approvedBy: req.user._id`, and sets `publishedAt: new Date()`.

### Phase B: Draft Management
- While in `'draft'` state, faculty can modify notice details via `PUT /api/notices/:id`.
- When ready, faculty clicks **Submit**, calling `PATCH /api/notices/:id/submit`, which transitions the status to `'pending_approval'`.

### Phase C: Administrative Review
- The administrator navigates to `/admin/pending`.
- **Option 1 – Approve:**
  - Calls `PATCH /api/notices/:id/approve`.
  - Status becomes `'published'`.
  - Records `approvedBy: adminId` and `publishedAt: currentTimestamp`.
- **Option 2 – Reject:**
  - Calls `PATCH /api/notices/:id/reject` with a required `rejectionReason` string.
  - Status becomes `'rejected'`.
  - The rejection feedback is saved so the faculty author can see what needs fixing.

### Phase D: Revision & Resubmission
- The faculty member navigates to **My Notices** and sees the red `'Rejected'` badge and the administrator's feedback note.
- When the faculty member clicks **Edit** and saves changes, the backend controller **automatically resets the status to `'draft'`** and clears the rejection reason.
- The faculty member can then review the revised draft and submit it again for approval.

---

## 10. Department-Based Visibility: How It Works

One of the project's most important features is **department isolation**:

### Database Field:
The `notices` collection has a field called `targetDepartment`:
- If `targetDepartment === 'ALL'` ➜ Institution-wide notice (visible to everyone).
- If `targetDepartment === 'Computer Science'` ➜ Department-specific notice.

### Backend Enforcement (Never Trust the Client):
When an authenticated student requests notices from `GET /api/notices`:
```javascript
if (req.user.role !== 'admin') {
  query.status = 'published';
  query.$or = [
    { targetDepartment: 'ALL' },
    { targetDepartment: req.user.department },
  ];
}
```
Even if a Computer Science student attempts to manually query the API or open a direct URL for a Mechanical Engineering notice, `GET /api/notices/:id` checks:
```javascript
const isDeptPermitted =
  notice.targetDepartment === 'ALL' ||
  notice.targetDepartment === req.user.department;

if (!isDeptPermitted && req.user.role !== 'admin') {
  return res.status(403).json({
    message: 'Access denied: This notice is intended for another department.'
  });
}
```
This guarantees **true server-side security** that cannot be bypassed by client-side manipulation.

---

## 11. Common Viva Questions & Model Answers

### Q1: Why did you use bcryptjs instead of standard MD5 or SHA256?
**Answer:** MD5 and SHA-256 are fast general-purpose hashing algorithms susceptible to dictionary attacks and rainbow tables. `bcryptjs` is an adaptive key derivation function with an adjustable work factor (salt rounds). It incorporates a random cryptographic salt to prevent rainbow table attacks and is intentionally computationally expensive to thwart brute-force cracking attempts.

### Q2: Why is the Administrator account created through a seed script instead of a registration page?
**Answer:** In a real-world enterprise or college environment, allowing public registration for an administrative role is a severe security vulnerability (privilege escalation). By utilizing `seedAdmin.js`, the admin account is provisioned directly via secure environment variables (`.env`). The public registration endpoint explicitly rejects any attempts to register with the `admin` role.

### Q3: What is the purpose of React Context API in your application?
**Answer:** Without Context, user authentication state (such as the JWT token, user name, role, and department) would need to be passed down through props from component to component ("prop drilling"). `AuthContext.jsx` provides a centralized store accessible by any component (`Navbar`, `ProtectedRoute`, `AdminDashboard`) via the custom `useAuth()` hook.

### Q4: What happens if a user's token is altered in browser localStorage?
**Answer:** If an attacker tampers with the token payload in `localStorage` (e.g. changing `"role": "student"` to `"role": "admin"`), the token's digital signature will no longer match when sent to the server. The `jwt.verify()` function in our `authMiddleware` will throw an error, causing the server to immediately respond with HTTP 401 Unauthorized.

### Q5: What are HTTP status codes used in your REST API?
- **200 OK:** Successful retrieval or update (`GET`, `PUT`, `PATCH`, `DELETE`).
- **201 Created:** Successful creation of a new resource (`POST` for user registration or notice creation).
- **400 Bad Request:** Missing fields, invalid data, or prohibited status transition.
- **401 Unauthorized:** Missing, expired, or invalid JWT authentication token.
- **403 Forbidden:** Authenticated user lacks permission (wrong role, unapproved account status, or wrong department).
- **404 Not Found:** Requested notice or user does not exist.
- **500 Internal Server Error:** Unexpected database or server exception.

### Q6: Can an administrator delete a notice?
**Answer:** Yes. The administrator has full authority to delete any notice (draft, pending, or published) using the `DELETE /api/notices/:id` endpoint. Faculty members can also delete their own draft or rejected notices before they are published, but cannot delete other faculty members' notices or published circulars. Students have strictly read-only access and cannot delete notices.
