# Fitness Species Admin Portal

A premium marketplace operations portal for Fitness Species / ALK built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Firebase email/password login with persisted auth state and protected portal routes
- Firebase ID-token authentication for backend product-review operations
- Live pending, approved, and rejected product views from the backend API
- Firebase-authenticated product approval and rejection flow
- Seller and category management views
- Responsive admin shell with sticky top bar and sidebar
- Dashboard product totals and priority queue are loaded from the backend; unsupported seller totals are shown as unavailable
- Seller, category, and other non-product-management pages remain prototype views backed by local mock data

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

Run the product image URL-selection regression tests with `npm test` (Node.js 22.18 or newer).

## Vercel deployment

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Use the default Next.js build settings.
4. Add the environment variables below.
5. Set the custom domain to `admin.alk.co.in` once DNS is configured.

## Environment variables

Copy `.env.example` to `.env.local`, then replace the Firebase placeholders using the Web App configuration from Firebase project `sellerportal-2786c`. Do not place service-account JSON, MongoDB credentials, or backend secrets in frontend variables.

```env
NEXT_PUBLIC_API_URL=https://fitness-species-backend.onrender.com
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_web_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sellerportal-2786c.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sellerportal-2786c
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_project_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_web_app_id
```

`NEXT_PUBLIC_API_URL` must be the backend base URL without `/api`. For local backend development, override it with `http://localhost:5000`; production must use `https://fitness-species-backend.onrender.com`. Set the API URL and all six Firebase Web App variables in the Admin Portal's Vercel Production environment, then redeploy. These values are public frontend configuration only; never add MongoDB credentials, Firebase Admin private keys, or administrator UIDs.

In Firebase Console for `sellerportal-2786c`, enable Email/Password under Authentication → Sign-in method, ensure `localhost` and `admin-portal-sepia-chi.vercel.app` are authorized domains, and create administrator accounts through the existing trusted process. Google login is not offered because its provider enablement has not been verified.

The Firebase Web configuration is supplied at runtime through `.env.local`, which is ignored by Git. The local configuration must use project `sellerportal-2786c`. Without the six Firebase Web App values, the login page displays a configuration error and authentication cannot succeed.

## Security notes

- Signing in authenticates an account; it does not make that account an administrator. The frontend does not use a role label or client-side claim to grant admin privileges.
- The backend verifies Firebase ID tokens and checks the server-managed `ADMIN_FIREBASE_UIDS` allowlist for review operations. The current backend has no separate admin-verification endpoint; its `/api/admin/products` endpoints enforce both checks on every operation, and non-allowlisted users receive HTTP 403.
- A Firebase session only controls access to the client portal shell. The backend remains the authority for admin access; any future admin API route must apply the same server-side authentication and allowlist checks.
- MongoDB credentials, service account keys, and private server secrets remain server-side only.

## API readiness

Product review pages call the registered `/api/admin/products?status=...`, `/api/admin/products/:productId`, and `PATCH /api/admin/products/:productId/review` routes. Review requests send `{ status: "approved" }` or `{ status: "rejected", rejectionReason }`; rejection reasons must contain 5–1000 characters. Dashboard status counts use the backend's `total` field. The backend has no admin seller-count endpoint, so Active Sellers is shown as unavailable instead of fabricated. Other non-product-management screens remain prototype views backed by local mock data.

The deployed backend currently responds healthy and reports MongoDB database `fitness_species`. Its active routes verify Firebase ID tokens against project `sellerportal-2786c` and authorize admins only through the server-side `ADMIN_FIREBASE_UIDS` allowlist. It allows the exact Seller and Admin Vercel origins and authenticated request headers. Production login and review still require working Firebase Web App values in Vercel, backend Firebase Admin credentials, and an authorized admin UID.

The currently deployed Admin Portal was checked and reports that all six Firebase configuration values are missing. Configure the six `NEXT_PUBLIC_FIREBASE_*` values from the `sellerportal-2786c` Web App and `NEXT_PUBLIC_API_URL=https://fitness-species-backend.onrender.com` in its Vercel Production environment, confirm the admin domain is authorized in Firebase Authentication, and redeploy. Then verify login with an allowlisted admin and a normal seller account; do not treat a successful login alone as admin authorization.

## Product image providers

Live product review lists and detail pages share the image selector and renderer in `components/admin-review.tsx`. The backend product contract is `images: string[]`; the Admin Portal selects the first valid HTTPS URL and displays its existing fallback when no supported URL remains or loading fails.

The Admin Portal currently allows these remote image providers and path scopes:

- `images.unsplash.com` (HTTPS)
- `www.myprotein.co.in/images`
- `img.tatacliq.com/images/i26/**`
- `contents.mediadecathlon.com/p*/**`
- `5.imimg.com/data5/**` (IndiaMART CDN)
- `firebasestorage.googleapis.com/v0/b/sellerportal-2786c.firebasestorage.app/o/sellers/{uid}/products/{uuid}.{jpg|png|webp}` (seller-owned uploads)
- `encrypted-tbn1.gstatic.com/shopping` and `/images` (Google Shopping thumbnails)

The Creatine product's verified image URL uses `5.imimg.com/data5/...`; this is an observed image CDN URL, not evidence that the Seller Portal uploads files to or controls IndiaMART storage. Firebase Storage is not added to the allowlist because its use by the Seller Portal has not been verified. The Admin Portal repository does not contain the Seller Portal or backend source, so upload validation, storage ownership, MongoDB persistence, and API serialization must be verified and maintained in those projects.

The Seller Portal uploads JPEG, PNG, and WebP files to the signed-in seller's Firebase Storage folder; new product submissions save the resulting download URLs as strings in `images`. Firebase Storage rules limit writes to the owner's folder and validate content type and file size. The backend independently checks the exact bucket, seller UID, object path, and URL shape on create/update while preserving unchanged legacy image URLs. Deploy the Storage rules with `firebase deploy --only storage --project sellerportal-2786c`, and configure `FIREBASE_STORAGE_BUCKET=sellerportal-2786c.firebasestorage.app` in the backend environment.

To add another provider, first verify its URL in an authenticated product response and confirm that the image loads. Add an exact HTTPS hostname and the narrowest stable path pattern to both `isAllowedProductImageUrl` in `lib/admin-api.ts` and `images.remotePatterns` in `next.config.ts`, then add URL selection/validation regression coverage for both an accepted URL and rejected sibling hosts/paths. Do not accept arbitrary hosts, broad wildcard hostnames, or unvalidated seller-submitted URLs. Prefer extending the controlled upload flow rather than accepting new external links.
