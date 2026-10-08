import {
	useCreatorOnboarding,
	useOnboardingStatus,
} from "@/api/hooks/useCreatorOnboarding";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import {
	FormInput,
	FormInputLong,
} from "@/components/UIComponents/TextInputs/FormInput";
import { H4, H5 } from "@/components/UIComponents/Typography";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

const creatorOnboardingProfile = () => {
	const [username, setUsername] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [about, setAbout] = useState("");
	const {
		mutate: startOnboarding,
		isPending,
		error,
	} = useCreatorOnboarding();
	const { data: status } = useOnboardingStatus();
	useEffect(() => {
		if (status && !status.is_complete) {
			startOnboarding({
				username: username == "" ? undefined : username,
				display_name: displayName == "" ? undefined : displayName,
				about: about == "" ? undefined : about,
			});
		}
	}, [status]);
	return (
		<View style={{ flex: 1 }}>
			<HeaderSimple title="Creator Profile" />
			<View style={{ flex: 1, padding: 20, gap: 32 }}>
				<View style={{ gap: 12 }}>
					<H4>Username</H4>
					<FormInput
						value={username}
						onChangeText={setUsername}
						placeholder="Enter a unique username"
					/>
				</View>
				<View style={{ gap: 12 }}>
					<H4>Display Name</H4>
					<FormInput
						value={displayName}
						onChangeText={setDisplayName}
						placeholder="Enter a display name"
					/>
				</View>
				<View style={{ gap: 12 }}>
					<H4>About me</H4>
					<FormInputLong
						value={about}
						onChangeText={setAbout}
						placeholder="Write a short description about the recipes you’re planning to share."
					/>
				</View>
			</View>
			<PrimaryButton
				style={{ margin: 20 }}
				onPress={() =>
					startOnboarding({
						username,
						display_name: displayName,
						about,
					})
				}
			>
				{isPending ? "Setting up..." : "Next"}
			</PrimaryButton>
			{error && <H5>{error.message}</H5>}
		</View>
	);
};

export default creatorOnboardingProfile;

const styles = StyleSheet.create({});
