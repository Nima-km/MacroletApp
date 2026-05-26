# MacroletApp

> **Coming to the App Store** — Full-featured nutrition tracking with custom charts, recipe creation, and a creator monetization system.

---

## Overview

MacroletApp is a comprehensive mobile nutrition application that enables users to track their diet while supporting a creator economy. Users can create and share recipes, filter by macros, calories, and tags, and track meals seamlessly. Creators earn money based on the portion of paid users who log their recipes, with Stripe handling all payment processing.

---

## Key Features

| Feature                    | Description                                                              |
| -------------------------- | ------------------------------------------------------------------------ |
| **Custom Recipe Creation** | Create and upload recipes with macro breakdowns automatically calculated |
| **Advanced Filtering**     | Filter recipes by macros, calories, tags, and name                       |
| **Custom Charts (Skia)**   | High-performance nutrition charts built with React Native Skia           |
| **Creator Monetization**   | Recipe creators earn money based on paid user engagement                 |
| **Secure Authentication**  | Clerk-powered auth with social login support                             |
| **Stripe Payments**        | Automated subscriptions and creator earnings payouts                     |

---

## Tech Stack

**Frontend**

- [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/)
- [React Native Skia](https://shopify.github.io/react-native-skia/) — custom chart rendering
- [TanStack Query](https://tanstack.com/query) — caching & data synchronization
- [Drizzle ORM](https://orm.drizzle.team/) — local database management

**Backend**

- [Express.js](https://expressjs.com/) _(reimplemented from Django for better scaling)_
- [Clerk](https://clerk.com/) — authentication
- [Stripe](https://stripe.com/) — payment processing & webhook handling

---

## Architecture & Challenges

### High-Performance Charts

Building smooth, performant charts while handling large nutrition datasets.
**Solution:** Optimized rendering with data windowing and memoization using React Native Skia.

### Creator Revenue Tracking

Accurately tracking and calculating creator earnings from recipe usage across a large catalog.
**Solution:** Implemented an event-driven tracking system with Stripe webhooks for reliable, real-time calculations.

### Local Database Optimization

Keeping the local Drizzle database in sync while maintaining UI performance.
**Solution:** Used TanStack Query for intelligent caching and sync management.

### Backend Migration

Originally built on Django, the backend was fully reimplemented in Express.js to improve infrastructure flexibility and horizontal scaling.

---

## Results

- Smooth **60fps** nutrition charts with Skia rendering
- Accurate creator payment calculations across **1,000+ recipes**
- **Zero transaction failures** with Stripe webhook system
- App Store ready with full regulatory compliance

---

## Status

> **Coming to App Store** — Currently in final review stages.

---

## Contact

Interested in this project or want to collaborate? Feel free to reach out!
