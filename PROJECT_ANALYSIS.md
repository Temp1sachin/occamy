# Occamy Field Operations - Project Analysis

## 📋 Project Overview

**Project Name**: Occamy Field Operations  
**Technology Stack**: Next.js 14+ (App Router), TypeScript, Tailwind CSS v4, Prisma ORM, SQLite  
**Purpose**: A comprehensive field operations management system for tracking activities, sales, meetings, and distribution across field officers and admin oversight.

---

## 🏗️ Architecture & Folder Structure

```
occamy-field-ops/
├── app/                          # Next.js App Router (main application)
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts     # NextAuth.js handler
│   │   │   └── assign-role/route.ts       # Role assignment endpoint
│   │   └── activities/
│   │       ├── route.ts                   # GET/POST activities
│   │       └── [id]/route.ts              # GET specific activity
│   ├── auth/                     # Authentication pages
│   │   ├── login/                # Login page
│   │   │   ├── page.tsx
│   │   │   └── LoginClient.tsx   # Two-step role selection UI
│   │   ├── role-select/          # Post-login role assignment
│   │   │   ├── page.tsx
│   │   │   └── RoleSelectClient.tsx
│   │   ├── role-apply/           # Apply role & redirect
│   │   │   └── page.tsx
│   │   └── error/
│   │       └── page.tsx
│   ├── dashboard/                # Dashboard pages
│   │   ├── page.tsx              # Dashboard router
│   │   ├── admin/                # Admin dashboard
│   │   │   ├── page.tsx          # Admin overview (metrics, stats)
│   │   │   ├── map/              # Admin full map view
│   │   │   │   └── page.tsx
│   │   │   └── activities/       # Admin activity management
│   │   │       ├── page.tsx      # All activities list
│   │   │       └── [id]/
│   │   │           └── page.tsx  # Activity detail view
│   │   └── officer/              # Officer dashboard
│   │       ├── page.tsx          # Officer main (form + mini map)
│   │       └── map/
│   │           └── page.tsx      # Officer personal map view
│   ├── globals.css               # Global Tailwind styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page (redirects to dashboard)
├── components/                   # Reusable React components
│   ├── ActivityForm.tsx          # Activity logging form
│   ├── ActivityDetails.tsx       # Activity detail display
│   ├── ActivityAnalytics.tsx     # Analytics charts
│   ├── AdminDashboardMetrics.tsx # Admin dashboard charts & metrics
│   ├── DashboardLayout.tsx       # Dashboard sidebar layout
│   ├── MapView.tsx               # Leaflet map implementation
│   └── MapViewWrapper.tsx        # Map wrapper with dynamic loading
├── lib/                          # Utility functions & config
│   ├── auth.ts                   # NextAuth configuration
│   ├── auth-utils.ts             # Auth helper functions
│   └── SessionProvider.tsx       # Session context provider
├── middleware.ts                 # Next.js middleware
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Database seeding
├── public/                       # Static assets
├── eslint.config.mjs             # ESLint configuration
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies
├── postcss.config.mjs            # PostCSS configuration
├── tsconfig.json                 # TypeScript configuration
└── middleware.ts                 # Next.js middleware
```

---

## 🔐 Authentication System

### Implementation Details
- **Provider**: Auth0 with NextAuth.js v5
- **Strategy**: JWT-based authentication
- **Session Duration**: 30 days
- **Database Integration**: Prisma with SQLite

### Authentication Flow (Completed)
1. **Login Page** (`/auth/login`)
   - User selects role: Admin or Officer
   - Redirects to Auth0 with role in URL params
   - Purple-themed UI with gradient backgrounds (purple-600 to purple-700)

2. **Auth0 Callback**
   - Auth0 authenticates credentials
   - Returns to role-select page with Auth0 token

3. **Role Selection & Assignment** (`/auth/role-select`)
   - Reads preferred role from URL params
   - Calls `/api/auth/assign-role` POST endpoint
   - Updates user's role in Prisma database
   - Redirects to role-apply page

4. **Role Verification** (`/auth/role-apply`)
   - Reads user's role from Prisma database (source of truth)
   - Redirects to correct dashboard based on role

### Key Features
✅ Custom Auth0 claims reading from JWT's decoded ID token  
✅ Role assignment before Auth0 login  
✅ Database-backed role persistence  
✅ Token-independent role verification (prevents token staleness)  
✅ Purple gradient authentication UI with shadow effects  

---

## 👥 User Roles & Authorization

### Role Types
1. **ADMIN**
   - Full system access
   - View all field officer activities
   - Analytics and insights on all operations
   - Access to admin dashboard with full reporting

2. **OFFICER**
   - Log personal activities
   - View personal location history
   - Limited to own activities
   - Field operation tracking

### Authorization Implementation
- **Middleware** (`middleware.ts`): Only enforces authentication (no role-based logic)
- **Page-Level Protection**: Each dashboard page reads user role from Prisma DB
- **Pattern**: Role check in server-side page, redirect if unauthorized
- **Example**:
  ```typescript
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard/officer');
  }
  ```

---

## 📊 Database Schema (Prisma)

### Models

#### User Model
```typescript
- id: String (CUID)
- username: String (unique)
- password: String (hashed with bcryptjs)
- email: String (unique)
- name: String
- role: String ('ADMIN' | 'OFFICER')
- createdAt: DateTime
- updatedAt: DateTime
- activityLogs: ActivityLog[]
```

#### ActivityLog Model
```typescript
- id: String (CUID)
- userId: String (FK to User)
- user: User (relation)
- type: String ('MEETING' | 'SALES' | 'DISTRIBUTION')
- title: String
- description: String (optional)
- latitude: Float (optional)
- longitude: Float (optional)
- timestamp: DateTime
- updatedAt: DateTime
- meeting: MeetingDetails (one-to-one)
- sale: SaleDetails (one-to-one)
- distribution: DistributionDetails (one-to-one)
```

#### MeetingDetails Model
```typescript
- id: String (CUID)
- logId: String (unique FK to ActivityLog)
- attendeeName: String
- category: String ('FARMER' | 'SELLER' | 'INFLUENCER')
- contactPhone: String (optional)
- contactEmail: String (optional)
- businessPotential: String (optional)
- duration: Int (in minutes, optional)
- notes: String (optional)
- isGroupMeeting: Boolean
- groupSize: Int (for group meetings)
- meetingType: String (for group meetings: 'Training', 'Demo', 'Feedback')
```

#### SaleDetails Model
```typescript
- id: String (CUID)
- logId: String (unique FK to ActivityLog)
- productName: String
- quantity: Float
- unit: String ('kg' | 'liter' | 'unit')
- amount: Float (in currency)
- buyerName: String
- saleMode: String ('DIRECT' | 'VIA_DISTRIBUTOR')
- isRepeatOrder: Boolean
- notes: String (optional)
```

#### DistributionDetails Model
```typescript
- id: String (CUID)
- logId: String (unique FK to ActivityLog)
- productName: String
- quantity: Float
- unit: String ('kg' | 'liter' | 'unit')
- distributedTo: String
- notes: String (optional)
```

---

## 🎯 Implemented Features

### 1. **Authentication & Authorization** ✅
- Auth0 integration with custom role claims
- Two-step login flow with role selection
- JWT-based session management
- Role-based access control
- Database-backed role persistence

### 2. **Activity Logging** ✅
- **Meeting Activities**
  - Individual meetings (farmer, seller, influencer)
  - Group meetings with attendee count
  - Meeting details (duration, notes, contact info)
  - Business potential tracking

- **Sales Activities**
  - Product name, quantity, unit tracking
  - Sale amount recording
  - Buyer information
  - Direct vs. distributor sales mode
  - Repeat order tracking

- **Distribution Activities**
  - Product distribution tracking
  - Quantity and unit management
  - Distribution recipient tracking

### 3. **Location Tracking** ✅
- GPS coordinates capture (latitude/longitude)
- Map visualization with Leaflet
- Location history per officer

### 4. **Dashboards**

#### Admin Dashboard (`/dashboard/admin`)
- **Overview Page**
  - Total activities count
  - Meeting statistics
  - Sales metrics
  - Distribution tracking
  - Activity type breakdown (pie chart)
  - Sales trend analysis
  - Officer performance comparison
  - Recent activities table
  - Filter by officer and activity type

- **Map View** (`/dashboard/admin/map`)
  - Real-time tracking of all field activities
  - Interactive map with activity markers
  - Full-screen map interface

- **Activities Management** (`/dashboard/admin/activities`)
  - View all activities across all officers
  - Sortable activity table
  - Activity type filtering
  - Activity detail navigation
  - Officer information display

- **Activity Details** (`/dashboard/admin/activities/[id]`)
  - Comprehensive activity information
  - Meeting/Sale/Distribution specific details
  - Officer information
  - Timestamp and location data

#### Officer Dashboard (`/dashboard/officer`)
- **Main Page**
  - Activity logging form (MEETING, SALES, DISTRIBUTION)
  - Personal statistics card
  - Mini map showing personal locations
  - Recent personal activities list
  - Quick action buttons

- **Map View** (`/dashboard/officer/map`)
  - Personal location history
  - Full-screen personal map
  - Activity location tracking

### 5. **Analytics & Reporting** ✅
- Activity type distribution (pie charts)
- Sales trends over time (line charts)
- Officer performance comparison (bar charts)
- Custom filters (by officer, activity type)
- Metrics calculation (total sales, meetings, distributions)

### 6. **User Interface** ✅
- **Authentication UI** (Recently Enhanced)
  - Purple gradient backgrounds (purple-600 to purple-700)
  - Shadow effects (shadow-2xl)
  - Interactive hover animations
  - Form validation and error display

- **Dashboard UI** (Recently Enhanced)
  - Purple gradient headers
  - Enhanced shadow effects
  - Hover state animations (scale, translate, color changes)
  - Responsive grid layouts
  - Rounded cards with borders
  - Purple accent colors throughout

- **Components**
  - Activity form with conditional rendering
  - Activity details view
  - Analytics charts using Recharts
  - Interactive map with Leaflet
  - Sidebar navigation (DashboardLayout)
  - Responsive design

### 7. **API Endpoints** ✅

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth handler |
| `/api/auth/assign-role` | POST | Assign role to user |
| `/api/auth/assign-role` | GET | Get current user role |
| `/api/activities` | GET | Fetch activities (filtered) |
| `/api/activities` | POST | Create new activity |
| `/api/activities/[id]` | GET | Fetch specific activity |

### 8. **Database Features** ✅
- User management with role assignment
- Activity logging with multiple activity types
- Location tracking with GPS coordinates
- Activity metadata storage
- Cascading deletes (user deletion removes activities)
- Timestamp tracking (createdAt, updatedAt)
- Data validation through Prisma schema

---

## 🎨 UI/UX Features

### Design System (Recently Implemented)
- **Color Scheme**
  - Primary: Purple gradient (from-purple-600 to-purple-700)
  - Secondary: Purple shades (500, 400)
  - Backgrounds: Purple-50
  - Borders: Purple-100
  - Accent: Purple-900 text

- **Typography**
  - Headers: Large, bold, white on purple gradients
  - Body: Medium weight, gray text
  - Labels: Small uppercase font-bold

- **Interactive Effects**
  - Hover animations: scale-105, -translate-y-1
  - Shadow transitions: shadow-lg to shadow-2xl
  - Color transitions: smooth duration-300
  - Active states: scale-95

- **Layout**
  - Rounded corners: rounded-2xl on cards
  - Spacing: Consistent padding/margin (8px base unit)
  - Responsive: Grid layouts with responsive breakpoints
  - Sidebar: Dashboard layout with icon navigation

### Components with Enhanced Styling
- ✅ Login page (LoginClient.tsx)
- ✅ Role selection (RoleSelectClient.tsx)
- ✅ Admin dashboard (admin/page.tsx)
- ✅ Admin map (admin/map/page.tsx)
- ✅ Admin activities (admin/activities/page.tsx)
- ✅ Admin activity detail (admin/activities/[id]/page.tsx)
- ✅ Officer dashboard (officer/page.tsx)
- ✅ Officer map (officer/map/page.tsx)

---

## 🔧 Technical Implementation

### Key Technologies
- **Frontend**: React 19.2.3, Next.js 16.1.6
- **Styling**: Tailwind CSS v4, PostCSS
- **Backend**: Next.js API routes, TypeScript
- **Database**: Prisma ORM, SQLite
- **Authentication**: NextAuth.js v5, Auth0
- **Maps**: Leaflet, React-Leaflet
- **Charts**: Recharts
- **Icons**: Lucide React
- **Password Hashing**: bcryptjs

### Build & Development
- **Package Manager**: npm
- **TypeScript**: Strict mode
- **Linting**: ESLint v9 with Next.js config
- **Node Types**: @types/node v20
- **Development Server**: Next.js dev server (port 3000)

### Scripts Available
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed database with test data
npm run db:push      # Push Prisma schema to database
```

---

## 🗂️ Seed Data

### Pre-populated Users (from `prisma/seed.ts`)

| Role | Username | Email | Password | ID |
|------|----------|-------|----------|-----|
| ADMIN | admin | admin@occamy.com | admin123 | auto-generated |
| OFFICER | officer1 | officer1@occamy.com | officer123 | auto-generated |
| OFFICER | officer2 | officer2@occamy.com | officer456 | auto-generated |

---

## 🚀 User Journeys

### Admin User Flow
1. Login at `/auth/login` → Select "Admin" role
2. Provide Auth0 credentials
3. Redirected to `/dashboard/admin`
4. View:
   - Overview with metrics
   - All officer activities
   - Map view of all locations
   - Detailed activity reports
   - Officer performance analytics

### Officer User Flow
1. Login at `/auth/login` → Select "Officer" role
2. Provide Auth0 credentials
3. Redirected to `/dashboard/officer`
4. Can:
   - Log new activities (Meeting, Sales, Distribution)
   - View personal location history
   - Check recent personal activities
   - Access full personal map

---

## 📈 Analytics & Metrics Available

### Admin Analytics
- Total activities by type
- Sales revenue tracking
- Meeting count and categories
- Distribution metrics
- Officer performance comparison
- Activity trends over time
- Group meeting statistics

### Data Points Tracked
- Activity count by type
- Sales amount totals
- Quantity tracked (kg, liters, units)
- Location data (lat, lon)
- Attendee information
- Time spent (meeting duration)
- Repeat order tracking

---

## 🔒 Security Features

### Implemented
✅ JWT-based authentication  
✅ Hashed passwords (bcryptjs)  
✅ Role-based access control  
✅ Middleware authentication check  
✅ Page-level authorization  
✅ Secure NextAuth callbacks  
✅ Auth0 integration with custom claims  
✅ Protected API endpoints  

### Security Patterns
- Server-side role verification (not client-side)
- Database as source of truth for roles
- JWT tokens with 30-day expiration
- CORS-friendly API structure
- Environment variable protection

---

## 🐛 Known Issues & Resolutions

### Issue 1: Auth Loop (RESOLVED)
- **Problem**: Users redirected between `/dashboard/admin` and `/auth/login`
- **Cause**: Pages reading role from stale JWT token instead of database
- **Solution**: Implemented Prisma DB queries in each dashboard page

### Issue 2: Role Not Persisting (RESOLVED)
- **Problem**: Role always defaulted to OFFICER
- **Cause**: Auth0 custom claims read from profile() callback (unreliable)
- **Solution**: Moved claim reading to JWT callback's decoded ID token

### Issue 3: Middleware PrismaError (RESOLVED)
- **Problem**: "PrismaClientValidationError: In order to run Prisma Client on edge runtime..."
- **Cause**: Middleware trying to use Prisma on Edge runtime
- **Solution**: Removed database queries from middleware, kept only auth check

---

## 📝 Environment Variables Required

```
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_ISSUER_BASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
DATABASE_URL=file:./dev.db
```

---

## 🎓 Development Best Practices Implemented

1. **Async Server Components**: Used for database queries
2. **Dynamic Component Loading**: MapView loaded dynamically to avoid SSR issues
3. **Client Components**: Activity forms and charts use 'use client'
4. **Type Safety**: Full TypeScript implementation
5. **Error Handling**: Try-catch in async operations, error redirects
6. **Performance**: Optimized queries, lazy loading
7. **Code Organization**: Separation of concerns (auth, components, API)
8. **Responsive Design**: Mobile-first Tailwind approach

---

## 📊 Project Status Summary

### ✅ Completed Features
- Authentication system (Auth0 + NextAuth.js)
- Role-based authorization
- Activity logging (3 types)
- Admin dashboard with analytics
- Officer dashboard with personal tracking
- Map visualization
- Location tracking
- Database schema with relationships
- API endpoints
- UI enhancements (purple theme, shadows, interactions)
- Seed data
- TypeScript type safety

### 🔄 Partially Implemented
- None currently (all major features complete)

### ⏳ Potential Future Enhancements
- Email notifications
- Real-time activity updates (WebSocket)
- Advanced filtering and search
- CSV/PDF exports
- Mobile app version
- Offline mode
- Advanced geofencing
- Team collaboration features
- Activity approval workflow
- Multi-language support

---

## 🏆 Technical Achievements

1. **Robust Authentication Flow**: Two-step role selection with Auth0
2. **Database-Backed Authorization**: Prevents token staleness issues
3. **Purple Theme Consistency**: Comprehensive UI redesign across all pages
4. **Multi-Activity System**: Flexible logging for 3 different activity types
5. **Real-Time Analytics**: Live metrics and charts
6. **Responsive Maps**: Interactive map visualization with Leaflet
7. **Type-Safe Development**: Full TypeScript implementation
8. **Clean Architecture**: Well-organized folder structure and separation of concerns

---

Generated: February 2, 2026
