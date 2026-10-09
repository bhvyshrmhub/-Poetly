# Poetly V2 — Deployment & Operational Runbook

## 1. System Overview

Poetly V2 is built with Next.js 16 (App Router with Webpack bundler), Supabase PostgreSQL, Supabase Auth (Google OAuth), and Supabase Storage. The production frontend is deployed on Vercel (`https://poetly-psi.vercel.app`), connecting to the Supabase project (`oevnshynpzpgezrjsmle`).

---

## 2. Supabase Database Setup & Migration

### Migration File
`supabase/migrations/20260912080000_fix_admin_rls_and_storage.sql`

### How to Apply in Supabase Dashboard
Direct Supabase CLI database push requires the database password or Supabase Personal Access Token. To apply this migration reliably without CLI credentials:

1. Log in to the [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project: **`oevnshynpzpgezrjsmle`**.
3. In the left navigation, select **SQL Editor** (icon with `>_`).
4. Click **New Query**.
5. Open `supabase/migrations/20260912080000_fix_admin_rls_and_storage.sql` from this repository, copy its entire contents, and paste them into the SQL Editor.
6. Click **Run** (or press `Cmd+Enter` / `Ctrl+Enter`).
7. Confirm the result returns `Success. No rows returned`.

### What This Migration Fixes & Configures
- **Infinite Recursion Fix (PostgreSQL 42P17)**: Defines `public.is_admin(user_id uuid)` as a `SECURITY DEFINER` function with a clean search path to evaluate admin privileges without recursive SELECT queries on `public.admin_users`.
- **Storage Buckets & Policies**: Creates `avatars` and `poem-images` public buckets in `storage.buckets` and establishes secure upload/update/delete policies for authenticated users.
- **Comment Author Moderation**: Grants poem authors permission to delete any comment left under their poems (`poem_author_delete_comments`), in addition to users deleting their own comments.
- **Notification Actor Enforcement**: Hardens notifications INSERT RLS so users can only create notification events where `actor_id = auth.uid()`.
- **User Creation Hardening**: Updates `handle_new_user()` trigger to safely handle duplicate usernames with numeric suffixes, preventing primary key and unique constraint crashes during Google OAuth first-time login.

---

## 3. Environment Variables Configuration

Configure the following environment variables in your deployment environment (e.g., Vercel Project Settings > Environment Variables):

### Public Variables (Client & Server)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `https://oevnshynpzpgezrjsmle.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Public API Key | `eyJhbGciOi...` |

### Server-Only Secrets
| Variable | Description | Notes |
| :--- | :--- | :--- |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | Required for admin API routes and elevated tasks |
| `ADMIN_USERNAME` | Master Admin portal username | Default or custom admin handle |
| `ADMIN_PASSWORD_HASH` | 64-byte hex PBKDF2 (SHA-512, 100k iter) hash | Generated via crypto script below |
| `ADMIN_PASSWORD_SALT` | 32-byte hex cryptographic salt | Generated via crypto script below |
| `ADMIN_SESSION_SECRET` | 32+ char secret for signing HMAC admin session tokens | Generated via crypto script below |

### Admin Credential Generator Script
To generate the admin password hash, salt, and session secret, run this in your terminal:

```bash
node -e '
const crypto = require("crypto");
const password = process.argv[1] || "ChangeMeSecret123!";
const salt = crypto.randomBytes(32).toString("hex");
const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
const sessionSecret = crypto.randomBytes(32).toString("hex");

console.log("=== POETLY ADMIN SECRETS ===");
console.log("ADMIN_PASSWORD_SALT=" + salt);
console.log("ADMIN_PASSWORD_HASH=" + hash);
console.log("ADMIN_SESSION_SECRET=" + sessionSecret);
' "YOUR_CHOSEN_ADMIN_PASSWORD"
```

Copy the generated values and paste them into Vercel's Environment Variables settings.

---

## 4. Verification & Testing

### Running Automated Tests
The repository includes a comprehensive native Node.js test suite covering authentication, permissions, profile generation, social features, and feed ranking:

```bash
npm test
```
All 30 automated unit and integration tests must pass cleanly.

### Typecheck & Lint
```bash
npx tsc --noEmit
npm run lint
```

### Production Build
```bash
npm run build
```
*Note: Due to Next.js 16 Webpack configuration, the build command runs `next build --webpack`.*

---

## 5. Post-Deployment Smoke Verification Checklist

After deploying the changes to Vercel:

1. **Authentication**:
   - Navigate to `/login`.
   - Click "Continue with Google".
   - Confirm successful sign-in, session creation, cookie propagation, and redirect to `/home` or `/profile/setup`.
2. **Profile & Identity**:
   - Check that user profile displays correct handle, bio, and avatar.
   - Edit bio/name on `/profile` and verify persistence.
3. **Writing & Publishing**:
   - Navigate to `/write`.
   - Enter title, body, and tags.
   - Toggle "Preview" mode to verify markdown/poem presentation.
   - Click "Publish" and verify redirection to `/poem/[id]`.
   - Verify that author sees "Edit" and "Delete" buttons on their own poem.
   - Click "Edit", modify text, and verify changes persist on `/poem/[id]`.
4. **Social & Engagement**:
   - Click "Like" on a poem and verify like count increments.
   - Click "Save" and verify poem appears in `/saved`.
   - Post a comment under a poem. Verify author can delete comments.
   - Navigate to `/writers` and click "Follow". Verify follow status updates and follower count increments on the profile.
5. **Feed & Search**:
   - Check `/home` tabs: "Recent", "Trending", "Following", and "New Voices".
   - Search poems by title and tags on `/search` and `/explore`.
6. **Admin Portal**:
   - Navigate to `/admin/login`.
   - Sign in with configured `ADMIN_USERNAME` and password.
   - Check moderation of reported poems and comments on `/admin/reports` and `/admin/poems`.
