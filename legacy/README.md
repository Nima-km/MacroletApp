# legacy/

Superseded implementations, kept for reference rather than deleted.

Convention: a replaced file is moved here as `<original-name>-legacy.<ext>`.

**Why here and not in place:** anything under `app/` is a live expo-router route,
so a `foo-legacy.tsx` sitting beside `foo.tsx` would register a real (dead) route
and ship in the bundle. Files outside `app/` can keep the `-legacy` suffix in
place.
