import {
	useCreatorOnboarding,
	useOnboardingStatus,
} from "@/api/hooks/useCreatorOnboarding";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import GoogleSignInButton from "@/components/UIComponents/Buttons/authButtons/GoogleSignInButton";
import SignOutButton from "@/components/UIComponents/Buttons/authButtons/SignOutButton";
import SubscribeButton from "@/components/UIComponents/Buttons/authButtons/SubscribeButton";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { useAuth } from "@clerk/expo";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

const account = () => {
	const { isSignedIn, isLoaded, getToken } = useAuth();
	const [username, setUsername] = useState("");
	const {
		mutate: startOnboarding,
		isPending,
		error,
	} = useCreatorOnboarding();
	const { data: status } = useOnboardingStatus();

	return (
		<KeyboardAware>
			<View style={{ flex: 1 }}>
				<HeaderSimple title="User Settings" />
				<View style={{ flex: 1, padding: 20, gap: 12 }}>
					{isSignedIn ? (
						<View>
							<SignOutButton />

							<SubscribeButton planId="gold" />
						</View>
					) : (
						<GoogleSignInButton />
					)}
				</View>
			</View>
		</KeyboardAware>
	);
};

export default account;

const styles = StyleSheet.create({});
