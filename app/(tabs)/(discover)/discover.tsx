import {
	DISCOVER_DEFAULT_MANDATORY,
	DISCOVER_DEFAULT_OPTIONAL,
	useDiscoverFeed,
} from "@/api/hooks/useDiscoverFeed";
import { useTagPreferences } from "@/db/hooks/discover/useTagPreferences";
import { useSearchCreators } from "@/api/hooks/useSearchCreator";
import { useFilteredRecipes } from "@/api/hooks/useSearchRecipe";
import SettingsIcon from "@/assets/svg/settings.svg";
import SlidersIcon from "@/assets/svg/sliders.svg";
import { tagLabel } from "@/api/fetchTags";
import DiscoverFeed from "@/components/discoverComponets/DiscoverFeed";
import FollowedCreatorsRow from "@/components/discoverComponets/FollowedCreatorsRow";
import SearchRecipeResult from "@/components/discoverComponets/SearchRecipeResult";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import SearchFilterBottomSheet from "@/components/UIComponents/BottomSheet/SearchFilterBottomSheet";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { FormInputSearch } from "@/components/UIComponents/TextInputs/FormInput";
import { H5, H6 } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSubscriptionState } from "@/api/hooks/useSubscriptionState";
import { isApiError } from "@/api/errors";
import {
	ActivityIndicator,
	Pressable,
	RefreshControl,
	StyleSheet,
	View,
} from "react-native";

/** Two tags then "+N", so the summary under the search field stays one line. */
const SUMMARY_MAX = 2;
function summarise(names: string[]) {
	if (!names.length) return "None";
	const shown = names.slice(0, SUMMARY_MAX).map(tagLabel).join(", ");
	return names.length > SUMMARY_MAX
		? `${shown} +${names.length - SUMMARY_MAX}`
		: shown;
}

const discover = () => {
	const router = useRouter();

	// Discover, and the search it drives, is a Premium feature. This is the UI half
	// of the gate - the server enforces it too (`requireSubscription` on
	// `/discover`, `/recipes/search` and `/creator/search`), so the locked screen is
	// a courtesy rather than the protection: it stops a free user making requests
	// that can only come back 403.
	const {
		data: subscription,
		isLoading: subscriptionLoading,
		refetch: refetchSubscription,
	} = useSubscriptionState();
	const isEntitled = subscription?.entitled === true;

	const [searchInput, setSearchInput] = useState("");
	const [committedSearch, setCommittedSearch] = useState("");
	const [showSearch, setShowSearch] = useState(false);
	const [filters, setFilters] = useState<Record<string, string>>({});

	const {
		data: searchResult,
		isLoading,
		isFetching,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		error,
		refetch,
	} = useFilteredRecipes(filters, committedSearch);
	const flattenSearchResult =
		searchResult?.pages.flatMap((page) => page.data) ?? [];

	// Same committed search string drives both tabs; each is enabled by its own
	// minimum length, so neither fires for a one-letter query.
	const {
		data: creatorResult,
		fetchNextPage: fetchNextCreatorsPage,
		hasNextPage: hasNextCreatorsPage,
		isFetchingNextPage: isFetchingNextCreatorsPage,
		refetch: refetchCreators,
	} = useSearchCreators(committedSearch);
	const flattenCreatorResult =
		creatorResult?.pages.flatMap((page) => page.data) ?? [];

	// The user's own tag choices, from the local DB.
	const {
		required,
		preferred,
		isLoading: preferencesLoading,
	} = useTagPreferences();

	// Until someone has chosen tags, keep the filters this page always had, so
	// Discover does not silently become a different feed for anyone who never opens
	// Preferences. Delete this fallback once onboarding seeds a first choice.
	const hasPreferences = required.length > 0 || preferred.length > 0;
	const mandatory = hasPreferences ? required : DISCOVER_DEFAULT_MANDATORY;
	const optional = hasPreferences ? preferred : DISCOVER_DEFAULT_OPTIONAL;

	// Gated on the local read so the request is not sent twice: once with the
	// fallback tags, then again with the real ones.
	const {
		data: recipeList,
		isLoading: recipeListLoading,
		isError,
		error: discoverError,
		refetch: refetchRecipeList,
	} = useDiscoverFeed(mandatory, optional, !preferencesLoading && isEntitled);

	// Two ways to be locked: the local entitlement says no, or the request came back
	// 403 because the server disagrees - which now means only a stale local cache or
	// a lapsed subscription, since RevenueCat is the single authority on both sides.
	// Following the server keeps a paying user off "Couldn't load your feed" when
	// their local state has drifted.
	const forbiddenByServer =
		isApiError(discoverError) && discoverError.status === 403;
	const locked = !subscriptionLoading && (!isEntitled || forbiddenByServer);

	/**
	 * Pull-to-refresh.
	 *
	 * Local state rather than the query's `isRefetching`, so the spinner means "you
	 * pulled" and not "React Query decided to refetch" - a background refetch would
	 * otherwise flash it. The feed always refreshes; the two search queries only
	 * when a search is showing, since they are disabled without one.
	 */
	const [refreshing, setRefreshing] = useState(false);
	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			// Query results have different shapes, so this is Promise<unknown>[].
			const refreshes: Promise<unknown>[] = [refetchRecipeList()];
			if (committedSearch.length >= 3) {
				refreshes.push(refetch(), refetchCreators());
			}
			await Promise.all(refreshes);
		} finally {
			setRefreshing(false);
		}
	}, [refetchRecipeList, refetch, refetchCreators, committedSearch]);

	function handleSubmitSearch() {
		setShowSearch(true);
		setCommittedSearch(searchInput.trim());
		refetch();
	}

	function handleClearSearch() {
		setSearchInput("");
		setCommittedSearch("");
	}
	const sheetRef = useRef<BottomSheet>(null);
	function onOnlineRecipe(recipeSlug: string | undefined | null) {
		console.log("the online selected recipe is", recipeSlug);
		if (recipeSlug)
			router.push({
				pathname: "/(tabs)/(discover)/onlineRecipe",
				params: { recipeSlug },
			});
	}
	useEffect(() => {
		if (error) console.log("error", (error as Error).message, searchResult);
	}, [error]);
	return (
		<View style={{ flex: 1, paddingBottom: 20 }}>
			<KeyboardAware
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
					/>
				}
			>
				<HeaderSimple
					title="Discover"
					back={showSearch}
					backAction={() => setShowSearch(false)}
				/>

				{subscriptionLoading ? (
					<View style={styles.contentState}>
						<ActivityIndicator />
					</View>
				) : locked ? (
					<View style={styles.lockedWrap}>
						<View style={styles.lockedCard}>
							<H5 style={styles.lockedTitle}>
								Discover is a Premium feature
							</H5>
							<H6 style={styles.lockedBody}>
								Search every recipe, follow creators, and get
								sections built from the tags you pick.
							</H6>
							<PrimaryButton
								onPress={() =>
									router.push(
										"/(tabs)/(profile)/subscription",
									)
								}
							>
								Go Premium
							</PrimaryButton>
							{/* A subscriber whose entitlement went stale on the server
							    was stuck here with an app restart as the only way out.
							    Re-asking both the entitlement and the feed clears it. */}
							<Pressable
								accessibilityRole="button"
								accessibilityLabel="Recheck my subscription"
								onPress={() => {
									refetchSubscription();
									refetchRecipeList();
								}}
							>
								<H6 style={styles.lockedLink}>
									Already subscribed? Tap to recheck
								</H6>
							</Pressable>
						</View>
					</View>
				) : (
					<>
						<View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
							<View
								style={{
									flexDirection: "row",
									gap: 8,
									marginBottom: 20,
								}}
							>
								<View style={{ flex: 1 }}>
									<FormInputSearch
										value={searchInput}
										onSubmitEditing={handleSubmitSearch}
										onChangeText={setSearchInput}
									/>
								</View>
								<Pressable
									style={{
										backgroundColor: colors.primary_bg,
										borderRadius: 8,
										justifyContent: "center",
										alignItems: "center",
										width: 50,
										height: 50,
									}}
									onPress={() =>
										sheetRef.current?.snapToIndex(2)
									}
								>
									<SettingsIcon />
								</Pressable>
							</View>

							{/* What the feed is currently filtered by, and the way in to change
					    it. Tappable as a whole row rather than just the icon. */}
							<Pressable
								onPress={() =>
									router.push(
										"/(tabs)/(discover)/discoveryPreferences",
									)
								}
								accessibilityRole="button"
								accessibilityLabel="Edit discovery preferences"
								style={styles.summary}
							>
								<View style={{ flex: 1 }}>
									{hasPreferences ? (
										<>
											<H6
												style={styles.summaryLine}
												numberOfLines={1}
											>
												<H6 style={styles.summaryLabel}>
													Required:{" "}
												</H6>
												{summarise(required)}
											</H6>
											<H6
												style={styles.summaryLine}
												numberOfLines={1}
											>
												<H6 style={styles.summaryLabel}>
													Preferred:{" "}
												</H6>
												{summarise(preferred)}
											</H6>
										</>
									) : (
										<>
											<H6 style={styles.summaryLabel}>
												Personalise your feed
											</H6>
											<H6 style={styles.summaryLine}>
												Pick the tags you want recipes
												from
											</H6>
										</>
									)}
								</View>
								<SlidersIcon color={colors.primary} />
							</Pressable>
						</View>
						{!showSearch ? (
							// This area used to render nothing at all while the feed loaded,
							// and nothing forever if the request failed - so a slow feed
							// looked like a blank screen and a failed one was silent.
							recipeListLoading ? (
								<View style={styles.contentState}>
									<ActivityIndicator />
								</View>
							) : isError ? (
								<View style={styles.contentState}>
									<H5 style={styles.contentStateText}>
										Couldn't load your feed
									</H5>
									<PrimaryButton
										onPress={() => refetchRecipeList()}
									>
										Try again
									</PrimaryButton>
								</View>
							) : !recipeList?.sections?.length ? (
								<View style={styles.contentState}>
									<H5 style={styles.contentStateText}>
										Nothing here for these filters yet
									</H5>
									<PrimaryButton
										onPress={() =>
											router.push(
												"/(tabs)/(discover)/discoveryPreferences",
											)
										}
									>
										Adjust preferences
									</PrimaryButton>
								</View>
							) : (
								<View style={{ gap: 20 }}>
									{/* Above the feed rather than between sections: personal
							    content should not need a scroll to find. Hidden by
							    the component itself when the list is empty. */}

									<DiscoverFeed
										feedData={recipeList?.sections}
									/>
									<FollowedCreatorsRow />
								</View>
							)
						) : (
							<SearchRecipeResult
								recipes={flattenSearchResult}
								accounts={flattenCreatorResult}
								searchTerm={committedSearch}
								onEndReachedRecipes={() => {
									if (hasNextPage && !isFetchingNextPage)
										fetchNextPage();
								}}
								onEndReachedAccounts={() => {
									if (
										hasNextCreatorsPage &&
										!isFetchingNextCreatorsPage
									)
										fetchNextCreatorsPage();
								}}
								isFetchingNextPageRecipes={isFetchingNextPage}
								isFetchingNextPageAccounts={
									isFetchingNextCreatorsPage
								}
							/>
						)}
					</>
				)}
			</KeyboardAware>
			<SearchFilterBottomSheet
				ref={sheetRef}
				onApply={(newFilters) => setFilters(newFilters)}
			/>
		</View>
	);
};

export default discover;

const styles = StyleSheet.create({
	contentState: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: 16,
		padding: 20,
	},
	lockedWrap: {
		flex: 1,
		padding: 20,
	},
	lockedCard: {
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 16,
		gap: 12,
	},
	lockedTitle: {
		color: colors.primary,
	},
	lockedBody: {
		color: colors.medium_gray,
	},
	lockedLink: {
		color: colors.primary,
		textAlign: "center",
	},
	contentStateText: {
		color: colors.inactive,
		textAlign: "center",
	},
	summary: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 16,
	},
	summaryLabel: {
		color: colors.primary,
	},
	summaryLine: {
		color: colors.medium_gray,
	},
});
