import {
	useCreatorStatus,
	useStartPayoutSetup,
} from "@/api/hooks/useCreatorOnboarding";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import StatusBadge from "@/components/UIComponents/Badges/StatusBadge";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { H2, H3, H5, H6 } from "@/components/UIComponents/Typography";
import { formatCents, payoutLabel, payoutTone } from "@/lib/payouts";
import { colors } from "@/theme";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

/**
 * Creator earnings.
 *
 * This is where deferring payouts pays off: the money a creator earns without a
 * Stripe account is shown here rather than being invisible, which is what turns
 * "set up payouts" from an obstacle into an obvious next step.
 *
 * The per-period breakdown (paid vs trial credits) belongs here too, but needs a
 * payout-history endpoint that does not exist yet.
 */
const CreatorEarnings = () => {
	const router = useRouter();
	const { data: status, isLoading } = useCreatorStatus();
	const { mutate: startSetup, isPending } = useStartPayoutSetup();

	const creator = status?.creator;
	const payoutState = status?.payout_state ?? "pending";
	const ready = status?.payouts_ready === true;
	const pendingCents = creator?.pending_balance_cents ?? 0;
	const heldCents = creator?.unpayable_cents ?? 0;

	if (isLoading) {
		return (
			<KeyboardAware>
				<HeaderSimple title="Creator Earnings" />
				<View style={styles.screen}>
					<H5 style={styles.muted}>Loading…</H5>
				</View>
			</KeyboardAware>
		);
	}

	if (!creator) {
		return (
			<KeyboardAware>
				<HeaderSimple title="Creator Earnings" />
				<View style={styles.screen}>
					<View style={styles.card}>
						<H3>You're not a creator yet</H3>
						<H5 style={styles.muted}>
							Publish a recipe to start earning from subscribers who log
							it.
						</H5>
					</View>
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
			</KeyboardAware>
		);
	}

	return (
		<KeyboardAware>
			<HeaderSimple title="Creator Earnings" />
			<View style={styles.screen}>
				<View style={styles.card}>
					<H3>Payouts</H3>
					<StatusBadge
						label={payoutLabel(payoutState)}
						tone={payoutTone(payoutState)}
					/>
					<H5 style={styles.muted}>
						{ready
							? "Your earnings are transferred automatically each month."
							: "Your earnings are yours, and are held until payouts are set up. Nothing is lost by waiting."}
					</H5>
				</View>

				<View style={styles.card}>
					<H6 style={styles.muted}>Held until payouts are set up</H6>
					<H2>{formatCents(heldCents)}</H2>
				</View>

				<View style={styles.card}>
					<H6 style={styles.muted}>Ready to pay out</H6>
					<H2>{formatCents(pendingCents)}</H2>
				</View>

				{!ready ? (
					<PrimaryButton
						onPress={() => startSetup()}
						disabled={isPending}
					>
						{isPending ? "Opening Stripe…" : "Set up payouts"}
					</PrimaryButton>
				) : null}

				<H6 style={styles.hint}>
					Earnings are calculated at the end of each month from the
					recipes subscribers logged. A monthly breakdown is coming.
				</H6>
			</View>
		</KeyboardAware>
	);
};

export default CreatorEarnings;

const styles = StyleSheet.create({
	screen: {
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
	muted: {
		color: colors.medium_gray,
		lineHeight: 21,
	},
	hint: {
		color: colors.inactive,
		lineHeight: 20,
	},
});
