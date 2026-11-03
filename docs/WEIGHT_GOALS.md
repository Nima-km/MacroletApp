# Weight tracking, weight goals, and adaptive maintenance

This is the design document for the weight-goal system and the Pro maintenance
calculator. It records not just *what* is being built but *why* each decision was made,
because most of them were argued out and the reasoning is the part that is easy to lose.

Nothing here is implemented yet. Sections marked **Built** exist in the app today; the
rest is design.

---

## 1. The problem this solves

Today the app tracks weight and shows a delta, but it deliberately refuses to judge it:

> "The delta is deliberately neutral: for weight, up is not failure and down is not
> success — that depends on the user's goal, which the app does not know."
> — `components/UIComponents/Cards/WeightCard.tsx`

That comment is the brief. The user has a goal; the app doesn't know it. Everything
below exists to close that gap without turning the app into something that nags people
about their bodies.

Two constraints shape the whole design:

1. **Weight is noisy.** Day-to-day movement is dominated by water, glycogen, sodium and
   food still in transit. Any feature that reacts to a single weigh-in is wrong.
2. **The app must not give dangerous advice.** A target date plus a slow week is a
   straight line to "eat 200 kcal today" unless the guardrails are designed in from the
   start.

---

## 2. Decisions that are already settled

| Decision | Choice | Why |
| --- | --- | --- |
| Units | Build **before** the feature; canonical **grams**; display kg/lb | Retrofitting units across tables and charts is expensive; better to start canonical |
| Weight goal kinds | `lose` · `gain` · `maintain` (labelled "Maintain / Recomp") | Recomp and maintain are observed identically (flat trend); see §5 |
| Target date | Optional, and its free/Pro gate is decided **after** it is built | Product call deferred |
| Trend line | **Free** | See §6 — a weight chart without it is misleading, not merely less capable |
| Projection, ETA, confidence, on-track | **Pro** | Convenience, not correctness |
| Macro profiles | **Pro** | They have no consumer without the adaptive goal (§9) |
| Maintenance estimate | **On-device only** | Weight + food logs are the most personal data in the app and are already local-only |
| Guardrail bypass | Allowed, with a **specific** warning and a stored acknowledgement | See §8 |
| Recomp as a separate goal kind | **No** — merged with maintain | See §5 |

---

## 3. Units — **built**

### The decision

- **Canonical storage: grams.** Body weight is stored in grams, everywhere, forever.
- **Display: kg or lb**, chosen from locale (US/LR/MM imperial, else metric) and
  overridable in Profile → Preferences.
- **Scope for v1: body weight only.** Volumes and food servings keep their existing
  units — the food side is already grams throughout and converting it touches every card.

### Why grams

`weightItem.weight` is currently **lbs**, displayed with one decimal
(`formatWeight` → `toFixed(1)`). Storing grams makes a 0.1 lb step exactly
representable (45.36 g) and keeps one integer-ish scale for everything. kg would also
work; grams was chosen because it is the finest granularity any of the display units need.

### Why this must come first

Converting later means every table, chart axis, validation range and label has to be
touched again. Doing it first means the goal and estimator tables are born in the right
unit.

### The rules

1. **One conversion module.** `helper/units.ts` (new) owns
   `toDisplayWeight(grams)`, `fromInputWeight(value, unit)`, unit labels, minimum and
   maximum input, step sizes and decimal places. **Nothing else may name a unit.**
2. **One-time migration.** Existing `weightItem` rows are lbs; multiply by 453.592 and
   store grams. This migration must be exact and verifiable — a mixed-unit table is
   worse than either unit alone.
3. **Granularity is derived, not constant.** `MIN_WEIGHT = 20` and `MAX_WEIGHT = 500` in
   `helper/weightSummary.ts` are lbs. Wheel step, tick step, valid range and decimal
   places all come from the display unit.
4. **`WEIGHT_UNIT` stops being exported as a constant.** It becomes a value from the
   units module, read per render.

### What was built

- `helper/units.ts` — the single conversion module: `toDisplay`, `toGrams`,
  `formatWeight`, `weightBounds`, `axisStep`/`axisPadding`/`axisMinSpan`, and
  `localeWeightUnit()` (via `Intl`, so no native dependency).
- `setting` table (key/value) + `db/queries/settings`, and `store/unitStore.ts` holding
  the current unit so one change repaints every screen.
- `drizzle/0022_robust_famine.sql` — creates `setting`.
- `drizzle/0023_weight_to_grams.sql` — converts existing `weightItem` rows:
  `ROUND(weight * 453.59237)`. Verified against a scratch database: 180.5 → 81873,
  200 → 90718, 0.1 → 45, and reading back gives the same pounds.
- Hydration in `app/_layout.tsx` after migrations: a stored preference wins; otherwise
  an install **with existing weigh-ins keeps pounds** (it predates units), and a fresh
  install takes the device locale.
- Updated: `weightSummary` (grams only, formatting removed), `WeightCard`,
  `weightHistory` (input converted to grams, bounds in the display unit), `foodHistory`,
  `WeightChartFull` and `WeightLogChartSmall` (convert once, then all chart constants are
  in the display unit).
- Unit toggle on the Goals page, saved on tap.

**Verified on device:** a weight logged as 180.5 kg stored 180 500 g, displayed as
"397.9 lb" with the unit set to lb and "180.5 kg" with it set to kg, and the preference
survived a relaunch.

### Known precision note

Displaying one decimal in kg and converting back drifts by up to ~0.1 lb
(180.5 lb → 81.9 kg → 180.6 lb). The stored grams never change; only a user who retypes
a displayed value could shift it.

### Files that assumed lbs

`helper/weightSummary.ts` (`WEIGHT_UNIT`, `MIN_WEIGHT`, `MAX_WEIGHT`, `formatWeight`),
`components/chartComponents/LogHistoryCharts/WeightChartFull.tsx` (hard-codes "lbs"),
`WeightLogChartSmall.tsx`, `components/UIComponents/Cards/WeightCard.tsx`,
`app/(tabs)/(Home)/weightHistory.tsx`, `foodHistory.tsx`.

---

## 4. What already exists

| Piece | State | Notes |
| --- | --- | --- |
| `weightItem` table | built | `id, timestamp, weight` — lbs, decimals |
| `nutritionGoal` table | built | insert-only history, latest row wins |
| `macroSplit` / `macroGoal` tables | **present, unused** | `macroSplit` is just `id + name`; `macroGoal` holds one macro target per profile |
| `WeightChartFull` `goal` prop | **declared, never used** | The chart was clearly meant to take a goal; it is the natural seam |
| `FoodLogChart` goal line | built | Dashed reference line via `showReferenceLine1` — the pattern to copy |
| `summarizeWeight` | built | Shared summary used by the Home card and the history screen |
| Height / sex / age / activity | **not stored anywhere** | Required for a formula prior (§7) |
| Client migrations | built | `useMigrations(db, migrations)` in `app/_layout.tsx`, SQL under `drizzle/` |

### Prior art: the original `Macrolet` project

The first iteration implemented macro profiles and a maintenance estimate. Its
primitives are sound and worth reusing; its guards are not.

- **`findMiddleMacro(x, y, mid)`** — linear interpolation between two checkpoints by
  calorie position, interpolating grams. Correct; keep it.
- **`autoCalorie`** — returns the string `"OUT OF BOUNDS"` outside the checkpoint range.
  Replace with clamping.
- **`MaintenanceCalories`** — two 7-day windows, `median` of each, giving
  `avg_intake − weightChange × 250`. The `250` is `3500 / 14`, i.e. the kcal-per-lb
  divided by the ~14 days between the two medians. The per-window **median** is a good
  choice; the lack of confidence, coverage requirements and guardrails is not.
- **`assignNutrition`** — derives carbs as `(cal − 4p − 9f) / 4`. This is the consistency
  trick from §9; it simply was not enforced in the checkpoint editor.

---

## 5. Goal kinds

```
kind          lose | gain | maintain
target_weight centre of the band (maintain) or the target (lose/gain)
tolerance     band half-width — maintain only
target_date   nullable; never set for maintain
started_at    when this goal began (drives the water-drop exclusion, §7)
```

### Why `maintain` and `recomp` are one kind

They differ in intent but **not in what the app can observe**. Maintain wants the trend
flat; recomp expects the trend flat while composition changes. Since the only signal the
app has is weight, judging them separately would mean the app reporting "no progress"
during a successful recomp. One kind, judged by one observable, is the honest shape.

The "recomp" half lives in two places instead of a goal type:

- **a higher protein floor** in the macro profile (the actual lever), and
- **a line of copy at goal setup**: body composition changes need resistance training,
  and the scale staying flat is the expected outcome, not failure.

### What maintain does

- **Target is a band**, centred on the current weight when created, default ±1 lb
  (configurable ±1–2). Reads as "stay between 179 and 181".
- **Calories = maintenance, flat.** No deficit. Someone who wants a deficit while
  training should choose *lose* with the gentlest pace — the app must not guess which
  half of the merged name they meant.
- **No target date field at all.** Not hidden — absent. There is no deadline to chase.
- **On-track is three states**: inside / above / below the band. If the trend sits
  outside for two consecutive weeks, the adaptive goal nudges calories. That is the whole
  maintenance algorithm.

### Why the goal carries `started_at`

The first ~14 days of a deficit are mostly glycogen and water, not fat (§6). The
exclusion window has to be relative to *this goal*, not a global date heuristic, so the
goal row records when it began.

---

## 5a. What is built (steps 2 and 3)

**Table** — `weightGoal`: `kind`, `target_weight` (grams), `tolerance` (grams, maintain
only), `target_date` (nullable), `started_at`, `created_at`. Insert-only; the newest row
is the active goal. Migration `0024`, verified applied on device.

**Rules encoded**

- `started_at` is inherited when only the numbers change and reset when the kind
  changes — the estimator's two-week exclusion must not restart on every edit.
  `helper/weightGoal.ts` holds this as a pure function, plus `isGoalReached`.
  Verified against real rows: a maintain goal started 15:30:50, switching to lose
  re-stamped it, and editing the lose target kept 15:34:57.
- `tolerance` is written as null for `lose`/`gain`, so a stale band cannot be read.
- `target_date` is never written for `maintain`.

**Screen** — `app/(tabs)/(profile)/weightGoal.tsx`, reached from a summary row on the
Goals page ("Weight goal · Maintain around 180 lb ±1 · Change").

It is a separate screen, not a card on Goals, because the target picker is a wheel and a
wheel is a `FlatList`: nesting one in a scrolling page is the exact failure the date
picker already had to be fixed for.

- Kind segmented control; the hint under it explains the choice, including that maintain
  covers recomp and the scale staying flat is the point.
- Target (or "Hold around", for maintain) via `TimeWheel`, seeded on the latest weigh-in
  and **snapped to the wheel's step** so the value shown is the value saved.
- Band selector for maintain (±1 and ±2 lb, or ±0.5 and ±1 kg).
- Optional target date for lose/gain, using the existing `DatePickerSheet`.
- Save and Remove actions; the screen has no flex spacer because one pushed the buttons
  under the tab bar.

Still not built: on-track status, projection, the estimator, and any gating of the date.

## 6. Trend weight

The single most important statistic in this feature.

**Everything downstream — maintenance, projections, on-track — uses the trend, never
the last weigh-in.** Comparing the first and last weigh-in is dominated by whatever water
the user happened to be holding on those two mornings. It is the most common way weight
apps mislead people.

Two forms, used for different jobs:

- **Weekly medians** — the unit of calculation for maintenance (§7). A median resists the
  one-off big meal the night before a weigh-in, which a mean does not.
- **Daily EMA** — a smoothed display line and a corroborating signal, α ≈ 0.1–0.2, or a
  regression slope for weekly data.

**Status:** trend lines are **free**. Whether the trend *weight* becomes the primary
displayed number is to be decided after seeing it implemented.

### What is built

`helper/weightTrend.ts` — pure, no database:

- **`emaTrend(points, alpha = 0.1)`** for drawing. The smoothing is applied **per day**,
  not per reading: `1 − (1 − α)^days`. Without that, someone weighing weekly sees a line
  that barely moves, because one 10% step is applied once a week instead of seven times.
- **`weeklyMedians(points)`** for arithmetic — one median per week, because that is the
  smallest unit not dominated by day-to-day noise. This is what the estimator will
  regress on.

**Readings are the primary series; the trend is the annotation.** An earlier version drew
it the other way round — trend solid, readings faint — which read as though the recorded
weight no longer mattered. The chart now draws every reading as a solid line, and the
trend as a dashed grey line on top. Copy: *"Readings move with water, salt and food in
transit. The dashed line is the trend."*

**Values are read by touching a point, not printed above every one.** Eight labels across
~250 px overlap into nonsense, so touching the plot shows the nearest reading in a box
(the value and its date) and enlarges that dot.

Three approaches were tried before this worked:

1. The fork's `pointerConfig` + `pointerLabelComponent` — never activated. The prop is not
   even in its TypeScript types, and the pointer only becomes a responder under conditions
   that a held touch did not satisfy here.
2. A `Pressable` as `customDataPoint` — the chart only makes a point touchable when the
   *item* has an `onPress`, and an item-level `onPress` still did not fire.
3. A transparent responder over the plot (`onStartShouldSetResponderCapture`) mapping
   `locationX` to the nearest point — this is what works.

The mapping uses the same geometry constants the chart is drawn with
(`AXIS_WIDTH = 41`, `INITIAL_SPACING = 34`, `SPACING = 30`). It tracks correctly but can
land one point off towards the ends; the enlarged dot makes the selection visible, so a
small drag corrects it.

The chart also regains x-axis dates, every other point, counting back from the newest so
the latest date stays on the axis.

### One row per reading, not per day

The weight query bucketed by day (`AVG` per day), so two weigh-ins on the same day became
a single averaged point and the History list showed days rather than logs. Three problems
followed from that one aggregation:

- `getWeightItems(from, to)` returns **raw rows**, which the chart and summary now use.
- `getAllWeightItems()` returns every log ever, which the History list uses — it is not
  limited to the visible window any more.
- The date control sits on the **selected day** rather than the window's exclusive end
  (it used to read tomorrow), and logging stamps that day with the current clock time, so
  a missed weigh-in can be filled in.

Verified on device: two logs on the same day drew as two points, an out-of-window log
appeared in History, and logging with the selector on 1 Nov wrote a row stamped
`2026-11-01`.

### Two defects this exposed

- Every data point label still printed the raw converted float
  (`395.9502228840401`) because the label was never switched to a formatter when weights
  became floats. Labels are now rounded to the unit's precision — whole pounds, one
  decimal for kilograms, because 2.2 lb between integer kilograms hides real movement.
- Three chart-spacing problems followed: labels clipped at the left edge, the x-axis
  truncating every date to "10…", and content wider than the chart so `scrollToEnd` cut
  the first point. Fixed with `spacing={30}`, `initialSpacing={34}` and **no x-axis
  date labels** — the window is in the header and every date is in the history list, so
  the axis was repeating information while losing it.
- The y-axis printed `40` for `400`: `yAxisLabelContainerStyle.width` was 28 and clipped
  the leading digit. Widened to 36.

### Still open

The week delta still reads first-vs-last (`"Up 2.0 lb over the week"`) while the trend
moved the other way — exactly the comparison §6 says not to trust. Switching that line to
the trend delta is a one-line change but it changes what the app asserts, so it is a
product decision, not a bug fix.

### Copy that matters

- Daily weight moves by ±2 lb with water, salt and food in transit; the line is the signal.
- The early drop is largely water — label the first two weeks as adjustment rather than
  counting it as fat lost.
- Around week 3–4 loss slows to the real fat/muscle rate. That is the model working, and
  it is exactly when people quit, so it deserves a sentence.

---

## 7. Maintenance estimate (Pro)

### Inputs

- weigh-ins, bucketed **by week**
- daily food logs, with exclusions (§10)
- height, sex, age, activity — **baseline only**

The profile fields exist to give a starting estimate. The copy must say what is true:
individual variation (metabolism, NEAT, absorption, logging error) dominates the formula,
which is why the app keeps re-estimating from actual data rather than trusting it.

### Method

1. **Weekly buckets.** One per week: `median(weigh-ins)`, sample count, spread. Days are
   never the unit of calculation — daily variance is too high.
2. **Weighted regression** through the weekly medians, weight ∝ sample count, so a week
   with four weigh-ins counts far more than a week with one. This is what makes "more
   logs = more accurate" true rather than aspirational.
3. **Slope in lb/week → maintenance:**

   ```
   maintenance = mean_intake − (slope_lb_per_week × 3500 / 7)
               = mean_intake − slope_lb_per_week × 500
   ```

   The old `250` was `3500 / 14`; expressing the slope per week makes the constant `500`
   and removes the assumption that two medians sit exactly 14 days apart.
4. **Hybrid confidence.** Weekly-median regression sets the number. The daily EMA slope
   corroborates it: agreement → high confidence, divergence → widen the range and
   downgrade, because a systematic disagreement usually means uneven data.

### Robustness

- Drop a week whose median deviates more than ~3× MAD from the fitted line (travel,
  illness) — count it as **missing**, not as evidence.
- **Skip the first 14 days** of the goal episode (`started_at`).
- Require ≥2 weeks with data to show anything, ≥3 for medium, ≥4 for high.

### Confidence

A function of weeks with data, median weigh-ins per week, logged-day coverage, and
residual scatter.

| Tier | Range | What it says |
| --- | --- | --- |
| low | ±250 kcal | "2 more weigh-ins and 2 more logged days this week" |
| medium | ±175 kcal | — |
| high | ±100 kcal | — |

**Downgrade, never disable.** Stale data keeps the last estimate, labelled: "based on
data ending 12 Oct — 3 weigh-ins since missed."

---

## 8. Adaptive calorie goal and guardrails

### Stored vs derived — the real question

This is not a yes/no about automation. If a deficit is defined as "20% below
maintenance", the calorie goal moves whenever maintenance does, whether or not anyone
calls it automatic. The only choice is what the user sees.

**Decision: a goal has a `source`.**

- `manual` — the number the user typed. It never moves by itself.
- `adaptive` — derived from maintenance + pace. It updates, but **only on a fixed weekly
  cadence**, never mid-day, and always with a visible changelog:
  *"maintenance 2,610 → 2,570; target 2,070 → 2,030."*

The changelog is what makes an adapting goal trustworthy instead of magic.

### The inversion that prevents dangerous advice

```
safe intake range → rate of change → projected date
```

never

```
target date → required rate → intake
```

With the second ordering, a user behind schedule gets a punitive target. With the first,
the goal is always inside a safe band and being behind simply moves the projected date.
**The date is information, not an instruction.**

### Guardrails

- **Deficit cap**: 20–25% of TDEE **or** 1% of bodyweight/week — whichever is *less*
  aggressive.
- **Absolute floor**: never below ~1,200 kcal, and never below estimated BMR.
- **Surplus cap**: +15–20% of TDEE, ~0.25–0.5% BW/week.
- **Day-to-day stability**: clamp changes to ±200 kcal against a 7-day average, so one
  bad week cannot swing the target.
- **Infeasible date**: show the earliest safe date instead of a number that gets them there.

### Bypass

Users can already set any calorie/macro number by hand, so the guardrails must be
bypassable — but visibly:

- one **specific** warning naming the actual risk ("below 1,200 kcal", "2.4 lb/week"),
- a stored acknowledgement tied to that goal row, so it is not re-nagged every launch.

---

## 9. Macro profiles (Pro)

The curve exists to answer "what macros does this calorie target correspond to?" It has
no consumer without the adaptive goal, which is why it is Pro.

### Shape

A profile holds **checkpoints** of `(calories, protein g, fat g)`; **carbs are derived**:
`carbs = (cal − 4p − 9f) / 4`.

Three typed numbers instead of four, and the checkpoint is consistent by construction —
no recomputing calories from all three and hoping they agree (which is what the original
editor did, despite `assignNutrition` already deriving carbs elsewhere).

### Validation, not correction

- calories strictly ascending; ≥1 checkpoint (flat curve); 2+ to interpolate
- derived carbs ≥ 0, else the checkpoint is impossible — reject at entry
- **protein and fat floors**, so a 1,200 kcal checkpoint cannot yield 10 g fat
- optional "fill sensible defaults" (protein ~1.8 g/kg, fat ~28% of calories, carbs
  remainder) so nobody starts from an empty form

### Interpolation

Linear in grams between neighbouring checkpoints — exactly `findMiddleMacro`. The only
change: **clamp outside the range**. Extrapolating a 1,200–2,000 curve up to 3,500
produces macros nobody intended, and the old `"OUT OF BOUNDS"` string is not a return
type.

### Consumption path

```
maintenance → calorie target → interpolate the profile → macro targets
```

One path, which is also why the profile cannot exist as a standalone free feature.

---

## 10. Day exclusions (Pro)

Incomplete logging looks like a deficit that never happened, so excluded days must not
reach the estimator.

- **Auto-detect**: a day is incomplete when its logged energy is far below the user's own
  28-day median, or when a gap sits between logged days.
- **Always reviewed, never silently applied.** A genuine fasting day looks identical to a
  forgotten log.
- Store `source: auto | user`, `excluded: bool`, and a `dismissed` flag so a reverted
  auto-exclusion is not re-detected on the next run.
- Manual additions and reverts are both allowed.

---

## 11. Free vs Pro

| | Free | Pro |
| --- | --- | --- |
| Log weight, see history | ✓ | ✓ |
| Trend line | ✓ | ✓ |
| Macro / calorie goal (manual) | ✓ | ✓ |
| Weight goal (a number / a band) | ✓ | ✓ |
| On-track status, projection, ETA | ✗ | ✓ |
| Target date / pace | ✗ (deferred, see §2) | ✓ |
| Maintenance estimate + confidence | ✗ | ✓ |
| Adaptive calorie goal | ✗ | ✓ |
| Day exclusions (auto + manual) | ✗ | ✓ |
| Macro profiles | ✗ | ✓ |
| Weekly review, plateau detection | ✗ | ✓ |

**Unresolved:** a free *maintain* goal is nearly empty, because the band status is the
entire feature — there is no projection or ETA being given away. Two options were
considered: keep the gate (consistent) or free the band status for maintain only. Not
decided.

The app ships **with no ads on the free tier**, which is the reason this line is drawn
where it is: convenience and algorithm are paid, logging and data are free.

---

## 12. UI surfaces

### Goals tab (`app/(tabs)/(profile)/goals.tsx`)

Currently: a calorie hero with the macro bar, three wheels (protein/carbs/fat), Apply.
Plus a **Weight goal** card:

- current weight (from `summarizeWeight`), target or band, delta
- target weight via the same `TimeWheel` component, opening at the current weight
- date field **only** for lose/gain
- pace control (Pro), date as an alternative control for users who want it
- clear / change goal

### Home weight card (`WeightCard`)

Inverts its current neutrality. With a goal it can say "down 3.2 of 8.0 lb" or
"inside your band", plus a thin progress track.

### Weight history (`weightHistory.tsx`)

Goal line on `WeightChartFull`, goal in the summary strip. The chart already accepts a
`goal` prop that is currently ignored — that is the seam.

**The domain must include the goal.** `yAxisOffset` and `maxValue` are derived purely
from `minWeight`/`maxWeight` today; a goal above the heaviest weigh-in would be drawn
off-canvas.

### `WeightLogChartSmall`

No line. At 120 px tall a reference line is noise; the card carries the sentence instead.

---

## 13. Mechanics and constraints

### Migrations

The client runs real Drizzle migrations at startup (`useMigrations` in
`app/_layout.tsx`). Adding a table means:

1. edit `db/schema.ts`
2. `npx drizzle-kit generate` → a new `drizzle/00XX_*.sql` + regenerated `migrations.js`
3. commit both

**Additive only** (`CREATE TABLE`, no rewrites) — a failed migration blocks the app at
the layout, and every existing install runs it on next launch.

This is *not* the backend's `db:push` path; that applies to the server database only.

### Chart library

`react-native-gifted-charts` (a fork of master). Reference lines are supported —
`showReferenceLine1` / `referenceLine1Position` / `referenceLine1Config` appear in its
`renderHorizSections` implementation and are already used by `FoodLogChart`.

### Where logic lives

- **Pure, database-free** functions in `helper/` — trend fitting, maintenance formula,
  interpolation, confidence, unit conversion. Testable in Node without SQLite, matching
  the repo's existing convention (`summarizeWeight` works this way).
- SQLite access stays in `db/queries/*`, read through `db/hooks/*`.

---

## 14. Build order

1. **Units** — canonical grams, `helper/units.ts`, migration of existing rows, every
   lbs assumption removed. Nothing else can start until this is done.
2. ~~**`weightGoal` table + hook**~~ — **built** (see §2a).
3. ~~**Weight goal editor**~~ — **built** as its own screen, reached from Goals (see §2a).
4. ~~**Trend weight**~~ — **built**: `helper/weightTrend.ts`, drawn on both charts.
   *Still to decide: whether the trend becomes the primary number.*
5. **Maintenance estimator** — pure functions first, then the confidence tiers, then the
   Pro surface.
6. **Adaptive calorie goal** — `source: manual|adaptive`, weekly cadence, changelog line.
7. **Macro profiles** — checkpoints, derived carbs, validation, interpolation with clamp.
8. **Exclusions** — auto-detect, review, revert.
9. **Guardrails + bypass** — warnings, stored acknowledgement, feasibility messaging.

Steps 1–3 are useful on their own and ship without any algorithm.

---

## 15. Open decisions

1. **Target date gate** — free or Pro. Deferred until it is built.
2. **Free maintain band status** — see §11; the free version is otherwise inert.
3. **Recomp as a distinct kind** — currently merged; revisit if a second progress signal
   (waist measurement) is ever built.
4. **Trend weight as the primary displayed number** — decide after step 4.
5. **`WeightChartFull`'s unused `goal` prop** — it types as `nutritionGoalGet` (a calorie
   goal) but is only used by the weight chart, which needs a weight goal. The type should
   change when it is first used.

---

## 16. Glossary

| Term | Meaning here |
| --- | --- |
| **Trend** | Smoothed weight: weekly medians for maths, EMA for display |
| **Maintenance** | Calories eaten to hold weight stable (TDEE) |
| **Band** | The acceptable weight range for a maintain goal |
| **Pace** | Rate of change as % bodyweight/week — the primary control |
| **Checkpoint** | One `(calories, protein, fat)` point on a macro profile |
| **Excluded day** | A day omitted from the estimate because logging was incomplete |
| **Adaptive goal** | A calorie goal derived from maintenance + pace, updated weekly |
