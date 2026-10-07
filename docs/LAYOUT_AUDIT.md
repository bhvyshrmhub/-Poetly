# Poetly Global Layout Architecture & Route Audit

## 1. Executive Summary

This document outlines the layout audit and target architecture for Poetly's unified global application shell.
Prior to this refactor, the platform had two divergent layout paradigms:
1. `/home` used `HomeLayout`, which embedded its own separate `HomeNavbar`, `MobileTopBar`, `MobileBottomNav`, `home-sidebar`, and `home-right-sidebar`.
2. All other routes (`/explore`, `/collections`, `/notifications`, `/profile`, `/poem`, `/write`, `/saved`) used `AppShell` with differing internal widths, headers, and navigation patterns.

This refactor establishes **ONE unified global shell**:
- **ONE GlobalHeader**
- **ONE Left Sidebar**
- **ONE Mobile Navigation**
- **ONE MainContent & RightRail Grid System**
- Consistent AMOLED-first design tokens and responsive breakpoints.

---

## 2. Route Map & Classification

| Route | Auth Type | Page Template Type | Left Sidebar | Right Rail | Mobile Nav | Notes |
|---|---|---|---|---|---|---|
| `/` | Public | Redirect | - | - | - | Redirects to `/home` |
| `/home` | Public/Auth | Type A (Feed) | Yes | Yes (Activity, Suggested Writers) | Yes | Unified from `HomeLayout` into `AppShell` |
| `/explore` | Public | Type B (Discovery) | Yes | Optional/Integrated | Yes | Discovery tabs (Poems, Prompts, Writers) |
| `/collections` | Public/Auth | Type D (Collections) | Yes | No | Yes | Curated shelves list & create modal |
| `/collections/[id]` | Public/Auth | Type D (Collections) | Yes | Optional | Yes | Single collection poem list & management |
| `/saved` / `/library` | Protected | Type E (List) | Yes | No | Yes | User's saved poems library |
| `/notifications` | Protected | Type E (Notifications) | Yes | No | Yes | Centered notifications feed |
| `/profile` | Protected | Type C (Profile) | Yes | No | Yes | Redirects to current user's profile |
| `/profile/[username]` | Public | Type C (Profile) | Yes | Optional | Yes | Profile header, bio, stats, tabs |
| `/profile/setup` | Protected | Form | Yes | No | Yes | Initial onboarding setup |
| `/poem/[id]` | Public | Type G (Reading) | Yes | Optional (Author/Related) | Yes | Immersive literary poem reading view |
| `/poem/[id]/edit` | Protected | Form | Yes | No | Yes | Author poem editing |
| `/poem/[id]/respond` | Protected | Form | Yes | No | Yes | Respond to poem with a poem |
| `/poem/[id]/canvas` | Protected | Interactive | Yes | No | Yes | Social share card generator |
| `/write` | Protected | Type F (Writing) | Yes | Optional (Prompts/Tips) | Yes | Poetry composition canvas |
| `/search` | Public | Type B (Discovery) | Yes | No | Yes | Search poems, writers, and tags |
| `/trending` | Public | Type A (Feed) | Yes | Yes | Yes | Trending poems list |
| `/writers` | Public | Type B (Discovery) | Yes | No | Yes | Writers directory |
| `/prompts` / `/prompts/[id]` | Public | Type B/D | Yes | Optional | Yes | Community writing prompts |
| `/login` | Public | Auth | No | No | No | Auth card / Google OAuth |
| `/admin/*` | Admin Cookie | Admin Shell | Dedicated Admin | No | Dedicated Admin | Separate admin layout strictly preserved |

---

## 3. Responsive Breakpoint Strategy

- **Desktop (>= 1200px)**:
  - Header: Sticky GlobalHeader (Height: 60px)
  - Layout Grid: 3-column / 2-column
    - Left Sidebar: 240px - 280px (sticky)
    - Main Content: Flexible width (max 680px - 720px for feeds, 42rem for reading)
    - Right Rail: 260px - 300px (when present)
- **Tablet (768px - 1199px)**:
  - Left Sidebar: 240px (sticky)
  - Main Content: Flexible width (expands into the space formerly occupied by Right Rail)
  - Right Rail: Hidden cleanly (`hidden xl:block` or `hidden lg:block`)
- **Mobile (< 768px)**:
  - Header: Compact Top Bar (`Poetly` Logo, Notifications Bell, Avatar)
  - Left Sidebar: Hidden from fixed flow (accessible via bottom navigation or slide-out)
  - Main Content: Full width with 16px horizontal padding
  - Bottom Navigation: Fixed bottom bar (`Home`, `Explore`, `✦ Write`, `Notifications`, `Me`) with >= 44px touch targets and safe area insets.

---

## 4. Visual Foundation & Design Tokens

- **AMOLED Dark (Default)**:
  - Background: `#050505` / `#000000`
  - Elevated surfaces: `#0A0A0A`, `#0E0E12`, `#14141A`
  - Borders: `#1A1A1A`, `#222226`
  - Text: Primary `#F5F5F5`, Secondary `#A0A0A0`, Tertiary `#666666`
  - Accents: Rose `#E8A0B8`, Lavender `#B8B8D8`, Lilac `#C8A8D8`
- **Light Theme**:
  - Background: `#FAF7F1` / `#FAF9F6`
  - Elevated surfaces: `#FFFEFA`, `#FFFFFF`
  - Borders: `#EAE1D2`, `#DDD2BE`
  - Text: Primary `#221D18`, Secondary `#6C6257`
  - Accents: Rose `#D67FA1`, Lavender `#8B90C8`
