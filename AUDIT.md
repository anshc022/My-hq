# My-hq Codebase Audit Report

**Date:** 2026-02-11
**Auditor:** Probe-Full-Audit Subagent

## 1. Executive Summary

'My-hq' is a sophisticated real-time dashboard visualization for a multi-agent system (OpenClaw). It uses **Next.js 16 (App Router)** and **React 19** for the frontend, **Supabase** for state management and real-time updates, and an HTML5 **Canvas** for a complex 2D visualization of the "office" environment.

The codebase is generally well-structured and uses modern React patterns. However, there are significant security risks regarding hardcoded credentials and some opportunities for performance optimization in the rendering layer.

## 2. Architecture Overview

- **Frontend**: Next.js 16, React 19 (Server Components + Client Components).
- **State Management**: Supabase (PostgreSQL) + Supabase Realtime (WebSockets).
- **Visualization**: Custom 2D Canvas engine (`OfficeCanvas.jsx`) rendering pixel-art agents and environment.
- **Backend Integration**:
  - `gateway-bridge`: A specialized API route acting as a webhook receiver for OpenClaw gateway events.
  - `dispatch`: API route for triggering agent actions.

## 3. Findings & Observations

### 🛡️ Security

**CRITICAL: Hardcoded Credentials**
- `lib/gateway.js` contains a fallback hardcoded token: `token: process.env... || '7dd2661047fa7bfe75d082c887b9691ac7d1f7911ee8aace'`.
- `app/api/dispatch/route.js` also contains fallback Gateway URLs.
- **Recommendation**: Remove all hardcoded fallback secrets immediately. Fail fast if environment variables are missing.

**Supabase Keys**
- Usage appears correct: `NEXT_PUBLIC_SUPABASE_ANON_KEY` is used in client-side `lib/supabase.js`, while `SUPABASE_SERVICE_ROLE_KEY` is strictly limited to server-side API routes (`api/gateway-bridge`, `api/dispatch`). This effectively separates privileged operations from the client.

### ⚡ Performance

**Canvas Rendering**
- `OfficeCanvas.jsx` uses `requestAnimationFrame` effectively for smooth animations.
- **Concern**: The component relies on the `agents` prop. High-frequency updates from Supabase Realtime (e.g., streaming text tokens) will trigger React renders. While the canvas logic is isolated in a `ref` and `useEffect`, frequent prop updates could cause overhead.
- **Recommendation**: Ensure the `agents` state update frequency is throttled or batched if the agent count grows.

**Real-time Subscriptions**
- `app/page.js` subscribes to `postgres_changes` for `ops_agents`, `ops_events`, and `ops_messages`. This is efficient, but as the `ops_events` table grows, the initial `limit(50)` fetch is good practice.

### 💻 Code Quality

**Strengths**
- **Modern React**: Good use of `useCallback`, `useRef`, and Server Actions/API Routes.
- **Component Separation**: Logical split between UI components (`StatsBar`, `AgentPanel`) and the complex visualization (`OfficeCanvas`).
- **Visual Logic**: The canvas drawing code is surprisingly robust, featuring custom pixel art rendering, smoothing/interpolation (`lerp`), and particle effects.

**Weaknesses**
- **Styling Strategy**: Heavy use of inline JavaScript styles (`const styles = { ... }`) mixed with global CSS. This makes the code harder to read and harder to optimize (no CSS extraction).
  - **Recommendation**: Move to CSS Modules or Tailwind CSS for better performance and maintainability.
- **Complex Logic in API Routes**: `app/api/gateway-bridge/route.js` is very long (400+ lines) and contains mixed responsibilities (parsing, delegation logic, Supabase writes).
  - **Recommendation**: Extract business logic (like `detectDelegation` or `detectRoomCommand`) into separate utility files in `lib/`.

### 🔍 Best Practices

- **Linting**: `eslint.config.mjs` is present and configured for Next.js.
- **File Structure**: Standard Next.js App Router structure is followed.
- **Error Handling**: Basic try/catch blocks exist in API routes, but error reporting is just `console.error`. Consider a structured logger or error tracking service.

## 4. Detailed Component Analysis

| Component | Status | Notes |
|-----------|--------|-------|
| `OfficeCanvas.jsx` | 🟢 Excellent | High complexity handled well. Good animation loop. |
| `gateway-bridge` | 🟡 Caution | Monolithic function. Logic for "watchdog" and "delegation" should be unit testable. |
| `lib/gateway.js` | 🔴 Critical | Contains hardcoded secrets. |
| `app/page.js` | 🟢 Good | Clean composition of sub-components. |

## 5. Recommended Next Steps

1.  **Immediate**: Rotate the exposed Gateway token and remove it from `lib/gateway.js`.
2.  **Refactor**: Move logic from `app/api/gateway-bridge/route.js` into `lib/logic/`.
3.  **Style Migration**: Convert inline JS styles to CSS Modules or Tailwind to reduce bundle size and improve runtime performance.
4.  **Resilience**: Add a proper "dead letter queue" or retry mechanism for failed dispatches in `api/dispatch/route.js`.

---
*End of Report*
