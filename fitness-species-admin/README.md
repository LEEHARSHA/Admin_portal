# Fitness Species Admin Portal

A premium marketplace operations portal for Fitness Species / ALK built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Marketplace-style dashboard for moderation workflows
- Pending review queue with search and filters
- Product approval and rejection flow
- Seller and category management views
- Responsive admin shell with sticky top bar and sidebar
- Mock data layer prepared for production API integration

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Production build

```bash
npm run build
npm run start
```

## Vercel deployment

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Use the default Next.js build settings.
4. Add the environment variables below.
5. Set the custom domain to `admin.alk.co.in` once DNS is configured.

## Environment variables

```env
NEXT_PUBLIC_API_URL=https://api.alk.co.in
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Security notes

- The frontend never enforces authorization.
- Firebase ID token verification must happen on the backend.
- MongoDB credentials, service account keys, and private server secrets remain server-side only.

## API readiness

The app is structured to support a service layer for dashboard, product, and seller APIs. In its current form, it uses a mock data layer for design validation and workflow prototyping before backend integration.
