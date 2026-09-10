# IVP Africa Web

IVP Africa is a multi-role talent and jobs platform built with Next.js, TypeScript, and Tailwind CSS. The front end is structured around four core user experiences: public browsing, talent onboarding and job workflows, employer management, and an admin control dashboard.

This project is designed to support the IVP ecosystem across Africa by connecting skilled candidates with employers, while giving administrators tools for verification, user management, reports, content updates, and platform oversight.

---

## Project overview

IVP Africa is a full-stack-style frontend experience for a recruitment and talent platform. The application is organized around role-based access and dashboard flows:

- Public visitors can browse the site, learn about the brand, review services, and explore job opportunities.
- Talent users can manage profiles, search jobs, save roles, and track applications.
- Employers can manage company profiles, hiring workflows, and job postings.
- Admin users can monitor the platform, review jobs and users, verify employers, and inspect audit logs.

The current codebase follows the App Router pattern in Next.js and uses route groups to separate user journeys without changing the actual URL structure.

---

## Tech stack

This project is built on a modern React/Next.js stack:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- App Router architecture
- Lucide React for icons
- Framer Motion for UI animations
- Recharts for analytics/dashboard visuals
- Axios for HTTP requests
- React Hot Toast for toast notifications
- jsPDF for PDF generation
- Socket.IO client for real-time communication support

### Core dependencies

The project uses the following major libraries as seen in the app setup:

- next
- react
- react-dom
- tailwindcss
- lucide-react
- framer-motion
- axios
- recharts
- react-hot-toast
- jspdf
- socket.io-client

---

## Application architecture

### App Router structure

The app is built under the Next.js App Router in `src/app`.

The main route groups in the project are:

- `(public)` — landing page, about, services, jobs, contact, FAQs, employers, privacy, terms
- `(talent)` — candidate dashboard and experiences
- `(employer)` — employer dashboard and operations
- `(admin)` — admin dashboard and administration screens
- `(auth)` — login, signup, password reset, email verification, admin auth flows

The root layout at `src/app/layout.tsx` handles global metadata and font setup, while the public layout wraps the public-facing website experience.

### Global app shell

`src/app/layout.tsx` sets:

- site-wide metadata for title, description, sitemap, and social sharing
- Google font loading with `Manrope` and `Plus Jakarta Sans`
- base HTML structure and body styling

This keeps branding and global styling centralized across the app.

---

## Route and user flow overview

### Public routes

The public-facing side includes pages such as:

- `/`
- `/about`
- `/jobs`
- `/employers`
- `/contact`
- `/faqs`
- `/services`
- `/privacy-policy`
- `/terms`

These pages are organized in `src/app/(public)`.

### Authentication routes

The project has dedicated auth flows for users and admins:

- `/login`
- `/signUp`
- `/forgot-password`
- `/reset-password`
- `/VerifyEmailPage`
- `/adminLogin`
- `/adminLogin/verifyAdmin`

These route groups are under `src/app/(auth)`.

### Admin routes

The admin section is fully organized under `src/app/(admin)/admin`.

Important admin routes include:

- `/admin` — dashboard overview
- `/admin/users` — user management
- `/admin/employer-verification` — pending verification checks
- `/admin/jobs` — job management
- `/admin/subscriptions` — subscription and billing management
- `/admin/reports` — analytics and reports
- `/admin/content` — content updates
- `/admin/notifications` — broadcast notifications
- `/admin/audit-logs` — platform audit trail
- `/admin/settings` — admin settings
- `/admin/profile` — personal admin profile

The admin sidebar and top navigation are implemented in:

- `src/app/(admin)/admin/components/AdminSidebar.tsx`
- `src/app/(admin)/admin/components/AdminNavbar.tsx`

### Admin redirect logic

The app uses redirect logic based on a user role.

The core auth redirect is defined in `src/lib/api/client.ts` and does this:

```ts
const redirectPath = role === "employer"
  ? "/employer"
  : role === "admin"
    ? "/admin"
    : "/talent";
```

This means that after a successful login, admins are sent to the admin dashboard at `/admin`.

---

## Authentication and session handling

The project uses a lightweight session layer that lives under `src/lib/auth`.

### Session utilities

- `src/lib/auth/session.ts` — central session data handling
- `src/lib/auth/useSession.ts` — hook for reading session state in client components
- `src/app/(auth)/requireAuth.tsx` — role-based access protection

The `RequireRole` component checks whether the user is logged in and whether they have the correct role. If not, it redirects them to the correct route. This is essential for protecting role-specific pages and keeping the admin, employer, and talent flows separate.

### Admin login flow

The admin login flow is built in:

- `src/app/(auth)/adminLogin/page.tsx`
- `src/app/(auth)/adminLogin/verifyAdmin/page.tsx`

The process is:

1. Admin enters email on the login page.
2. The app calls `adminAuthApi.requestLogin(...)`.
3. The backend sends a secure login link.
4. The admin completes verification via the token-based flow.
5. The app routes the authenticated admin to the dashboard.

---

## Frontend structure

### Main folders

```bash
src/
  app/
    (admin)/
    (auth)/
    (employer)/
    (public)/
    (talent)/
    globals.css
    layout.tsx

  components/
    common/
    layout/
    sections/

  hooks/
    useForm.ts
    useScrollAnimation.ts
    useWindowSize.ts

  lib/
    api/
    auth/
    types/
    utils/

  pages/
  services/
  utils/
```

### Component organization

- `src/components/common` contains reusable UI building blocks like buttons, logos, section headings, and image fallbacks.
- `src/components/layout` contains layout-level navigation and footer components.
- `src/components/sections` contains landing page sections like hero, about, portfolio, and services.
- `src/lib/api` contains all API integration and backend communication logic.
- `src/lib/types` holds shared TypeScript interfaces for app entities.
- `src/lib/utils` contains helper functions and platform-specific logic.

---

## API layer and backend integration

The project separates API access from UI components.

The main API modules include:

- `src/lib/api/adminAuth.ts`
- `src/lib/api/adminDashboard.ts`
- `src/lib/api/adminJobs.ts`
- `src/lib/api/adminUsers.ts`
- `src/lib/api/adminReports.ts`
- `src/lib/api/auditLogs.ts`
- `src/lib/api/profile.ts`
- `src/lib/api/jobs.ts`
- `src/lib/api/message.ts`
- `src/lib/api/notification.ts`
- `src/lib/api/employerJob.ts`
- `src/lib/api/applications.ts`

The app is structured so that UI screens depend on exported API modules instead of directly calling fetch logic in page components. This keeps data access consistent and easier to replace with a real backend later.

### API client conventions

The project uses a consistent fetch wrapper approach through `src/lib/api/httpClient.ts` and other API modules. Most endpoints are organized around role-based domains and use the same pattern of request/response handling.

This project also includes mock data support for UI development before the backend is fully live.

---

## Styling and design system

The project uses Tailwind CSS for styling and a modern design language built around purple/indigo branding.

Common design patterns include:

- rounded cards and panels
- soft shadows
- gradient highlights
- dark and light informational panels
- role-based color coding for statuses and actions

The color palette and layout are intentionally built around a premium, modern recruitment brand identity for IVP Africa.

---

## State and data flow

The application uses a mix of:

- React state hooks for local component state
- custom hooks for session and browser logic
- module-level API abstractions for data retrieval
- route-based and role-based UI gating

As seen in the dashboard logic, the admin overview page pulls data from `adminDashboardApi.getStats()` and related API modules, then renders cards, pending verifications, and updates in the dashboard UI.

---

## Scripts and local development

Use the following commands from the project root:

```bash
npm install
npm run dev
```

### Available scripts

```bash
npm run dev      # Start the Next.js development server
npm run build    # Create a production build
npm run start    # Run the production server
npm run lint     # Run project lint checks
```

### Recommended workflow

1. Install dependencies
2. Start the local app with `npm run dev`
3. Work inside route groups for each user role
4. Keep API logic in `src/lib/api`
5. Keep reusable UI in `src/components`
6. Use `session` and `RequireRole` to protect private routes

---

## Environment and deployment considerations

The project is ready for environment-based configuration. The README mentions `.env.local`, and the app is structured for backend integration with real endpoints once API contracts are finalized.

At the moment, the codebase already supports a mock-driven frontend flow while the real backend continues to mature.

For deployment, this is a standard Next.js app that can be deployed to platforms such as Vercel, with environment variables configured in the hosting provider.

---

## Code conventions and standards

The project uses a few clear conventions:

- Next.js App Router for screens and route organization
- TypeScript for strongly typed models and API contracts
- Tailwind utility classes for styling
- modular component design for reuse
- route groups to keep UX flows logically separated
- role-based checks to control access to private sections

The codebase also keeps one important pattern: UI components are not deeply coupled to the backend response shape. The API layer acts as a boundary, which makes it easier to replace mock data with real integrations later.

---

## What this project is aiming to solve

IVP Africa is being built as a talent and recruitment operating system for African job markets. The front end is designed to support:

- employer hiring workflows
- talent discovery and engagement
- trust and verification systems
- platform operations for internal teams
- role-based management for the entire hiring ecosystem

This makes the application more than a simple jobs board — it is structured as a complete digital hiring platform with business, operations, and admin needs built in.

---

## Future directions

The project is still evolving, and the direction is clear:

- replace mock API flows with live backend endpoints
- finalize better production content and brand assets
- improve role-based access and security checks
- expand dashboard analytics and reports
- add stronger validation for all job, employer, and talent workflows
- polish the UI with final branded interactions and responsive behavior

---

## Summary

IVP Africa Web is a modern Next.js recruitment platform built for multiple user roles and workflows. It combines a clean public-facing website with a structured admin, talent, and employer dashboard system, all connected through a role-aware architecture and a modular API layer.

The project is intentionally organized for scale, maintainability, and future backend integration — making it a strong foundation for a real production recruitment platform.

---

## Useful links inside the codebase

- Application root: `src/app/layout.tsx`
- Admin dashboard: `src/app/(admin)/admin/page.tsx`
- Admin login: `src/app/(auth)/adminLogin/page.tsx`
- Role guard: `src/app/(auth)/requireAuth.tsx`
- Session hook: `src/lib/auth/useSession.ts`
- Redirect logic: `src/lib/api/client.ts`
- Sidebar navigation: `src/app/(admin)/admin/components/AdminSidebar.tsx`
