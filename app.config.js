/**
 * Dynamic config, for one reason: the dev build needs a different applicationId from the
 * EAS-signed APK so both can live on the same phone.
 *
 * They cannot share `com.macroletapp.app` — the admin APK is signed with the EAS-managed
 * keystore and a local `expo run:android` build with the checked-in debug keystore, so
 * Android refuses the update rather than overwriting the installed app. Different package,
 * no conflict, and the admin app keeps its data.
 *
 * `app.json` stays the source of truth; only the package is swapped, and only when
 * EXPO_PUBLIC_APP_VARIANT=dev is set. A profile without it builds the real package, so
 * EAS production and beta are unaffected.
 */
module.exports = ({ config }) => {
	const devVariant = process.env.EXPO_PUBLIC_APP_VARIANT === "dev";

	if (!devVariant) return config;

	return {
		...config,
		// Two identical icons on the home screen is a guessing game; the label says which
		// one you are about to open. `slug` is left alone so EAS still recognises the project.
		name: `${config.name ?? "Macrolet"} Dev`,
		android: {
			...config.android,
			package: `${config.android?.package ?? "com.macroletapp.app"}.dev`,
		},
	};
};
