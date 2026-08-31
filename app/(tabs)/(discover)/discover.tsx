import { useDiscoverFeed } from "@/api/hooks/useDiscoverFeed";
import { useFilteredRecipes } from "@/api/hooks/useSearchRecipe";
import SettingsIcon from "@/assets/svg/settings.svg";
import DiscoverFeed from "@/components/discoverComponets/DiscoverFeed";
import SearchRecipeResult from "@/components/discoverComponets/SearchRecipeResult";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import SearchFilterBottomSheet from "@/components/UIComponents/BottomSheet/SearchFilterBottomSheet";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { FormInputSearch } from "@/components/UIComponents/TextInputs/FormInput";
import { colors } from "@/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
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
	const {
		data: recipeList,
		isLoading: recipeListLoading,
		isError,
		error: discoverError,
		refetch: refetchRecipeList,
	} = useDiscoverFeed(
		["high-protein", "low-calorie"],
		["high-protein", "low-calorie"],
	);

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
					{
						<PrimaryButton
							onPress={() =>
								router.push({
									pathname: "/creatorProfile",
									params: { username: "noma" },
								})
							}
						>
							TEST
						</PrimaryButton>
					}
				</View>
				{!showSearch ? (
					<DiscoverFeed feedData={recipeList?.sections} />
				) : (
					<SearchRecipeResult
						recipes={flattenSearchResult}
						onEndReachedRecipes={() => {
							if (hasNextPage && !isFetchingNextPage)
								fetchNextPage();
						}}
						isFetchingNextPageRecipes={isFetchingNextPage}
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

const styles = StyleSheet.create({});
