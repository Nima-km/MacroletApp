import { useToggleFollow } from "@/api/hooks/useFollowCreator";
import type { CreatorSearchItem } from "@/api/searchCreator";
import Monogram from "@/components/UIComponents/Avatar/Monogram";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import { H4, H6 } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

const AVATAR_SIZE = 56;

const followerLabel = (count: number) =>
	`${count.toLocaleString()} ${count === 1 ? "follower" : "followers"}`;

/**
 * An account result in Discover search: avatar, name, follower count, Follow.
 *
 * The design also shows a strip of the creator's recipe thumbnails beneath this.
 * It is deliberately absent: there is no image pipeline yet (no upload endpoint,
 * no storage, no image column on `recipe`), so there is nothing real to render.
 * `CreatorSearchItem.thumbnails` is already in the API contract, so adding the
 * strip is a change to this file only once images exist — see
 * `Macrolet-Express/docs/IMAGE_PIPELINE.md`.
 */
export default function AccountResultCard({
	creator,
}: {
	creator: CreatorSearchItem;
}) {
	const router = useRouter();
	const { mutate: toggleFollow, isPending, variables } = useToggleFollow();

	// Only this row shows a pending state when several rows share the hook.
	const busy = isPending && variables?.username === creator.username;

	return (
		<View style={styles.card}>
			<View style={styles.topRow}>
				<Pressable
					style={styles.identity}
					onPress={() =>
						router.push({
							pathname: "/creatorProfile",
							params: { username: creator.username },
						})
					}
				>
					<Monogram name={creator.display_name} size={AVATAR_SIZE} />
					<View style={styles.text}>
						<H4 numberOfLines={1}>{creator.display_name}</H4>
						<H6 style={styles.meta}>
							{followerLabel(creator.followers)}
						</H6>
					</View>
				</Pressable>

				<PrimaryButton
					compact
					disabled={busy}
					onPress={() =>
						toggleFollow({
							username: creator.username,
							following: creator.is_following,
						})
					}
				>
					{creator.is_following ? "Following" : "Follow"}
				</PrimaryButton>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 16,
		gap: 12,
	},
	topRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	identity: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		flex: 1,
	},
	text: {
		flex: 1,
		gap: 4,
	},
	meta: {
		color: colors.medium_gray,
	},
});
