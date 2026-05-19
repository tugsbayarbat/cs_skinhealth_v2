# SkinHealth Next.js Application

This repository contains the Next.js frontend and API orchestration layer for the **SkinHealth Dermatology Chatbot** project. It serves as the primary user interface for patients to register, log in via OTP, and interact with the multimodal machine learning backend.

## Project Scope

**Important:** This repository is strictly scoped to the **Frontend** of the SkinHealth application. It handles the web UI, client-side routing, user authentication flows, and API orchestration.

It does **not** contain the core machine learning models, datasets, or the primary inference logic. The backend dependency for this project is managed in a separate repository (the FastAPI/LangGraph backend).

## Architecture & Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Authentication:** NextAuth (Auth.js) with a custom OTP (One-Time Password) email flow.
- **Database:** PostgreSQL hosted on [Neon](https://neon.tech), accessed natively via `@neondatabase/serverless`.
- **Backend Integration:** Communicates with a local LangGraph/FastAPI multimodal ML model.
- **Email Service:** Nodemailer using SMTP.

## Prerequisites

- Node.js 18+ and `npm`
- A [Neon](https://neon.tech) PostgreSQL database instance
- An SMTP server configuration for sending OTP emails
- The `skincare_model-main` FastAPI backend running locally (for chatbot capabilities)

## Environment Setup

Create a `.env.local` file in the root directory based on the following template. Do not commit this file to version control.

```env
# Email / SMTP Configuration for OTP
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASS=your_smtp_password
SMTP_FROM=your_email@domain.com

# Neon PostgreSQL Database URL
DATABASE_URL=postgresql://user:password@endpoint.neon.tech/dbname?sslmode=require

# NextAuth Secret (Generate with: npx auth secret)
AUTH_SECRET=your_generated_auth_secret

# Shared secret for internal Next.js → FastAPI calls
# This must perfectly match the FASTAPI_INTERNAL_SECRET in your Python backend.
FASTAPI_INTERNAL_SECRET=your_shared_secret
```

## Database Initialization

This project utilizes raw SQL queries with Neon Serverless for performance and simplicity, foregoing a heavy ORM.

Before running the application for the first time, you must initialize the database schema. Open the `schema.sql` file provided in the repository root and execute its contents within your Neon SQL Editor.

This script provisions the required tables, including:
- `users`: Core user profiles.
- `sessions`, `accounts`, `verification_tokens`: Tables required by the NextAuth Neon adapter.
- `otp_codes`, `otp_attempts`: Custom tables designed for handling the secure email login flow and rate-limiting.
- `conversations`, `messages`: Storage for chatbot session histories.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser. The page will auto-update as you edit the application files.

## ML Backend Integration

To utilize the core chatbot features, you must have the multimodal dermatology model running concurrently.

1. Navigate to the `skincare_model-main` directory and start the FastAPI server.
2. Ensure the `FASTAPI_INTERNAL_SECRET` in both the Python environment and Next.js `.env.local` match identically.
3. The Next.js API routes will securely proxy chatbot conversation requests to the FastAPI service using this token as an authorization header.

## Deployment

The recommended platform for deploying this Next.js app is [Vercel](https://vercel.com/new). 

When deploying, ensure you replicate all the environment variables from your `.env.local` into the Vercel project settings. The Neon Serverless architecture is natively optimized to handle Edge and Serverless environments like Vercel.
