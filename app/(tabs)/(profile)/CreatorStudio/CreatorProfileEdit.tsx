import { fieldErrorFor, messageForApiError } from "@/api/errors";
import {
	useCreatorStatus,
	useSaveCreatorProfile,
} from "@/api/hooks/useCreatorOnboarding";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import {
	FormInput,
	FormInputLong,
} from "@/components/UIComponents/TextInputs/FormInput";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { H4, H5, H6 } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";

const DISPLAY_NAME_MAX = 30;
const ABOUT_MAX = 250;

/**
 * Edit an existing creator profile.
 *
 * The onboarding flow's profile step, pointed at a profile that already exists: the
 * same fields, the same save call (`POST /creator/onboard` updates in place rather
 * than inserting), and the same error mapping.
 *
 * What it deliberately does not offer is the username. That is the public key behind
 * every recipe link and follower, so editing it is not an edit - it is a rename that
 * breaks references, and the API's own uniqueness check only covers half of that.
 */
const CreatorProfileEdit = () => {
	const router = useRouter();
	const { data: status, isLoading } = useCreatorStatus();
	const creator = status?.creator ?? null;

	const { mutate: saveProfile, isPending, error } = useSaveCreatorProfile();

	const [displayName, setDisplayName] = useState("");
	const [about, setAbout] = useState("");
	const [instagram, setInstagram] = useState("");
	const [youtube, setYoutube] = useState("");
	const [tiktok, setTiktok] = useState("");
	// Seed once, when the profile first arrives, rather than overwriting what the
	// user is typing on every refetch.
	const [seeded, setSeeded] = useState(false);

	useEffect(() => {
		if (seeded || !creator) return;
		setDisplayName(creator.display_name ?? "");
		setAbout(creator.about ?? "");
		setInstagram(creator.instagram ?? "");
		setYoutube(creator.youtube ?? "");
		setTiktok(creator.tiktok ?? "");
		setSeeded(true);
	}, [creator, seeded]);

	const canSave = displayName.trim().length > 0 && !isPending;

	const handleSave = () => {
		if (!creator || !canSave) return;
		saveProfile(
			{
				// Sent unchanged: the endpoint takes the whole profile, and the
				// username is what identifies the row being updated.
				username: creator.username,
				display_name: displayName,
				about,
				// Empty clears the link; the API turns "" into null.
				instagram,
				youtube,
				tiktok,
				// No `avatar_path`: omitting it leaves the existing picture alone.
			},
			{
				onSuccess: () => {
					Toast.show({ type: "success", text1: "Profile updated" });
					router.back();
				},
			},
		);
	};

	if (isLoading) {
		return (
			<KeyboardAware>
				<HeaderSimple title="Edit Profile" />
				<View style={styles.content}>
					<H5 style={{ color: colors.inactive }}>Loading…</H5>
				</View>
			</KeyboardAware>
		);
	}

	if (!creator) {
		return (
			<KeyboardAware>
				<HeaderSimple title="Edit Profile" />
				<View style={styles.content}>
					<H4>No creator profile yet</H4>
					<H6 style={{ color: colors.inactive }}>
						Publish a recipe to become a creator first.
					</H6>
				</View>
			</KeyboardAware>
		);
	}

	return (
		<KeyboardAware>
			<HeaderSimple title="Edit Profile" />
			<View style={styles.content}>
				<View style={{ gap: 10 }}>
					<View style={styles.labelRow}>
						<H4>Display Name</H4>
						<H5 style={{ color: colors.inactive }}>required</H5>
					</View>
					<FormInput
						value={displayName}
						onChangeText={setDisplayName}
						placeholder="Your name"
						maxLength={DISPLAY_NAME_MAX}
						error={fieldErrorFor(error, "display_name")}
					/>
				</View>

				<View style={{ gap: 10 }}>
					<View style={styles.labelRow}>
						<H4>Bio</H4>
						<H5 style={{ color: colors.inactive }}>optional</H5>
					</View>
					<FormInputLong
						value={about}
						onChangeText={setAbout}
						placeholder="A line or two about what you cook."
						maxLength={ABOUT_MAX}
						error={fieldErrorFor(error, "about")}
					/>
				</View>

				<View style={{ gap: 14 }}>
					<View style={{ gap: 4 }}>
						<H4>Links</H4>
						<H5 style={{ color: colors.inactive }}>
							Shown as pills on your profile. Leave one empty to hide it.
						</H5>
					</View>
					<FormInput
						value={instagram}
						onChangeText={setInstagram}
						placeholder="https://instagram.com/yourname"
						autoCapitalize="none"
						keyboardType="url"
						error={fieldErrorFor(error, "instagram")}
					/>
					<FormInput
						value={youtube}
						onChangeText={setYoutube}
						placeholder="https://youtube.com/@yourname"
						autoCapitalize="none"
						keyboardType="url"
						error={fieldErrorFor(error, "youtube")}
					/>
					<FormInput
						value={tiktok}
						onChangeText={setTiktok}
						placeholder="https://tiktok.com/@yourname"
						autoCapitalize="none"
						keyboardType="url"
						error={fieldErrorFor(error, "tiktok")}
					/>
				</View>

				<H5 style={{ color: colors.inactive }}>
					Your handle is @{creator.username} and can't be changed.
				</H5>

				{error ? (
					<H6 style={{ color: colors.error }}>
						{messageForApiError(error)}
					</H6>
				) : null}

				<PrimaryButton
					onPress={handleSave}
					disabled={!canSave}
					style={{ opacity: canSave ? 1 : 0.5 }}
				>
					{isPending ? "Saving…" : "Save Changes"}
				</PrimaryButton>
			</View>
		</KeyboardAware>
	);
};

export default CreatorProfileEdit;

const styles = StyleSheet.create({
	content: {
		flex: 1,
		padding: 20,
		gap: 20,
	},
	labelRow: {
		flexDirection: "row",
		gap: 8,
	},
});
