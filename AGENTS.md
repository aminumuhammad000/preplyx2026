n# CBT Platform - Agent Documentation

## Project Overview
This is a Computer Based Test (CBT) platform consisting of three main components:
- **Preplyx**: Next.js main application for students (port 3000)
- **Admin Panel**: React + Vite admin interface (port 5173)  
- **Backend**: Node.js + Express + MongoDB API server (port 5000)

## Development Commands

### Backend
```bash
cd backend
npm install
npm run dev      # Development server with nodemon
npm run build    # TypeScript compilation
npm start        # Production server
```

### Preplyx (Main Application)
```bash
cd preplyx
npm install
npm run dev      # Next.js development server (port 3000)
npm run build    # Production build
npm start        # Production server
npm run lint     # ESLint
```

### Admin Panel
```bash
cd admin-panel
npm install
npm run dev      # Vite development server (port 5173)
npm run build    # TypeScript compilation + Vite build
npm run lint     # Oxlint
npm run preview  # Preview production build
```

## Architecture & Integration

### Authentication System
- Shared authentication using `preplyx_token` in localStorage
- Both applications use the same backend API (`http://localhost:5000/api`)
- JWT tokens with 30-day expiration
- Cross-application logout functionality

### API Endpoints (Backend)
- Authentication: `/api/auth/login`, `/api/auth/register`, `/api/auth/profile`
- Exams: `/api/exams`, `/api/exams/{exam}/subjects`
- Questions: `/api/questions`
- User Data: `/api/data/stats`, `/api/data/sessions`
- Wallet: `/api/wallet`, `/api/wallet/transactions`
- Admin: `/api/admin/*` (various admin endpoints)

### Database Models
- User, Wallet, Transaction, Exam, Question, ExamSession
- SystemConfig, SupportTicket, BroadcastNotification

## Key Integration Points

### 1. Token Sharing
- Both apps read/write `preplyx_token` in localStorage
- Admin panel also stores `adminToken` and `adminUser` for compatibility
- Logout clears all authentication tokens

### 2. Cross-Application Navigation
- Preplyx sidebar has "Admin Panel" link → opens `http://localhost:5173`
- Admin panel sidebar has "Go to Preplyx" link → opens `http://localhost:3000`
- Both open in new tabs with shared authentication

### 3. Logo Management
- Preplyx: `preplyx/public/logo.png`
- Admin Panel: `admin-panel/src/assets/logo.png`
- Used in login pages, dashboards, and layouts

## File Structure Notes

### Preplyx (Next.js App Router)
- `src/app/` - Next.js 13+ app directory
- `src/app/dashboard/` - Main application routes
- `src/components/` - Reusable components
- `src/context/` - React Context (AuthContext)
- `src/lib/` - Utilities (api.ts, storage.ts, questionGenerator.ts)

### Admin Panel (React + Vite)
- `src/pages/` - Page components (Dashboard, Users, Exams, etc.)
- `src/components/` - Layout component
- `src/assets/` - Static assets (logo.png)

### Backend
- `src/controllers/` - Request handlers
- `src/models/` - Mongoose models
- `src/routes/` - Express route definitions
- `src/middlewares/` - Express middleware (auth, error handling)

## Important Configuration

### Environment Variables
Backend uses `.env` file:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `PORT` - Server port (default 5000)

### CORS Configuration
Backend configured to accept requests from both frontend applications.

## Testing & Verification

### Manual Testing Steps
1. Start all three servers (backend, preplyx, admin-panel)
2. Register/login in Preplyx
3. Navigate to Admin Panel via sidebar link
4. Verify auto-login works (shared token)
5. Test logout from either application
6. Verify both applications log out

### Common Issues
- **Backend not running**: Ensure MongoDB is accessible and backend starts without errors
- **Port conflicts**: Check if ports 3000, 5000, 5173 are available
- **CORS errors**: Verify backend CORS configuration
- **Authentication failures**: Check JWT_SECRET and token generation

## Recent Changes (Integration)
- Modified admin panel login to use email field (consistent with preplyx)
- Added shared token management (`preplyx_token`)
- Added cross-application navigation links
- Updated logo displays in both applications
- Enhanced logout to clear shared authentication

## Logo Setup
The project uses a custom logo that should be placed in:
1. `preplyx/public/logo.png` - For Next.js application
2. `admin-panel/src/assets/logo.png` - For React admin panel

Current logo file: `a.jpg` in project root (needs to be converted/copied to PNG format)
