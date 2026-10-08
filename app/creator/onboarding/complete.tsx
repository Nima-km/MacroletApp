import {
	useCreatorStatus,
	useStartPayoutSetup,
} from "@/api/hooks/useCreatorOnboarding";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import {
	PrimaryButton,
	SecondaryButton,
} from "@/components/UIComponents/Buttons/Button";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { H3, H5 } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";

const STUDIO = "/(tabs)/(profile)/CreatorStudio/CreatorEarnings";

/**
 * Landing route for Stripe's `return_url`
 * (`macroletapp://creator/onboarding/complete`, via the backend's 302).
 *
 * Before this existed the deep link matched nothing, so finishing Stripe dropped
 * the user on an unmatched route and the app never learned the outcome.
 */
const CreatorOnboardingComplete = () => {
	const router = useRouter();
	const { data: status, refetch } = useCreatorStatus();
	const { mutate: finishSetup, isPending } = useStartPayoutSetup();

	// Ask Stripe directly on arrival: the webhook may not have landed yet, and
	// this is the moment the user expects an answer.
	useEffect(() => {
		void refetch();
	}, [refetch]);

	const ready = status?.payouts_ready === true;

	return (
		<KeyboardAware>
			<HeaderSimple title="Payouts" back={false} />
			<View style={styles.screen}>
				<View style={styles.card}>
					<H3>{ready ? "You're all set" : "Almost there"}</H3>
					<H5 style={styles.body}>
						{!status
							? "Checking with Stripe…"
							: ready
								? "Payouts are enabled. Your earnings will be transferred automatically each month."
								: "Stripe still needs a little more information before payouts can be enabled."}
					</H5>
				</View>

				{ready ? (
					<PrimaryButton onPress={() => router.replace(STUDIO)}>
						Go to Creator Studio
					</PrimaryButton>
				) : (
					<>
						<PrimaryButton
							onPress={() => finishSetup()}
							disabled={isPending}
						>
							{isPending ? "Opening Stripe…" : "Finish setup in Stripe"}
						</PrimaryButton>
						<SecondaryButton onPress={() => router.replace(STUDIO)}>
							Later
						</SecondaryButton>
					</>
				)}
			</View>
		</KeyboardAware>
	);
};

export default CreatorOnboardingComplete;

const styles = StyleSheet.create({
	// The root stack's background is `colors.error` (style guide §9 item 4), so
	// screens outside the tab layouts set their own.
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
