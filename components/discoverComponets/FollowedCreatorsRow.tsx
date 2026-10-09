import { useFollowing } from "@/api/hooks/useFollowCreator";
import ArrowRight from "@/assets/svg/arrow-right.svg";
import Monogram from "@/components/UIComponents/Avatar/Monogram";
import { H2, H5, H6 } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

const AVATAR_SIZE = 60;

/**
 * "Creators You Follow" - a horizontal row of the accounts the user follows, with
 * an arrow through to the full list.
 *
 * Renders **nothing** while loading or when the list is empty. An empty section
 * headed "Creators You Follow" is worse than no section: it advertises the absence
 * of something, and for a new user it would be the first thing on Discover.
 *
 * The list deliberately bleeds past the screen gutter (`paddingHorizontal` on the
 * content rather than the container) so a partial card is visible at the edge -
 * that cut-off card is what tells the user the row scrolls.
 */
const FollowedCreatorsRow = () => {
	const router = useRouter();
	const { data: creators } = useFollowing();

	const followed = creators ?? [];
	if (followed.length === 0) return null;

	return (
		<View style={styles.section}>
			<Pressable
				accessibilityRole="button"
				accessibilityLabel={`See all ${followed.length} creators you follow`}
				onPress={() =>
					router.push("/(tabs)/(discover)/followedCreators")
				}
				style={({ pressed }) => [
					styles.header,
					pressed && styles.pressed,
				]}
			>
				<H2>Creators You Follow</H2>
				<ArrowRight color={colors.primary} pointerEvents="none" />
			</Pressable>

			<FlatList
				data={followed}
				horizontal
				showsHorizontalScrollIndicator={false}
				keyExtractor={(item) => item.username}
				contentContainerStyle={styles.row}
				ItemSeparatorComponent={<View style={{ width: 16 }} />}
				renderItem={({ item }) => (
					<Pressable
						accessibilityRole="button"
						accessibilityLabel={`${item.display_name}, @${item.username}`}
						onPress={() =>
							router.push({
								pathname: "/(tabs)/(discover)/creatorProfile",
								params: { username: item.username },
							})
						}
						style={({ pressed }) => [
							styles.creator,
							pressed && styles.pressed,
						]}
					>
						<Monogram name={item.display_name} size={AVATAR_SIZE} />
						<H6 numberOfLines={1} style={styles.name}>
							{item.display_name}
						</H6>
						<H5 numberOfLines={1} style={styles.username}>
							@{item.username}
						</H5>
					</Pressable>
				)}
			/>
		</View>
	);
};

export default FollowedCreatorsRow;

const styles = StyleSheet.create({
	section: {
		gap: 12,
		marginBottom: 40,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
	},
	pressed: {
		opacity: 0.7,
	},
	row: {
		paddingHorizontal: 20,
	},
	creator: {
		width: AVATAR_SIZE + 24,
		alignItems: "center",
		gap: 8,
	},
	name: {
		textAlign: "center",
	},
	username: {
		color: colors.medium_gray,
		textAlign: "center",
	},
});
