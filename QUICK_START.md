# Quick Start Guide

Get the Real Estate Platform running in 5 minutes!

## Prerequisites
✅ Node.js installed  
✅ MySQL running (XAMPP recommended)  
✅ Database `realestate` created with tables (see SETUP_GUIDE.md)

## Backend (Terminal 1)

```bash
cd Backend
npm install
copy .env.example .env
# Edit .env with your DB credentials and admin password hash
npm run dev
```

Wait for: `✅ Connected to MySQL database: realestate`

## Frontend (Terminal 2)

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Browser opens to: http://localhost:5173

## Test It!

1. **Homepage**: Should show search bar and features
2. **Sign Up**: Create an owner account (phone: 9876543210)
3. **Add Property**: Dashboard → Add Property
4. **Admin**: http://localhost:5173/admin/login

## Plots not showing after “Plot — Lease / Buy”?

If listings appear under **My properties** but not on **Plots**, your MySQL `properties.type` column may still be the old ENUM without `plot_lease` / `plot_buy`. Run the migration once (see `Backend/migrations/001_extend_property_type_enum.sql`). The backend also treats “empty `type` + katha” as a plot for listing so the Plots page works even before you repair rows.

**New fields (balconies, bathrooms, garden, car parking, floor):** run `Backend/migrations/002_property_amenities.sql` in phpMyAdmin after pulling the latest code, or new listings will fail on insert.

## Ports

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Health: http://localhost:5000/health

## Need Help?

See `SETUP_GUIDE.md` for detailed instructions.

## Common Commands

```bash
# Backend
npm run dev          # Start with auto-reload
npm start           # Production mode

# Frontend  
npm run dev         # Development server
npm run build       # Build for production
npm run preview     # Preview production build
```

## File Locations

- Backend config: `Backend/.env`
- Frontend config: `frontend/.env`
- Uploads folder: `Backend/uploads/`
- Database: `realestate` in MySQL

## Default Admin

Set in `Backend/.env`:
```env
ADMIN_EMAIL=admin@realestate.com
ADMIN_PASSWORD=[bcrypt hash]
```

Generate hash:
```bash
cd Backend
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword', 10).then(console.log);"
```

---

**Happy Coding! 🚀**
