import { useSaveCreatorProfile } from "@/api/hooks/useCreatorOnboarding";
import { fieldErrorFor, messageForApiError } from "@/api/errors";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import Monogram from "@/components/UIComponents/Avatar/Monogram";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import {
	FormInput,
	FormInputLong,
} from "@/components/UIComponents/TextInputs/FormInput";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { H3, H4, H5, H6 } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";

const USERNAME_MAX = 30;
const DISPLAY_NAME_MAX = 30;
const ABOUT_MAX = 250;

/**
 * The handle as it will be stored: lowercase, `[a-z0-9_]` only.
 *
 * This is applied to the *submitted* value and to anything derived for display -
 * never inside `onChangeText`. Rewriting the text as it is typed fights the
 * platform: iOS auto-capitalises the first character natively, so the controlled
 * `value` and the native text disagree and the field goes out of sync. Keeping
 * the raw keystrokes in state and normalising on the way out avoids that
 * entirely, and the API lowercases anyway.
 */
const toHandle = (value: string) =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9_]/g, "")
		.slice(0, USERNAME_MAX);

/**
 * Creator onboarding, step 1 of 2: the public profile.
 *
 * Saving this publishes the profile - no Stripe account is created and nothing
 * about payouts is asked for here (docs/PAYOUT_MODEL.md D7).
 */
const creatorOnboardingProfile = () => {
	const router = useRouter();
	const [username, setUsername] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [about, setAbout] = useState("");

	const { mutate: saveProfile, isPending, error } = useSaveCreatorProfile();

	// Derived for display only - the field itself keeps exactly what was typed.
	const handle = toHandle(username);
	const previewName = displayName.trim() || username.trim() || "Your name";

	const handleSubmit = () => {
		saveProfile(
			{ username: handle, display_name: displayName, about },
			{
				onSuccess: () => {
					Toast.show({
						type: "success",
						text1: "Profile published",
						text2: `You're live at @${handle}`,
					});
					router.replace(
						"/(tabs)/(profile)/CreatorOnboarding/creatorOnboardingPayouts",
					);
				},
			},
		);
	};
	return (
		<KeyboardAware>
			<HeaderSimple title="Creator Profile" />
			<View style={styles.content}>
				<H6 style={styles.step}>Step 1 of 2</H6>

				{/* What they are actually creating, before they commit to it. */}
				<View style={styles.card}>
					<View style={styles.preview}>
						<Monogram name={previewName} />
						<View style={styles.previewText}>
							<H3 numberOfLines={1}>{previewName}</H3>
							<H6 style={styles.muted}>
								{handle ? `@${handle}` : "@yourhandle"}
							</H6>
						</View>
					</View>
					{about.trim() ? (
						<H5 style={styles.body} numberOfLines={3}>
							{about.trim()}
						</H5>
					) : null}
				</View>

				<View style={styles.field}>
					<H4>Username</H4>
					{/* The value stays exactly as typed (see toHandle) and the keyboard
					    is told not to capitalise, so nothing fights the platform. */}
					<FormInput
						value={username}
						onChangeText={setUsername}
						placeholder="yourhandle"
						autoCapitalize="none"
						autoCorrect={false}
						maxLength={USERNAME_MAX}
						error={fieldErrorFor(error, "username")}
					/>
					<H6 style={styles.hint}>
						Letters, numbers and underscores. This is your public
						@handle{handle && handle !== username ? ` (saved as @${handle})` : ""}.
					</H6>
				</View>

				<View style={styles.field}>
					<H4>Display Name</H4>
					<FormInput
						value={displayName}
						onChangeText={setDisplayName}
						placeholder="How your name appears"
						maxLength={DISPLAY_NAME_MAX}
						error={fieldErrorFor(error, "display_name")}
					/>
				</View>

				<View style={styles.field}>
					<H4>About me</H4>
					<FormInputLong
						value={about}
						onChangeText={setAbout}
						placeholder="A short description of the recipes you'll share."
						maxLength={ABOUT_MAX}
						error={fieldErrorFor(error, "about")}
					/>
					<H6 style={styles.hint}>
						{ABOUT_MAX - about.length} characters left
					</H6>
				</View>

				{error && !fieldErrorFor(error, "username") ? (
					<H6 style={styles.error}>{messageForApiError(error)}</H6>
				) : null}

				<PrimaryButton onPress={handleSubmit} disabled={isPending}>
					{isPending ? "Publishing…" : "Create profile"}
				</PrimaryButton>
			</View>
		</KeyboardAware>
	);
};

export default creatorOnboardingProfile;

const styles = StyleSheet.create({
	content: {
		flex: 1,
		padding: 20,
		paddingBottom: 40,
		gap: 20,
	},
	step: {
		color: colors.inactive,
	},
	card: {
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 16,
		gap: 12,
	},
	preview: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	previewText: {
		flex: 1,
		gap: 4,
	},
	field: {
		gap: 12,
	},
	body: {
		color: colors.medium_gray,
		lineHeight: 21,
	},
	muted: {
		color: colors.medium_gray,
	},
	hint: {
		color: colors.inactive,
		lineHeight: 20,
	},
	error: {
		color: colors.error,
	},
});
