import { TESTBACKEND } from "@/api/searchRecipe";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import { SecondaryButton } from "@/components/UIComponents/Buttons/Button";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

const profile = () => {
	const { getToken, has } = useAuth();
	const router = useRouter();

	async function testbackend() {
		const token = await getToken();
		if (token) console.log("result", await TESTBACKEND(token));
		else console.log("login");
	}
	return (
		<KeyboardAware>
			<HeaderSimple title="Profile" back={false} />
			<View style={{ flex: 1, padding: 20, gap: 8 }}>
				<SecondaryButton
					onPress={() => router.push("/(tabs)/(profile)/account")}
				>
					Account
				</SecondaryButton>
				<SecondaryButton
					onPress={() => router.push("/(tabs)/(profile)/goals")}
				>
					Goals
				</SecondaryButton>
				<SecondaryButton
					onPress={() => router.push("/(tabs)/(profile)/myRecipes")}
				>
					My Recipes
				</SecondaryButton>
				<SecondaryButton onPress={() => testbackend()}>
					TEST BACKEND
				</SecondaryButton>
			</View>
		</KeyboardAware>
	);
};

export default profile;

const styles = StyleSheet.create({});
