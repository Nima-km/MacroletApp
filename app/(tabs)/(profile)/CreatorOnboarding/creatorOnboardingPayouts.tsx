import {
	useCreatorStatus,
	useStartPayoutSetup,
} from "@/api/hooks/useCreatorOnboarding";
import { messageForApiError } from "@/api/errors";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import {
	PrimaryButton,
	SecondaryButton,
} from "@/components/UIComponents/Buttons/Button";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { H3, H5, H6 } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";

const STUDIO = "/(tabs)/(profile)/CreatorStudio/CreatorEarnings";

const formatCents = (cents: number) =>
	(cents / 100).toLocaleString(undefined, {
		style: "currency",
		currency: "USD",
	});

/**
 * Creator onboarding, step 2 of 2: payouts.
 *
 * Deliberately skippable and phrased as a choice, not a wall: the profile is
 * already published, and earnings accumulate whether or not Stripe is set up
 * (docs/PAYOUT_MODEL.md D7).
 */
const creatorOnboardingPayouts = () => {
	const router = useRouter();
	const { data: status } = useCreatorStatus();
	const { mutate: startSetup, isPending, error } = useStartPayoutSetup();

	const payoutState = status?.payout_state ?? "pending";
	const ready = status?.payouts_ready === true;
	const held = status?.creator?.unpayable_cents ?? 0;

	const handleSetup = () => {
		startSetup(undefined, {
			onSuccess: (result) => {
				// 'success' means the browser reached our return URL. Anything else
				// ('dismiss', 'cancel', 'locked') means they closed the Stripe sheet
				// without finishing - not an error, just unfinished.
				if (result.browser.type === "success") {
					router.replace(STUDIO);
					return;
				}
				Toast.show({
					type: "info",
					text1: "Payouts not set up yet",
					text2: "You can finish this any time from Creator Studio.",
				});
			},
		});
	};

	return (
		<KeyboardAware>
			<HeaderSimple title="Get paid" />
			<View style={styles.content}>
				<H6 style={styles.step}>Step 2 of 2</H6>

				<View style={styles.card}>
					<H3>
						{ready ? "Payouts are set up" : "Set up payouts"}
					</H3>
					<H5 style={styles.body}>
						{ready
							? "Stripe has everything it needs. Your earnings will be transferred automatically each month."
							: "Payouts are how we send you the money you earn. Stripe handles the identity and bank details - we never see your bank account."}
					</H5>

					{held > 0 ? (
						<H5 style={styles.held}>
							{formatCents(held)} is waiting for you. It stays yours
							until you're ready.
						</H5>
					) : null}

					{payoutState === "restricted" ? (
						<H6 style={styles.warning}>
							Stripe needs more information before payouts can be
							enabled. Finish the steps in Stripe to continue.
						</H6>
					) : null}
				</View>

				{error ? (
					<H6 style={styles.error}>{messageForApiError(error)}</H6>
				) : null}

				{ready ? (
					<PrimaryButton onPress={() => router.replace(STUDIO)}>
						Go to Creator Studio
					</PrimaryButton>
				) : (
					<>
						<PrimaryButton onPress={handleSetup} disabled={isPending}>
							{isPending ? "Opening Stripe…" : "Set up payouts"}
						</PrimaryButton>
						<SecondaryButton onPress={() => router.replace(STUDIO)}>
							I'll do this later
						</SecondaryButton>
						<H6 style={styles.hint}>
							You can publish and earn without this. Nothing is lost by
							waiting.
						</H6>
					</>
				)}
			</View>
		</KeyboardAware>
	);
};

export default creatorOnboardingPayouts;

const styles = StyleSheet.create({
	content: {
		flex: 1,
		padding: 20,
		paddingBottom: 40,
		gap: 20,
	},
	step: {
		color: colors.inactive,
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
	held: {
		color: colors.dark_green,
		lineHeight: 21,
	},
	warning: {
		color: colors.dark_yellow,
		lineHeight: 20,
	},
	hint: {
		color: colors.inactive,
		lineHeight: 20,
	},
	error: {
		color: colors.error,
		lineHeight: 20,
	},
});
