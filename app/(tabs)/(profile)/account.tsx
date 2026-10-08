import HeaderSimple from "@/components/navComponents/HeaderSimple";
import GoogleSignInButton from "@/components/UIComponents/Buttons/authButtons/GoogleSignInButton";
import SignOutButton from "@/components/UIComponents/Buttons/authButtons/SignOutButton";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { useAuth } from "@clerk/expo";
import React from "react";
import { View } from "react-native";

/**
 * Account settings.
 *
 * The subscription and creator-onboarding controls that used to live here were
 * testing scaffolding. Subscriptions now have a real screen
 * (`(profile)/subscription`) and creator onboarding its own flow, so this screen
 * is back to sign-in state only.
 */
const account = () => {
	const { isSignedIn } = useAuth();

	return (
		<KeyboardAware>
			<View style={{ flex: 1 }}>
				<HeaderSimple title="User Settings" />
				<View style={{ flex: 1, padding: 20, gap: 12 }}>
					{isSignedIn ? <SignOutButton /> : <GoogleSignInButton />}
				</View>
			</View>
		</KeyboardAware>
	);
};

export default account;
