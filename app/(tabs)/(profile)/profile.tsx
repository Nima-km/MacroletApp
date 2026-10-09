import { useFollowerCount } from "@/api/hooks/useFollowCreator";
import { useCreatorStatus } from "@/api/hooks/useCreatorOnboarding";
import ChevronRight from "@/assets/svg/chevron-right.svg";
import DollarIcon from "@/assets/svg/dollar-frame.svg";
import RecipeIcon from "@/assets/svg/recipe-book.svg";
import SettingsIcon from "@/assets/svg/settings.svg";
import PreferencesIcon from "@/assets/svg/sliders.svg";
import SubscriptionIcon from "@/assets/svg/subscription.svg";
import ProfileIcon from "@/assets/svg/user.svg";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import Monogram from "@/components/UIComponents/Avatar/Monogram";
import ProBadge from "@/components/UIComponents/Badges/ProBadge";
import StatusBadge from "@/components/UIComponents/Badges/StatusBadge";
import GoogleSignInButton from "@/components/UIComponents/Buttons/authButtons/GoogleSignInButton";
import SignOutButton from "@/components/UIComponents/Buttons/authButtons/SignOutButton";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import { H2, H3, H5, H6 } from "@/components/UIComponents/Typography";
import { useSubscriptionState } from "@/api/hooks/useSubscriptionState";
import { colors } from "@/theme";
import { useAuth, useUser } from "@clerk/expo";
import Constants from "expo-constants";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
	ActivityIndicator,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleProp,
	StyleSheet,
	View,
	ViewStyle,
} from "react-native";

/**
 * Profile: identity, creator status and account destinations.
 *
 * Supersedes the previous version, kept verbatim at
 * `legacy/profile-legacy.tsx`. What changed and why:
 *
 * - The account rows used to render even when signed out, so a signed-out user
 *   was offered "Log Out". Everything is now behind one `isSignedIn` check.
 * - `useCreatorStatus` is a network query, and the page rendered the
 *   non-creator state while it was in flight - so creators saw the "Become a
 *   Creator" upsell and then their own rows popped in above it. There is now a
 *   loading state, an error state with a retry, and the creator slot renders
 *   only once the answer is known.
 * - Premium was read once on mount. Tab screens stay mounted, so buying a plan
 *   left this page on "Free" until the app restarted. It is a query now,
 *   refreshed whenever the page regains focus.
 * - Rows follow the style guide: flat, dividers in `light_gray` (the palette's
 *   divider colour) rather than `primary_bg`, inside white cards, with the screen
 *   gutter at 20 and `paddingBottom: 40` so the last row clears the tab bar.
 * - The avatar row navigated to Creator Earnings, which was a surprise, and did
 *   nothing at all for non-creators. It is now an identity block, and the public
 *   profile is its own row.
 */

/** A settings row: icon, label, optional status pill, chevron. */
function Row({
	icon,
	label,
	badge,
	onPress,
	last,
}: {
	icon: React.ReactNode;
	label: string;
	badge?: React.ReactNode;
	onPress: () => void;
	last?: boolean;
}) {
	return (
		<Pressable
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel={label}
			style={({ pressed }) => [
				styles.row,
				!last && styles.rowDivider,
				pressed && styles.rowPressed,
			]}
		>
			<View style={styles.rowLeft}>
				{icon}
				<H3>{label}</H3>
			</View>
			<View style={styles.rowRight}>
				{badge}
				{/* Decorative: the row already announces its label. */}
				<ChevronRight
					color={colors.primary}
					accessibilityElementsHidden
					importantForAccessibility="no"
				/>
			</View>
		</Pressable>
	);
}

function Card({
	children,
	style,
}: {
	children: React.ReactNode;
	style?: StyleProp<ViewStyle>;
}) {
	return <View style={[styles.card, style]}>{children}</View>;
}

const profile = () => {
	const { isSignedIn } = useAuth();
	const { user } = useUser();
	const router = useRouter();

	const {
		data: status,
		isLoading,
		isError,
		refetch,
		isRefetching,
	} = useCreatorStatus();

	const creator = status?.creator ?? null;
	const username = creator?.username ?? null;
	const followers = useFollowerCount(username);

	// Shared with Discover's premium gate, so the two screens cannot disagree
	// about whether the user is subscribed.
	const subscription = useSubscriptionState();
	const isPro = subscription.data?.entitled === true;

	useFocusEffect(
		useCallback(() => {
			subscription.refetch();
		}, [subscription.refetch]),
	);

	const onRefresh = useCallback(() => {
		refetch();
		subscription.refetch();
		followers.refetch();
	}, [refetch, subscription.refetch, followers.refetch]);

	const displayName =
		creator?.display_name ??
		user?.fullName ??
		user?.username ??
		"Your profile";

	const version = Constants.expoConfig?.version;

	if (!isSignedIn) {
		return (
			<View style={styles.screen}>
				<HeaderSimple title="Profile" back={false} />
				<ScrollView contentContainerStyle={styles.content}>
					<Card>
						<H3>Sign in to Macrolet</H3>
						<H5 style={styles.muted}>
							Save your recipes, sync your logs and follow creators.
						</H5>
						<GoogleSignInButton />
					</Card>
				</ScrollView>
			</View>
		);
	}

	return (
		<View style={styles.screen}>
			<HeaderSimple title="Profile" back={false} />
			<ScrollView
				contentContainerStyle={styles.content}
				refreshControl={
					<RefreshControl
						refreshing={isRefetching || subscription.isRefetching}
						onRefresh={onRefresh}
					/>
				}
			>
				<Card>
					<View style={styles.identity}>
						<Monogram name={displayName} size={56} />
						<View style={styles.identityText}>
							<H2 numberOfLines={1}>{displayName}</H2>
							{username ? (
								<H5 style={styles.muted}>@{username}</H5>
							) : null}
							<View style={styles.identityMeta}>
								{isPro ? <ProBadge /> : null}
								{followers.data ? (
									<H6 style={styles.muted}>
										{followers.data.count}{" "}
										{followers.data.count === 1
											? "follower"
											: "followers"}
									</H6>
								) : null}
							</View>
						</View>
					</View>
				</Card>

				{isLoading ? (
					<Card>
						<ActivityIndicator />
					</Card>
				) : isError ? (
					<Card>
						<H3>Couldn't load your creator status</H3>
						<H5 style={styles.muted}>
							Check your connection and try again.
						</H5>
						<PrimaryButton onPress={() => refetch()}>
							Try again
						</PrimaryButton>
					</Card>
				) : creator ? (
					<Card style={styles.rowCard}>
						<Row
							icon={<RecipeIcon color={colors.primary} />}
							label="Creator Studio"
							onPress={() =>
								router.push("/(tabs)/(profile)/CreatorStudio")
							}
						/>
						{status?.payouts_ready ? null : (
							<Row
								icon={<DollarIcon color={colors.primary} />}
								label="Finish payouts setup"
								badge={
									<StatusBadge
										label="Action needed"
										tone="warning"
									/>
								}
								onPress={() =>
									router.push(
										"/(tabs)/(profile)/CreatorStudio/CreatorEarnings",
									)
								}
							/>
						)}
						<Row
							icon={<ProfileIcon color={colors.primary} />}
							label="View public profile"
							onPress={() =>
								router.push({
									pathname:
										"/(tabs)/(discover)/creatorProfile",
									params: { username: username as string },
								})
							}
							last
						/>
					</Card>
				) : (
					<Card>
						<H3>Upload your recipes and earn money</H3>
						<H5 style={styles.muted}>
							Publish recipes, build a following, and get paid when
							subscribers cook from them.
						</H5>
						<PrimaryButton
							onPress={() =>
								router.push(
									"/(tabs)/(profile)/CreatorOnboarding/creatorOnboardingIntro",
								)
							}
						>
							Become a Creator
						</PrimaryButton>
					</Card>
				)}

				<Card style={styles.rowCard}>
					<Row
						icon={<SubscriptionIcon color={colors.primary} />}
						label="Subscription"
						badge={
							isPro ? (
								<StatusBadge label="Premium" tone="positive" />
							) : (
								<StatusBadge label="Free" tone="info" />
							)
						}
						onPress={() =>
							router.push("/(tabs)/(profile)/subscription")
						}
					/>
					<Row
						icon={<PreferencesIcon color={colors.primary} />}
						label="Preferences and Goals"
						onPress={() => router.push("/(tabs)/(profile)/goals")}
					/>
					<Row
						icon={<SettingsIcon color={colors.primary} />}
						label="Account"
						onPress={() => router.push("/(tabs)/(profile)/account")}
						last
					/>
				</Card>

				<Card style={styles.rowCard}>
					<SignOutButton />
				</Card>

				{version ? (
					<H6 style={[styles.muted, styles.version]}>
						Macrolet {version}
					</H6>
				) : null}
			</ScrollView>
		</View>
	);
};

export default profile;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	content: {
		// Gutter 20, and 40 at the end so the last row clears the tab bar.
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 40,
		gap: 20,
	},
	card: {
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 16,
		gap: 12,
	},
	/** Rows bring their own vertical padding, so the card only pads sideways. */
	rowCard: {
		paddingVertical: 0,
		gap: 0,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 16,
	},
	rowDivider: {
		borderBottomWidth: 1,
		borderColor: colors.light_gray,
	},
	rowPressed: {
		backgroundColor: colors.off_white,
	},
	rowLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		flex: 1,
	},
	rowRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	identity: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	identityText: {
		flex: 1,
		gap: 4,
	},
	identityMeta: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginTop: 4,
	},
	muted: {
		color: colors.medium_gray,
	},
	version: {
		textAlign: "center",
		color: colors.inactive,
	},
});
