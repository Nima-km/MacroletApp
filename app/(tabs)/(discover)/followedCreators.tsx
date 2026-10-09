import { useFollowing } from "@/api/hooks/useFollowCreator";
import AccountResultCard from "@/components/discoverComponets/AccountResultCard";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import { H5 } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

/**
 * Everyone the signed-in user follows.
 *
 * Same rows as Discover → Search → Accounts (`AccountResultCard`), because the
 * backend returns the same item shape - so this page is the full-size version of
 * the row on Discover, and unfollowing here removes the row.
 */
const FollowedCreators = () => {
	const router = useRouter();
	const { data: creators, isLoading, isError, refetch } = useFollowing();

	const followed = creators ?? [];

	return (
		<View style={styles.screen}>
			<HeaderSimple title="Creators You Follow" />

			{isLoading ? (
				<View style={styles.centred}>
					<ActivityIndicator />
				</View>
			) : isError ? (
				<View style={styles.centred}>
					<H5 style={styles.muted}>
						Couldn't load the creators you follow
					</H5>
					<PrimaryButton onPress={() => refetch()}>
						Try again
					</PrimaryButton>
				</View>
			) : followed.length === 0 ? (
				<View style={styles.centred}>
					<H5 style={styles.muted}>
						You don't follow anyone yet
					</H5>
					<PrimaryButton onPress={() => router.back()}>
						Find creators
					</PrimaryButton>
				</View>
			) : (
				<FlatList
					data={followed}
					keyExtractor={(item) => item.username}
					contentContainerStyle={styles.list}
					ItemSeparatorComponent={<View style={{ height: 8 }} />}
					renderItem={({ item }) => (
						<AccountResultCard creator={item} />
					)}
				/>
			)}
		</View>
	);
};

export default FollowedCreators;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	centred: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: 16,
		padding: 20,
	},
	muted: {
		color: colors.medium_gray,
		textAlign: "center",
	},
	list: {
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 40,
	},
});
