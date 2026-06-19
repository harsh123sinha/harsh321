# System context for AI assistants (Harsh321 / Harsh To Let Services)

**Purpose:** Give another tool (e.g. ChatGPT) enough grounded context to modify this repo safely. **Do not paste real secrets** from `.env` into chats.

---

## 1. Repository layout

```
harsh321/
├── Backend/                 # Node ESM Express API
│   ├── server.js            # Entry: CORS, JSON, /images static, /api/* routes
│   ├── config/              # DB, loadEnv
│   ├── controllers/         # Route handlers (auth, properties, admin, …)
│   ├── models/              # MySQL queries (userModel, propertyModel, …)
│   ├── routes/              # authRoutes, propertyRoutes, adminRoutes, subAdminRoutes, publicRoutes
│   ├── middleware/          # auth JWT, rateLimiter, …
│   ├── utils/               # email.js (Nodemailer), helpers, ensurePropertySchema
│   ├── uploads/             # Served at GET /images/... (also legacy image paths)
│   ├── .env.example         # Documented env template (safe to commit)
│   └── package.json         # "dev": nodemon server.js, "start": node server.js
├── frontend/                # React 18 + Vite 6 + React Router 7 + TanStack Query
│   ├── src/
│   │   ├── App.jsx          # Routes, ChatWidget global
│   │   ├── main.jsx
│   │   ├── contexts/AuthContext.jsx
│   │   ├── utils/api.js     # Axios instance, VITE_API_BASE_URL, image URL helpers
│   │   ├── utils/helpers.js # Phone mask, WhatsApp hrefs, safe paths, badges
│   │   ├── components/      # layout (Navbar, Footer), search, properties (PropertyCard, PropertyListRow, MaskedPhone…, WhatsApp…)
│   │   ├── pages/           # Home, listings, PropertyDetail, auth, dashboards, admin paths
│   │   └── chatbot/         # In-app assistant: widget, reducer, steps, carousel
│   ├── public/              # Static assets (e.g. chatbot-teaser.svg)
│   ├── vite.config.js       # Dev server + /images → backend proxy
│   └── .env.example
├── START_NEW.md
├── UNDERSTANDING.md
└── CHAT_UNDERSTANDING.md    # (this file)
```

---

## 2. Runtime stack

| Layer | Technology |
|-------|------------|
| API | Express 4, ES modules (`"type": "module"` in Backend/package.json) |
| DB | MySQL via `mysql2/promise` |
| Auth | JWT in `Authorization` header; roles: `owner`, `agent`, `buyer`; separate admin/subadmin flows |
| Passwords | `bcryptjs` |
| Email | `nodemailer`; `Backend/utils/email.js` — `createTransport`, Gmail `service: 'gmail'` when user/host match; strips spaces from app passwords |
| OTP reset | In-memory `Map` in `authController.js` (not durable across restarts); dev console fallback when `DEV_OTP_TO_CONSOLE=true` and send fails |
| UI | React 18, Vite, Tailwind, React Query, react-hot-toast, lucide-react, axios |

---

## 3. HTTP API surface (Express)

All JSON APIs are under **`/api`** (no `/api` prefix on `/health` or `/images`).

| Mount | Module | Typical concerns |
|-------|--------|-------------------|
| `/api/auth` | `authRoutes.js` | login, signup, forgot-password, verify-otp, reset-password, profile |
| `/api/properties` | `propertyRoutes.js` | CRUD, search, type filters, uploads |
| `/api/admin` | `adminRoutes.js` | Admin dashboard operations |
| `/api/subadmin` | `subAdminRoutes.js` | Sub-admin |
| `/api/public` | `publicRoutes.js` | e.g. home payload, no auth |

**CORS:** `FRONTEND_URL` comma list; in non-production, any `http(s)://localhost` or `127.0.0.1` with any port is allowed.

---

## 4. Frontend architecture

- **`App.jsx`:** `BrowserRouter`, `QueryClientProvider`, `AuthProvider`, nested `Routes`. Public routes use `Layout` (Navbar + Outlet + Footer). `ChatWidget` is rendered once at app root (always mounted).
- **`utils/api.js`:** Axios `baseURL` from `import.meta.env.VITE_API_BASE_URL`. Image helpers normalize backend paths to `/images/...` in dev (same-origin via Vite proxy).
- **`PropertyDetail.jsx`:** Uses `MaskedPhoneActionButton`, `WhatsAppInquiryButton`; guest contact gating + login `next` / `from=contact` flow in `Login.jsx` and helpers.
- **Listings:** Many pages use **`PropertyListRow`** for horizontal scrolling cards; `PropertyCard` in `components/properties` is the main site card.
- **Chatbot (`src/chatbot/`):**
  - `ChatWidget.jsx` — open state, `sessionStorage` key `hts-chatbot-session-v1`, `completeFlow` hits `GET /properties/search` with `buildSearchParams`, carousel messages, `hts:open-chat` window event, FAB teaser on `/` only.
  - `chatReducer.js` — phases: welcome, category, form, results.
  - `stepConfig.js` — per-category step keys; `house_flat` / `apartment` **exclude** home sqft step (`HOME_AREA` removed).
  - `DynamicFormEngine.jsx` — step UI by `stepKey`.
  - `PropertyCarousel.jsx` — horizontal scroll + arrows; `PropertyCard.jsx` (chatbot) links to `/property/:id` and calls `onAfterNavigate` to close chat.

---

## 5. Environment variables (conceptual)

**Backend (`Backend/.env`):** `PORT`, `NODE_ENV`, `DB_*`, `JWT_*`, `FRONTEND_URL`, `SMTP_*`, optional `DEV_OTP_TO_CONSOLE`, admin OAuth placeholders.

**Frontend (`frontend/.env`):** `VITE_API_BASE_URL`, optional WhatsApp/contact `VITE_*`. Vite only exposes vars prefixed with `VITE_`.

---

## 6. Conventions for edits

- Prefer **minimal diffs**; match existing import style (ESM in Backend).
- **Never commit** `Backend/.env` or `frontend/.env` with real secrets.
- **Indian locale:** prices/formatting helpers in `helpers.js`; Patna locations may live in `constants/`.
- **Images:** API may return JSON array in `image_url`; parsing in helpers + proxy for dev.

---

## 7. Known operational constraints

- Forgot-password **OTP store** is in-memory — server restart clears pending OTPs.
- **Gmail SMTP** may be blocked (`ETIMEDOUT`) on some networks; **535** usually means wrong user/app-password length (expect **16** chars after stripping spaces) or normal password used by mistake.
- **OneDrive** paths on Windows sometimes affect file locking; running from a non-synced folder can avoid odd dev issues.

---

## 8. How to answer follow-up tasks

When asked to “add a field” or “change search”:

1. Locate **DB column** (if any) in migrations/schema docs in `Backend/README.md` or SQL scripts.
2. Update **model** + **controller** + **validator** if present.
3. Update **frontend** form + API payload + display (`PropertyDetail`, cards, search bar) as needed.
4. For **chatbot** search, update **`buildSearchParams.js`** and possibly **`refineResults`**.

When asked about **email**: read `Backend/utils/email.js` and `authController` forgot/verify/reset handlers only — do not log secrets.

---

*End of AI-oriented system map. Pair with `UNDERSTANDING.md` and `START_NEW.md` for humans.*
