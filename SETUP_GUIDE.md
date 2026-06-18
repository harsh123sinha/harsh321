# Complete Setup Guide - Real Estate Platform

This guide will walk you through setting up the complete Indian Real Estate Platform from scratch.

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] Node.js v14+ installed ([Download](https://nodejs.org/))
- [ ] MySQL server installed and running ([XAMPP](https://www.apachefriends.org/) recommended for Windows)
- [ ] Code editor (VS Code recommended)
- [ ] Terminal/Command Prompt access
- [ ] Gmail account (for OTP email functionality)

## 🗄️ Step 1: Database Setup

### Option A: Using XAMPP (Recommended for Windows)

1. **Start MySQL**:
   - Open XAMPP Control Panel
   - Click "Start" next to MySQL
   - Wait for it to turn green

2. **Open phpMyAdmin**:
   - Click "Admin" next to MySQL in XAMPP
   - Or go to: http://localhost/phpmyadmin

3. **Create Database**:
   - Click "New" in the left sidebar
   - Database name: `realestate`
   - Collation: `utf8mb4_general_ci`
   - Click "Create"

4. **Create Tables**:
   - Click on `realestate` database
   - Click "SQL" tab
   - Copy and paste this SQL:

```sql
-- Users table
CREATE TABLE user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('owner', 'agent', 'buyer') NOT NULL,
  phone_number VARCHAR(10) NOT NULL,
  accept_terms BOOLEAN DEFAULT TRUE,
  terms_accepted_at DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Properties table
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
  FOREIGN KEY (owner_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sub-admins table
CREATE TABLE sub_admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  hashed_password VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

5. Click "Go" to execute

### Option B: Using MySQL Command Line

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE realestate;
USE realestate;

# Copy and paste the SQL from above
```

## 🔧 Step 2: Backend Setup

### 2.1 Navigate to Backend Folder

```bash
cd Backend
```

### 2.2 Install Dependencies

```bash
npm install
```

This will install:
- express, mysql2, bcryptjs, jsonwebtoken, dotenv, cors, multer, express-validator, nodemailer, express-rate-limit

### 2.3 Create Environment File

```bash
# Copy example file
copy .env.example .env
```

### 2.4 Configure Environment Variables

Open `.env` in your editor and update:

```env
# Server
PORT=5000
NODE_ENV=development

# Database (XAMPP defaults)
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=realestate

# JWT Secret (generate random string)
JWT_SECRET=your-super-secret-random-string-min-32-chars
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Admin Credentials (see next step)
ADMIN_EMAIL=admin@realestate.com
ADMIN_PASSWORD=[will be generated in next step]

# Email (Gmail - see email setup section)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password-here
SMTP_FROM=noreply@realestate.com
```

### 2.5 Generate Admin Password Hash

Run this command in the Backend folder:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Admin@123', 10).then(hash => console.log('Copy this hash to ADMIN_PASSWORD in .env:\n' + hash));"
```

Copy the output hash and paste it into `ADMIN_PASSWORD` in your `.env` file.

**Note**: Change `Admin@123` to your desired admin password in the command above.

### 2.6 Start Backend Server

```bash
# Development mode with auto-reload
npm run dev

# OR Production mode
npm start
```

You should see:
```
🚀 Real Estate API running on port 5000
📍 Environment: development
🌐 CORS enabled for: http://localhost:5173
✅ Connected to MySQL database: realestate
```

**Keep this terminal window open!**

## 🎨 Step 3: Frontend Setup

### 3.1 Open New Terminal

Keep the backend terminal running and open a **new terminal** window.

### 3.2 Navigate to Frontend Folder

```bash
cd frontend
```

### 3.3 Install Dependencies

```bash
npm install
```

This will install:
- react, react-dom, react-router-dom, @tanstack/react-query, axios, react-hot-toast, lucide-react, tailwindcss

### 3.4 Create Environment File

```bash
# Copy example file
copy .env.example .env
```

### 3.5 Configure Frontend Environment

Open `.env` in your editor:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3.6 Start Frontend Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Your browser should automatically open to http://localhost:5173

## 📧 Step 4: Email Configuration (for OTP functionality)

### 4.1 Generate Gmail App Password

1. Go to your Google Account: https://myaccount.google.com
2. Click "Security" in the left menu
3. Enable "2-Step Verification" if not already enabled
4. Scroll down to "2-Step Verification" → "App passwords"
5. Select app: "Mail"
6. Select device: "Windows Computer" (or your device)
7. Click "Generate"
8. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### 4.2 Update Backend .env

In `Backend/.env`, update:

```env
SMTP_USER=your-actual-email@gmail.com
SMTP_PASSWORD=abcdefghijklmnop  # (remove spaces from app password)
```

### 4.3 Restart Backend Server

Press `Ctrl+C` in the backend terminal, then:

```bash
npm run dev
```

## ✅ Step 5: Verify Installation

### 5.1 Test Backend

Open browser to: http://localhost:5000/health

You should see:
```json
{
  "status": "ok",
  "message": "Real Estate API is running"
}
```

### 5.2 Test Frontend

Your browser should already be at: http://localhost:5173

You should see:
- Navy and gold color scheme
- "Real Estate" navbar
- "Find Your Perfect Property" hero section
- Search bar
- Features section
- Featured properties (will be empty initially)

### 5.3 Test Registration

1. Click "Get Started" or "Sign up"
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Phone: 9876543210 (must start with 6-9)
   - Role: Buyer
   - Password: Test@123
   - Accept terms
3. Click "Sign Up"
4. You should be redirected to Buyer Dashboard

### 5.4 Test Admin Login

1. Go to: http://localhost:5173/admin/login
2. Enter:
   - Email: admin@realestate.com
   - Password: [your admin password from Step 2.5]
3. You should see Admin Dashboard

## 🚀 Step 6: Add Sample Data

### 6.1 Create Owner Account

1. Logout from admin (if logged in)
2. Click "Sign up"
3. Register as an "Owner" with valid details
4. Phone number must start with 6-9 (e.g., 9876543210)

### 6.2 Add Sample Property

1. After login as Owner, go to "Dashboard"
2. Click "Add Property"
3. Fill in all required fields:
   - Title: "Beautiful 3BHK Apartment in Mumbai"
   - Description: "Spacious 3BHK with modern amenities..."
   - Price: 5000000 (₹50 Lakh)
   - Type: Rent
   - BHK: 3
   - Location: "Andheri West"
   - City: "Mumbai"
   - District: "Mumbai Suburban"
   - State: "Maharashtra"
   - Upload 2-3 images
4. Click "Add Property"
5. Go to "My Properties" to see your listing

### 6.3 Mark Property as Featured (Admin Only)

1. Login as Admin
2. Go to Admin Dashboard → "Manage Properties"
3. Find the property you just added
4. Toggle "Featured" status
5. Go back to homepage (logout and visit /) to see featured property

## 🎉 Success Checklist

Your installation is complete if you can:
- [x] Access frontend at http://localhost:5173
- [x] See homepage with search bar
- [x] Register a new user
- [x] Login and see role-based dashboard
- [x] Add a new property (as Owner/Agent)
- [x] View property detail page
- [x] Search for properties
- [x] Login as admin
- [x] Receive OTP email (forgot password)

## 🔧 Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution**: 
- Ensure MySQL is running in XAMPP
- Check DB credentials in Backend `.env`
- Verify database `realestate` exists

### Issue: "Port 5000 already in use"
**Solution**:
- Change PORT in Backend `.env` to 5001
- Update VITE_API_BASE_URL in frontend `.env` to http://localhost:5001/api

### Issue: "Images not uploading"
**Solution**:
- Check `Backend/uploads/` folder exists
- If not, create it manually
- Check file permissions

### Issue: "OTP email not sending"
**Solution**:
- Use Gmail App Password, NOT regular password
- Remove spaces from app password in .env
- Enable 2-factor authentication in Gmail
- Check firewall/antivirus settings

### Issue: "Frontend shows blank page"
**Solution**:
- Check browser console for errors (F12)
- Ensure backend is running
- Clear browser cache
- Check VITE_API_BASE_URL is correct

### Issue: "CORS error"
**Solution**:
- Ensure FRONTEND_URL in backend .env matches frontend port
- Restart backend server after changing .env

## 📱 Testing Mobile View

### Chrome DevTools (Recommended)

1. Open frontend in Chrome: http://localhost:5173
2. Press `F12` to open DevTools
3. Click the "Toggle device toolbar" icon (or press `Ctrl+Shift+M`)
4. Select device: iPhone 12 Pro or Pixel 5
5. Test:
   - Navigation menu (hamburger)
   - Property cards
   - Search bar
   - Image carousel (swipe)
   - Forms
   - Touch targets

### Real Device Testing

1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   ```

2. Update backend .env:
   ```env
   FRONTEND_URL=http://192.168.1.100:5173
   ```

3. Start frontend with host flag:
   ```bash
   npm run dev -- --host
   ```

4. On your mobile device (same WiFi):
   - Open browser
   - Go to: http://192.168.1.100:5173

## 🎓 Next Steps

Now that your app is running:

1. **Explore Features**:
   - Create different role accounts (Owner, Agent, Buyer)
   - Add multiple properties
   - Test search functionality
   - Try forgot password flow

2. **Customize**:
   - Update company name in code
   - Add your logo
   - Modify color theme if needed
   - Add more property types

3. **Enhance**:
   - Implement full admin CRUD pages (stubs provided)
   - Add Google OAuth (backend routes exist)
   - Add property favorites
   - Implement contact forms

4. **Deploy** (Future):
   - Choose hosting (Vercel for frontend, Heroku/Railway for backend)
   - Set up production database
   - Configure production environment variables
   - Update CORS settings

## 📚 Documentation

- **Backend API**: See `Backend/README.md`
- **Frontend**: See `frontend/README.md`
- **Main README**: See root `README.md`

## 💡 Pro Tips

1. **Use Nodemon**: Backend auto-restarts on code changes
2. **Use React DevTools**: Install browser extension for debugging
3. **Check Browser Console**: F12 → Console for frontend errors
4. **Check Terminal**: Backend logs appear in terminal
5. **Use Postman**: Test API endpoints directly
6. **Git**: Initialize repo and commit regularly
7. **Backup Database**: Export from phpMyAdmin regularly

## 🆘 Getting Help

If you encounter issues:
1. Check this guide's "Common Issues" section
2. Review error messages in browser console and terminal
3. Verify all steps were followed correctly
4. Check database tables exist and have correct structure
5. Ensure all environment variables are set

---

**Congratulations! Your Indian Real Estate Platform is now running! 🎉**
