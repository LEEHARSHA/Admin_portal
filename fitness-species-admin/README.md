# Fitness Species Admin Portal

A premium marketplace operations portal for Fitness Species / ALK built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Firebase email/password login with persisted auth state and protected portal routes
- Firebase ID-token authentication for backend product-review operations
- Live pending, approved, and rejected product views from the backend API
- Firebase-authenticated product approval and rejection flow
- Seller and category management views
- Responsive admin shell with sticky top bar and sidebar
- Prototype dashboard and non-product-management pages still use local mock data

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

Copy `.env.example` to `.env.local`, then replace the Firebase placeholders using the Web App configuration from Firebase project `sellerportal-2786c`. Do not place service-account JSON, MongoDB credentials, or backend secrets in frontend variables.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_web_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sellerportal-2786c.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sellerportal-2786c
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_project_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_web_app_id
```

`NEXT_PUBLIC_API_URL=http://localhost:5000` is for local development when the backend is running on the same computer. Production must use the HTTPS base URL of the deployed backend (without `/api`); no deployed backend URL is configured or assumed here. Set these values in the Vercel project environment and redeploy after updates.

In Firebase Console for `sellerportal-2786c`, enable Email/Password under Authentication → Sign-in method, ensure `localhost` and `admin-portal-sepia-chi.vercel.app` are authorized domains, and create administrator accounts through the existing trusted process. Google login is not offered because its provider enablement has not been verified.

The Firebase Web configuration is supplied at runtime through `.env.local`, which is ignored by Git. This checkout does not include that file or real Firebase credentials; copy `.env.example` and fill in the Web App values before testing sign-in. Without those values, the login page displays a configuration error and authentication cannot succeed.

## Security notes

- Signing in authenticates an account; it does not make that account an administrator. The frontend does not use a role label or client-side claim to grant admin privileges.
- The backend verifies Firebase ID tokens and checks the server-managed `ADMIN_FIREBASE_UIDS` allowlist for review operations. The current backend has no separate admin-verification endpoint; its `/api/admin/products` endpoints enforce both checks on every operation, and non-allowlisted users receive HTTP 403.
- A Firebase session only controls access to the client portal shell. The backend remains the authority for admin access; any future admin API route must apply the same server-side authentication and allowlist checks.
- MongoDB credentials, service account keys, and private server secrets remain server-side only.

## API readiness

Product review pages call `/api/admin/products`, `/api/admin/products/:productId`, and `/api/admin/products/:productId/review`. The dashboard and non-product-management screens remain prototype views backed by local mock data; the account label only identifies the signed-in Firebase account, not its authorization status. Local API integration requires the backend process, Firebase Web App values, Firebase account, backend Firebase credentials, MongoDB connection, and an allowlisted administrator UID. The Firebase Web App configuration and real account credentials are not present in this checkout, so end-to-end authentication has not been tested.

Before production use, configure the Firebase Web App variables in the portal's deployment environment and the deployed backend's Firebase credentials, `ADMIN_FIREBASE_UIDS`, MongoDB connection, and exact portal origin in `CORS_ORIGINS`. Then verify with real accounts that a trusted allowlisted administrator can review products and an authenticated non-admin receives HTTP 403. No production backend URL is configured in this checkout.

For the deployed portal at `https://admin-portal-sepia-chi.vercel.app`, set its Firebase authorized domain as above and set `NEXT_PUBLIC_API_URL` to the actual HTTPS URL only after the backend has been deployed. Also include the exact portal origin in backend `CORS_ORIGINS`. Review page responses remain the final administrator access check.
