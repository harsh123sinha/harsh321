# Real Estate Backend API

Node.js + Express + MySQL backend for Indian real estate listing platform.

## Features

- **Authentication**: JWT-based auth with signup, login, forgot password (OTP via email)
- **Property Management**: CRUD operations, search, featured properties, multi-image uploads
- **Role-Based Access**: Owner, Agent, Buyer roles with appropriate permissions
- **Admin Panel**: User management, property management, sub-admin management
- **Sub-Admin Panel**: Limited user and property management capabilities
- **Indian Mobile Validation**: Built-in validation for Indian phone numbers
- **Rate Limiting**: Protection against brute force attacks
- **File Uploads**: Multi-image upload support with validation

## Tech Stack

- Node.js + Express
- MySQL with mysql2 driver
- JWT for authentication
- bcryptjs for password hashing
- Multer for file uploads
- Nodemailer for email (OTP)
- Express-validator for input validation

## Prerequisites

- Node.js (v14 or higher)
- MySQL server running
- Existing `realestate` database (this API reuses your legacy database)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update with your database credentials (must match your existing MySQL setup)
   - Add SMTP credentials for email functionality
   - Generate admin password hash:
     ```bash
     node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-admin-password', 10).then(console.log);"
     ```
   - Add the hash to `ADMIN_PASSWORD` in `.env`

3. **Ensure database exists:**
   - This API expects the existing `realestate` database with tables: `user`, `properties`, `sub_admins`
   - If starting fresh, create these tables (see schema below)

## Database Schema

### Table: `user`
```sql
CREATE TABLE user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('owner', 'agent', 'buyer') NOT NULL,
  phone_number VARCHAR(10) NOT NULL,
  accept_terms BOOLEAN DEFAULT TRUE,
  terms_accepted_at DATETIME
);
```

### Table: `properties`
```sql
CREATE TABLE properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  type ENUM('rent', 'buy', 'other', 'plot', 'plot_lease', 'plot_buy') NOT NULL,
  bhk INT,
  katha VARCHAR(100),
  balconies INT NULL,
  bathrooms INT NULL,
  garden TINYINT(1) NOT NULL DEFAULT 0,
  car_parking TINYINT(1) NOT NULL DEFAULT 0,
  floor_no VARCHAR(32) NULL,
  location VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100) NULL,
  state VARCHAR(100) NULL,
  pincode VARCHAR(10),
  image_url TEXT,
  other_type VARCHAR(255),
  owner_id INT,
  featured BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (owner_id) REFERENCES user(id)
);
```

### Table: `sub_admins`
```sql
CREATE TABLE sub_admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  hashed_password VARCHAR(255) NOT NULL
);
```

## Running the Server

**Apply database changes without phpMyAdmin** (uses `.env` — needs MySQL running and a user with `ALTER` rights):

```bash
npm run db:migrate
```

This extends `properties.type` ENUM if needed, adds amenity columns (`balconies`, `bathrooms`, `garden`, `car_parking`, `floor_no`, `bike_parking`, `shop_sqft_range`, `shop_road_distance`, `shop_token_amount`, `furnishing_status`), and relaxes `district`/`state`. Same checks also run automatically when you start the API.

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start on `http://localhost:5000` (or port specified in `.env`)

## API Endpoints

### Public Routes

#### Auth
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/reset-password` - Reset password with token

#### Public Data
- `GET /api/public/home` - Featured properties + stats
- `GET /api/public/random-properties?limit=12` - Random properties
- `GET /api/public/stats` - Site statistics

#### Properties
- `GET /api/properties` - All properties
- `GET /api/properties/:id` - Property details
- `GET /api/properties/type/:type` - Properties by type (rent/buy/other/plot)
- `GET /api/properties/search?location=&type=&bhk=` - Search properties

### Protected Routes (JWT required)

#### User Profile
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/logout` - Logout

#### Property Management (Owner/Agent only)
- `POST /api/properties` - Add property (multipart/form-data)
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `GET /api/properties/user/my-properties` - Get user's properties

### Admin Routes

#### Admin Auth
- `POST /api/admin/login` - Admin login

#### User Management (Admin only)
- `GET /api/admin/users` - All users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

#### Property Management (Admin only)
- `GET /api/admin/properties?search=&type=&bhk=` - Search properties
- `PUT /api/admin/properties/:id` - Update property
- `DELETE /api/admin/properties/:id` - Delete property
- `POST /api/admin/properties/:id/toggle-featured` - Toggle featured status

#### Sub-Admin Management (Admin only)
- `GET /api/admin/subadmins` - All sub-admins
- `POST /api/admin/subadmins` - Create sub-admin
- `PUT /api/admin/subadmins/:id` - Update sub-admin
- `DELETE /api/admin/subadmins/:id` - Delete sub-admin

### Sub-Admin Routes

- `POST /api/subadmin/login` - Sub-admin login
- `GET /api/subadmin/dashboard` - Dashboard stats
- `GET /api/subadmin/users` - All users
- `PUT /api/subadmin/users/:id` - Update user
- `DELETE /api/subadmin/users/:id` - Delete user
- `GET /api/subadmin/properties` - All properties

## Image Upload Format

When adding/updating properties with images:
```javascript
FormData:
  images: File[] (max 10 images, max 5MB each)
  title: string
  description: string
  price: number
  type: 'rent' | 'buy' | 'other' | 'plot'
  bhk: number (required for rent/buy)
  katha: string (required for plot)
  other_type: string (required for other)
  location: string
  city: string
  district: string
  state: string
  pincode: string (optional)
  featured: 'true' | 'false'
```

Images are stored in `uploads/` folder and returned as JSON array of filenames in database.

## Migration from Legacy App

1. **Stop old server** if using same PORT (default 5000)
2. **Database remains unchanged** - this API reads/writes to existing tables
3. **Update `.env`** with same database credentials as legacy app
4. **Image compatibility**: Legacy images in `public/images/` are served via `/images/` route

## Security Notes

- Never commit `.env` file
- Rotate any exposed secrets from legacy app
- Use strong `JWT_SECRET` (random 64+ character string)
- Use app-specific password for Gmail SMTP (not your main password)
- Rate limiting enabled on auth endpoints (5 requests per 15 minutes)

## License

ISC
