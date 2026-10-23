import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import { H3, H5, H6 } from "@/components/UIComponents/Typography";
import { useBlockedAccounts, useUnblockAccount } from "@/api/hooks/useBlocks";
import { colors } from "@/theme";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

/**
 * Blocked accounts.
 *
 * Blocking is only half a control if it cannot be undone, so this is where it is.
 * The list comes from the server, so it survives a reinstall and matches what the
 * feed filtering is actually doing.
 */
export default function BlockedAccounts() {
	const { data, isLoading, error } = useBlockedAccounts();
	const { mutate: unblock, isPending } = useUnblockAccount();

	return (
		<View style={{ flex: 1 }}>
			<HeaderSimple title="Blocked accounts" />
			<ScrollView contentContainerStyle={styles.page}>
				{isLoading ? (
					<H5 style={styles.muted}>Loading…</H5>
				) : error ? (
					<H5 style={styles.muted}>
						Couldn't load your blocked accounts.
					</H5>
				) : !data || data.length === 0 ? (
					<View style={styles.card}>
						<H3>Nobody blocked</H3>
						<H5 style={styles.muted}>
							Blocked creators are hidden from search, discovery
							and their own profile.
						</H5>
					</View>
				) : (
					<View style={styles.card}>
						{data.map((account, index) => (
							<View key={account.username}>
								{index > 0 ? (
									<View style={styles.divider} />
								) : null}
								<View style={styles.row}>
									<View>
										<H5>{account.display_name}</H5>
										<H6 style={styles.muted}>
											@{account.username}
										</H6>
									</View>
									<Pressable
										onPress={() => unblock(account.username)}
										disabled={isPending}
										accessibilityRole="button"
										accessibilityLabel={`Unblock ${account.username}`}
										style={({ pressed }) => [
											styles.unblock,
											pressed && { opacity: 0.6 },
										]}
									>
										<H5 style={{ color: colors.primary }}>
											Unblock
										</H5>
									</Pressable>
								</View>
							</View>
						))}
					</View>
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	page: {
		paddingHorizontal: 20,
		paddingTop: 16,
		paddingBottom: 40,
		gap: 16,
	},
	card: {
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 16,
		gap: 12,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 10,
	},
	divider: {
		height: 1,
		backgroundColor: colors.light_gray,
		opacity: 0.6,
	},
	unblock: {
		paddingVertical: 8,
		paddingHorizontal: 8,
	},
	muted: {
		color: colors.inactive,
	},
});
