# Preplyx & Admin Panel Integration Guide

## Overview
The Preplyx (Next.js) and Admin Panel (React + Vite) have been successfully integrated to work together with shared authentication and seamless navigation between both applications.

## Integration Changes Made

### 1. Shared Authentication System
- **Token Sharing**: Both applications now use the same authentication token (`preplyx_token`)
- **Unified Login**: Admin panel login now saves tokens that work for both applications
- **Cross-Application Logout**: Logging out of either application clears the shared token

### 2. Navigation Integration
- **Preplyx Dashboard**: Added "Admin Panel" link in the sidebar footer that opens the admin panel in a new tab
- **Admin Panel**: Added "Go to Preplyx" link in the sidebar footer that opens the main application in a new tab
- **External Link Icons**: Added visual indicators (external link icons) for cross-application navigation

### 3. Logo Integration
- **Preplyx Application**: Updated logo display in:
  - Dashboard layout sidebar
  - Login page
  - Register page
- **Admin Panel**: Updated logo display in:
  - Login page
  - Layout sidebar

### 4. Backend Compatibility
- Both applications connect to the same backend server (`http://localhost:5000/api`)
- Admin panel login now uses `email` field instead of `username` for consistency
- Authentication endpoints are compatible between both applications

## Setup Instructions

### 1. Logo Image Setup
The provided logo image (`a.jpg`) needs to be properly placed in both applications:

#### For Preplyx (Next.js):
```bash
# Copy the logo to the preplyx public folder
cp a.jpg preplyx/public/logo.png
```

#### For Admin Panel (React + Vite):
```bash
# Copy the logo to the admin panel assets folder
cp a.jpg admin-panel/src/assets/logo.png
```

**Note**: The logo should be in PNG format for best compatibility. If your logo is in JPG format, you may need to convert it or update the import statements accordingly.

### 2. Running the Applications

#### Start the Backend Server:
```bash
cd backend
npm install
npm run dev
```
The backend will run on `http://localhost:5000`

#### Start Preplyx (Main Application):
```bash
cd preplyx
npm install
npm run dev
```
Preplyx will run on `http://localhost:3000`

#### Start Admin Panel:
```bash
cd admin-panel
npm install
npm run dev
```
Admin panel will run on `http://localhost:5173`

### 3. Testing the Integration

1. **Register/Login Flow**:
   - Go to `http://localhost:3000` (Preplyx)
   - Register a new account or login
   - You'll be logged into the Preplyx dashboard

2. **Cross-Application Navigation**:
   - In the Preplyx dashboard sidebar, click "Admin Panel" at the bottom
   - This will open the admin panel in a new tab
   - You should be automatically logged in (shared authentication)

3. **Admin Panel Navigation**:
   - In the Admin panel sidebar, click "Go to Preplyx" at the bottom
   - This will open Preplyx in a new tab
   - Your authentication should persist

4. **Logout Testing**:
   - Logout from either application
   - The shared token will be cleared
   - You'll need to login again to access either application

## Technical Details

### Authentication Flow
```
User Login → Backend Validation → Token Generation → Local Storage (preplyx_token)
                                                                   ↓
                                                    Shared between both applications
```

### File Changes Summary

#### Preplyx Files Modified:
- `src/app/dashboard/layout.tsx`: Added admin panel link, updated logo display
- `src/app/login/page.tsx`: Updated logo display
- `src/app/register/page.tsx`: Updated logo display

#### Admin Panel Files Modified:
- `src/pages/Login.tsx`: Updated authentication to use shared token, updated logo display
- `src/components/Layout.tsx`: Added Preplyx link, updated logout to clear shared token
- `src/pages/Login.css`: Added logo image styling

### Port Configuration
- **Backend**: `http://localhost:5000`
- **Preplyx**: `http://localhost:3000`
- **Admin Panel**: `http://localhost:5173`

## Troubleshooting

### Logo Not Displaying
- Ensure the logo file exists in both locations:
  - `preplyx/public/logo.png`
  - `admin-panel/src/assets/logo.png`
- Check file permissions and ensure the files are readable
- Clear browser cache if old logo is still showing

### Authentication Issues
- Ensure backend server is running on port 5000
- Check that both applications are using the same backend URL
- Clear localStorage and try logging in again
- Check browser console for authentication errors

### Navigation Issues
- Verify both applications are running on their respective ports
- Check that the URLs in the navigation links are correct
- Ensure pop-up blockers are not preventing new tabs from opening

## Future Enhancements
Consider implementing:
- Single Sign-On (SSO) with more robust token management
- Shared user preferences and settings
- Unified notification system across both applications
- API proxy to handle CORS issues more elegantly
