import { TESTBACKEND } from "@/api/searchRecipe";
import ChevronRight from "@/assets/svg/chevron-right.svg";
import RecipeIcon from "@/assets/svg/recipe-book.svg";
import PreferencesIcon from "@/assets/svg/sliders.svg";
import SubscriptionIcon from "@/assets/svg/subscription.svg";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import SignOutButton from "@/components/UIComponents/Buttons/authButtons/SignOutButton";
import {
	PrimaryButton,
	SecondaryButton,
} from "@/components/UIComponents/Buttons/Button";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { H2, H3, H4, H5_SemiBold } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

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
			<View style={{ flex: 1, padding: 20, gap: 24 }}>
				<Pressable
					style={{ flexDirection: "row", gap: 12 }}
					onPress={() =>
						router.navigate("/(tabs)/(profile)/creatorProfile")
					}
				>
					<View
						style={{
							width: 60,
							height: 60,
							borderRadius: 30,
							backgroundColor: colors.line_break,
						}}
					/>
					<View style={{ gap: 4, alignItems: "flex-start" }}>
						<H2>Giorno Giovanni</H2>
						<View
							style={{
								backgroundColor: colors.carbs,
								borderRadius: 20,
								paddingVertical: 5,
								paddingHorizontal: 10,
							}}
						>
							<H5_SemiBold style={{ color: colors.white }}>
								PRO
							</H5_SemiBold>
						</View>
					</View>
				</Pressable>
				<View style={{}}>
					<Pressable
						style={{
							paddingVertical: 16,
							flexDirection: "row",
							justifyContent: "space-between",
							borderBottomWidth: 1,
							borderColor: colors.primary_bg,
						}}
						onPress={() =>
							router.push(
								"/(tabs)/(profile)/CreatorStudio/myRecipes",
							)
						}
					>
						<View
							style={{
								flexDirection: "row",
								gap: 8,
								alignItems: "center",
							}}
						>
							<RecipeIcon color={colors.primary} />
							<H3>Creator Studio</H3>
						</View>
						<ChevronRight color={colors.primary} />
					</Pressable>
					<Pressable
						style={{
							paddingVertical: 16,
							flexDirection: "row",
							justifyContent: "space-between",
							borderBottomWidth: 1,
							borderColor: colors.primary_bg,
						}}
					>
						<View
							style={{
								flexDirection: "row",
								gap: 8,
								alignItems: "center",
							}}
						>
							<SubscriptionIcon color={colors.primary} />
							<H3>Subscription</H3>
						</View>
						<ChevronRight color={colors.primary} />
					</Pressable>
					<Pressable
						style={{
							paddingVertical: 16,
							flexDirection: "row",
							justifyContent: "space-between",
							borderBottomWidth: 1,
							borderColor: colors.primary_bg,
						}}
						onPress={() => router.push("/(tabs)/(profile)/goals")}
					>
						<View
							style={{
								flexDirection: "row",
								gap: 8,
								alignItems: "center",
							}}
						>
							<PreferencesIcon color={colors.primary} />
							<H3>Preferences and Goals</H3>
						</View>
						<ChevronRight color={colors.primary} />
					</Pressable>
					<SecondaryButton
						onPress={() => router.push("/(tabs)/(profile)/account")}
					>
						Account
					</SecondaryButton>
					<SignOutButton />
				</View>
				<View
					style={{
						borderRadius: 8,
						backgroundColor: colors.white,
						padding: 16,
						gap: 16,
					}}
				>
					<H4>Upload your recipes and earn money!</H4>
					<PrimaryButton
						onPress={() =>
							router.push(
								"/CreatorOnboarding/creatorOnboardingProfile",
							)
						}
					>
						Become a Creator
					</PrimaryButton>
				</View>
				{/* {<View>
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
						onPress={() =>
							router.push(
								"/(tabs)/(profile)/CreatorStudio/myRecipes",
							)
						}
					>
						My Recipes
					</SecondaryButton>
					<SecondaryButton onPress={() => testbackend()}>
						TEST BACKEND
					</SecondaryButton>
					<SecondaryButton
						onPress={() =>
							router.push("/(tabs)/(profile)/creatorProfile")
						}
					>
						Creator Profile
					</SecondaryButton>
				</View>} */}
			</View>
		</KeyboardAware>
	);
};

export default profile;

const styles = StyleSheet.create({});
