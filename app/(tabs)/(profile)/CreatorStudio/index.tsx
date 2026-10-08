import { useCreatorStatus } from "@/api/hooks/useCreatorOnboarding";
import ChevronRight from "@/assets/svg/chevron-right.svg";
import EarningsIcon from "@/assets/svg/dollar-frame.svg";
import RecipesIcon from "@/assets/svg/recipe-book.svg";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import StatusBadge from "@/components/UIComponents/Badges/StatusBadge";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { H3, H6 } from "@/components/UIComponents/Typography";
import { payoutLabel, payoutSummary, payoutTone } from "@/lib/payouts";
import { colors } from "@/theme";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

/**
 * Creator Studio hub.
 *
 * The Studio was a folder of screens with no landing page, so Earnings was only
 * reachable from a conditional row on Profile. This gives the section an entry
 * point, and leaves room for analytics or payout history later.
 *
 * Row geometry matches the Profile screen's rows (screen gutter 20, 16 vertical
 * padding, 1px `primary_bg` separator) so the two read as one system.
 */
const CreatorStudio = () => {
	const router = useRouter();
	const { data: status } = useCreatorStatus();

	const creator = status?.creator ?? null;

	const rows = [
		{
			key: "recipes",
			label: "My Recipes",
			icon: <RecipesIcon color={colors.primary} />,
			meta: null as string | null,
			badge: null as React.ReactNode,
			go: () => router.push("/(tabs)/(profile)/CreatorStudio/myRecipes"),
		},
		{
			key: "earnings",
			label: "Earnings",
			icon: <EarningsIcon color={colors.primary} />,
			meta: status ? payoutSummary(status) : null,
			badge: status ? (
				<StatusBadge
					label={payoutLabel(status.payout_state)}
					tone={payoutTone(status.payout_state)}
				/>
			) : null,
			go: () =>
				router.push("/(tabs)/(profile)/CreatorStudio/CreatorEarnings"),
		},
	];

	return (
		<KeyboardAware>
			<HeaderSimple title="Creator Studio" />
			<View style={styles.content}>
				{rows.map((row) => (
					<Pressable key={row.key} style={styles.row} onPress={row.go}>
						<View style={styles.rowLeft}>
							{row.icon}
							<View style={styles.rowText}>
								<H3>{row.label}</H3>
								{row.meta ? (
									<H6 style={styles.meta}>{row.meta}</H6>
								) : null}
							</View>
						</View>
						<ChevronRight color={colors.primary} />
					</Pressable>
				))}

				{creator && !status?.payouts_ready ? (
					<View style={styles.card}>
						<H6 style={styles.meta}>
							Your earnings are held until payouts are set up. Nothing
							is lost by waiting.
						</H6>
					</View>
				) : null}
			</View>
		</KeyboardAware>
	);
};

export default CreatorStudio;

const styles = StyleSheet.create({
	content: {
		flex: 1,
		padding: 20,
		paddingBottom: 40,
		gap: 20,
	},
	row: {
		paddingVertical: 16,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderBottomWidth: 1,
		borderColor: colors.primary_bg,
	},
	rowLeft: {
		flexDirection: "row",
		gap: 8,
		alignItems: "center",
		flex: 1,
	},
	rowText: {
		gap: 4,
		flex: 1,
	},
	meta: {
		color: colors.medium_gray,
	},
	card: {
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 16,
		gap: 8,
	},
});
