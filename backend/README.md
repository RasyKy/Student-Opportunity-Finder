# Backend Setup Guide

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account and project
- npm or yarn

### Installation

1. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in your Supabase credentials:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_KEY`: Your anon public key
   - `SUPABASE_SERVICE_KEY`: Your service role key (for admin operations)
   - `JWT_SECRET`: A secure random string for JWT signing

3. **Set up the database**

   **Option A: Using Supabase Dashboard (Recommended)**
   - Go to your Supabase project
   - Click "SQL Editor"
   - Create a new query and paste the contents of `migrations/001_init_schema.sql`
   - Run it
   - Create another query and paste `migrations/002_rls_policies.sql`
   - Run it

   **Option B: Using the migration script (requires admin credentials)**

   ```bash
   npm run migrate
   ```

4. **Start the server**

   ```bash
   npm run dev
   ```

Server will run on `http://localhost:4010`

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # Supabase client configuration
├── middleware/
│   └── auth.js              # Authentication and authorization middleware
├── routes/
│   ├── auth.js              # Authentication endpoints (register, login, logout)
│   ├── opportunities.js     # Opportunity CRUD and search
│   └── users.js             # User profile and bookmarks
├── scripts/
│   └── migrate.js           # Database migration script
├── migrations/
│   ├── 001_init_schema.sql  # Database schema creation
│   └── 002_rls_policies.sql # Row-Level Security policies
├── server.js                # Express server setup
└── package.json             # Dependencies
```

## 🔐 Authentication

### Register (Student or Organizer)

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "accountType": "student",
  "firstName": "John",
  "lastName": "Doe"
}
```

Response:

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "account_type": "student",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Logout

```bash
POST /api/auth/logout
Authorization: Bearer YOUR_TOKEN
```

## 🔑 Authorization

The API uses JWT tokens and role-based access control. Include the token in the Authorization header:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Roles

- **student**: Can browse opportunities, bookmark, apply
- **organizer**: Can create and manage opportunities, view applications
- **admin**: Full access to all resources

## 📚 API Endpoints

### Opportunities

- `GET /api/opportunities` - List opportunities (with search/filter)
- `GET /api/opportunities/:id` - Get single opportunity
- `POST /api/opportunities` - Create opportunity (organizer/admin)
- `PUT /api/opportunities/:id` - Update opportunity
- `DELETE /api/opportunities/:id` - Delete opportunity

### Users

- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile/:id` - Update user profile
- `GET /api/users/:id/bookmarks` - Get user bookmarks
- `POST /api/users/:id/bookmarks` - Add bookmark
- `DELETE /api/users/:id/bookmarks/:opportunityId` - Remove bookmark

## 🛡️ Security

- All passwords are hashed by Supabase Auth
- JWT tokens expire after 24 hours
- Row-Level Security (RLS) policies enforce data access rules at the database level
- Service keys are used only for admin operations on the backend

## 🚨 Important Notes

- **Never commit `.env` file** - It contains sensitive credentials
- **Never expose `SUPABASE_SERVICE_KEY`** - Keep it server-side only
- The `SUPABASE_KEY` is safe to expose (anonymous key)

## 📝 Next Steps

1. ✅ Database schema created
2. ✅ Authentication implemented
3. ✅ RBAC middleware set up
4. ⏭️ Connect frontend apps to the backend API
5. ⏭️ Implement moderation system (Task 4.5)
