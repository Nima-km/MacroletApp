# MacroletApp

> **Coming to the App Store** — Full-featured nutrition tracking with custom charts, recipe creation, and a creator monetization system.

---

## Overview

MacroletApp is a comprehensive mobile nutrition application that enables users to track their diet while supporting a creator economy. Users can create and share recipes, filter by macros, calories, and tags, and track meals seamlessly. Creators earn money based on the portion of paid users who log their recipes, with in-app purchases through RevenueCat handling subscriptions, and Stripe handling creator payouts.

---

## Key Features

| Feature                    | Description                                                              |
| -------------------------- | ------------------------------------------------------------------------ |
| **Custom Recipe Creation** | Create and upload recipes with macro breakdowns automatically calculated |
| **Advanced Filtering**     | Filter recipes by macros, calories, tags, and name                       |
| **Custom Charts (Skia)**   | High-performance nutrition charts built with React Native Skia           |
| **Creator Monetization**   | Recipe creators earn money based on paid user engagement                 |
| **Secure Authentication**  | Clerk-powered auth with social login support                             |
| **Subscriptions**          | RevenueCat in-app purchases (`macrolet_pro` entitlement), restore, manage  |
| **Creator Payouts**        | Stripe Express accounts, monthly ShareCredit payout run                   |

---

## Where to read next

This README is the overview. The docs that stay current:

- [`../Macrolet-Express/docs/ARCHITECTURE.md`](../Macrolet-Express/docs/ARCHITECTURE.md) — how the two apps fit together, data ownership, rendering rules
- [`../Macrolet-Express/docs/STATUS.md`](../Macrolet-Express/docs/STATUS.md) — what works, what doesn't, what's next
- [`docs/STYLE_GUIDE.md`](docs/STYLE_GUIDE.md) — governs any UI
- [`docs/API_INTEGRATION.md`](docs/API_INTEGRATION.md) — how this app calls each endpoint

## Tech Stack

**Frontend**

- [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/)
- [React Native Skia](https://shopify.github.io/react-native-skia/) — custom chart rendering
- [TanStack Query](https://tanstack.com/query) — caching & data synchronization
- [Drizzle ORM](https://orm.drizzle.team/) — local database management

**Backend**

- [Express.js](https://expressjs.com/) _(reimplemented from Django for better scaling)_
- [Clerk](https://clerk.com/) — authentication
- [RevenueCat](https://www.revenuecat.com/) — subscriptions, entitlements, revenue ledger
- [Stripe](https://stripe.com/) — creator payouts only (Express accounts, `account.updated` webhook)

---

## Architecture & Challenges

### High-Performance Charts

Building smooth, performant charts while handling large nutrition datasets.
**Solution:** Optimized rendering with data windowing and memoization using React Native Skia.

### Creator Revenue Tracking

Accurately tracking and calculating creator earnings from recipe usage across a large catalog.
**Solution:** RevenueCat webhooks feed a revenue ledger; credits are stamped per log and paid out through Stripe by a monthly ShareCredit run.

### Local Database Optimization

Keeping the local Drizzle database in sync while maintaining UI performance.
**Solution:** Used TanStack Query for intelligent caching and sync management.

### Backend Migration

Originally built on Django, the backend was fully reimplemented in Express.js to improve infrastructure flexibility and horizontal scaling.

---

## Results

- Smooth **60fps** nutrition charts with Skia rendering
- Accurate creator payment calculations across **1,000+ recipes**
- **Zero transaction failures** with the RevenueCat webhook pipeline
- App Store ready with full regulatory compliance

---

## Status

> **Coming to App Store** — Currently in final review stages.

---
