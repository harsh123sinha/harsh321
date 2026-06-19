# Start on a new machine (clone → run)

This guide is for **Harsh To Let Services** (`harsh321`): a **React (Vite) frontend** + **Node (Express) backend** + **MySQL** app.

---

## 1. Prerequisites

| Tool | Notes |
|------|--------|
| **Git** | To clone the repository |
| **Node.js** | v18+ recommended (match what you use today; v14+ may work) |
| **npm** | Comes with Node |
| **MySQL** | Server running locally or reachable on the network |
| **Database** | A MySQL database (default name in config: `realestate`) with the expected tables — see `Backend/README.md` for schema notes |

---

## 2. Clone the repository

```bash
git clone <YOUR_REPO_URL>
cd harsh321
```

Use your real GitHub (or other) URL. The project root contains **`Backend/`** and **`frontend/`** side by side.

---

## 3. Backend setup

```bash
cd Backend
npm install
```

### Environment file

1. Copy the example env (do **not** commit real `.env`):

   ```bash
   # Windows (cmd)
   copy .env.example .env

   # Windows (PowerShell) or macOS/Linux
   cp .env.example .env
   ```

2. Edit **`Backend/.env`** and set at minimum:

   - **`DB_HOST`**, **`DB_USER`**, **`DB_PASSWORD`**, **`DB_NAME`** — must match your MySQL instance and database name.
   - **`JWT_SECRET`** — long random string; used to sign JWTs.
   - **`FRONTEND_URL`** — Vite dev server origin, e.g. `http://localhost:5173` (comma-separated if multiple).
   - **`SMTP_*`** — only if you need **forgot-password email OTP**. Use a Gmail **App password** (16 characters) for the same account as **`SMTP_USER`**. See comments inside `.env.example`.
   - **`DEV_OTP_TO_CONSOLE=true`** — optional **development only** if SMTP is blocked or misconfigured; OTP is printed in the terminal instead of email. **Never** in production.

3. **`ADMIN_EMAIL` / `ADMIN_PASSWORD`** — only if you use admin routes; hash generation is described in `Backend/README.md`.

### Run the API

```bash
npm run dev
```

Default URL: **`http://127.0.0.1:5000`** (or `PORT` from `.env`).

Quick check:

```bash
curl http://127.0.0.1:5000/health
```

You should see JSON like `{ "status": "ok", ... }`.

Static uploads are served at **`/images`** from **`Backend/uploads/`**.

---

## 4. Frontend setup

Open a **second** terminal:

```bash
cd frontend
npm install
```

### Environment file

1. Copy example to real env:

   ```bash
   copy .env.example .env
   # or: cp .env.example .env
   ```

2. Edit **`frontend/.env`**:

   - **`VITE_API_BASE_URL`** — must point at your running API, e.g. `http://127.0.0.1:5000/api` (keep the `/api` suffix).
   - On Windows, **`127.0.0.1` vs `localhost`** can matter for cookies/CORS consistency; align with `FRONTEND_URL` / how you open the site in the browser.
   - Optional **`VITE_*`** WhatsApp / contact numbers — see comments in `.env.example`.

### Run the UI

```bash
npm run dev
```

Vite defaults to **`http://localhost:5173`**. It **proxies** `/images` to the backend so listing images work in dev without CORS issues.

---

## 5. Typical order to start

1. Start **MySQL**.
2. Start **Backend** (`Backend/` → `npm run dev`).
3. Start **Frontend** (`frontend/` → `npm run dev`).
4. Open the URL Vite prints (usually port **5173**).

---

## 6. Production build (frontend only here)

```bash
cd frontend
npm run build
npm run preview   # optional local preview of build
```

Deploy the `dist/` output behind a web server; set **`VITE_API_BASE_URL`** at **build time** to your public API URL.

---

## 7. Common problems

| Symptom | What to check |
|---------|----------------|
| CORS errors | `FRONTEND_URL` in `Backend/.env` includes the exact origin you use in the browser (scheme + host + port). |
| API 404 | `VITE_API_BASE_URL` ends with `/api` and matches where Express mounts routes (`/api/...`). |
| Images 404 in dev | Backend running; files under `Backend/uploads/`; Vite proxy in `vite.config.js` points at same host as API. |
| Forgot password email fails | SMTP credentials; Gmail app password must be **16** chars for that Gmail account; corporate networks may block SMTP — use `DEV_OTP_TO_CONSOLE=true` locally only. |
| Database errors | DB name, user, password, host; tables exist (`Backend/README.md`). |

---

## 8. Further reading

- **`UNDERSTANDING.md`** — how the app fits together (human-oriented).
- **`CHAT_UNDERSTANDING.md`** — deep system map for an AI assistant.
- **`Backend/README.md`** — API-focused backend notes and schema snippets.
