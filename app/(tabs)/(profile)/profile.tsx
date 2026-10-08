import { TESTBACKEND } from "@/api/searchRecipe";
import { useCreatorStatus } from "@/api/hooks/useCreatorOnboarding";
import ChevronRight from "@/assets/svg/chevron-right.svg";
import RecipeIcon from "@/assets/svg/recipe-book.svg";
import PreferencesIcon from "@/assets/svg/sliders.svg";
import SubscriptionIcon from "@/assets/svg/subscription.svg";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import Monogram from "@/components/UIComponents/Avatar/Monogram";
import ProBadge from "@/components/UIComponents/Badges/ProBadge";
import SignOutButton from "@/components/UIComponents/Buttons/authButtons/SignOutButton";
import {
	PrimaryButton,
	SecondaryButton,
	SubButton,
} from "@/components/UIComponents/Buttons/Button";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { H2, H3, H4, H5_SemiBold } from "@/components/UIComponents/Typography";
import { getSubscriptionState } from "@/lib/revenuecat";
import { colors } from "@/theme";
import { useAuth, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";

const profile = () => {
	const { getToken, isSignedIn } = useAuth();
	const { user } = useUser();
	const router = useRouter();
	const { data: status } = useCreatorStatus();
	const creator = status?.creator ?? null;
	const payoutsReady = status?.payouts_ready === true;
	const [isPro, setIsPro] = useState(false);

	// The badge reflects a real subscription, not optimism.
	useEffect(() => {
		let active = true;
		getSubscriptionState()
			.then((state) => {
				if (active) setIsPro(state.entitled);
			})
			.catch(() => {
				// No RevenueCat key in this build; leave the badge off.
			});
		return () => {
			active = false;
		};
	}, []);

	const displayName =
		creator?.display_name ??
		user?.fullName ??
		user?.username ??
		(isSignedIn ? "Your profile" : "Not signed in");

	async function testbackend() {
		const token = await getToken();
		if (token) console.log("result", await TESTBACKEND(token));
		else console.log("login");
	}
	return (
		<KeyboardAware>
			<HeaderSimple title="Profile" back={false} />
			<View style={{ flex: 1, padding: 20, gap: 24 }}>
				{isSignedIn ? (
					<Pressable
						style={{ flexDirection: "row", gap: 12 }}
						onPress={() =>
							creator
								? router.navigate(
										"/(tabs)/(profile)/CreatorStudio/CreatorEarnings",
									)
								: undefined
						}
					>
						<Monogram name={displayName} />
						<View style={{ gap: 4, alignItems: "flex-start" }}>
							<H2 numberOfLines={1}>{displayName}</H2>
							{isPro ? (
								<ProBadge />
							) : (
								<SubButton
									onPress={() =>
										router.push(
											"/(tabs)/(profile)/subscription",
										)
									}
								>
									Get Premium
								</SubButton>
							)}
						</View>
					</Pressable>
				) : null}
				<View style={{}}>
					{creator ? (
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
									"/(tabs)/(profile)/CreatorStudio",
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
					) : null}
					{creator && !payoutsReady ? (
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
									"/(tabs)/(profile)/CreatorStudio/CreatorEarnings",
								)
							}
						>
							<View
								style={{
									flexDirection: "row",
									gap: 8,
									alignItems: "center",
									flex: 1,
								}}
							>
								<SubscriptionIcon color={colors.primary} />
								<H3>Finish payouts setup</H3>
							</View>
							<ChevronRight color={colors.primary} />
						</Pressable>
					) : null}
					<Pressable
						style={{
							paddingVertical: 16,
							flexDirection: "row",
							justifyContent: "space-between",
							borderBottomWidth: 1,
							borderColor: colors.primary_bg,
						}}
						onPress={() =>
							router.push("/(tabs)/(profile)/subscription")
						}
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
				{isSignedIn && !creator ? (
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
									"/(tabs)/(profile)/CreatorOnboarding/creatorOnboardingIntro",
								)
							}
						>
							Become a Creator
						</PrimaryButton>
					</View>
				) : null}
			</View>
		</KeyboardAware>
	);
};

export default profile;

const styles = StyleSheet.create({});
