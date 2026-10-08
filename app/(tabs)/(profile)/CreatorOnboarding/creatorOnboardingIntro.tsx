import HeaderSimple from "@/components/navComponents/HeaderSimple";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { H3, H5 } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

/**
 * Creator onboarding, step 0: set expectations.
 *
 * The one thing this screen has to land is that payouts are *optional and
 * deferrable* - publishing and earning never require Stripe
 * (docs/PAYOUT_MODEL.md D7). Getting that across is what stops people abandoning
 * the flow at the bank-details step.
 */
const creatorOnboardingIntro = () => {
	const router = useRouter();

	return (
		<KeyboardAware>
			<HeaderSimple title="Become a Creator" />
			<View style={styles.content}>
				<View style={styles.card}>
					<H3>Share recipes. Earn from them.</H3>
					<H5 style={styles.body}>
						Publish your recipes and they appear in Discover, in search,
						and on your public profile. When paying subscribers log one of
						your recipes, you earn a share of their subscription.
					</H5>
				</View>

				<View style={styles.card}>
					<H3>What you need</H3>
					<H5 style={styles.body}>
						A unique username, a display name, and optionally a short bio.
						That's all - you can publish straight away.
					</H5>
					<H5 style={styles.body}>
						Setting up payouts is a separate step you can do whenever you
						like. You keep earning until you do, and everything you earn is
						held for you - never lost.
					</H5>
				</View>

				<PrimaryButton
					onPress={() =>
						router.push(
							"/(tabs)/(profile)/CreatorOnboarding/creatorOnboardingProfile",
						)
					}
				>
					Set up your creator profile
				</PrimaryButton>
			</View>
		</KeyboardAware>
	);
};

export default creatorOnboardingIntro;

const styles = StyleSheet.create({
	content: {
		flex: 1,
		padding: 20,
		paddingBottom: 40,
		gap: 20,
	},
	card: {
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 16,
		gap: 8,
	},
	body: {
		color: colors.medium_gray,
		lineHeight: 21,
	},
});
