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

### The chart plots one point per day; History lists every log

These are deliberately different, because they answer different questions.

**The chart** uses the daily bucket (`useGetWeightList` → `getWeightHistory`, one row per
day with `AVG(weight)`). Two weigh-ins on the same day differ by water and food timing,
which is noise at the scale of a trend; the day's average is the honest single number for
that day. Plotting both made the line jitter for no information.

**History** uses `getAllWeightItems()` — every log ever, newest first, not limited to the
visible window. That is where you go to check what you actually typed on a given morning.

Two consequences that had to be fixed:

- The date control sits on the **selected day** rather than the window's exclusive end (it
  used to read tomorrow), and logging stamps that day with the current clock time, so a
  missed weigh-in can be filled in. Verified: logging with the selector on 1 Nov wrote a
  row stamped `2026-11-01`.
- Day buckets arrive as `"2026-10-27"` and `new Date()` reads that as UTC midnight, which
  is the previous day everywhere west of Greenwich — every chart label was a day early.
  `parseDayBucket` builds the date in local time instead.

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
- **Damp, don't skip, the first 14 days** of the goal episode. Excluding them would miss
  the case that matters most — starting a diet and gaining — so they are included at
  `0.4 → 1.0` weight over the fortnight. In the first two weeks that mostly reads as a
  smaller effective sample; once the episode is a month old it stops the opening water
  swing from dragging on the regression.
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

**The profile is a table, not a store.** It was first written as a zustand store over the
`setting` key/value table — no migration, synchronous reads. That was wrong for data an
algorithm depends on: a store needs hydrating, and hydration was only wired into the two
profile screens, so the estimator would have read an empty profile and silently dropped
its prior. It is now a `profile` table (singleton row) read through a TanStack query, which
fetches on mount for every consumer. Migration `0026` creates the table and carries any
values already stored as settings into it.

### As built (`helper/maintenance.ts`)

**The headline blends the three windows ½ : ⅓ : ⅕** rather than taking the widest fit. A
single 56-day regression cannot turn quickly — six weeks of losing outweighs two weeks of
gaining inside one straight line, and a fixture of exactly that case lagged a real
reversal by ~900 kcal.

**Outlier removal is iterative and floored.** Drop the worst week, refit, look again (twice
at most). The threshold is `max(0.4 kg, min(3 × MAD, 1.5 kg))`: 3 × MAD is the right shape
but the wrong scale on four or five buckets, where one wild week inflates the MAD enough to
hide itself, and on a straight line the MAD collapses to zero and a pure ratio discards a
legitimate week.

**The prior blends in below 0.5 confidence**, proportionally, so nothing jumps:
`t = c / 0.5`, `estimate = t·data + (1−t)·prior`. Above 0.5 the prior contributes nothing.

**The target moves at most ±150 / ±250 / ±350** depending on episode age and tier, with a
75 kcal deadband (`nextCalorieGoal`). The estimate may swing; what a person eats from
should not.

Fixtures in `scripts/maintenance-fixtures.ts` (`node_modules/.bin/tsx scripts/maintenance-fixtures.ts`) cover: steady loss (recovers 2,760 from −0.6 kg/week at 2,100
kcal), **the early gain** (2,300 kcal, +0.35 kg/week over a fortnight → 1,916), a reversal
after six weeks of losing (recent data leads: 2,259), sparse data, a travel week (dropped,
back to 2,758), and no data at all. The same code run against the device's real 44-reading
series produced a flat slope, 0.118 kg residual scatter, and high confidence.

### The surface (step 5 complete)

A **Maintenance** row on Goals — `2,438 ± 250 kcal · prior` — opening a detail screen with
the number, the range, what the tier means in words, the four things that went into it
(average intake, weight change per week, days logged, weigh-ins), and the estimator's own
notes. The prior share is shown, so a profile-derived figure can never look like a
measurement.

**Gated as Pro.** The Goals row says `Pro · how many calories you actually burn`, the
detail screen replaces the numbers with an explanation, the Adaptive option is disabled, and
the weekly job refuses to run for a lapsed subscription — so a lapsed user keeps their last
adaptive number but it stops moving.

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

### Adaptive goal — as built (step 6)

`nutritionGoal` gained `source` (`manual | adaptive`) and `maintenance`. The table is
insert-only, so an adaptive update is simply a new row and the changelog *is* the history —
no separate audit table.

- `helper/calorieTarget.ts` — safe band → rate → target, with the deficit capped at whichever
  of 25 % of maintenance or 1 % of bodyweight per week binds first, a floor at
  `max(1200, BMR)`, and `projectedDate` reporting where the safe rate lands instead of
  honouring an impossible date.
- `helper/adaptiveGoal.ts` — the weekly cadence (7 days from the row's timestamp), macro
  scaling that preserves the split, and the changelog line.
- `db/hooks/goals/useAdaptiveGoal.ts` — runs from the Goals screen, because a local-first app
  has no scheduler that survives being closed. Guarded by the row timestamp, so opening the
  screen repeatedly is free.
- The card shows `Manual | Adaptive` and, when adaptive, the last change:
  `target 2600 → 2450 (-150) · maintenance 3956 → 2438`.

**Two defects this step exposed.** The `calories` column was never written — the app derived
it from macros and left the column at 0, which every new consumer read as "target 0". And
the estimator happily produced a maintenance from **two logged days** (3,956 kcal). It now
withholds the data estimate below seven logged days in 28 and lets the profile prior answer,
and coverage caps the confidence score so plentiful weigh-ins cannot outvote a thin food
log.

## 9. Macro profiles (Pro)

The curve exists to answer "what macros does this calorie target correspond to?" It has
no consumer without the adaptive goal, which is why it is Pro.

### As built (curve; storage and editor still to come)

**The profile is a pure mapping: calories in, macros out.** It has no opinion about whether
the target is sensible — the clamp belongs to the maintenance algorithm, not the curve. A
900 kcal target gets a 900 kcal answer.

- Below the lowest checkpoint it **interpolates**, which is why a profile can be anchored at
  `(0, 0, 0, 0)`: the curve is then defined at every calorie level with no special case.
- Above the highest checkpoint it **holds**, like a fan at full speed.
- Validation allows the origin checkpoint (only with zero macros) and rejects the rest as
  before: negative carbs, protein and fat floors, duplicate calorie levels.

Worked example, entered as three checkpoints and verified against the engine:

| Target | Output |
| --- | --- |
| 900 | 91 p / 34 f / 57 c |
| 1,580 | 160 p / 60 f / 100 c |
| 1,900 | 160 p / 69 f / 160 c |
| 2,650 | 160 p / 90 f / 300 c |
| 3,000 | held at 160 p / 90 f / 300 c |

Deriving carbs from the interpolated calorie target is algebraically identical to
interpolating carbs directly, whenever the endpoints are self-consistent — so the
three-argument mental model and the stored `(calories, protein, fat)` agree by construction.

**Defaults are generated, not hard-coded.** Each preset is derived from the user's weight and
height and **regenerated weekly** when the adaptive job runs, so the fat and protein slopes
track the body they belong to. Custom profiles are hand-built and never regenerated.

**Arbitrary checkpoints per profile, and multiple profiles per user** (muscle gain, fat
loss…), one active at a time.

**Adding a checkpoint:** the user picks a target calorie for it, adjusts protein / fat /
carbs until they hit that calorie (or close enough — close is shown, not enforced), and
confirms. It is appended to the profile.

**Snapshots, not regeneration.** A preset is written once, when it is added, from the
user's weight and height. Editing it therefore cannot be silently overwritten a week later;
a stored formula would have made that guaranteed. Regenerating is an explicit action.

**The height-aware cap.** Above a BMI of 35 the extra mass is not treated as requiring more
protein or fat, so a 250 lb person at 5'2" gets a lower figure than 250 lb at 6'4". Rails at
150–320 lb keep an extreme frame from producing an absurd cap, and a missing height falls
back to the old flat 220 lb.

**The chart is a scrubber, not a picture.** Tapping or dragging draws a vertical line that
follows the finger, with a dot on each macro line in that macro's colour and a tooltip
naming the calories and grams at that level; releasing snaps the line back to the right
edge. The x axis starts at zero so the fan visibly converges on the point all three lines
share — the origin checkpoint earning its place a second time.



## 10. Day exclusions (Pro) — **core built**

`helper/intakeDays.ts` decides which logged days count. Two rules, in this order:

1. **What the user said wins.** A day they include or exclude is never re-decided.
2. **Half-logged days drop automatically** — below 40 % of the median day's calories, or
   below 40 % of its item count. A partial Tuesday is not a 700 kcal Tuesday, and left in it
   pulls maintenance down with it.

A day with nothing logged is "not logged", not a day of zero intake. The baseline is built
only from days the user has not excluded, so dropping one unusual day does not shift the
"usual" and start excluding ordinary ones.

Overrides live in `intakeDayOverride` (migration `0028`), keyed by local `YYYY-MM-DD`. The
Maintenance screen lists the last fortnight with a tap to cycle a day: counted → dropped →
back to automatic. Excluded days are marked, never silently removed.

**Gated as Pro**, with the rest of the algorithm. "Looks half-logged" is decided by calories
and item count only — meal timing varies too much between people to be a signal.

## 10a. Original spec



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

**The chart is now custom, drawn with Skia** (`WeightChart.tsx`), replacing the
`react-native-gifted-charts` version. Two reasons:

1. **That library's x-axis is an index, not a time scale.** Points sit at uniform
   `spacing`, so an 18-day gap rendered the same width as a one-day gap — in a feature
   built around weighing in irregularly. `helper/weightChartScale.ts` now maps time to x,
   so gaps are visible.
2. **The goal line, the maintain band and a projection are shapes here**, not a fight
   with a fork whose `pointerLabelComponent` is missing from its own types and whose
   pointer API never activated.

Geometry lives in `helper/weightChartScale.ts` and is pure: `timeDomain`, `timeToX`,
`valueDomain` (with a minimum span so a 2 lb change is not stretched across the plot),
`niceTicks`, `tickDecimals`, `labelIndices`, `nearestPointIndex`. Tested in Node.

`WeightChart` takes `weightData` (grams) and an optional `goal` of
`{ targetWeight, tolerance }` in grams — the band is drawn when a tolerance is present,
which is what a maintain goal needs. **The goal is not wired yet**; the screen does not
pass it, and that is step 5's job.

**The axis is padded at both ends.** `valueDomain` takes `{ minSpan, pad }` and snaps
*outward* to whole tick steps, so the lowest reading never sits on the floor. Measured:

| Data | Axis | Air below / above |
| --- | --- | --- |
| 396.1–398.5 lb | 385–410 | 11.1 / 11.5 lb |
| 380–410 lb | 370–420 | 10.0 / 10.0 lb |
| 179.6–180.8 kg | 172.5–187.5 | 7.1 / 6.7 kg |

`axisMinSpan` is deliberately small (4 lb / 2 kg): an earlier version combined a 20 lb
floor with the padding and stretched a 2.5 lb change across 50 lb of axis. The headroom
comes from `axisPadding` (10 lb / 5 kg), which is the same number the library chart used.

**The line is straight, not smoothed.** A Catmull-Rom curve overshoots between points:
two readings either side of a low can produce a curve that dips below both of them,
drawing a weight nobody weighed. On a chart whose job is fidelity to measurements that is
a lie told for elegance, so segments are linear.

**The trend is the bold line and the readings are the faint one.** The v1 chart had this
inverted — a heavy 3 pt reading line with a grey dashed trend — so the eye landed on the
noise instead of the direction. Readings are now 1.5 pt `primary_inactive`; the trend is
3 pt `primary` with a soft gradient fill beneath it. Rings appear only while there are ≤ 7
marks.

**A sparse value axis: three labels over hairlines.** Removing the axis entirely left the
plot with no visible scale, which is fine for a sparkline and wrong for a chart someone is
supposed to read. Three labels (bottom, middle, top) at `rgba(46,34,28,0.06)` rules anchor
the scale without turning the plot back into graph paper. The goal is excluded from the
percentile clipping, or the target line falls off the bottom of the chart.

**The value box is drawn *inside* the canvas, and points at its reading.** On Android a
Skia canvas is a `SurfaceView`: it occupies its own layer and covers any React view placed
over it, so a normal `<View>` tooltip rendered perfectly and was completely invisible.

It is now a `RoundedRect` + notch + two `SkText`s, **always above the held dot** and centred
on it. It does not flip below near the top of the plot — below the point is where the axis
and the fill are, so a flipped box covered the thing it was describing. The
plot reserves `CHART_LAYOUT.top = 76` so a 48 pt box plus its 24 pt gap fits above the
highest point — without that headroom the box was pinned to the canvas edge and the gap
had nowhere to go. The notch is dropped when there is no room, and the held marker is
drawn last so it can never be hidden by the box. Styling follows the app: white card, 10 pt radius, `colors.light_gray`
border, black value in Metropolis SemiBold **17**, grey date in Metropolis Regular 12.

**The chart band is full-bleed**, matching the calorie card on Home: no side margin, no
radius, `paddingVertical` only. The controls inside keep their 20 pt inset; the canvas does
not, so the plot gains roughly 28 % more width than it had inside an inset card. Axis and
date labels clamp 2 pt inside the canvas edges so nothing touches the screen border.

**The readout always carries a tenth**, whatever the unit, while the axis ticks and the
goal label stay coarse. It is the one place the extra area earns its keep: the axis is for
orienting, the readout is for the number.

The chart still shows dates for every other point and reads a point on touch, but the
touch mapping is now exact rather than one point off, because it goes through the same
time scale the dots were placed with.

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

## 15. Decisions (settled)

1. **Target date / pace is Pro** — it exists to feed the algorithm, and the algorithm is the
   paid part. The `target_date` column stays available to the estimator regardless; what is
   gated is the ability to set one.
2. **Free maintain-goal status** — see §15a. Still the one open question.
3. **Recomp stays merged into maintain.** They ask the same question of the data — "is my
   weight stable" — and nothing in this app measures body composition. Revisit only if a
   second progress signal (waist circumference) is ever added.
4. **Trend weight is the primary number** on the weight card. The latest weigh-in becomes a
   secondary line ("last weighed 184.2, yesterday"), because the trend is the number that
   answers "how am I doing" and the raw reading answers "what did the scale say".
5. **The home sparkline may curve.** It is a rough shape, not a measurement; the history
   chart is linear because it is read precisely.
6. **Goal history on the chart stays current-goal-only**, with an **achievement marker** —
   see §15b.

## 15a. The free maintain-goal question

The problem: a maintain goal's entire value is "am I inside my band?" — but on-track status
is a Pro line in §11. So a free user configures a band and gets no feedback on it, which
risks reading as broken rather than as paid.

| Option | Free gets | Risk |
| --- | --- | --- |
| **A. Keep the gate** | the goal and the band, drawn; no status | consistent, but the free maintain goal is inert — the reason this was flagged |
| **B. Free the status** | "In band" / "3 lb above your band" | consistent with "data is free, algorithm is paid" — the status is a comparison, the projection is the algorithm |
| **C. Coarse free, precise Pro** | "outside your band" | free gets something, Pro gets "2.1 lb above for 6 days, back in band by 12 Nov" |

**Recommendation: B, with C as the shape.** Where you are against your own target is data,
not algorithm; the projection, the ETA and the on-track judgement stay Pro. B also has a
safety argument: maintenance is where rebound gets caught, and hiding the one signal that
shows it is the wrong thing to charge for.

## 15b. Achievement markers

When a goal is reached, the chart should show it: a goal set for 11 Nov, hit on 8 Nov, gets
a marker on 8 Nov.

**Derive, don't store.** For each goal episode `[started_at, next goal's started_at)`, scan
the weigh-ins (or the trend, for stability) and take the **first** crossing into the target —
for a lose goal, the first day at or below target; for a gain goal, at or above; for a
maintain goal, entering the tolerance band. No column, no migration, and — the reason it
wins — it stays correct when the user retro-edits or deletes a weigh-in. A stored
`achieved_at` would survive an edit that un-achieves it, which is a subtle lie on the chart.

Cost is a scan of the goal's own period, which is already loaded for the chart.

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

## Long-range views (1W · 1M · 3M · 1Y · All)

The chart was built for eight days. Beyond that the problem stops being rendering and
becomes *what one mark means*.

**The span chooses the bucket.** The rule is that the screen holds roughly 30–60 marks:
fewer and the shape is guesswork, more and the marks stop being readable.

**Every range is daily.** Weekly and monthly buckets existed to stop the marks crowding,
but the readings are now a faint line with no markers, so the noise reads as texture
rather than as a caterpillar. Aggregation was protecting the reader from something the
design already handles, at the cost of showing summaries where the actual measurements
were available.

| Range | Bucket | Typical marks | X labels |
| --- | --- | --- | --- |
| 1W | day | 7 | 10/29 |
| 1M | day | ~25 | 10/31 |
| 3M | day | ~80 | Nov |
| 1Y | day | ~300 | Nov, Mar, Jul |
| All | day | up to ~1800 (5-year cap) | 2021, 2023, 2025 |

Verified on device at the extremes: 309 daily points at 1Y and 1,583 at All both render
without a stall, and the trend stays legible as the one bold line through the noise.

`helper/weightRange.ts` owns this. `periodForDays` exists so a future free-form zoom can
ask for a span and get a sane bucket back.

**Bucket keys all emit a calendar day.** Day buckets are `"2026-11-02"`, weeks are the
Monday of that week (`weekday 0`, `-6 days`), months are the first (`start of month`).
One format means one parser and the chart can place a week exactly where it starts. `%W`
was tried and abandoned: its keys (`"2026-W44"`) cannot be parsed back into a date.

**Rings stop at 7 marks.** Beyond that they read as a caterpillar and hide the line they sit
on, so the line carries the shape and only the held point still gets a ring. With daily
points, only 1W qualifies.

**One encoding, chosen: `dots`.** Faint 1.5 pt readings with 10 pt rings while there are
≤ 7 marks, under a bold 3 pt trend. Four candidates were built and switched live — faint
line only, rings, range bars, and trend-only — and the rings won: they mark the days at
1W without crowding longer ranges, which have no rings at all. The others are deleted
along with the switcher.

**Gaps are bridged for a week, then broken.** With daily points, someone weighing weekly
would otherwise see the line shattered into confetti. The tolerance is in days
(`BRIDGE_DAYS`: 8 / 21 / 90), so a missed week still joins and a real pause breaks the
line — and the trend breaks with it. Joining months would invent continuity nobody
provided.

**The trend is a fixed half-life, not a fixed alpha.** Smoothing with a 14-day half-life
means "the trend" describes the same amount of time at 1W and at All. With a per-reading
alpha the same line meant a 6-day trend on one view and a 6-week one on another.

**The y-domain is percentile-clipped past ten points.** One message typed as 18 instead of
180 collapses a five-year view into a flat line at the top of the axis. Below ten points
percentiles are meaningless and the real extremes are kept, so nothing is hidden.

**Goals are drawn as steps.** Every `weightGoal` row holds from its `started_at` until the
next one begins, so a year shows 185 → 178 → a maintain band, rather than one horizontal
rule pretending the target never changed. Maintain goals draw their tolerance as a band.

**Range switches are prefetched, and never blank the card.** Two things were making the
card flash when the timeline changed: the query treated each window as a cold start, and
the summary swapped to "Loading…" while the next one ran. `weightHistoryQueryOptions`
(a single shared definition, so a prefetch can never key differently from the hook) sets
`placeholderData: keepPreviousData`, and the screen prefetches the other four windows in
an effect. Switching now paints the new range from cache — measured at 400 ms after the
tap, the card already reads "Down 1.4 lbs since Aug 7" rather than "Loading…".

`period` is in the query key. It was missing, so the same window bucketed differently
would have been served from the wrong cache entry.

**The summary adapts to the range.** 1W keeps "Down 1.4 lbs over the week"; longer ranges
say "Down 3.6 lbs since Aug 10" with "−0.3 lbs per week over 12 weeks · 41 weigh-ins".
Statements of fact, no on-track judgement. Dates gain a year when the window spans one.

**History is recent-20 plus "See all".** The card lists the last 20 logs; the button opens
`app/(tabs)/(Home)/weightLogs.tsx`, a virtualised `FlatList` of every log ever. The card's
`.map()` stops being a liability the day someone has a thousand weigh-ins.

**`weightItem` is indexed on `timestamp`** (migration `0025`). Every query is a range scan;
at five years of daily weigh-ins that was a full table scan each time.
