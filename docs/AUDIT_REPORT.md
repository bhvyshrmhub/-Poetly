# Poetly V2 — Application Architecture & Audit Report

**Date:** October 2026  
**Auditor:** Senior Full-Stack, Database, Security & QA Engineering Team  
**Scope:** Poetly Next.js 16 Web Application, Supabase Backend, Security, Feeds & UI  

---

## 1. Executive Summary

A comprehensive repository and live production database audit was conducted on Poetly. The core Next.js 16 (App Router) + React 19 codebase builds cleanly with Webpack and passes TypeScript and ESLint validation. However, critical database policy defects, missing storage buckets, unhandled OAuth cookie options, and unhandled Supabase API errors were identified that directly caused prior saving and admin failures.

---

## 2. Live Database Status & Verification

Audited against production Supabase project `oevnshynpzpgezrjsmle` (`https://oevnshynpzpgezrjsmle.supabase.co`):

| Entity / Table | Live State | Row Count / Status | Notes & Issues |
|---|---|---|---|
| `profiles` | **Present** | 3 rows | Schema matches `database.types.ts`. |
| `poems` | **Present** | 3 rows | Schema matches `database.types.ts`. |
| `likes` | **Present** | 3 rows | Unique constraint `(user_id, poem_id)` active. |
| `comments` | **Present** | 1 row | Schema matches `database.types.ts`. |
| `follows` | **Present** | 2 rows | Unique constraint `(follower_id, following_id)` active. |
| `responses` | **Present** | 1 row | Relationship links original and response poems. |
| `saves` | **Present** | 0 rows | Table exists and queryable. |
| `collections` | **Present** | 0 rows | Table exists and queryable. |
| `collection_poems` | **Present** | 0 rows | Table exists and queryable. |
| `prompts` | **Present** | 0 rows | Table exists and queryable. |
| `notifications` | **Present** | 0 rows | Table exists and queryable. |
| `reports` | **Present** | 0 rows | Table exists and queryable. |
| `admin_users` | **BROKEN** | Error `42P17` | **CRITICAL: Infinite recursion detected in RLS policy**. |
| `featured_content` | **BROKEN** | Error `42P17` | **CRITICAL: Cascading failure** from `admin_users` policy. |
| `admin_activity_log` | **BROKEN** | Error `42P17` | **CRITICAL: Cascading failure** from `admin_users` policy. |
| Storage `avatars` | **MISSING** | `NoSuchBucket` | Bucket not created in Supabase project. Avatar uploads fail. |
| Storage `poem-images` | **MISSING** | `NoSuchBucket` | Bucket not created in Supabase project. Image uploads fail. |
| Admin RPC Functions | **MISSING** | 404 (PGRST202) | Functions in `20260912070000_admin_functions.sql` not applied. |

---

## 3. Discovered Vulnerabilities & Root Causes

### 3.1 Infinite Recursion in `public.admin_users` RLS (PostgreSQL 42P17)
- **Root Cause:** In migration `20260912020000_full_bootstrap.sql` line 558:
  ```sql
  CREATE POLICY "Admins can manage admin users"
    ON public.admin_users FOR ALL
    USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
  ```
  Because this policy is defined `FOR ALL`, ANY query executing `SELECT` on `admin_users` evaluates the policy subquery against `admin_users`. This recurses infinitely, causing PostgreSQL to abort with error `42P17`.
  Furthermore, `featured_content` and `admin_activity_log` have policies subquerying `admin_users`, making them crash identically.
- **Solution:** Drop the recursive `FOR ALL` policy. Create discrete `FOR SELECT`, `FOR INSERT`, `FOR UPDATE`, and `FOR DELETE` policies utilizing a `SECURITY DEFINER` helper function `is_admin()`, and ensure `SELECT` does not trigger subqueries on the same table.

### 3.2 Storage Buckets Non-Existent
- **Root Cause:** Migration `20260912060000_storage_buckets.sql` was not applied to the production database.
- **Solution:** Prepare migration `20260912080000_fix_admin_rls_and_storage.sql` to insert `avatars` and `poem-images` into `storage.buckets` with appropriate RLS policies.

### 3.3 New User Trigger Collision Fragility
- **Root Cause:** In `handle_new_user()`, `split_part(new.email, '@', 1)` is used as fallback username. Two users with identical email local parts (e.g. `john@gmail.com` and `john@outlook.com`) result in a duplicate key violation on `profiles_username_key`, crashing Google OAuth signup.
- **Solution:** Sanitize username, detect existing usernames in a loop or append a unique hex suffix from the UUID, and wrap in exception handling with `ON CONFLICT (id) DO NOTHING`.

### 3.4 OAuth Callback Dropping Cookie Options
- **Root Cause:** In `src/app/auth/callback/route.ts`, when copying cookies from `supabaseResponse` to `NextResponse.redirect`, only `name` and `value` were passed, dropping `path`, `maxAge`, `sameSite`, and `httpOnly`.
- **Solution:** Spread `...options` into `response.cookies.set(name, value, options)`.

### 3.5 Admin Password Timing Attack Vulnerability
- **Root Cause:** In `src/app/api/admin/login/route.ts`, `hashHex === ADMIN_PASSWORD_HASH` performed non-constant-time string comparison.
- **Solution:** Use `crypto.timingSafeEqual` with matching buffer lengths.

### 3.6 Unhandled Errors on Supabase JS Client Operations
- **Root Cause:** In `PoemCard.tsx`, `SuggestedWriters.tsx`, and `ProfileByUsernamePage`, database operations (like, save, follow) used `try { await supabase... } catch {}`. Because Supabase JS returns `{ data, error }` instead of throwing exceptions, DB errors were silently ignored, causing optimistic state discrepancies.
- **Solution:** Explicitly check `if (error) throw error` and revert optimistic UI states on failure.

### 3.7 Insecure Notification Insert RLS Policy
- **Root Cause:** `CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);` allowed any user to spoof notifications for any user.
- **Solution:** Enforce `WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = actor_id)`.

### 3.8 Missing UI Workflows
- **Writing Experience:** Missing `beforeunload` unsaved changes warning; missing direct link to `/write/preview`.
- **Poem Detail:** Poem author had no Edit or Delete buttons on `/poem/[id]`.
- **Writers Page:** Follow button was missing (`showFollow` not passed to `WriterCard`).
- **Feeds:** `new-voices` feed tab executed the identical query as `for-you`.

---

## 4. Remediation Plan

1. **Migration `20260912080000_fix_admin_rls_and_storage.sql`**:
   - Fix `admin_users`, `featured_content`, and `admin_activity_log` RLS infinite recursion.
   - Implement `is_admin()` SECURITY DEFINER function.
   - Create missing admin RPC functions.
   - Provision `avatars` and `poem-images` storage buckets.
   - Harden `notifications` RLS policies.
   - Make `handle_new_user()` trigger collision-proof.
2. **Authentication & Session Hardening**:
   - Fix cookie options in OAuth callback.
   - Add constant-time timingSafeEqual in admin login.
3. **Profile System Self-Healing**:
   - Ensure profile auto-provisioning fallback on write/interaction if trigger was skipped.
4. **Poem & Social Interactions**:
   - Check Supabase `{ error }` and revert optimistic state on failure.
   - Add author Edit and Delete buttons on `/poem/[id]`.
   - Add preview button and unsaved changes listener on `/write`.
   - Complete `new-voices` feed logic and sanitize search queries.
   - Enable follow buttons on `/writers`.
5. **Automated Testing Suite**:
   - Add unit and integration tests verifying authentication, profiles, poem mutations, social interactions, and admin security.
