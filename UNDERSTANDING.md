# How Harsh To Let Services works (big picture)

This document is for **you** — a single readable map of what the project does and how the pieces talk to each other.

---

## What is this project?

A **property listing web app** for the Indian market (Patna-focused copy and helpers): users can **browse** rent/buy/plot/other listings, open **property detail**, **search**, and (with roles) **list or manage** properties. There is also an **embedded chatbot** on every page that walks users through preferences and runs a **search**, then shows results as a horizontal carousel.

Technically it is:

- **Backend:** Node.js + Express REST API + MySQL  
- **Frontend:** React + Vite + Tailwind + React Query  
- **Auth:** JWT stored client-side; roles for owners, agents, buyers; separate admin/sub-admin areas  

---

## Request flow (normal page)

1. You open the **Vite** site (e.g. `http://localhost:5173`).
2. The browser loads **React**. `App.jsx` chooses a **route** (Home, Rent, Property detail, Login, …).
3. Data-heavy pages use **React Query** to call the API through **`src/utils/api.js`** (Axios). The base URL comes from **`VITE_API_BASE_URL`** in `frontend/.env` (must end with `/api` to match the server).
4. The Express server answers on **`PORT`** (default 5000). Routes live under **`/api/...`**. MySQL returns rows; controllers shape JSON for the UI.
5. **Images:** In development, image URLs often become same-origin **`/images/...`**, and Vite **proxies** `/images` to the backend so the browser does not need direct access to port 5000 for static files. Uploaded files live in **`Backend/uploads/`**.

---

## Auth and “who am I?”

- **Signup / login** hit `/api/auth/...`. On success the client stores a **JWT** (see `AuthContext`).
- Protected pages use a **`ProtectedRoute`** wrapper with `allowedRoles`.
- **Forgot password:** email (if SMTP works) or **dev console OTP** when configured — see `START_NEW.md` and `Backend/utils/email.js`.

---

## Listings and property detail

- Listings are loaded from **`/api/properties/...`** (search, by type, featured, etc.) — exact paths are in `Backend/routes/propertyRoutes.js` and the React pages that call them.
- **`PropertyCard`** + **`PropertyListRow`** give a **horizontal** scroll experience on many pages.
- **`PropertyDetail`** shows full info, similar listings, and **contact** actions. Guests see **masked phone** and a **WhatsApp** button that matches the logged-in label but sends them to **login** first (`MaskedPhoneActionButton`, `WhatsAppInquiryButton`, helpers in `helpers.js`).

---

## Chatbot (high level)

- **`ChatWidget`** sits outside the router tree but inside the app — always available.
- State is mostly in **`chatReducer`**; progress can be **restored from `sessionStorage`** so refresh/navigation does not wipe the conversation (until “New requirement” clears it).
- **Category** → **wizard steps** (`stepConfig.js` + `DynamicFormEngine.jsx`) → on last step **`completeFlow`** builds query params, calls **`GET /properties/search`**, pushes bot messages including a **carousel** of properties (`PropertyCarousel`).
- Clicking a listing **navigates** to `/property/:id` and **closes** the chat panel for a cleaner mobile/desktop UX.

---

## Admin / sub-admin

Separate route groups and APIs (`/api/admin`, `/api/subadmin`) for internal operations. Day-to-day listing browsing does not require these.

---

## Where to change what (quick index)

| Goal | Likely places |
|------|----------------|
| New env var for API | `Backend/.env`, `loadEnv`, then any `process.env` consumer |
| New env var for UI | `frontend/.env` with `VITE_` prefix, use `import.meta.env.VITE_*` |
| Search / filters | Backend property controller + `frontend` SearchBar / `SearchResults.jsx`; chatbot: `buildSearchParams.js` |
| New listing field | DB column → model → API → forms + `PropertyDetail` + cards |
| Email / OTP | `Backend/utils/email.js`, `authController.js` forgot/verify/reset |
| Navbar links | `frontend/src/components/layout/Navbar.jsx` |
| Home marketing / hero | `frontend/src/pages/Home.jsx`, `frontend/src/index.css` |
| Chatbot copy / steps | `chatbot/` folder, `stepConfig.js` |

---

## Docs in this repo

| File | Audience |
|------|----------|
| **`START_NEW.md`** | New machine: clone, install, env, run |
| **`CHAT_UNDERSTANDING.md`** | AI: dense architecture map |
| **`UNDERSTANDING.md`** | You: this narrative overview |
| **`Backend/README.md`** | Backend API + MySQL schema notes |

---

When you open this project months later: start **`START_NEW.md`**, skim **`UNDERSTANDING.md`**, then search the codebase by feature name or route path.
