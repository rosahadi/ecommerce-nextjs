# 🛍️ Urban Edge - Modern E-Commerce Platform

A full-featured, modern e-commerce platform built with Next.js 15, TypeScript, and Supabase. Features include product management, shopping cart, secure checkout, user authentication, and a comprehensive admin dashboard.

## ✨ Features

### 🏪 **Customer Features**

- **Product Catalog** - Browse products with advanced filtering and search
- **Shopping Cart** - Add/remove items with persistent cart state
- **Secure Checkout** - Multi-step checkout process with address and payment
- **User Authentication** - Sign up/sign in with email and password
- **Order Management** - View order history and track purchases
- **Product Reviews** - Rate and review products (authenticated users only)
- **Theme Toggle** - Switch between light and dark modes

### 👨‍💼 **Admin Features**

- **Dashboard Overview** - Sales analytics with interactive charts
- **Product Management** - Create, update, delete, and manage inventory
- **Order Management** - Process and track customer orders
- **User Management** - Manage customer accounts and permissions
- **File Uploads** - Easy product image management

### 🛠️ **Technical Features**

- **Server-Side Rendering** - Fast page loads and SEO optimization
- **Type Safety** - Full TypeScript implementation with Zod validation
- **Modern UI Components** - ShadCN UI with Tailwind CSS styling
- **Payment Integration** - Stripe and PayPal payment processing
- **Email Notifications** - Automated order confirmations and receipts

## 🚀 Tech Stack

| Category           | Technologies                     |
| ------------------ | -------------------------------- |
| **Frontend**       | Next.js 15, React 19, TypeScript |
| **Styling**        | Tailwind CSS, ShadCN UI          |
| **Database**       | Supabase (PostgreSQL)            |
| **ORM**            | Prisma                           |
| **Authentication** | NextAuth                         |
| **Payments**       | Stripe, PayPal                   |
| **Forms**          | React Hook Form + Zod            |
| **File Storage**   | Uploadthing                      |
| **Email**          | React Email + Resend             |
| **Charts**         | Recharts                         |
| **Deployment**     | Vercel                           |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 18 or higher)
- npm or yarn
- Git

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/rosahadi/ecommerce-nextjs
   cd urban-edge
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   > **Note**: If you encounter dependency conflicts with React 19, use:

   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory and add the following:

   ```env
   # Database (Supabase)
   DATABASE_URL="your-supabase-database-url"
   DIRECT_URL="your-supabase-direct-url"

   # App URLs
   NEXT_PUBLIC_SERVER_URL=http://localhost:3000

   # Authentication (NextAuth)
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_URL_INTERNAL=http://localhost:3000

   # Payments (Stripe)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
   STRIPE_SECRET_KEY="your-stripe-secret-key"
   STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"

   # Email (Resend)
   RESEND_API_KEY="your-resend-api-key"

   # File Uploads (Uploadthing)
   UPLOADTHING_SECRET="your-uploadthing-secret"
   UPLOADTHING_APP_ID="your-uploadthing-app-id"
   UPLOADTHING_TOKEN="your-uploadthing-token"

   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev --name init

   # (Optional) Seed the database with sample data
   npx prisma db seed
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.
