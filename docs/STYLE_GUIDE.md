# MacroletApp Style Guide

> Derived from the existing client styles. This guide is **descriptive first, prescriptive second**: every
> value below was read out of the shipping code, not invented. Where the codebase disagrees with itself,
> the guide states the dominant convention as "canonical" and records the exceptions in
> [§7 Drift & cleanup backlog](#7-drift--cleanup-backlog).

**Scope:** the React Native / Expo client in `MacroletApp` — `app/**` and `components/**`.
The Express backend has no UI styles and is out of scope.

**Method / audit basis**

| Metric | Value |
| --- | --- |
| Source files scanned (`app/**`, `components/**`, `.ts`/`.tsx`) | 130 |
| Files containing a style object | 112 |
| `StyleSheet.create` blocks | 110 |
| Style objects parsed (StyleSheet + inline `style={{…}}`) | 919 |
| Style declarations parsed | 2,104 |
| Files importing the theme (`@/theme`) | 81 |
| Files containing raw hex literals | 13 |
| SVG icon assets | 51 |

Styling is plain React Native `StyleSheet.create` plus inline `style={{…}}` objects. There is **no**
Tailwind/NativeWind, no styled-components, and no CSS file. The only centralised tokens live in
[`theme/`](../theme/index.ts):

- [`theme/colors.ts`](../theme/colors.ts) — 20 color tokens
- [`theme/typography.ts`](../theme/typography.ts) — 8 text styles
- [`components/UIComponents/Typography/Text.tsx`](../components/UIComponents/Typography/Text.tsx) — the `H1…H6` wrappers

There is **no spacing, radius, elevation, or sizing token file** — those values are literals everywhere.

---

## 1. Color

### 1.1 Palette

All 20 tokens from [`theme/colors.ts`](../theme/colors.ts), with the number of reference sites found in
`app/**` + `components/**`.

| Token | Hex | Refs | Role |
| --- | --- | --- | --- |
| `primary` | `#bb3800` | 106 | Brand rust. Primary CTA fill, active tab/step, links, inline emphasis, key data. |
| `white` | `#FFFFFF` | 78 | Card/sheet/input surface; text on `primary`. |
| `primary_bg` | `#F5E6E0` | 40 | Brand-tinted surface: pills, segmented controls, icon buttons, avatars, image placeholders. |
| `inactive` | `#938B87` | 29 | Muted text and icons; empty-state copy; unselected dropdown options. |
| `off_white` | `#F7F4F1` | 18 | App/page background and modal panel surface. |
| `carbs` | `#ff8c27` | 17 | Macro data color (carbs). |
| `protein` | `#e25e4d` | 16 | Macro data color (protein). |
| `fat` | `#ffcb1f` | 16 | Macro data color (fat). |
| `error` | `#D72424` | 16 | Error text, error borders, destructive affordances. |
| `medium_gray` | `#5B5252` | 15 | Secondary body text, metadata, author names, descriptions. |
| `light_gray` | `#C5C5C5` | 15 | Hairlines, dividers, chart axes/rules, sheet grab handle. |
| `black` | `#2E221C` | 11 | Default text color (applied by every `typography` token). |
| `dark_blue` | `#3A3980` | 9 | Info/neutral status ink (pairs with `light_blue`). |
| `light_blue` | `#E4E7F7` | 6 | Info/neutral status fill; creator/status pills. |
| `line_break` | `#CECECE` | 3 | Structural separators and outlines. |
| `dark_green` | `#265B20` | 3 | Positive status ink (pairs with `light_green`). |
| `primary_inactive` | `#D79A80` | 2 | Unselected brand ink (segmented control, radio). |
| `light_yellow` | `#F8F0CD` | 1 | Warning status fill (pairs with `dark_yellow`). |
| `dark_yellow` | `#A45D16` | 1 | Warning status ink. |
| `light_green` | `#E1F2CB` | 1 | Positive status fill. |

### 1.2 Semantic rules

1. **Backgrounds:** page/screen = `off_white`; anything sitting on the page = `white`; brand-tinted accents =
   `primary_bg`. Separation is achieved by the white-on-`off_white` contrast — **cards do not use shadows or
   borders** (see [§5](#5-elevation--shadows)).
2. **Text:** body/default = `black` (inherited from `typography`); secondary = `medium_gray`; muted, disabled and
   empty state = `inactive`; error = `error`; inverse (on `primary`) = `white`.
3. **Interaction:** the active/selected state is always `primary` (fill, ink, or border). The *unselected brand*
   state is `primary_inactive`, not an opacity.
4. **Status pairs:** status is expressed as a light fill + matching dark ink, and optionally a 1px border of the
   dark ink: `light_green`/`dark_green` (positive), `light_blue`/`dark_blue` (neutral/info),
   `light_yellow`/`dark_yellow` (warning/archived).
5. **Macro data colors are reserved.** `protein`, `carbs`, `fat` must only ever encode those macros, always in
   **P → C → F** order. Never use them as decorative UI accents.
6. **Import the token, never the hex.** `import { colors } from "@/theme";` is the only supported path
   (81 files do this). Raw hex/rgba/color-name literals are drift — 13 files contain them.

### 1.3 Macro / data-visualisation palette

| Channel | Token | Hex |
| --- | --- | --- |
| Protein | `colors.protein` | `#e25e4d` |
| Carbs | `colors.carbs` | `#ff8c27` |
| Fat | `colors.fat` | `#ffcb1f` |
| Calories / weight / primary series | `colors.primary` | `#bb3800` |
| Chart axis & rules | `colors.light_gray` | `#C5C5C5` |
| Rating star | *(no token — literal)* | `#FEC92D` |

The Skia arc chart uses a bespoke three-stop gradient (`#EE5B5B → #FFA658 → #FFE043`,
[`ArcChart.tsx:21-23`](../components/chartComponents/MacroCharts/ArcChart.tsx#L21-L23)) that is a near-miss of the
macro trio but is **not** tokenised. Treat it as legacy, or promote it to tokens before reuse.

### 1.4 Known deviations

- `"#333333"` is duplicated as the dropdown/recipe-nav label color in three files instead of a token.
- `shadowColor: "#000000"` (×8) and `"#D1BBB3"` (×1) are not tokens.
- `"rgba(0,0,0,0.5)"` is the modal backdrop in three files with no token.
- Placeholder/muted grays bypass the palette: `"#999"` (placeholder), `"#ddd"` (input label), `"#ccc"` (divider),
  `"#666"` / `"#fff"` (time-date selector), `ios_backgroundColor="#3e3e3e"` (switch).
- `borderLeftColor: "pink"` on the toast `info` variant, and `"red"` / `"grey"` in test screens and dead styles.

---

## 2. Typography

### 2.1 Families

| Alias | File | Weights used |
| --- | --- | --- |
| `GS-*` (General Sans) | `assets/fonts/general-sans/GeneralSans-Medium.otf` | Medium only |
| `Metro-*` (Metropolis) | `assets/fonts/Metropolis-{Regular,Medium,SemiBold,Bold}.ttf` | Regular, Medium, SemiBold, Bold |

Fonts are registered once in [`app/_layout.tsx:30-36`](../app/_layout.tsx#L30-L36) with `useFonts`. General Sans
ships 12 files on disk but **only `GS-Medium` is loaded** — there is no `GS-Regular`/`GS-Bold` alias, so adding one
means adding a `require` there.

**Two families, two jobs:** General Sans = display/headings (H1, H2). Metropolis = everything else (H3–H6).

### 2.2 Scale

Defined in [`theme/typography.ts`](../theme/typography.ts) and exposed as components in
[`Text.tsx`](../components/UIComponents/Typography/Text.tsx). Usage counts are opening tags across
`app/**` + `components/**`.

| Token | Component | Family | Size | Default color | Uses | Intended role |
| --- | --- | --- | --- | --- | --- | --- |
| `h1` | `<H1>` | GS-Medium | 26 | `black` | 37 | Screen and chart-section titles ("Calorie Intake"), empty states, hero numbers. |
| `h2` | `<H2>` | GS-Medium | 22 | `black` | 29 | Secondary page titles, entity names (recipe/profile), large stats. |
| `h3` | `<H3>` | Metro-Medium | 18 | `black` | 33 | Card titles, dropdown labels, date buttons, modal units, stat blocks. |
| `h4` | `<H4>` | Metro-SemiBold | 17 | `black` | 73 | Default emphasis: button labels, row labels, list headers, macro labels. |
| `h4_Bold` | `<H4_Bold>` | Metro-Bold | 17 | `black` | 1 | Reserved; effectively unused — prefer `<H4>`. |
| `h5` | `<H5>` | Metro-Regular | 16 | `black` | 64 | Body copy, values and units, input text, inline/secondary buttons. |
| `h5_SemiBold` | `<H5_SemiBold>` | Metro-SemiBold | 16 | `black` | 47 | Emphasised labels, toast text, radio labels, selected-state copy. |
| `h6` | `<H6>` | Metro-Regular | 14 | `black` | 45 | Captions, hints, metadata, error messages, macro values. |

### 2.3 Rules

1. **Always render text through `H1…H6`.** Only 3 files import React Native's `Text`; 9 inline `fontSize`
   declarations exist in the entire app. There is no reason to add a tenth.
2. **Never set `fontFamily` outside `theme/typography.ts`.** Today it appears in exactly one file — keep it that way.
3. **Recolor, never resize.** `<H4 style={{ color: colors.medium_gray }}>` is the pattern; passing `fontSize`
   or `fontWeight` breaks the scale.
4. `props.style` is merged **after** the token, so a passed `color` wins. That is intentional and is how
   variants are built.
5. Use the semantic level, not the visual size: a caption is `<H6>` even if you want it to look bigger.
6. `lineHeight` is set in exactly one place ([`RadioButton.tsx`](../components/UIComponents/Buttons/RadioButton.tsx)
   description text, `lineHeight: 20`). Multi-line body copy should get an explicit `lineHeight` of
   `1.3–1.4 × fontSize` until a token exists.

### 2.4 Canvas typography (Skia)

[`context/FontProvider.tsx`](../context/FontProvider.tsx) mirrors three text styles for Skia charts:
`h1` = General Sans Medium @ 26, `h2` = General Sans Medium @ 22, `h5` = Metropolis Regular @ 16.
**These are hardcoded duplicates** — if the type scale changes, this file must change in lockstep.

---

## 3. Spacing

There is no spacing token file; the scale below was derived from every `gap`, `padding*` and `margin*`
declaration in the codebase (total occurrences in parentheses).

### 3.1 The scale

Base unit **4**.

| Step | px | Use | Occurrences |
| --- | --- | --- | --- |
| `space-0` | 0 | reset | 18 |
| `space-1` | 2 | tight icon/text pairing | 6 |
| `space-2` | 4 | inline gaps, dense chip internals | 33 |
| `space-3` | 8 | **default gap** between stacked/related elements | 75 |
| `space-4` | 10 | legend/label gaps, compact padding | 42 |
| `space-5` | 12 | **default inner padding**, compact list rows | 81 |
| `space-6` | 16 | card padding, sheet footer padding | 24 |
| `space-7` | 20 | **default screen gutter** and section spacing | 123 |
| `space-8` | 24 | wide gutters, header padding | 15 |
| `space-9` | 32 / 40 / 45 / 50 / 60 | occasional large separators, empty states | ~15 |

### 3.2 Rules

1. **Gutter:** screen content uses `paddingHorizontal: 20` (19 sites) — the single most common padding in the app.
2. **Card padding:** `16` for content cards, `12` for compact cards/rows. Vertical rhythm inside a card uses `gap`,
   not margins: `gap: 8` (66 sites) or `gap: 20` (30 sites).
3. **Prefer `gap` over `margin`.** `gap` is the most-used layout property after `flexDirection`; margin is
   reserved for one-sided nudges (`marginBottom: 20` between sections, `marginTop: 1–14` for optical fixes).
4. **Section spacing:** `marginBottom: 20` under a section (12 sites); `paddingBottom: 40` at the end of a
   scrollable list to clear the centre FAB.
5. Off-scale values (`5`, `7`, `9`, `13`, `14`, `18`, `28`, `35`) exist but are always local optical fixes —
   do not promote them to a pattern.
6. `marginTop: 1` on error text is intentional (pulls the message tight to its field).

---

## 4. Radius

No radius tokens exist. Observed distribution (all `borderRadius`/corner-radius declarations):

| Radius | Count | Use |
| --- | --- | --- |
| **8** | 86 | **Canonical.** Cards, inputs, dropdown surfaces, buttons on `primary_bg`, sheet edges, images. |
| **10** | 23 | Larger controls and overlays: segmented control, dropdown selector, expandable card, chart images. |
| 15 / 20 / 22 / 25 | 16 | Pills and chips. `22` = inline `SubButton`; `25` = status/comment pills; `15` = 30×30 avatars. |
| 50 / 60 | 5 | Perfect circles: `IconButton` (50×50, r50), the two centre-FAB circles. |
| 2 / 4 / 7 / 12 / 30 | ~15 | One-offs: 2px grab handle, 4px macro dots, 7px legacy button base, 12px radio cards, 30px step dots. |

Rules:

1. Default to **8** for any new surface.
2. Use **10** only when the element is large enough that r8 looks sharp (≥48px tall overlay/selector).
3. Radius **50** means a circle — set `width === height === borderRadius`.
4. Never compute a radius from a font size (two legacy sites do: `typography.h5_SemiBold.fontSize - 1` / `- 4`).
5. Nested surfaces use `outer − inner` (e.g. a 10 card containing an 8 image) to avoid corner artifacts.

---

## 5. Elevation & shadows

Shadows are **rare and deliberately so**. Cards are flat; only floating chrome casts.

**Canonical floating shadow** (toast, tab bar):

```ts
{
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.8,
  shadowRadius: 2,
  elevation: 5,               // Android
  shadowColor: "#D1BBB3",     // token wanted: a warm neutral; not in the palette yet
}
```

| Level | Recipe | Used by |
| --- | --- | --- |
| 1 | `elevation: 1`, `shadowColor: "#000000"` | Resting nav strips — no visible effect (no offset/opacity/radius; see drift #16) |
| 2 | `elevation: 2`, `shadowColor` | Selected segment in the segmented radio control |
| 5 | the canonical recipe above | Tab bar, toast, nav bars in elevated state |
| 20 | `elevation: 20`, plus `position: "absolute"`, `zIndex: 999` | Dropdown overlay (comment in code: iOS uses `zIndex`, Android needs `elevation`) |

Rules:

1. **Cards, inputs, list rows and buttons are flat** — no shadow, no border.
2. If something floats, use the canonical recipe; do not invent offsets.
3. Always pair `shadow*` (iOS) with `elevation` (Android); one without the other is a bug.
4. `shadowColor` is currently a literal in 9 files — promote to a token (`shadow` / `shadowWarm`) when the
   palette is next touched.

---

## 6. Layout, screens & icons

### 6.1 Screen scaffold

```
SafeAreaProvider (app/_layout.tsx)
└── Tabs (sceneStyle.backgroundColor = colors.off_white)   ← page background
    └── Screen
        ├── KeyboardAware        ← pattern A: keyboard-safe ScrollView (~most screens)
        │   ├── HeaderSimple / HeaderCore / TopNav
        │   └── content          ← paddingHorizontal: 20, paddingBottom: 40
        └── View { flex: 1 }     ← pattern B: plain container (discover, foodItem, FindFood, preview)
```

- Page background is set for all tabs via `sceneStyle` in [`app/(tabs)/_layout.tsx`](../app/(tabs)/_layout.tsx);
  `(logs)` and `(profile)` repeat it on their nested `Stack`, `(Home)` and `(discover)` do not (see drift #4).
  Screens themselves do not re-declare it.
- Content wrapper: `paddingHorizontal: 20`; end-of-list `paddingBottom: 40` to clear the centre FAB.
- [`KeyboardAware`](../components/UIComponents/KeyboardAware/KeyboardAware.tsx) is the standard scroll container
  (`flexGrow: 1`, `minHeight: 700`, nested scrolling, keyboard-persist taps). On iOS it uses `behavior="padding"`,
  on Android `"height"`, toggled by keyboard events.
- **Safe areas are handled only by** [`HeaderCore`](../components/navComponents/HeaderCore.tsx), which applies
  `paddingTop: insets.top + 10` and horizontal insets. The tab bar is an **in-flow** 88px white row with a fixed
  `paddingBottom: 20` and no inset awareness, and the centre FAB protrudes `marginTop: -40` into content. Only
  `logs.tsx` reserves that 40px. See the cleanup backlog.

### 6.2 Navigation chrome

**Tab bar** ([`MyTabBar.tsx`](../components/navComponents/MyTabBar.tsx)) — in-flow, **not** floating, no shadow:

```ts
{ flexDirection: "row", paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20,
  justifyContent: "space-around", backgroundColor: colors.white }   // 20 + 48 + 20 = 88px
```

- Four tabs, `height: 48`, widths `65 / 68 / 68 / 65` (Home, Discover, Logs, Profile), spaced by `space-around`.
- Icon 28 × 28 on top (`primary` when focused, `inactive` otherwise), label below: focused `<H5_SemiBold color={primary}>`,
  unfocused `<H5 color={inactive}>`. Focus is positional (`state.index === index`, hardcoded 0–3).
- Centre action: 60 × 60 white circle (`radius 60`, `marginTop: -40`) containing a 50 × 50 `primary` circle
  (`radius 50`) with the 36 × 36 plus icon in white.
- Radial menu when open: `option` = `position: "absolute"`, `bottom: 70`, row, `gap: 8`, `height: 50`,
  `elevation: 5`; buttons `141 × 50`, `radius 8`, white; the canonical floating shadow is applied only while open.
  Rows translate to `-10 / -80 / -150`.

**Headers**

| Component | Recipe |
| --- | --- |
| [`HeaderCore`](../components/navComponents/HeaderCore.tsx) | Only inset-aware header: `off_white`, `paddingTop: insets.top + 10`, horizontal insets, `gap: 10`; title row `paddingHorizontal: 20`, `space-between`; fixed `width: 70` side slots; title `<H1>`; optional logo below title |
| [`HeaderSimple`](../components/navComponents/HeaderSimple.tsx) | Back button `50 × 70`, chevron-left 24 × 24 in `primary`; `back` defaults to `true` |
| [`HeaderFood`](../components/navComponents/HeaderFood.tsx) | Back `50 × 70`; right slot `50 × 70`, `justifyContent: "flex-end"`; actions `<H4 color={primary}>` ("Edit"/"Cancel") |

**Horizontal nav strips** — four near-duplicates sharing one visual grammar: 1px `light_gray` bottom border,
an active underline `height: 3`, `flex: 1` — in all three implementations the underline is `colors.error`
(semantically wrong; see drift #8), label `<H5_SemiBold>` (TopNav/RecipeNav, `marginBottom: 10`) or `<H6>`
(NavSelector, `marginBottom: 4`), active ink `black`/`primary`, inactive `inactive`.

| Component | Options | Distribution | Horizontal inset |
| --- | --- | --- | --- |
| [`TopNav`](../components/navComponents/TopNav.tsx) | injected | `flex: 1` + `space-around` | `35` |
| [`NavSelector`](../components/navComponents/NavSelector.tsx) | Recent / Recipes / Barcode / Quick Add | `space-around`, `gap: 6` per option, icons 28 × 28 | `0` |
| [`RecipeNav`](../components/recipeComponents/RecipeNav.tsx) | Overview / Ingredients / Directions / Reviews | hardcoded `gap: 65` | `20` |

**Step indicator** ([`StepIndicator.tsx`](../components/recipeComponents/StepIndicator.tsx)):
circles 33 × 33, `borderRadius: 30`, `borderWidth: 1` — active = `primary_bg` fill + `primary` border, inactive =
white on white; completed = 28 × 28 `primary` badge with a check; otherwise the step number as `<H5>`
(`primary` when active, else `black`). Connectors are `height: 1`, `light_gray`, width `58` (46 before the last
step). Circle row `paddingLeft: 30`, `gap: 10`; label row `paddingHorizontal: 20`, `space-between`, `<H6>`.

### 6.3 Icons

- 51 SVGs live in `assets/svg/`, imported **as components** via `react-native-svg-transformer`
  ([`metro.config.js`](../metro.config.js), typed by [`declerations.d.ts`](../declerations.d.ts)).
  There is no icon font and no `@expo/vector-icons` usage.
- Icons are colored through the `color` prop, which works because the SVG sources stroke/fill with `currentColor`.
  Some legacy assets hardcode their own colors (e.g. `plus.svg` uses `#B7410E` + white) and therefore ignore the prop.
- **Sizes:** `24` inline (input/adornment), `28` in tabs and toasts, `50` for the logo, `110` for empty-state art,
  `164` for step images. Set both `width` and `height`; never rely on the SVG's intrinsic size.
- Active/selected icon = `colors.primary`; inactive = `colors.inactive`. That mapping is used for every tab.

### 6.4 Fixed dimensions worth knowing

| Element | Size |
| --- | --- |
| Tab bar | in-flow, 88 tall (20 + 48 + 20), white, no shadow |
| Tab item | `height: 48`, width 65–68; icon 28 × 28 |
| Centre FAB | 60 × 60 white circle + 50 × 50 `primary` button, `marginTop: -40` |
| FAB menu button | 141 × 50, radius 8 |
| Header side slot | `width: 70`; back button `50 × 70` |
| Step circle | 33 × 33, `borderWidth: 1`; completed badge 28 × 28 |
| Icon button | 50 × 50, radius 50 |
| Input | `minHeight: 50`, radius 8, full width |
| Numeric input box | 70 × 46 (prep/cook setter) |
| Toast | 350 × 50, radius 8 |
| Prep/Cook summary bar | full width × 80, radius 8 |
| Macro dot (legend) | 10 × 10, radius 10 |
| Macro progress band | height 15 (default) / 12 in compact cards |
| Sheet grab handle | 60 × 5, radius 2 |

---

## 7. Components

Navigation chrome (tab bar, headers, nav strips, step indicator) is covered in
[§6.2](#62-navigation-chrome).

### 7.1 Buttons

Source: [`components/UIComponents/Buttons/`](../components/UIComponents/Buttons).

**Base geometry** (`styles.button`, shared by primary/secondary/add):

```ts
{ padding: 15, borderRadius: 7, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }
```

| Variant | Background | Border | Label | Ink | Notes |
| --- | --- | --- | --- | --- | --- |
| `PrimaryButton` | `colors.primary` | none | `<H4>` | `colors.white` | Main CTA. Full-width at the bottom of lists. |
| `SecondaryButton` | `colors.white` | none | `<H4>` | `colors.primary` | Optional trailing `icon`. |
| `SecondaryAddButton` | `colors.white` | none | `<H2>+` + `<H4>` | `colors.primary` | Left-aligned "add" affordance. |
| `InlineButton` | transparent | none | `<H5 underline>` | `colors.primary` | Text link; no padding/radius. |
| `SubButton` | `colors.primary_bg` | none | `<H5>` | `colors.primary` | Pill: `borderRadius: 22`, `alignSelf: "flex-start"`, effective `padding: 7`. |
| `DateButton` | `colors.primary_bg` | none | `<H3>` | `colors.primary` | `padding: 12`, `borderRadius: 8`. |
| `IconButton` | `colors.primary_bg` | none | — | icon | 50 × 50, radius 50, centered. |
| `PrepCookButton` | `colors.white` | none | `<H4>`/`<H5>` | default/`inactive` | 3-up summary bar, `height: 80`, r8, `padding: 12`, 1px `#ccc` dividers. |
| `RateButton` | — | — | — | — | **Stub — not implemented.** |

**Radio family** ([`RadioButton.tsx`](../components/UIComponents/Buttons/RadioButton.tsx)):

| Export | Container | Selected | Unselected |
| --- | --- | --- | --- |
| `StyledRadioButton` | `primary_bg`, r10, `padding: 6` | white segment, r10, `elevation: 2`, `<H5_SemiBold color={primary}>` | transparent, `<H5_SemiBold color={primary_inactive}>` |
| `DefaultRadioButton` | — | 20×20 dot, r15, `outlineColor: primary`, inner 12×12 r12 `primary` | `outlineWidth: 1`, `outlineColor: inactive` |
| `DetailedRadioButton` | white, r12, `padding: 20`, `borderWidth: 2`, `gap: 4` | `borderColor: primary`, `backgroundColor: primary_bg`, title `primary` | `borderColor: "transparent"`, description `<H6 color={medium_gray}>` |

**Rules**

1. One primary CTA per screen/section; everything else is secondary or a `SubButton` pill.
2. Button labels are `<H4>` (17/SemiBold); only `SubButton`/`InlineButton` use `<H5>`.
3. Do not add height — padding defines the size (`15` base).
4. **No disabled, pressed, focus, or loading visual states exist anywhere.** `TouchableOpacity`'s default
   `activeOpacity` is the only feedback. Define these states once, centrally, before adding more buttons.

### 7.2 Text inputs

Source: [`components/UIComponents/TextInputs/FormInput.tsx`](../components/UIComponents/TextInputs/FormInput.tsx).

**Base field:** `borderRadius: 8`, `backgroundColor: colors.white`, `minWidth: 50`, `minHeight: 50`,
inner padding `10/10`, `flexDirection: "row"`, `alignItems: "center"`; text uses `typography.h5`;
leading icon 24×24 with `marginRight: 8`; `placeholderTextColor="#999"`.

| Variant | Delta |
| --- | --- |
| `FormInput` | base |
| `FormInputLong` | `height: 100`, `textAlignVertical: "top"`, `multiline` |
| `FormInputSearch` | search icon (24×24) |
| `FormInputMacro` | numeric, centered, `placeholder "0"`, `unit="g"`, `selectTextOnFocus` |
| `FormInputNumber` | numeric, centered, defaults to `typography.h3` |
| `FormInputNumberStyled` | 140 × 50 pill group: 50px `primary_bg` left cap (r8 left) with `<H5_SemiBold color={primary}>` + numeric field |

**States**

| State | Treatment |
| --- | --- |
| Idle | Flat white, **no border** |
| Error | `borderWidth: 1`, `borderColor: colors.error`; message `<H6 color={colors.error}>`, `marginTop: 1` |
| Focus | **not styled** |
| Disabled | **not supported** |

[`ControlledTextInput`](../components/UIComponents/TextInputs/ControlledTextInput.tsx) and
[`DropDownCore`](../components/UIComponents/DropDown/DropDownCore.tsx) share one dropdown recipe:
white surface, `borderRadius: 8/10`, `marginTop: 1`, animated `height` (`duration: 200`), option rows
`paddingVertical: 14 / paddingHorizontal: 18` with `<H3>` labels, selected row `backgroundColor: primary_bg`
+ `color: primary`, unselected text `inactive`, overlay `elevation: 20` + `zIndex: 999`. The trigger
(`styles.selector`) is white r10 with `padding: 14/24` and no border or shadow.

[`ExpandableTextInput`](../components/UIComponents/TextInputs/ExpandableTextInput.tsx): white r10 header
(`padding: 12`, `<H4 color={primary}>`), 24×24 plus icon that rotates `0° → 45°` over 200 ms; expanded body is
`off_white`, r10, `padding: 12`, `marginHorizontal: 8`, height animates to 60.

**Rule:** the field surface is white and borderless; error is the *only* state that draws a border.

### 7.3 Cards & list rows

The canonical card:

```ts
{ backgroundColor: colors.white, borderRadius: 8, padding: 16, gap: 8 }   // no shadow, no border
```

| Card | Recipe delta |
| --- | --- |
| `FoodCardFull` / `FoodCardSmall` | base; title box `width: 240`; inline 3-segment macro band; legend dots |
| `FoodCardQuick` | **row style**: `paddingVertical: 16`, `gap: 8`, transparent — used inside bottom sheets |
| `FoodCardIngredient` | row, `gap: 0`; inner column `gap: 4` |
| `RecipeCard` | fixed `height: 139`; row `gap: 16`, `padding: 12`; image 128 × 115 r8; text column `gap: 8` |
| `RecipeCardSmall` | `width: 159 × scale`, image band `height: 122 × scale`, content `padding: 12`, `gap: 8` |
| `RecipeBookCard` | 165 × 136 image mosaic, `gap: 2`, outer-corner-only radius 8, no surface/padding |
| `StepsCard` | `padding: 12`, `gap: 12`; step title `<H4 color={primary}>`; image 164 × 164 r10 |
| `ReviewCard` | `padding: 16`, `gap: 12`, `marginBottom: 10`; avatar 30 × 30 r15 `primary_bg` |

**List conventions**

- Item spacing: `ItemSeparatorComponent` with `height: 8` (or `height: 12` for feed items) — *not* per-row margins.
- Card lists use `FoodCardFull` rows inset by `paddingHorizontal: 20`; rows inside sheets use `FoodCardQuick`.
- Section headers: `<H4>` + a `flex: 1` 1px `colors.light_gray` rule with `marginLeft: 20`.
- Empty states: 110 × 110 SVG, `<H4 color={colors.inactive}>` message, `marginTop: 14`, second line `marginTop: 4`.
- Swipe actions: `ReanimatedSwipeable`, `rightThreshold: 30`, action width 120, right corners r8,
  `containerStyle={{ paddingHorizontal: 20 }}`; background color is passed by the caller (no default token).

### 7.4 Macro display

- **Progress band** ([`MacroChart`](../components/chartComponents/MacroCharts/MacroChart.tsx)): three
  flex-weighted views in **P → C → F** order, `height: 15` (12 in compact cards), `borderRadius: 8` on the outer
  edges only, with conditional rounding when an adjacent macro is 0. `FoodCardFull` inlines a copy of this recipe
  instead of importing it.
- **Legend:** `flexDirection: "row"`, `justifyContent: "space-around"`; each item is a 10 × 10 dot at radius 10 in
  the macro color plus a label. Dot + label gap is `8` (canonical), `4` (recipe cards) or `2` (quick rows).
- **Labels:** `<H5_SemiBold>P|C|F</H5_SemiBold>` + `<H6>{value} g</H6>`. Recipe cards drop the letter and show the
  value only; `RecipeCardSmall` uses an H6 value above a 3px r2 solid bar instead.
- **Calories:** `<H4>{n} cals</H4>` right-aligned on full cards; `<H5_SemiBold>{n} cal</H5_SemiBold>` on compact
  rows; `<H6 color={colors.primary}>` beside an icon on recipe cards.
- Charts: macro bars use `colors.protein|carbs|fat`, weight line/area uses `colors.primary`, axes use
  `colors.light_gray`.

### 7.5 Pills, chips & status badges

There is **no chip component**; the de-facto pill is `SubButton` (`primary_bg`, `radius 22`, `padding 7`,
`<H5 color={primary}>`). Status pills follow the status-pair rule:

```ts
// positive / info / warning
{ backgroundColor: colors.light_green | light_blue | light_yellow,
  borderColor:     colors.dark_green  | dark_blue  | dark_yellow,
  borderWidth: 1, borderRadius: 25, padding: 8, gap: 4 }
```

Counts and percentages render as `<H6>`; the ink matches the dark pair color.

### 7.6 Modals & bottom sheets

**Modal** ([`ModalCore`](../components/UIComponents/Modals/ModalCore.tsx)): backdrop `flex: 1`, centered,
`backgroundColor: "rgba(0,0,0,0.5)"`, tap-to-close; panel `off_white`, `borderRadius: 8`, `padding: 16`,
`margin: 20`, `flex: 1`; title `<H3>`. Footers are a `gap: 10` row of two `flex: 1` buttons
(secondary = cancel, primary = confirm).

**Bottom sheet** ([`BottomSheetCore`](../components/UIComponents/BottomSheet/BottomSheetCore.tsx)):
`@gorhom/bottom-sheet` with `snapPoints` `["7%","50%","70%","92%"]` (filters use `["3%","50%","70%","90%"]`),
`enableDynamicSizing={false}`, no content panning. Handle wrapper `marginBottom: 10`,
`paddingHorizontal: 20`; grip 60 × 5, `borderRadius: 2`, `colors.light_gray`, `marginVertical: 10`.
Content is `BottomSheetScrollView` → `flex: 1`, `justifyContent: "space-between"`, `paddingHorizontal: 10`.
Footer is `BottomSheetFooter` with `bottomInset={0}`, `off_white`, `padding: 16`, `gap: 20`.
Sheet background is supplied by the caller through `style` (it maps to `backgroundStyle`) — most sheets use
`off_white`.

Sheet list divider: `height: 1`, `colors.primary_bg`, `marginHorizontal: 20`.

### 7.7 Toasts

[`toastConfig.tsx`](../components/UIComponents/Toasts/toastConfig.tsx): container `350 × 50`, `flexDirection: "row"`,
`gap: 8`, `alignItems: "center"`, `paddingHorizontal: 24`, `backgroundColor: colors.white`, `borderRadius: 8`,
plus the canonical floating shadow.

| Variant | Content |
| --- | --- |
| `success` | 28 × 28 icon (`colors.primary`) + `<H5_SemiBold color={colors.primary}>` |
| `error` | `<H5_SemiBold color={colors.error}>`, no icon |
| `info` | stock `BaseToast` with a stray `borderLeftColor: "pink"` and inline `fontSize: 15` — **use success/error instead** |

### 7.8 Images

[`ImageView`](../components/UIComponents/Image/ImageView.tsx) wraps `expo-image` with a `colors.primary_bg`
background (placeholder tint), `flex: 1` and constructs nothing else — **all sizing, radius and `contentFit` come
from the caller**, and radii must be passed twice (`style` and `imageStyle`).

| Context | Geometry |
| --- | --- |
| Recipe card (wide) | 128 × 115, radius 8 |
| Recipe card (small) | full width × `122 × scale`, top corners r8 only |
| Recipe book mosaic | 165 × 136, 2 × 2, `gap: 2`, outer corners only |
| Step image | 164 × 164, radius 10, `contentFit="cover"` (bypasses `ImageView`) |

Rule: any new image goes through `ImageView`, gets an explicit size and `contentFit`, and uses the same radius as
its container.

---

## 8. Patterns & conventions (TL;DR)

**Do**

- Import `colors` from `@/theme`; render text with `H1…H6`.
- Page = `off_white`, surface = `white`, accent = `primary_bg`, active = `primary`.
- Compose with `gap` (8 / 12 / 20); pad cards `16`, screens `20`.
- Radius 8 for surfaces, 10 for large controls, 50 for circles.
- Keep cards flat; add the canonical shadow only to floating chrome.
- Spacing between list items: `ItemSeparatorComponent`, not margins.
- Macro colors, always P → C → F.
- Reserve ~40px of bottom clearance on tab screens so the centre FAB does not cover content.

**Don't**

- Don't hardcode hex/rgba/color names, `fontSize`, `fontFamily` or `fontWeight`.
- Don't invent a new radius/shadow/height without checking [§4](#4-radius) and [§5](#5-elevation--shadows).
- Don't nest a shadowed card inside another shadowed card.
- Don't set a fixed `width` on text blocks that should wrap (three cards hardcode `240`).
- Don't copy `ModalCore` backdrops, sheet handles or macro bands — extract them if they change again.
- Don't build a fifth nav strip; reuse the one in [§6.2](#62-navigation-chrome) (the existing four disagree on insets, gaps and label sizes).
- Don't use `colors.error` for active indicators — that is a semantic error token.

---

## 9. Drift & cleanup backlog

Ordered by how much recurring damage each item causes.

| # | Issue | Evidence | Suggested fix |
| --- | --- | --- | --- |
| 1 | No spacing/radius/elevation tokens — every value is a literal | 2,104 declarations, no token file | Add `theme/spacing.ts`, `theme/radii.ts`, `theme/shadow.ts` and export from `theme/index.ts`. |
| 2 | No disabled / pressed / focus / loading states | `PrepCookButton` `disable` changes nothing visually; no input focus style | Define once (opacity 0.4 disabled, `activeOpacity` 0.7, focus ring) and apply centrally. |
| 3 | Raw color literals in 13 files | `"#333333"` ×3, `shadowColor:"#000000"` ×8, `"#D1BBB3"`, `rgba(0,0,0,0.5)` ×3, `"#999"`, `"#ddd"`, `"#ccc"`, `"#666"`, `"#fff"`, `"pink"`, `"#FEC92D"`, `"#EE5B5B"/"#FFA658"/"#FFE043"` | Promote to tokens: `overlay`, `shadow`, `shadowWarm`, `star`, `placeholder`, `chromeGradient`. |
| 4 | Root stack background is `colors.error` (red), and tab stacks disagree on backgrounds | [`app/_layout.tsx:67`](../app/_layout.tsx#L67); `(logs)`/`(profile)` set `off_white`, `(Home)`/`(discover)` set none | Set `colors.off_white` at the root; the red shows behind transitions. |
| 5 | Safe areas only handled in `HeaderCore` | `MyTabBar` uses a fixed `paddingBottom: 20` and never calls `useSafeAreaInsets`; only 1 file does | Route the tab bar and scroll bottoms through `useSafeAreaInsets`. |
| 6 | Only one screen reserves bottom clearance for the FAB | `logs.tsx:168` `paddingBottom: 40`, `discover.tsx:70` `20`, all other tab screens `0` | Add the 40px clearance (or a safe-area inset) to the shared screen scaffold. |
| 7 | Four near-duplicate horizontal nav strips with four geometries | `TopNav` inset 35 / `space-around`; `NavSelector` inset 0; `RecipeNav` inset 20 / `gap: 65`; label gap 10 vs 4; underline copy-pasted 3× | Collapse to one component with props; share the underline style. |
| 8 | Nav underlines use `colors.error` as an accent | `TopNav.tsx:92`, `NavSelector.tsx:144`, `RecipeNav.tsx:94` (`height: 3`, `colors.error`) | This is a brand accent, not an error — switch to `colors.primary`. |
| 9 | `KeyboardAware` ignores its `contentPadding` prop | [`KeyboardAware.tsx`](../components/UIComponents/KeyboardAware/KeyboardAware.tsx) destructures `contentPadding = 16` but never uses it; `minHeight` hardcoded 700 | Apply the prop to `contentContainerStyle.paddingBottom`; move `minHeight` to a constant. |
| 10 | Macro band + legend dot duplicated across 5 files | `FoodCardFull` inlines `MacroChart`; `macroBall` 10×10 r10 copied 5× | Make `MacroChart` the only implementation; export a `MacroLegend` component. |
| 11 | Cards hardcode widths (`240`/`200`) and heights (`139`, `313×scale`) | `FoodCardFull.tsx:25`, `FoodCardQuick.tsx:29`, `RecipeCard.tsx:23` | Use `flex` + `numberOfLines`; keep only aspect ratios fixed. |
| 12 | Header geometry bugs | `HeaderCore.tsx:68` renders a phantom `<View/>` that adds ~10px under `gap: 10`; `HeaderCore.tsx:77` `paddingTop: 20` is dead (overridden at L34) | Drop the empty slot; remove the dead style. |
| 13 | `StepIndicator` geometry does not line up | `borderRadius: 30` on a 33 × 33 circle, asymmetric connector `58`/`46`; circle row (`paddingLeft: 30`) shares no axis with label row (`paddingHorizontal: 20`) | Derive radius from size; align circle and label rows to one inset. |
| 14 | Wrong step index on the Preview screen | [`preview.tsx:99`](../app/(tabs)/(logs)/CreateRecipe/preview.tsx#L99) passes `activeStep={0}` for step 4 | Pass `3`. |
| 15 | Debug routes registered as real tabs | [`app/(tabs)/_layout.tsx:30-31`](../app/(tabs)/_layout.tsx#L30-L31) registers `test`/`test1`; `MyTabBar` matches focus positionally 0–3 | Remove the routes, or match focus by route name. |
| 16 | Dead / commented-out styles | empty `StyleSheet.create({})` in 6+ files; unused `styles.rightAction` (`"red"`), `shadowProp`, `styled_optionButton`; no-op shadows (`elevation: 1` with no offset/opacity/radius) in the nav strips | Delete; lint with `eslint-plugin-react-native/no-unused-styles`. |
| 17 | `BottomSheetCore` `snapPoints` memoised with empty deps | `useMemo(() => snapPoints, [])` | Add the dependency (or drop the memo). |
| 18 | Toast `info` variant is off-system | `borderLeftColor: "pink"`, inline `fontSize: 15` | Restyle to `medium_gray`/`H5`, or remove. |
| 19 | `Title` casing is inconsistent in the `H1` slot | `"LOGS"`, `"CREATE RECIPE"`, `"Weight history"`, `"My Recipes"`, `"Create Recipe"` | Pick sentence case, enforce in the header API. |
| 20 | `TopNav` defaults `scrollEnabled = false` | [`TopNav.tsx:25`](../components/navComponents/TopNav.tsx#L25); injected `gap: 60` can overflow unseen | Default to scrollable when the strip overflows. |
| 21 | `RateButton` is an empty stub | [`RateButton.tsx`](../components/UIComponents/Buttons/RateButton.tsx) | Implement or delete. |
| 22 | `h4_Bold` is used once; `lineHeight` used once | — | Either adopt or remove from the scale. |
| 23 | Unused `GS-*` weights ships in the bundle | `assets/fonts/general-sans/` has 12 files, 1 loaded | Delete unused `.otf` files. |

---

## 10. Appendix — token quick reference

```ts
// theme/colors.ts (unchanged — canonical)
import { colors, typography } from "@/theme";

// Requested additions (see backlog #1, #3)
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };
export const radius  = { sm: 4, md: 8, lg: 10, pill: 50, circle: 999 };
export const shadow  = {
  floating: {
    shadowColor: "#D1BBB3",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
};
// plus: overlay: "rgba(0,0,0,0.5)", shadowNeutral: "#000000", star: "#FEC92D"
```

| Need | Use |
| --- | --- |
| Page background | `colors.off_white` |
| Card / sheet / input surface | `colors.white` |
| Tinted accent surface | `colors.primary_bg` |
| CTA fill / active state | `colors.primary` |
| Body text | `colors.black` (via `H*`) |
| Secondary text | `colors.medium_gray` |
| Muted / disabled / empty | `colors.inactive` |
| Unselected brand ink | `colors.primary_inactive` |
| Hairline / axis / grab handle | `colors.light_gray` |
| Structural separator | `colors.line_break` |
| Error | `colors.error` |
| Macro P / C / F | `colors.protein` / `colors.carbs` / `colors.fat` |
| Screen title | `<H1>` (GS-Medium 26) |
| Section / entity title | `<H2>` (GS-Medium 22) |
| Card title, stat | `<H3>` (Metro-Medium 18) |
| Button label, row label | `<H4>` (Metro-SemiBold 17) |
| Body, value, unit | `<H5>` (Metro-Regular 16) |
| Emphasised label | `<H5_SemiBold>` (Metro-SemiBold 16) |
| Caption, meta, error | `<H6>` (Metro-Regular 14) |
| Gap (related) | `8` |
| Gap (sections) | `20` |
| Card padding | `16` |
| Screen gutter | `20` |
| Surface radius | `8` |

---

*Generated by auditing `app/**` and `components/**` at the current HEAD. Re-run the audit if the theme or the
component library changes.*
