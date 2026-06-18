# HarshToLetServices Frontend

Modern, mobile-first React application for Indian real estate listing platform built with Vite, React, and Tailwind CSS.

## Features

- **Mobile-First Design**: Optimized for mobile users with large touch targets, bottom navigation, and responsive layouts
- **Indian Theme**: Navy (#0F172A) and Gold (#D4AF37) color scheme
- **Property Browsing**: Browse, search, and filter properties by type, location, BHK
- **User Authentication**: Signup, login, forgot password with OTP
- **Role-Based Dashboards**: Separate dashboards for Owners, Agents, and Buyers
- **Property Management**: Add, edit, delete properties with multi-image upload
- **Admin Panel**: User management, property management, sub-admin management
- **Touch-Optimized**: Image carousels with swipe support, no hover-only interactions
- **Indian Price Formatting**: Displays prices in Lakhs and Crores

## Tech Stack

- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **TanStack Query** for server state management
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Lucide React** for icons

## Prerequisites

- Node.js (v14 or higher)
- Backend API running on `http://localhost:5000`

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Update `VITE_API_BASE_URL` if your backend runs on a different port

   ```bash
   cp .env.example .env
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable components
│   │   ├── layout/        # Navbar, Footer, Layout
│   │   ├── properties/    # PropertyCard
│   │   ├── search/        # SearchBar
│   │   └── auth/          # ProtectedRoute
│   ├── contexts/          # React contexts
│   │   └── AuthContext.jsx
│   ├── pages/             # Page components
│   │   ├── auth/          # Login, Signup, ForgotPassword
│   │   ├── dashboards/    # Owner, Agent, Buyer dashboards
│   │   ├── properties/    # AddProperty, MyProperties, EditProperty
│   │   ├── admin/         # Admin pages
│   │   └── subadmin/      # Sub-admin pages
│   ├── utils/             # Utility functions
│   │   ├── api.js         # Axios instance
│   │   └── helpers.js     # Helper functions
│   ├── App.jsx            # Main app component with routing
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── tailwind.config.js     # Tailwind configuration
├── vite.config.js         # Vite configuration
└── package.json
```

## Available Routes

### Public Routes
- `/` - Home page
- `/rent` - Rent properties
- `/buy` - Buy properties
- `/plots` - Plot properties
- `/other` - Other properties
- `/property/:id` - Property detail
- `/search` - Search results
- `/terms` - Terms & Conditions
- `/privacy` - Privacy Policy

### Authentication
- `/login` - User login
- `/signup` - User registration
- `/forgot-password` - Password reset

### User Dashboards (Protected)
- `/dashboard/owner` - Owner dashboard
- `/dashboard/agent` - Agent dashboard
- `/dashboard/buyer` - Buyer dashboard

### Property Management (Protected)
- `/add-property` - Add new property (Owner/Agent only)
- `/my-properties` - View user's properties (Owner/Agent only)
- `/edit-property/:id` - Edit property (Owner/Agent only)

### Admin (Protected)
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - Manage users
- `/admin/properties` - Manage properties
- `/admin/subadmins` - Manage sub-admins

### Sub-Admin (Protected)
- `/subadmin/login` - Sub-admin login
- `/subadmin/dashboard` - Sub-admin dashboard

## Key Components

### PropertyCard
Mobile-optimized property card with:
- Responsive image display
- Indian price formatting
- Property type badges
- Touch-friendly buttons
- Owner information

### SearchBar
Advanced search component with:
- Location search
- Property type filter
- BHK filter
- Mobile-responsive filters
- Collapsible on mobile

### Navbar
Responsive navigation with:
- Mobile hamburger menu
- Role-based navigation
- Authentication state
- Touch-optimized menu items

## Mobile Optimization

The app is built mobile-first with:

1. **Touch Targets**: Minimum 44x44px for all interactive elements
2. **Large Typography**: Readable text sizes on small screens
3. **Bottom Navigation**: Easy thumb access on mobile
4. **Image Carousels**: Touch/swipe support for property images
5. **No Hover Dependencies**: All interactions work on touch devices
6. **Responsive Grids**: 1 column on mobile, 2-3 on larger screens
7. **Optimized Forms**: Large inputs, proper input types for mobile keyboards

## Indian Formatting

### Price Formatting
```javascript
formatIndianPrice(5000000)    // ₹50.00 Lakh
formatIndianPrice(15000000)   // ₹1.50 Cr
formatIndianPrice(50000)      // ₹50,000
```

### Mobile Number Validation
```javascript
isValidIndianMobile('9876543210')  // true
isValidIndianMobile('1234567890')  // false (must start with 6-9)
```

## Color Theme

```css
Primary Navy: #0F172A
Accent Gold: #D4AF37
Background White: #FFFFFF
Light Gray: #E5E7EB
Dark Gray: #4B5563
Text Navy: #1E293B
```

## API Integration

All API calls use the `api` utility with:
- Automatic token injection
- Error handling
- 401 redirect to login
- Base URL configuration via environment variables

Example:
```javascript
import api from '../utils/api';

const properties = await api.get('/properties');
const newProperty = await api.post('/properties', formData);
```

## Building for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

## Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

For production, update to your production API URL.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)

## Development Tips

1. **Hot Module Replacement**: Vite provides instant updates during development
2. **React DevTools**: Use browser extension for debugging
3. **TanStack Query DevTools**: Uncomment in App.jsx for query debugging
4. **Tailwind IntelliSense**: Install VS Code extension for class autocomplete

## Common Issues

### Port Already in Use
If port 5173 is busy:
```bash
npm run dev -- --port 3000
```

### API Connection Refused
Ensure backend is running on the correct port and CORS is configured.

### Images Not Loading
Check that:
1. Backend uploads folder exists
2. `VITE_API_BASE_URL` is correct
3. Image filenames in database match actual files

## Contributing

This is a production-ready real estate platform. For enhancements:
1. Admin/Sub-admin pages need full implementation (stubs provided)
2. Add property edit with image management
3. Advanced search filters
4. Property favorites/wishlist
5. Contact form integration
6. Google OAuth integration (backend route exists)

## License

ISC
