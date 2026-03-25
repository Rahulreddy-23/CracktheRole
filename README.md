# CrackTheRole

CrackTheRole is an AI-powered interview preparation platform designed specifically for Indian engineers. It offers realistic mock interviews (coding, system design, and behavioral), smart ATS-friendly resume tailoring, and comprehensive analytics to help candidates excel in their tech interviews.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components, Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Framer Motion
- **UI Components**: Shadcn UI
- **Database/Auth**: Firebase & Firestore
- **AI Models**: Claude 3.5 Sonnet (via Anthropic API)
- **Code Execution**: Judge0 CE API
- **Payments**: Razorpay
- **Markdown & PDF**: React Markdown, React-to-Print

## Features

- **AI Mock Interviews**: End-to-end simulated interviews via chat with problem panels, rich hints, and scoring.
- **In-Browser Execution**: Integrated Monaco Editor with multi-language support synced to the Judge0 code execution engine.
- **Smart Resume Builder**: Generate bullet points from scratch using AI or tailor your existing resume to fit a specific job description.
- **Analytics & History**: Track progress across all mock interviews with distinct scoring categories (Communication, Problem Solving, Code Quality, etc).
- **Billing & Pro Plans**: Razorpay powered starter, interview, and unlimited monthly Pro plans.

## Getting Started Locally

### Prerequisites

- Node.js 18+
- Firebase project
- Anthropic API key
- Razorpay account (Test mode)

### 1. Clone & Install
```bash
npm install
```

### 2. Environment Variables
Copy the `.env.example` file to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in the credentials for Firebase, Anthropic, Razorpay, and Judge0. Note that the application works seamlessly with the standard `https://judge0-ce.p.rapidapi.com` endpoint by default.

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

## Deployment to Vercel

### Setup instructions

1. Push your code to a GitHub repository.
2. Sign in to Vercel and create a **New Project**, importing the respective repository.
3. Overwrite or provide the following Environment Variables in the Vercel dashboard:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_JUDGE0_API_URL`
   - `JUDGE0_API_KEY`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK` (Optional, as fallback)
   - `ANTHROPIC_API_KEY`
   - `FIREBASE_ADMIN_PROJECT_ID`
   - `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `FIREBASE_ADMIN_PRIVATE_KEY` (ensure `\n` characters are properly set up)
4. Deploy the application. Vercel automatically detects Next.js configurations.

### Security Notes
- Security headers (e.g. `X-Frame-Options`, `X-Content-Type-Options`) have been explicitly added in `next.config.ts`.
- `ANALYZE=true npm run build` can be used to locally check bundle sizes via `@next/bundle-analyzer`.
- Ensure your `firestore.rules` file is properly deployed via the Firebase CLI using `firebase deploy --only firestore:rules`.

## Project Structure
- `/src/app/` - Next.js App Router folders (pages, layouts, api routes)
- `/src/components/` - Reusable UI widgets and Shadcn elements
- `/src/lib/` - Utilities (Firebase Init, AI config, Razorpay, auth)
- `/src/config/` - Static configurations like Pricing mappings
- `/src/hooks/` - Custom client-side data fetching hooks
