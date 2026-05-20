# Lumen — Modern High-Performance E-Commerce Application

Lumen is a state-of-the-art e-commerce storefront designed with rich aesthetics, smooth user interactions, and robust engineering. Built using **TanStack Start** (SSR/SPA framework) for lightning-fast loads, **Tailwind CSS** for a tailored visual design system, and **Supabase** for secure auth, database management, and row-level security.

---

## ✨ Features

- **🛍️ Storefront & Collections**: Browse featured products, category-specific items, and search collections in real-time.
- **🛒 Shopping Cart & Wishlist**: Persistent cart and wishlist experience with state synchronization.
- **🔒 Secure Authentication**: Email/Password and Google OAuth login via native Supabase Auth.
- **📦 Checkout & Order Management**: Dimmable checkout form, coupon system integration (percentage and fixed-amount discounts), tax/shipping calculations, and real-time order tracking.
- **👤 User Dashboard**: Review and manage order history, update user profiles, and check active settings.
- **🛡️ Admin Panel**: Role-based access control (RBAC) allowing admins to create, read, update, and delete products, categories, coupons, and orders.
- **⚡ Performance & SSR**: Blazing fast rendering powered by TanStack Start and built-in Cloudflare Worker compatibility.

---

## 🛠️ Tech Stack

- **Core Framework**: React 19 & TypeScript
- **Routing & SSR**: [TanStack Start](https://tanstack.com/router/v1/docs/start/overview)
- **Styling & UI**: Tailwind CSS, Radix UI Primitives, Lucide Icons, and Framer Motion for interactive transitions
- **Backend & Database**: [Supabase](https://supabase.com) (PostgreSQL, Auth, Storage, and Row-Level Security)
- **Deployment**: Configured for Cloudflare Workers/Pages (`wrangler.jsonc`)

---

## 🚀 Getting Started

Follow these steps to run the application locally on your machine:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org) (v18+) and `npm` installed.

### 2. Clone the Project
```bash
git clone https://github.com/chxb07/Lumen.git
cd Lumen
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup (Supabase)
1. Go to your [Supabase Dashboard](https://database.new) and create a new project.
2. Open the **SQL Editor** in your Supabase dashboard.
3. Open the file [supabase_schema.sql](./supabase_schema.sql) in this repository, copy its contents, paste them into the SQL Editor, and click **Run**. This will create the database tables, enums, triggers, storage buckets, RLS policies, and seed products.
4. If you plan to support Google login, go to **Authentication -> Providers -> Google** in Supabase and configure your client credentials.

### 5. Configure Environment Variables
Create a `.env` file in the root of your project using the `.env.example` template:
```bash
cp .env.example .env
```
Fill in your Supabase project parameters in the `.env` file:
```env
SUPABASE_PUBLISHABLE_KEY="your_publishable_anon_key"
SUPABASE_URL="https://your_project_id.supabase.co"
VITE_SUPABASE_PROJECT_ID="your_project_id"
VITE_SUPABASE_PUBLISHABLE_KEY="your_publishable_anon_key"
VITE_SUPABASE_URL="https://your_project_id.supabase.co"
```

### 6. Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:8080` to view the application.

---

## 📦 Building for Production

To create an optimized production bundle ready for Cloudflare deployment, run:
```bash
npm run build
```
The compiled client assets and server bundle will be generated under the `dist/` directory.

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
