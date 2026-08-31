import ChevronRight from "@/assets/svg/chevron-right.svg";
import ProfileIcon from "@/assets/svg/user.svg";
import { colors } from "@/theme";
import { useClerk } from "@clerk/expo";
import * as Linking from "expo-linking";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { H3 } from "../../Typography";
const SignOutButton = () => {
	// Use `useClerk()` to access the `signOut()` function
	const { signOut } = useClerk();
	const handleSignOut = async () => {
		try {
			await signOut();
			// Redirect to your desired page
			Linking.openURL(Linking.createURL("/"));
		} catch (err) {
			// See https://clerk.com/docs/custom-flows/error-handling
			// for more info on error handling
			console.error(JSON.stringify(err, null, 2));
		}
	};
	return (
		<Pressable
			style={{
				paddingVertical: 16,
				flexDirection: "row",
				justifyContent: "space-between",
				borderBottomWidth: 1,
				borderColor: colors.primary_bg,
			}}
			onPress={handleSignOut}
		>
			<View
				style={{
					flexDirection: "row",
					gap: 8,
					alignItems: "center",
				}}
			>
				<ProfileIcon color={colors.primary} />
				<H3>Log Out</H3>
			</View>
			<ChevronRight color={colors.primary} />
		</Pressable>
	);
};

export default SignOutButton;

const styles = StyleSheet.create({
	button: {
		backgroundColor: colors.white, // Google blue
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 10,
	},
});
