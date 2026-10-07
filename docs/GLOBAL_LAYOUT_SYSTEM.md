# Poetly — Global Application Shell & Layout System

This document outlines the unified global application layout architecture established across the Poetly platform.

---

## 1. Core Architecture Principles

1. **One Global Application Shell (`AppShell`)**
   - The platform operates within a single, persistent shell.
   - Page transitions change only inner content; the navigation, header, sidebar, and grid geometry remain consistent.

2. **Semantic Hierarchy**
   ```text
   <AppShell>
     ├── <GlobalHeader />             (Sticky 60px header: logo, search, CTA, notifications, theme, profile)
     ├── <AppLayout>                  (Desktop 3-column / Tablet 2-column / Mobile 1-column flex grid)
     │     ├── <Sidebar />            (Fixed/Sticky desktop navigation, route-aware active states)
     │     ├── <MainContent>          (Consistent padding scale, configurable max-width constraints)
     │     │     └── {Page Content}
     │     └── <RightRail>            (Optional contextual rail: trending, suggested writers, activity)
     └── <MobileNav />                (Fixed mobile bottom navigation bar with safe-area insets)
   ```

3. **AMOLED-First Theme with Warm Parchment Light Mode**
   - **Dark Mode**: `#050505` AMOLED background, `#0D0D11` / `#111116` elevated surfaces, `#16161E` borders, `#E8A0B8` rose brand accent.
   - **Light Mode**: `#FAF7F1` parchment background, `#FFFEFA` / `#FFFFFF` elevated surfaces, `#EAE1D2` borders, `#D67FA1` rose brand accent.

---

## 2. Reusable Layout Primitives (`src/components/layout/`)

| Component | Path | Description |
| :--- | :--- | :--- |
| `AppShell` | `src/components/layout/AppShell.tsx` | Top-level container connecting header, sidebar, main content, right rail, and mobile drawer. |
| `AppLayout` | `src/components/layout/AppLayout.tsx` | Centered flex/grid container (`max-w-[1360px] mx-auto px-2 sm:px-4 lg:px-8`). |
| `GlobalHeader` | `src/components/layout/GlobalHeader.tsx` | Sticky 60px header with wordmark, search, write CTA, bell, theme toggle, and account menu. |
| `Sidebar` | `src/components/layout/Sidebar.tsx` | Primary desktop navigation (Home, Explore, Collections, Saved, Notifications, Search, Write, Profile). |
| `MobileNav` | `src/components/layout/MobileNav.tsx` | Fixed bottom bar (5 items, $\ge 44\text{px}$ touch targets, safe-area inset support). |
| `MainContent` | `src/components/layout/MainContent.tsx` | Centered content area with responsive padding (`px-4 sm:px-6 py-6 pb-24 md:pb-12`). |
| `RightRail` | `src/components/layout/RightRail.tsx` | Optional contextual sidebar (`280px–300px`), hidden on tablet and mobile viewports. |
| `PageHeader` | `src/components/layout/PageHeader.tsx` | Unified header primitive for titles, subtitles, back links, badges, and action buttons. |

---

## 3. Max-Width System

Configured via the `maxWidth` prop on `<AppShell maxWidth="...">` or `<MainContent maxWidth="...">`:

- **`feed`** (`max-w-[700px]`): Default for social feeds, notifications, collections, prompts, and search.
- **`reading`** (`max-w-[42rem]` / `max-w-2xl`): Optimized measure for poem reading and comment sections.
- **`wide`** (`max-w-[960px]` / `max-w-5xl`): For writing studio (`/write`), writer directory grid (`/writers`), and full profiles.
- **`full`** (`max-w-none`): For administrative dashboards and unrestricted grid layouts.

---

## 4. Route Template Implementations

| Route | Max-Width | Sidebar | Right Rail | Layout Notes |
| :--- | :--- | :--- | :--- | :--- |
| `/home` | `feed` | Yes | Activity & Suggested Writers | Tabbed Feed (All, Following, Curated) |
| `/explore` | `wide` | Yes | Discovery Rail (Trending & Poets) | Grid of featured poems and collections |
| `/trending` | `feed` | Yes | None | Tabs: Trending, Most Loved, Rising |
| `/writers` | `wide` | Yes | None | 3-column responsive writer grid |
| `/prompts` | `feed` | Yes | None | Active / Archive prompt list |
| `/prompts/[id]` | `feed` | Yes | None | Prompt banner + inspired poems |
| `/collections` | `feed` | Yes | None | User and public collections list |
| `/collections/[id]`| `feed` | Yes | None | Collection details + included poems |
| `/library` / `/saved` | `feed` | Yes | None | Saved poems and likes tabs |
| `/notifications` | `feed` | Yes | None | Notification stream with filter tabs |
| `/profile/[username]`| `feed` | Yes | Suggested Writers | Avatar, bio, follow stats, published tabs |
| `/poem/[id]` | `reading` | Yes | Author Info & Related Poems | Serif reading measure, canvas generator |
| `/write` | `wide` | Yes | None | Writing studio, toolbar, tags, publishing |
| `/search` | `feed` | Yes | None | Unified search (poems, writers, tags) |

---

## 5. Backward Compatibility & Module Federation

To protect existing imports throughout the codebase, legacy component paths re-export the unified layout primitives:

- `src/components/shell/AppShell.tsx` $\to$ re-exports `src/components/layout/AppShell.tsx`
- `src/components/Navbar.tsx` & `HomeNavbar.tsx` $\to$ re-export `GlobalHeader.tsx`
- `src/components/MainNavigation.tsx` $\to$ re-exports `Sidebar.tsx`
- `src/components/MobileBottomNav.tsx` $\to$ re-exports `MobileNav.tsx`
- `src/components/HomePoemCard.tsx` $\to$ re-exports `PoemCard.tsx`
- `src/components/ui/Avatar.tsx` $\to$ unified Next.js image component with initials fallback
