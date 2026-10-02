# MacroletApp — API integration audit

> **Scope:** the client's API layer only — everything under `MacroletApp/api/**` and the React-Query hooks that call it. UI/screen behaviour is out of scope except where a hook has no consumer.
>
> **Counterpart:** `Macrolet-Express/docs/ONLINE_FEATURES.md` is the backend contract. Where the two disagree, this file records which side is wrong.
>
> Verified against client commit `fc749ef`, backend commit `05f7a67`.

---

## 1. How the client talks to the API

| Aspect | Reality |
| --- | --- |
| Transport | Plain `fetch` per endpoint (`axios` is only used for the direct Open Food Facts call). No shared client, no interceptor. |
| Auth | Each hook calls Clerk's `useAuth().getToken()` and passes `Authorization: Bearer <token>` explicitly. Cookies are never used. |
| Base URL | `process.env.EXPO_PUBLIC_API_URL`, read at module scope in ~10 files. Currently `http://192.168.1.239:5000` (a LAN IP) in `.env`; the Railway URL is parked as `EXPO_PUBLIC_API_URL_DEACTIVE`. |
| Error handling | `if (!res.ok) throw new Error((await res.json()).error)` — duplicated per function; non-JSON error bodies would throw a parse error instead. |
| Response typing | Types are hand-declared per module (`api/*.ts`, `types/*.ts`) and are **not** generated from or checked against the backend. Several are wrong (§4). |
| Caching | TanStack Query. `queryKey`s are per-domain. |

**Two `QueryClient` instances exist.** The provider uses the one created in `app/_layout.tsx:25`, but `api/hooks/useBarcodeLookup.ts:5` exports a second one, which `api/hooks/useUploadRecipe.ts:27` and some `db/hooks/*` invalidate against. Those invalidations do not touch the app's cache.

---

## 2. Endpoint map

Status: **OK** = works · **BROKEN** = cannot succeed as written · **PARTIAL** = works but a documented field is missing/wrong · **NO CALLER** = client hook exists, nothing uses it.

| Client function (file) | Method + path | Hook | Backend handler | Status |
| --- | --- | --- | --- | --- |
| `fetchFilteredRecipes` (`api/searchRecipe.ts:4`) | `GET /recipes/search/` | `useFilteredRecipes` | `routes/recipe.ts:17` | PARTIAL — no `tags` in response (§4.7); search needs ≥3 chars, so filters alone cannot query |
| `fetchRecipeFromSlug` (`api/searchRecipe.ts:42`) | `GET /recipes/${slug}` | `useGetRecipeFromSlug` | `routes/recipe.ts:44` | **BROKEN** — no auth header → 401 |
| `fetchAuthorFromSlug` (`api/searchRecipe.ts:58`) | `GET /creator/${slug}` | `useGetAuthorFromSlug` | `routes/creator.ts:34` | OK (route is public) |
| `TESTBACKEND` (`api/searchRecipe.ts:69`) | `GET /debug` | — | `server.ts:55` | Debug only; unused (call site commented out) |
| `fetchCreatorProfile` (`api/creator.ts:32`) | `GET /recipes/creator/${username}` | `useCreatorProfile` | `routes/recipe.ts:57` | OK |
| `fetchCreatorRecipes` (`api/creator.ts:46`) | `GET /recipes/creator/allrecipes/${username}` | `useCreatorRecipes` | `routes/recipe.ts:73` | PARTIAL — `page`/`limit` ignored server-side; local type says `recipes: RecipeCardData` but it is an array |
| `updloadRecipe` (`api/uploadRecipe.ts:4`) | `POST /recipes/` | `useUploadRecipe` | `routes/recipe.ts:102` | **BROKEN** payload (§3.3); returned bare slug string is parsed correctly |
| `fetchDiscoverFeed` (`api/fetchDiscoverFeed.ts:58`) | `GET /discover` | `useDiscoverFeed` | `routes/discover.ts:7` | PARTIAL — hook is gated on `optional_tags.length > 0`; `author` field does not exist in the payload |
| `fetchApprovedTags` (`api/fetchTags.ts:1`) | `GET /tag` | `useTags` | `routes/tag.ts:15` | OK (public) |
| `fetchSearchFood` (`api/searchFood.ts:3`) | `GET /food/${query}` | `useSearchFood` | `routes/food.ts:10` | OK; results are written into local SQLite |
| `postFood` (`api/postFood.ts:3`) | `POST /food` | `useInsertFood` | `routes/food.ts:23` | NO CALLER |
| `postCredit` (`api/postCredit.ts:1`) | `POST /creator/credit` | `usePostCredit` | `routes/creator.ts:77` | OK — called on recipe log |
| `useCreatorOnboarding` (`api/hooks/useCreatorOnboarding.ts:22`) | `POST /creator/onboard` | itself | `routes/creator.ts:16` | OK. `GET /creator/onboard/refresh` is never called; the Stripe return deep link has no route in `app/` |
| `useOnboardingStatus` (`api/hooks/useCreatorOnboarding.ts:54`) | `GET /creator/onboard/status` | itself | `routes/creator.ts:65` | OK |
| `fetchRecipeReviews` (`api/review.ts:5`) | `GET /recipes/${slug}/reviews` | `useRecipeReviews` | **unmounted** | **BROKEN** |
| `postReview` (`api/review.ts:21`) | `POST /recipes/${slug}/reviews` | `useCreateReview` | **unmounted** | **BROKEN**; hook has no call |
| `postCreatorResponse` (`api/review.ts:63`) | `POST /recipes/reviews/${id}/response` | `useCreatorResponse` | **unmounted** | **BROKEN**; hook has no call |
| `postReport` (`api/review.ts:86`) | `POST /recipes/${slug}/report` | `useReportRecipe` | **unmounted** | **BROKEN**; hook has no call |
| `postRecipeBook` (`api/recipeBook.ts:6`) | `POST /recipebooks` | `useCreateRecipeBook` | `routes/recipeBook.ts:18` | NO CALLER (the bookmark UI uses local SQLite) |
| `deleteRecipeBookApi` (`api/recipeBook.ts:25`) | `DELETE /recipebooks/${id}` | `useDeleteRecipeBook` | `routes/recipeBook.ts:29` | NO CALLER |
| `postRecipeToBook` (`api/recipeBook.ts:40`) | `POST /recipebooks/${id}/recipes` | `useAddRecipeToBook` | `routes/recipeBook.ts:43` | NO CALLER |
| `deleteRecipeFromBook` (`api/recipeBook.ts:60`) | `DELETE /recipebooks/${id}/recipes/${slug}` | `useRemoveRecipeFromBook` | `routes/recipeBook.ts:62` | NO CALLER |
| `fetchCreatorRecipeBooks` (`api/recipeBook.ts:85`) | `GET /recipebooks/creator/${username}` | `useCreatorRecipeBooks` | — | **BROKEN** — route does not exist (backend is `GET /recipebooks/:username`) |
| `fetchRecipesFromRecipeBook` (`api/recipeBook.ts:99`) | `GET /recipebooks/${slug}` | `useRecipeBookRecipes` | `routes/recipeBook.ts:78` | **BROKEN** — matches the username handler; returns book summaries, not `RecipeCardData[]` |
| `fetchCreatorOverview` (`api/creatorDashboard.ts:12`) | `GET /dashboard/overview` | `useCreatorOverview` | `routes/dashboard.ts:19` | PARTIAL — key mismatch when the creator has no published recipes (§4.5) |
| `fetchCreatorRecipes` (`api/creatorDashboard.ts:25`) | `GET /dashboard/recipes` | `useDashboardRecipes` | `routes/dashboard.ts:32` | OK; server totals are inflated by row multiplication (§4.6) |
| `fetchRecipeAnalytics` (`api/creatorDashboard.ts:47`) | `GET /dashboard/recipes/${slug}/analytics` | `useRecipeAnalytics` | `routes/dashboard.ts:49` | NO CALLER |
| `fetchPayoutHistory` (`api/creatorDashboard.ts:64`) | `GET /dashboard/payouts` | `usePayoutHistory` | `routes/dashboard.ts:60` | NO CALLER |
| `fetchTopPerformingRecipes` (`api/creatorDashboard.ts:77`) | `GET /dashboard/recipes/top` | `useTopPerformingRecipes` | `routes/dashboard.ts:82` | OK |
| `archiveRecipe` (`api/creatorDashboard.ts:90`) | `PATCH /dashboard/recipes/${slug}/archive` | `useArchiveRecipe` | `routes/dashboard.ts:71` | OK, but the mutate is never invoked |
| `publishRecipe` (`api/creatorDashboard.ts:108`) | `PATCH /dashboard/recipes/${slug}/publish` | `usePublishRecipe` | — | **BROKEN** — no such backend route |
| `deleteRecipe` (`api/creatorDashboard.ts:126`) | `DELETE /dashboard/recipes/${slug}` | `useDeleteRecipe` | `routes/dashboard.ts:93` | Commented out client-side; backend route exists |
| `fetchFollowedCreators` / `postFollow` / `deleteFollow` / `fetchFollowerCount` (`api/hooks/useDiscoverFeed.ts:24-86`) | `/follow/*` | — | `routes/follow.ts` | All commented out — **no follow API is reachable from the app** |
| `FetchBarcode` (`api/fetchBarcode.ts:3`) | `GET world.openfoodfacts.org/api/v3/product/${barcode}.json` | `useBarcodeLookup` | — | Direct third-party call that duplicates the backend's server-side logic |

---

## 3. Blocking defects

**3.1 Missing auth on a gated endpoint.** `fetchRecipeFromSlug` (`api/searchRecipe.ts:42-52`) sends no headers, yet `GET /recipes/:recipe_slug` is wrapped in `requireSubscription` (`Macrolet-Express/src/routes/recipe.ts:44`), which needs both a Clerk session and a `gold` plan. Every "open an online recipe" flow therefore 401s. Its caller, `useGetRecipeFromSlug` (`api/hooks/useSearchRecipe.ts:49`), obtains a token and then does not pass it.

**3.2 Three routes the backend does not have.**

- `PATCH /dashboard/recipes/:slug/publish` (`api/creatorDashboard.ts:108`)
- `GET /recipebooks/creator/:username` (`api/recipeBook.ts:85`) — backend is `GET /recipebooks/:username`
- `GET /recipebooks/:slug` (`api/recipeBook.ts:99`) — resolves to the username handler and returns `{recipeBook_slug, bookName, pictures}[]`, not the declared `RecipeCardData[]`; consumers would dereference `recipe.foodData.name` on `undefined`

**3.3 `POST /recipes` payload vs the zod schema.** `transformRecipeForAPI` (`api/tranformers.ts:32-53`) produces:

- `tags`: client type is `RecipeTags[] = { tag: string }[]` (`types/recipe.ts:48`, `db/schema.ts:42`), backend expects `z.array(z.string())` (`schemas/recipe.ts:30`) → 400 whenever tags are present.
- `barcode`: backend requires a non-empty string (`schemas/recipe.ts:4`), but it comes from a nullable local column (`db/schema.ts:20`) and `JSON.stringify` drops `undefined` → `Required` 400.
- `servings_yield`: backend requires an integer ≥1 (`schemas/recipe.ts:29`); the client accepts decimals and validates only "> 0" (`store/recipeStore/useRecipeStore.ts:261`).
- `bannerImage`: never sent at all (`api/tranformers.ts:43` is a `TODO`), while the backend column and the card components both read it.
- `directions[].photo`: sent as a device-local `file://` URI from `useImageManager`, so the stored value is unusable to anyone else. No storage upload exists anywhere in the app.

**3.4 The publish path never persists the slug.** The live flow calls `updloadRecipe` directly from `app/(tabs)/(logs)/HandleCreateRecipe123/PreviewRecipe.tsx:34`, whereas only `useUploadRecipe` (`api/hooks/useUploadRecipe.ts:16-18`) writes the returned slug into SQLite via `updateRecipeSlug`. Consequences: the "already uploaded" guard (`api/uploadRecipe.ts:8-10`) can never fire, and pressing Publish twice creates two server recipes. The same file swallows failures — `.catch(log).then(navigate + reset)` — so a 400/403 still clears the draft.

---

## 4. Field-level mismatches

1. **Reviews** (`types/review.ts`) declare `review.username` and `response.creator_username`; the backend selects raw `review` rows (`user_id`) and a `creator_review_response` row (`creator_id`), so both are `undefined`. `created_at` is typed `Date` but arrives as a string, and `ReviewCard` calls `.toDateString()` on it.
2. **Search results** omit `tags` — `/recipes/search` returns raw `recipe` rows (`services/recipe.ts:196-217`) and `transformRecipesFromAPI` (`api/tranformers.ts:76`) copies `apiRecipe.tags`, which is always `undefined`. Tags only exist on `GET /recipes/:slug` (`services/recipe.ts:263`).
3. **`GET /recipes/:slug` has no `recipeData.id`** (`services/recipe.ts:254-264`), but the client's `RecipeInsert` type requires one and bookmarking gates on `recipeData.id`. `foodData` likewise lacks `id`, `barcode`, `serving_100g`, `volume_100ml` and `micro_nutriants`.
4. **Discover cards have no `author`** — the cached payload (`services/scoring.ts:106-124`) never includes it, and `fetchDiscoverFeed`'s `toRecipeCardData` does not set it, yet `RecipeCard`/`RecipeCardSmall` render `recipeData.author`. `calories`, `avg_rating`, `score` and `creator_id` are also dropped by the transformer.
5. **`GET /dashboard/overview` key mismatch** — the no-published-recipes branch returns `pendingBalance` (`services/dashboard.ts:36`) while the normal branch and the client type use `pendingBalanceCents` (`services/dashboard.ts:54`, `types/dashboard.ts:5`).
6. **Dashboard totals are inflated** — `totalLogs`/`totalImpressions` come from `count()` over two `leftJoin`s in the same query (`services/dashboard.ts:95-96`), which multiplies rows; and `/dashboard/recipes` has no status filter while `/dashboard/overview` counts published only.
7. **`RecipeTags`** as a shape (`{tag}`) disagrees with the backend's `string[]` everywhere it is used, not just on upload.
8. **`/recipes/creator/allrecipes/:username`** ignores `page`/`limit` (`routes/recipe.ts:83`), so the infinite query (`api/hooks/useCreator.ts:25`) re-fetches the same page while `hasNextPage` stays false.

---

## 5. Housekeeping in `api/`

- Dead exports: `transformRecipeForAPIOLD` (`api/tranformers.ts:3`), `transformRecipeFromAPI` (`:54`), `useUpdateSlugRecipe` (`api/hooks/useCreateRecipe.ts:104`), `useInsertFood`/`postFood`, and the commented blocks in `api/creatorDashboard.ts:125`, `api/hooks/useDiscoverFeed.ts:24`, `api/hooks/useReview.ts:45`.
- Two functions named `fetchCreatorRecipes` with different signatures and endpoints (`api/creator.ts:46`, `api/creatorDashboard.ts:25`) — a rename waiting to cause a bug.
- `TESTBACKEND` targets `/debug`, which dumps request headers; remove both before shipping.
- `SubscribeButton` hardcodes the Clerk plan id (`cplan_31CHATwXmr20VQOBVaRmVC7JSib`) and ignores its `planId` prop; this is Clerk Billing, which is what the backend's `requireSubscription` checks — so backend `src/lib/revenuecat.ts` is unused.

---

## 6. Suggested fix order

1. Pass the token in `fetchRecipeFromSlug` (one line) — unblocks the main online flow.
2. Decide the review mount (`app.use('/recipes', reviewRouter)`) and start the router; the client paths are already correct.
3. Fix the `POST /recipes` payload: `tags.map(t => t.tag)`, guarantee a barcode string, coerce `servings_yield` to an integer.
4. Call `updateRecipeSlug` from the live preview path and stop resetting the draft when the upload fails.
5. Fix or delete the three non-existent routes; align `/recipebooks/*` on one convention.
6. Only then add image upload and wire the follow API, which currently has no UI path at all.
