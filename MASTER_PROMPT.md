# Master Prompt — Full-Stack School Project Generator

Copy and paste this entire prompt into our conversation. Fill in the sections marked with `[___]`.

---

```
Build a complete full-stack web application matching the following specification exactly.

## SCENARIO
[Describe your school project scenario — e.g., "A library book lending system", "A student grade management system", etc.]

## ENTITIES (models)
List all entities. Example format:
- EntityName: fieldName(fieldType), fieldName(fieldType), ... [relationship notes]
- EntityName: fieldName(fieldType), fieldName(fieldType), ... [relationship notes]
(Any number of entities — each gets its own CRUD page.)

## BUSINESS LOGIC & RULES
[Describe any calculations, validations, status transitions, unique constraints, or special behavior]

---
Generate the full project with the EXACT architecture, design system, component API, file structure, and patterns described below.
---

## TECHNOLOGY STACK
- Backend: Node.js + Express.js + MongoDB (Mongoose ODM)
- Frontend: React 19 + Vite + Tailwind CSS 3
- Auth: JWT (stored in localStorage + cookie) + bcryptjs
- Forms: react-hook-form + zod + @hookform/resolvers/zod
- Icons: lucide-react
- Charts: recharts (PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend)
- Notifications: react-toastify (v11)
- HTTP client: axios (with request/response interceptors)
- Validation (backend): express-validator
- Routing: react-router-dom v7
- Password hashing: bcryptjs

## PROJECT STRUCTURE
```
project/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── seed.js
│   ├── .env
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   └── [one file per entity].js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── [one file per entity].js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── [one file per entity].js
│   ├── validations/
│   │   ├── authValidation.js
│   │   └── [one file per entity].js
│   └── middleware/
│       ├── auth.js
│       ├── errorHandler.js
│       └── validate.js
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── index.css (Tailwind directives)
│   │   ├── App.jsx
│   │   ├── api/
│   │   │   ├── axios.js
│   │   │   └── endpoints.js
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── UIContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useUI.js
│   │   ├── components/
│   │   │   ├── PageHeader.jsx
│   │   │   ├── StatsCard.jsx
│   │   │   ├── DataTable.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── ConfirmModal.jsx
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx
│   │   └── pages/
│   │       ├── Landing.jsx
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Reports.jsx
│   │       └── [one page per entity].jsx
│   └── public/
```

## BACKEND SPECIFICATION

### server.js
- Import: express, dotenv, cors, helmet, morgan, cookie-parser, connectDB, errorHandler
- dotenv.config() then connectDB() then create app
- Middleware order: helmet({ contentSecurityPolicy: false }), cors({ origin: 'http://localhost:5173', credentials: true }), morgan('dev'), express.json(), express.urlencoded({ extended: true }), cookieParser()
- Routes: /api/auth, /api/[entity-plural] for each entity
- GET /api/health returns { success: true, message: '...' }
- Error handler at end
- PORT from env or 5000

### config/db.js
- Async function, mongoose.connect(process.env.MONGO_URI), log host, catch error + process.exit(1)

### .env
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/[DBName]
JWT_SECRET=[project]_jwt_secret_key
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
NODE_ENV=development
```

### models/User.js
- Fields: username (String, required, unique, trim, minlength:3, maxlength:50), email (String, required, unique, trim, lowercase), password (String, required, minlength:6, select:false), name (String, required, trim, minlength:3, match: alphabetic), phone (String, required, match: Rwandan phone pattern), role (String, enum: ['admin','user'], default: 'user')
- Pre-save hook: hash password with bcryptjs genSalt(10) if modified
- Method: comparePassword(candidatePassword) using bcrypt.compare
- timestamps: true

### models/[Entity].js
- Mongoose schema with appropriate fields (String, Number, Date, ObjectId refs, enums, etc.)
- Required validations with error messages
- Indexes on frequently queried fields
- timestamps: true

### middleware/auth.js
- protect: extract token from cookies.token or Authorization Bearer header. If none → 401. Verify with jwt.verify using JWT_SECRET. Find user by decoded.id. If not found → 401. Set req.user. Catch → 401.
- authorize: unused (remove import from routes — every authenticated user has full access)

### middleware/errorHandler.js
- Handle: ValidationError (400, join messages), duplicate key 11000 (400), CastError (400, "Resource not found")
- Default: status from res.statusCode or 500
- Return { success: false, message }

### middleware/validate.js
- Use validationResult from express-validator. If errors → 400 with joined messages. Else next().

### controllers/authController.js
- sendTokenResponse(user, statusCode, res): sign jwt with { id: user._id, role: user.role }, expiresIn from env. Set httpOnly cookie. Return { success, message: 'Success', data: { _id, username, email, name, phone, role, token } }
- register: check existing user by email/username → 400 if exists. User.create. sendTokenResponse(201)
- login: findOne({ email }).select('+password'). If no user or !comparePassword → 401. sendTokenResponse(200)
- logout: set cookie 'token'='none' with 5s expiry. Return { success, message: 'Logged out' }
- getMe: findById(req.user._id). Return { success, data: user }
- forgotPassword: findOne({ email }). If not found → 404. Return { success, data: { email, name } }

### controllers/[Entity]Controller.js
Every controller follows this exact CRUD pattern:
```
const getItems = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await Item.countDocuments();
    const items = await Item.find()
      .populate([any refs])
      .skip(skip).limit(limit).sort({ createdAt: -1 });
    res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

const getItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate([refs]);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (error) { next(error); }
};

const createItem = async (req, res, next) => {
  try {
    const item = await Item.create(req.body);
    const populated = await item.populate([refs]);
    res.status(201).json({ success: true, message: 'Created', data: populated });
  } catch (error) { next(error); }
};

const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate([refs]);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Updated', data: item });
  } catch (error) { next(error); }
};

const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
};
```

### routes/authRoutes.js
- POST /register with registerValidation + validate
- POST /login with loginValidation + validate
- POST /logout
- POST /forgot-password with forgotPasswordValidation + validate
- GET /me with protect

### routes/[Entity]Routes.js
- router.use(protect)
- GET / getItems
- POST / with validation + validate, createItem
- GET /:id getItem
- PUT /:id with validation + validate, updateItem
- DELETE /:id deleteItem

### validations/authValidation.js
- registerValidation: username (trim, 3-50 chars), email (isEmail + normalizeEmail), password (min 6), name (trim, min 3, alphabetic regex), phone (Rwandan pattern)
- loginValidation: email (isEmail), password (notEmpty)
- forgotPasswordValidation: email (isEmail)

### validations/[Entity]Validation.js
- Array of body() checks with appropriate types: notEmpty, isEmail, isMongoId, isFloat({min:0}), isInt({min:1}), isISO8601, isIn([enum values]), matches(regex), trim, etc.

### seed.js
- Connect to MongoDB
- Drop all collections (listCollections + dropCollection for each)
- Log "System initialized from zero"
- process.exit(0)

### package.json (backend)
```json
{
  "scripts": { "start": "node server.js", "dev": "nodemon server.js", "seed": "node seed.js" },
  "dependencies": {
    "bcryptjs": "^3.0.3", "cookie-parser": "^1.4.7", "cors": "^2.8.6",
    "dotenv": "^17.4.2", "express": "^5.2.1", "express-validator": "^7.3.2",
    "helmet": "^8.2.0", "jsonwebtoken": "^9.0.3", "mongoose": "^9.6.2",
    "morgan": "^1.10.1", "nodemon": "^3.1.11"
  }
}
```

## FRONTEND SPECIFICATION

### Design System (must match exactly)
- Primary color: blue-600 (#2563eb)
- Card style: bg-white/70 backdrop-blur-xl rounded-xl border border-blue-100 shadow-lg shadow-blue-100/30
- Hover: shadow-xl hover:shadow-blue-100/40
- Buttons: primary = bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200
- Inputs: rounded-xl border border-gray-200 bg-white/80 focus:ring-2 focus:ring-blue-200 focus:border-blue-400
- Error inputs: border-red-300 focus:ring-red-200
- Page background: bg-gray-50
- Animations: animate-fade-in, transition-all duration-200/300
- Font: Tailwind default system sans-serif
- Sidebar: fixed left, bg-white/70 backdrop-blur-xl, border-r border-blue-100, w-60 (collapsed: w-16), z-30
- Main area: flex-1 flex flex-col, ml-60 (collapsed: ml-16)
- Header: sticky top-0, bg-white/70 backdrop-blur-xl, border-b border-blue-100, z-20
- Footer: bg-white/70 backdrop-blur-xl, border-t border-blue-100, text-xs text-gray-500

### vite.config.js
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } } },
})
```

### tailwind.config.js
```js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

### src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### src/main.jsx
- StrictMode + App

### src/api/axios.js
- Create axios instance: baseURL 'http://localhost:5000/api', withCredentials: true, headers: { 'Content-Type': 'application/json' }
- Request interceptor: read token from localStorage, set Authorization Bearer header
- Response interceptor: on error, if not auth-me/logout url or status !== 401, toast.error(message, { autoClose: 1000 }). Reject promise.

### src/api/endpoints.js
For each entity, create an API object:
```
export const [entity]API = {
  getAll: (params) => API.get('/[entity-plural]', { params }),
  getById: (id) => API.get(`/[entity-plural]/${id}`),
  create: (data) => API.post('/[entity-plural]', data),
  update: (id, data) => API.put(`/[entity-plural]/${id}`, data),
  delete: (id) => API.delete(`/[entity-plural]/${id}`),
};
```
Also authAPI and reportAPI (getDashboard, getDailyIncome, getAll).

### src/context/AuthContext.jsx
- AuthContext = createContext(null)
- AuthProvider: user state, loading state, loadUser (get token from localStorage, call getMe, set user or clear token), login (call API, save token, set user), register (same), logout (call API, remove token, set null, toast), forgotPassword (call API)
- Provide: { user, loading, login, register, logout, forgotPassword }

### src/context/UIContext.jsx
- UIContext = createContext(null)
- UIProvider: sidebarOpen state, modal state ({ open, type, data }), confirmModal state ({ open, message, onConfirm })
- openModal(type, data), closeModal(), openConfirm(message, onConfirm), closeConfirm()
- Provide: { sidebarOpen, setSidebarOpen, modal, openModal, closeModal, confirmModal, openConfirm, closeConfirm }

### src/hooks/useAuth.js
- useContext(AuthContext), throw if not within provider

### src/hooks/useUI.js
- useContext(UIContext), throw if not within provider

### src/components/PageHeader.jsx
- Props: { title, subtitle, action }
- Layout: flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4
- Title: text-xl font-bold text-gray-800
- Subtitle: text-sm text-gray-400 mt-0.5

### src/components/StatsCard.jsx
- Props: { icon: Icon, label, value, color }
- Color map: blue/green/yellow/red/purple → bg-*-50 text-*-500 border-*-100
- Layout: bg-white/70 backdrop-blur-xl rounded-xl border border-blue-100 p-5 shadow-lg shadow-blue-100/30 hover:shadow-xl transition-all
- Inner: flex items-center justify-between. Left: label (text-xs uppercase tracking-wider text-gray-400) + value (text-2xl font-bold text-gray-800 mt-1). Right: icon in p-3 rounded-xl border with color classes.

### src/components/DataTable.jsx
- Props: { columns, data, pagination, onPageChange, loading, actions }
- Loading state: 5 skeleton rows (h-12 bg-gray-100 rounded-lg animate-pulse)
- Empty state: single row with colSpan={columns.length + 1}, "No data found"
- Normal: table with thead (border-b border-blue-100, text-left px-4 py-3 font-semibold text-blue-600) + tbody rows (border-b border-gray-50 hover:bg-blue-50/50)
- Each cell: col.render ? col.render(row) : row[col.key], text-gray-600, whitespace-nowrap
- Actions cell: {actions?.(row)}, text-right whitespace-nowrap
- Pagination: if pagination.pages > 1, show page info + prev/next buttons + numbered page buttons (active: bg-blue-500 text-white shadow-md shadow-blue-200, inactive: text-gray-500 hover:bg-blue-50 hover:text-blue-500)

### src/components/Modal.jsx
- Props: { open, onClose, title, children, size = 'max-w-lg' }
- If !open → null
- Fixed inset-0 z-50, black/30 backdrop-blur-sm overlay (click to close)
- Card: relative w-full ${size} bg-white/80 backdrop-blur-xl rounded-xl border border-blue-100 shadow-2xl shadow-blue-200/50 p-6 animate-fade-in
- Header: flex items-center justify-between mb-4, title (text-lg font-semibold text-blue-600), close button (X icon)

### src/components/ConfirmModal.jsx
- Uses useUI to get confirmModal + closeConfirm
- If !confirmModal.open → null
- Fixed inset-0 z-[60], black/30 overlay
- Card: max-w-sm, border-red-100, shadow-red-200/50
- Content: AlertTriangle icon in red circle, "Confirm Action" title, message text, Cancel + Confirm (red) buttons

### src/layouts/DashboardLayout.jsx
- Full page: min-h-screen bg-gray-50 flex
- Sidebar (fixed left): w-60 / w-16 collapsed. Header with "TransitPro" logo + collapse button. Nav from navItems array ({ path, label, icon }). Active link: bg-blue-500 text-white shadow-md shadow-blue-200. Logout button at bottom.
- Main area: flex-1 flex flex-col, ml-60 / ml-16. Header (sticky, welcome + user name + role badge). Main (flex-1 p-6, <Outlet />). Footer (credits: name, email, phone, "Powered by Brave").

### App.jsx
- BrowserRouter, AuthProvider, UIProvider, ToastContainer (top-right, autoClose 1000, no progress bar, newestOnTop)
- Routes:
  - / → PublicRoute > Landing
  - /auth/login → PublicRoute > Login
  - /auth/register → PublicRoute > Register
  - / → ProtectedRoute > DashboardLayout (layout route with Outlet)
    - dashboard → Dashboard
    - [entity-plural] → EntityPage (one per entity)
    - reports → Reports
  - * → Navigate to /
- ProtectedRoute: if loading → spinner, if user → children, else → Navigate to /auth/login
- PublicRoute: if loading → spinner, if user → Navigate to /dashboard, else → children

### src/pages/Landing.jsx
- Full landing page with sticky header (logo + Sign In + Get Started links to /auth/login and /auth/register)
- Hero section: badge + title with colored span + description + CTA buttons
- Stats highlight section (gradient card)
- Features grid (6 cards: icon + title + description)
- Footer with links + name/email/phone + "Powered by Brave"

### src/pages/Login.jsx
- Full page: min-h-screen bg-gray-50 flex
- Left side (flex-1): centered max-w-md form
  - Logo icon (blue-600 rounded-xl), "Welcome back" heading, description
  - Form: email (Mail icon) + password (Lock icon + toggle show/hide) + forgot password link
  - Submit button: "Sign In"
  - Bottom: "Don't have an account? Create account" link to /auth/register
  - Forgot password mode: back button + email form
- Right side (hidden lg:flex flex-1): bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 with decorative blur circles
  - Centered: TransitPro logo (white/15 glass), "TransitPro" title, description text, 3 feature grid items (white/10 glass cards with icons + label + desc)
- Field component: renders input with icon, error state, and error message

### src/pages/Register.jsx
- Same split layout as Login but reversed: branding on left, form on right
- Form: username + name (2-col grid), email, phone, password with toggle
- Submit: "Create Account"
- Bottom: "Already have an account? Sign in" link to /auth/login

### src/pages/Dashboard.jsx
- Title + subtitle
- Stats cards grid (7 cards): use StatsCard component with appropriate icons and colors
- 2-col grid below: Pie chart card (blue gradient) + Quick Summary card
- Pie chart: ResponsiveContainer with PieChart. Pie with innerRadius=60, outerRadius=100, paddingAngle=3. Cell fills from blue shade array: ['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8']. Tooltip + Legend.
- Loading: skeleton placeholders
- Fetch from reportAPI.getDashboard()

### src/pages/Reports.jsx
- Title + subtitle + CSV + "Download PDF" buttons
- 3 summary cards: Total Revenue (blue gradient card), Transactions, Average per Day
- Daily Transactions table: Date, Revenue, Transaction count (circle badge), Avg Amount, % of Total (with progress bar)
- Table footer with totals row
- Empty state: icon + "No transaction data yet"
- All Parking Records table below with search filter
- CSV export: generates CSV with daily data + summary section
- PDF export: generates styled HTML document with header, summary cards, full table, footer — downloaded as .html file (open in browser and print as PDF)
- Fetch from reportAPI.getDailyIncome() + reportAPI.getAll()

### src/pages/[Entity]Page.jsx (every entity page follows this EXACT pattern)
```jsx
import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { useUI } from '../hooks/useUI';
import { [entity]API } from '../api/endpoints';
// import other API modules if needed for select dropdowns

const schema = z.object({
  // zod validation for each form field matching the model
});

export default function [EntityPlural]() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { modal, openModal, closeModal, openConfirm } = useUI();

  const form = useForm({ resolver: zodResolver(schema) });
  const editId = modal.data?._id;
  const isEdit = !!editId;

  const fetchData = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data: res } = await [entity]API.getAll({ page: p, limit: 10 });
      setData(res.data);
      setPagination(res.pagination);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(page); }, [page, fetchData]);

  const handleSubmit = async (formData) => {
    try {
      if (isEdit) {
        await [entity]API.update(editId, formData);
        toast.success('[Entity] updated', { autoClose: 1000 });
      } else {
        await [entity]API.create(formData);
        toast.success('[Entity] created', { autoClose: 1000 });
      }
      closeModal();
      fetchData(page);
    } catch {}
  };

  const handleDelete = (id) => {
    openConfirm('Are you sure?', async () => {
      try {
        await [entity]API.delete(id);
        toast.success('[Entity] deleted', { autoClose: 1000 });
        fetchData(page);
      } catch {}
    });
  };

  const openEdit = (row) => {
    form.reset({ /* map row fields to form fields */ });
    openModal('edit', row);
  };

  const openCreate = () => {
    form.reset({ /* default values */ });
    openModal('create');
  };

  // Badge render helper for status fields (optional)
  const statusBadge = (value) => {
    // map values to color classes
  };

  const columns = [
    { key: 'fieldName', label: 'Label' },
    { key: 'fieldName', label: 'Label', render: (r) => /* custom render */ },
  ];

  return (
    <div>
      <PageHeader title="[Entity]s" subtitle="Manage [entity description]"
        action={
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md shadow-blue-200 transition-all">
            <Plus size={16} /> Add [Entity]
          </button>
        }
      />
      <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-blue-100 p-5 shadow-lg shadow-blue-100/30">
        <DataTable columns={columns} data={data} pagination={pagination} onPageChange={setPage} loading={loading}
          actions={(row) => (
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 size={15} /></button>
              <button onClick={() => handleDelete(row._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>
            </div>
          )}
        />
      </div>

      <Modal open={modal.open && ['create', 'edit'].includes(modal.type)} onClose={closeModal} title={isEdit ? 'Edit [Entity]' : 'Add [Entity]'}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Form fields matching the schema */}
          {/* Each field: label + input/select with register + error message */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal} className="flex-1 py-2.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md shadow-blue-200">{isEdit ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmModal />
    </div>
  );
}
```

### package.json (frontend)
```json
{
  "dependencies": {
    "@hookform/resolvers": "^5.4.0", "axios": "^1.13.5",
    "lucide-react": "^1.16.0", "react": "^19.2.0",
    "react-dom": "^19.2.0", "react-hook-form": "^7.76.1",
    "react-router-dom": "^7.13.0", "react-toastify": "^11.1.0",
    "recharts": "^3.8.1", "zod": "^4.4.3"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1", "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3", "@vitejs/plugin-react": "^5.1.1",
    "autoprefixer": "^10.4.24", "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1", "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0", "postcss": "^8.5.6",
    "tailwindcss": "^3.4.19", "vite": "^7.3.1"
  }
}
```

## KEY RULES
1. No seed data — system starts empty. seed.js drops all collections and exits.
2. No admin roles — every authenticated user has full CRUD on all entities.
3. All pages use the identical component API and layout structure described above.
4. All forms use react-hook-form + zod + zodResolver + the same input styling.
5. All tables use the DataTable component with pagination, loading skeletons, and action buttons.
6. The Dashboard pie chart always uses blue gradient shades (never mixed colors).
7. The Reports page always has summary cards + daily table + CSV export + HTML PDF download.
8. Every API endpoint returns { success, data, pagination } or { success, message }.
9. Every controller wraps in try/catch with next(error).
10. Every frontend API call wraps in try/catch with empty catch (errors handled by axios interceptor toast).

Generate ALL files now with the entity names and fields I provided above.
```
