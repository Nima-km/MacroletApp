import ProfileIcon from "@/assets/svg/user.svg";
import { colors } from "@/theme";
import { useClerk } from "@clerk/expo";
import React from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { H3 } from "../../Typography";

/**
 * Log out.
 *
 * Destructive, so it confirms first and uses the `error` ink the style guide
 * reserves for destructive affordances (§2). It previously signed out on a single
 * tap while wearing a `ChevronRight`, which implies navigation rather than
 * destruction, and afterwards fired `Linking.openURL` at the app's own root.
 *
 * `(profile)/account` shares this component and so inherits the confirmation.
 */
const SignOutButton = () => {
	const { signOut } = useClerk();

	const handleSignOut = async () => {
		try {
			await signOut();
			// No redirect needed: signing out flips `isSignedIn`, and the screens
			// that require a session already branch on it.
		} catch (error) {
			console.error("Sign out failed", error);
		}
	};

	const confirmSignOut = () =>
		Alert.alert("Log out?", "You'll need to sign in again to sync your logs.", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Log out",
				style: "destructive",
				onPress: () => void handleSignOut(),
			},
		]);

	return (
		<Pressable
			onPress={confirmSignOut}
			accessibilityRole="button"
			accessibilityLabel="Log out"
			style={({ pressed }) => [styles.row, pressed && styles.pressed]}
		>
			<View style={styles.left}>
				<ProfileIcon color={colors.error} />
				<H3 style={styles.label}>Log Out</H3>
			</View>
		</Pressable>
	);
};

export default SignOutButton;

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 16,
	},
	pressed: {
		backgroundColor: colors.off_white,
	},
	left: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	label: {
		color: colors.error,
	},
});
