import {
	useCreatorOnboarding,
	useOnboardingStatus,
} from "@/api/hooks/useCreatorOnboarding";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import GoogleSignInButton from "@/components/UIComponents/Buttons/authButtons/GoogleSignInButton";
import SignOutButton from "@/components/UIComponents/Buttons/authButtons/SignOutButton";
import SubscribeButton from "@/components/UIComponents/Buttons/authButtons/SubscribeButton";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { FormInput } from "@/components/UIComponents/TextInputs/FormInput";
import { H3, H5 } from "@/components/UIComponents/Typography";
import { useAuth } from "@clerk/expo";
import React, { useEffect, useState } from "react";
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
	useEffect(() => {
		if (status && !status.is_complete) {
			startOnboarding(username);
		}
	}, [status]);
	return (
		<KeyboardAware>
			<View style={{ flex: 1 }}>
				<HeaderSimple title="User Settings" />
				<View style={{ flex: 1, padding: 20, gap: 12 }}>
					{isSignedIn ? (
						<View>
							<SignOutButton />
							{status?.is_complete ? (
								<H5>Your creator account is active!</H5>
							) : (
								<>
									<H3>Change username</H3>
									<FormInput
										value={username}
										onChangeText={setUsername}
									/>
									<PrimaryButton
										onPress={() =>
											startOnboarding(username)
										}
									>
										{isPending
											? "Setting up..."
											: "Become a Creator"}
									</PrimaryButton>
									{error && <H5>{error.message}</H5>}
								</>
							)}
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
