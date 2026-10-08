import {
	DISCOVER_DEFAULT_MANDATORY,
	DISCOVER_DEFAULT_OPTIONAL,
	useDiscoverFeed,
} from "@/api/hooks/useDiscoverFeed";
import { useSearchCreators } from "@/api/hooks/useSearchCreator";
import { useFilteredRecipes } from "@/api/hooks/useSearchRecipe";
import SettingsIcon from "@/assets/svg/settings.svg";
import DiscoverFeed from "@/components/discoverComponets/DiscoverFeed";
import SearchRecipeResult from "@/components/discoverComponets/SearchRecipeResult";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import SearchFilterBottomSheet from "@/components/UIComponents/BottomSheet/SearchFilterBottomSheet";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { FormInputSearch } from "@/components/UIComponents/TextInputs/FormInput";
import { H5 } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
const discover = () => {
	const router = useRouter();

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
	} = useSearchCreators(committedSearch);
	const flattenCreatorResult =
		creatorResult?.pages.flatMap((page) => page.data) ?? [];
	const {
		data: recipeList,
		isLoading: recipeListLoading,
		isError,
		error: discoverError,
		refetch: refetchRecipeList,
	} = useDiscoverFeed(DISCOVER_DEFAULT_MANDATORY, DISCOVER_DEFAULT_OPTIONAL);

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
	// TEMP DIAGNOSTIC (remove with the one in useDiscoverFeed): if this prints
	// BEFORE the "[discover] token …" line, the app-start warm-up worked and the
	// remaining delay is inside the request path.
	useEffect(() => {
		const t =
			typeof performance !== "undefined"
				? Math.round(performance.now())
				: 0;
		console.log(`[startup] discover screen mounted @${t}ms`);
	}, []);

	useEffect(() => {
		if (error) console.log("error", (error as Error).message, searchResult);
	}, [error]);
	return (
		<View style={{ flex: 1, paddingBottom: 20 }}>
			<KeyboardAware>
				<HeaderSimple
					title="Discover"
					back={showSearch}
					backAction={() => setShowSearch(false)}
				/>

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
							onPress={() => sheetRef.current?.snapToIndex(2)}
						>
							<SettingsIcon />
						</Pressable>
					</View>
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
							<PrimaryButton onPress={() => refetchRecipeList()}>
								Try again
							</PrimaryButton>
						</View>
					) : !recipeList?.sections?.length ? (
						<View style={styles.contentState}>
							<H5 style={styles.contentStateText}>
								Nothing to show for these filters yet
							</H5>
						</View>
					) : (
						<DiscoverFeed feedData={recipeList?.sections} />
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
						isFetchingNextPageAccounts={isFetchingNextCreatorsPage}
					/>
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
	contentStateText: {
		color: colors.inactive,
		textAlign: "center",
	},
});
