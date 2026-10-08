import { useStartPayoutSetup } from "@/api/hooks/useCreatorOnboarding";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import {
	PrimaryButton,
	SecondaryButton,
} from "@/components/UIComponents/Buttons/Button";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { H3, H5 } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

const STUDIO = "/(tabs)/(profile)/CreatorStudio/CreatorEarnings";

/**
 * Landing route for Stripe's `refresh_url`
 * (`macroletapp://creator/onboarding/refresh`). Stripe sends the user here when
 * an onboarding link expires or was already used, so the only useful thing to
 * offer is a fresh one.
 */
const CreatorOnboardingRefresh = () => {
	const router = useRouter();
	const { mutate: startSetup, isPending } = useStartPayoutSetup();

	return (
		<KeyboardAware>
			<HeaderSimple title="Payouts" back={false} />
			<View style={styles.screen}>
				<View style={styles.card}>
					<H3>That link expired</H3>
					<H5 style={styles.body}>
						Stripe onboarding links can only be used once. Get a fresh one
						to pick up where you left off - you won't have to start over.
					</H5>
				</View>

				<PrimaryButton
					onPress={() => startSetup()}
					disabled={isPending}
				>
					{isPending ? "Opening Stripe…" : "Get a new link"}
				</PrimaryButton>
				<SecondaryButton onPress={() => router.replace(STUDIO)}>
					Later
				</SecondaryButton>
			</View>
		</KeyboardAware>
	);
};

export default CreatorOnboardingRefresh;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: colors.off_white,
		padding: 20,
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
