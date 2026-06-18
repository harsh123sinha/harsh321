# Indian Real Estate Platform

A comprehensive, mobile-first real estate listing web application for India, built with modern technologies and designed to work seamlessly with mobile devices.

## 🏗️ Project Overview

This is a complete rebuild of an existing Indian real-estate application with two separate repositories:
- **Backend**: Node.js + Express + MySQL
- **Frontend**: React (Vite) + Tailwind CSS

The application **reuses the existing MySQL database** schema, ensuring compatibility with legacy data while providing a modern, mobile-optimized user experience.

## ✨ Key Features

### User Features
- **Property Browsing**: Browse properties by type (Rent, Buy, Plots, Other)
- **Advanced Search**: Search by location, type, BHK, price range
- **Harsh To Let Assistant**: Floating chat-style widget (bilingual prompts) that collects property requirements and runs `GET /properties/search` with matching results in a swipeable carousel
- **Property Details**: Full property information with image galleries
- **User Authentication**: Secure signup, login, password reset with OTP
- **Role-Based Access**: Owner, Agent, and Buyer roles with specific permissions
- **Property Management**: Add, edit, delete properties with multi-image upload
- **Indian Formatting**: Prices in Lakhs/Crores, Indian mobile validation

### Admin Features
- **User Management**: CRUD operations for all users
- **Property Management**: Full control over all properties, toggle featured status
- **Sub-Admin Management**: Create and manage sub-administrators
- **Dashboard**: Overview statistics and quick actions

### Mobile-First Design
- ✅ Large touch targets (minimum 44x44px)
- ✅ Bottom navigation for easy thumb reach
- ✅ Responsive grids (1 column mobile → 3 columns desktop)
- ✅ Touch-optimized image carousels with swipe support
- ✅ No hover-only interactions
- ✅ Optimized typography for mobile readability
- ✅ Fast loading and smooth animations

## 🎨 Design Theme

**Color Palette**:
- Primary Navy: `#0F172A`
- Accent Gold: `#D4AF37`
- Background White: `#FFFFFF`
- Light Gray: `#E5E7EB`
- Dark Gray: `#4B5563`

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (with mysql2 driver)
- **Authentication**: JWT (jsonwebtoken)
- **Password**: bcryptjs
- **File Upload**: Multer
- **Email**: Nodemailer (OTP functionality)
- **Validation**: express-validator
- **Security**: express-rate-limit, CORS

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## 📁 Project Structure

```
HarshToLetServices/
├── Backend/
│   ├── config/              # Database configuration
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Auth, upload, rate limiting
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── utils/               # Helpers (email, formatting)
│   ├── uploads/             # Uploaded images
│   ├── server.js            # Entry point
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
└── frontend/
    ├── public/              # Static assets
    ├── src/
    │   ├── chatbot/         # Harsh To Let Assistant (guided search widget)
    │   ├── components/      # Reusable components
    │   ├── contexts/        # React contexts
    │   ├── pages/           # Page components
    │   ├── utils/           # API client, helpers
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── .env.example
    ├── tailwind.config.js
    └── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL server
- Existing `realestate` database (or create new with provided schema)

### 1. Database Setup

The application expects these tables in your MySQL database:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS realestate;
USE realestate;

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
);

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
  FOREIGN KEY (owner_id) REFERENCES user(id)
);

-- Sub-admins table
CREATE TABLE sub_admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  hashed_password VARCHAR(255) NOT NULL
);
```

### 2. Backend Setup

```bash
cd Backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Generate admin password hash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-admin-password', 10).then(console.log);"
# Add the hash to ADMIN_PASSWORD in .env

# Start server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Update VITE_API_BASE_URL if needed

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Access the Application

- **Public Website**: http://localhost:5173
- **API**: http://localhost:5000
- **Admin Login**: http://localhost:5173/admin/login
- **Sub-Admin Login**: http://localhost:5173/subadmin/login

## 🔐 Default Credentials

Set these in your Backend `.env` file:

```env
ADMIN_EMAIL=admin@realestate.com
ADMIN_PASSWORD=[bcrypt hash generated above]
```

For testing, create users via the signup page.

## 📱 Mobile Testing

The app is optimized for mobile. Test on:
- Chrome DevTools mobile emulator
- Real mobile devices
- Responsive design mode (320px - 2560px)

Key mobile features:
- Touch-friendly navigation
- Swipeable image galleries
- Large, tappable buttons
- Optimized forms for mobile keyboards
- Bottom-positioned key actions

## 🔄 Migration from Legacy App

If you have a legacy application:

1. **Stop old server** if using same PORT (default 5000)
2. **Database unchanged** - this API reads/writes existing tables
3. **Image compatibility** - legacy images served via `/images/` route
4. **Update `.env`** - use same database credentials

## 📧 Email Configuration

For OTP/forgot password functionality:

1. Use Gmail with App Password (not regular password)
2. Enable 2-factor authentication in your Google account
3. Generate App Password: https://myaccount.google.com/apppasswords
4. Add to Backend `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM=noreply@realestate.com
```

## 🏆 Features Breakdown

### Public Features
✅ Property listings by type (Rent/Buy/Plot/Other)
✅ Featured properties on homepage
✅ Advanced search with filters
✅ Property detail page with image carousel
✅ Indian price formatting (Lakhs/Crores)
✅ Mobile-optimized navigation
✅ Terms & Privacy pages

### Authentication
✅ User signup with role selection
✅ Login with JWT tokens
✅ Forgot password with email OTP
✅ Indian mobile number validation
✅ Session persistence

### User Dashboards
✅ Owner dashboard
✅ Agent dashboard
✅ Buyer dashboard with featured properties

### Property Management
✅ Add property with multiple images
✅ Edit property details
✅ Delete property
✅ View own properties
✅ Type-specific fields (BHK for rent/buy, Katha for plots)

### Admin Panel
✅ Admin login
✅ User management (list, edit, delete)
✅ Property management with search
✅ Toggle featured properties
✅ Sub-admin CRUD
✅ Statistics dashboard

### Sub-Admin Panel
✅ Sub-admin login
✅ Limited user management
✅ Property viewing
✅ Dashboard stats

## 🔒 Security Features

- ✅ JWT authentication
- ✅ Bcrypt password hashing
- ✅ Rate limiting on auth endpoints
- ✅ Input validation
- ✅ CORS configuration
- ✅ Protected routes
- ✅ Role-based access control
- ✅ No secrets in source code

## 📈 Future Enhancements

Potential features to add:
- [ ] Google OAuth integration (routes exist in backend)
- [ ] Property favorites/wishlist
- [ ] Contact form for property inquiries
- [ ] Property comparison
- [ ] Map integration for location
- [ ] Advanced admin analytics
- [ ] Email notifications for new properties
- [ ] Property status (sold, rented, available)
- [ ] User reviews/ratings
- [ ] Real-time chat between users

## 🐛 Troubleshooting

### Backend won't start
- Check MySQL is running
- Verify database credentials in `.env`
- Ensure port 5000 is available

### Frontend can't connect to API
- Verify backend is running on correct port
- Check `VITE_API_BASE_URL` in frontend `.env`
- Check CORS configuration in backend

### Images not loading
- Ensure `uploads/` folder exists in Backend
- Check file permissions
- Verify image filenames match database records

### OTP email not sending
- Verify SMTP credentials
- Use Gmail App Password, not regular password
- Check firewall/antivirus blocking SMTP

## 📝 API Documentation

Full API documentation available in `Backend/README.md`

Key endpoints:
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/properties` - List all properties
- `POST /api/properties` - Add property (authenticated)
- `GET /api/public/home` - Homepage data
- `POST /api/admin/login` - Admin login

## 🤝 Contributing

This is a production-ready application. For improvements:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

ISC License

## 👥 Support

For questions or issues:
- Check README files in Backend and frontend folders
- Review API documentation
- Test with provided examples

---

**Built with ❤️ for Indian Real Estate**
