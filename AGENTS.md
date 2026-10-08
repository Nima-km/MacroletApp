# MacroletApp — client instructions

Expo SDK 57 / React Native client. Prebuilt native project: `ios/` and `android/`
both exist, so new native modules require a rebuild, not just a JS reload.
Product overview and feature list: `README.md`.

## Shape

| Area | Where |
| --- | --- |
| Screens | `app/` — expo-router, file-based (`app/(tabs)/...`) |
| Backend calls | `api/**` — one module per endpoint group, hooks in `api/hooks/**` |
| Local database | `db/` — Drizzle over `expo-sqlite`, offline-first; migrations in `drizzle/` |
| Server state | TanStack Query; the `QueryClient` is created in `app/_layout.tsx` |
| UI state | Zustand — `store/` (date, recipe, scroll) |
| Theme | `theme/` (`colors`, `typography`) |
| Components | `components/**` (UIComponents, navComponents, chartComponents, recipeComponents) |

## Payments (RevenueCat)

- `lib/revenuecat.ts` — configure, `logIn(clerkUserId)`, purchase, restore,
  management URL, error mapping. Every function degrades to a no-op when no key is
  configured, so the app still runs without RevenueCat.
- `context/RevenueCatProvider.tsx` — mounted inside `<ClerkProvider>`; keeps the
  RevenueCat customer tied to the signed-in Clerk user and returns to anonymous on
  sign-out. Never throws.
- `app/(tabs)/(profile)/subscription.tsx` — the subscription screen: status badge,
  plan choice, purchase, restore, and a "Manage subscription" link that opens the
  store's own page. The superseded `SubscribeButton` / `RestorePurchasesButton`
  now live in `legacy/`.
- **A native rebuild is required** after touching any of this:
  `npx expo run:ios` / `npx expo run:android`. Expo Go cannot load
  `react-native-purchases`.
- Both cadences are wired in RevenueCat: `$rc_monthly` -> `Premium` (P1M) and
  `$rc_annual` -> `yearly` (P1Y), each granting the `macrolet_pro` entitlement.
  `getPlanOptions()` only offers packages that have a product, so a cadence with
  no product attached simply does not appear rather than failing at the store
  sheet.
- `.env` is **tracked in git** — only public `EXPO_PUBLIC_*` values belong there.
  The secret RevenueCat key stays on the server.

## Error handling and toasts

- `api/errors.ts` owns this: `ApiError`, `toApiError`, `messageForApiError`,
  `showApiErrorToast`, `onMutationError`, `onQueryError`.
- The shared `QueryClient` toasts every mutation failure, and query failures only
  for auth/premium problems (`app/_layout.tsx`).
- Toast types are `success`, `error`, `warning`, `info`
  (`components/UIComponents/Toasts/toastConfig.tsx`). Reuse these instead of
  inventing new visuals.
- API modules throw status-aware errors rather than returning falsy values, so the
  toast layer can distinguish 401 from 403 from a network failure.

## Style

`docs/STYLE_GUIDE.md` governs **any UI you build**. Do not restyle existing
screens or components you were not asked to change.

## Verification

There is **no client test suite** — `tests/` holds test-data generators only
(`generateTestData.ts`, `testData.ts`), and `package.json` has no `test` script.

- `npx tsc --noEmit` — the baseline is **22 pre-existing errors**. Do not chase
  them during unrelated work, and never present a higher count as success; check
  that your own files add nothing. Current distribution:

  | File | Errors |
  | --- | --- |
  | `components/UIComponents/Modals/IngredientModal.tsx` | 6 |
  | `app/(tabs)/(logs)/HandleCreateRecipe123/**` | 5 — the code navigates to
    `/(tabs)/(logs)/HandleCreateRecipe/*`, but the directory is `...123`. Real
    broken navigation, not a typing nuisance. |
  | `helper/recipeHelpers/stespUtil.ts` | 5 |
  | `components/testComponents/TestComponent.tsx` | 2 |
  | `components/chartComponents/MacroCharts/MyBarChart.tsx` | 2 |
  | `components/UIComponents/Swipeable/SwipeableDelete.tsx` | 1 |
  | `components/navComponents/MyTabBar.tsx` | 1 — points at `/(tabs)/discover`, which is absent from the generated route types. Check whether the screen exists before "fixing" this with a cast. |
- `npx expo export --platform android` — must exit 0. Delete the resulting
  `dist/` afterwards (it is gitignored).
- `npx expo install --check` — should report "Dependencies are up to date";
  `npx expo install --fix` realigns patch versions.

## Local environment

In the agent sandbox `$HOME` is read-only, so before any install:

```bash
export HOME=/home/nima/Projects/MacroletProj/.apphome
export npm_config_cache=/home/nima/Projects/MacroletProj/.npm-cache-app
```

Otherwise Expo and npm fail with EROFS on `~/.expo` and the npm cache.
`credentials/` holds iOS signing material and is untracked — leave it alone.

## Replacing a file

When a screen or module is superseded, **do not delete it**: move it to `legacy/`
as `<original-name>-legacy.<ext>` (see `legacy/README.md`). Files under `app/`
cannot keep the suffix in place, because every file there is a live route.
`legacy/` is excluded from `tsconfig.json`, so the copies stay verbatim without
breaking the typecheck.
