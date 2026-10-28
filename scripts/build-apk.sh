#!/usr/bin/env bash
#
# Build an installable Android APK locally, the same way the iOS builds are made:
# `eas build --local` runs the build in a Docker container on this machine and drops
# the artifact in the current directory.
#
#   ./scripts/build-apk.sh              # preview profile (internal, APK)
#   EAS_PROFILE=development ./scripts/build-apk.sh
#
# Profile matters: `preview` is the only one that produces an APK. `beta` and
# `production` are `distribution: store` and produce .aab bundles you cannot sideload.
#
# Requirements: Docker running, and `eas login` done once (or EAS_TOKEN exported).
set -euo pipefail

cd "$(dirname "$0")/.."

PROFILE="${EAS_PROFILE:-preview}"

if ! docker info >/dev/null 2>&1; then
	echo "Docker is not running — \`eas build --local\` needs it." >&2
	exit 1
fi

echo "Profile: $PROFILE"
echo "API:     $(python3 -c "import json;print(json.load(open('eas.json'))['build']['$PROFILE'].get('env',{}).get('EXPO_PUBLIC_API_URL','(from .env)'))" 2>/dev/null || echo '(unknown)')"
echo

npx --yes eas-cli build \
	--platform android \
	--profile "$PROFILE" \
	--local \
	--non-interactive

echo
echo "Artifacts:"
ls -lht build-*.apk 2>/dev/null | head -3 || echo "  (no build-*.apk in $(pwd))"
