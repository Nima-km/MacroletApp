import { RecipeCardData } from "@/api/fetchDiscoverFeed";
import type { CreatorSearchItem } from "@/api/searchCreator";
import { colors } from "@/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import RecipeCard from "../chartComponents/Cards/RecipeCard";
import TopNav from "../navComponents/TopNav";
import { H5 } from "../UIComponents/Typography";
import AccountResultCard from "./AccountResultCard";

const ACCOUNTS_TAB = 0;
const RECIPES_TAB = 1;
const COOKBOOKS_TAB = 2;

type Props = {
	recipes?: RecipeCardData[];
	accounts?: CreatorSearchItem[];
	searchTerm?: string;
	onEndReachedRecipes: () => void;
	onEndReachedAccounts: () => void;
	isFetchingNextPageRecipes: boolean;
	isFetchingNextPageAccounts: boolean;
};

const SearchRecipeResult = ({
	recipes,
	accounts,
	searchTerm,
	onEndReachedRecipes,
	onEndReachedAccounts,
	isFetchingNextPageRecipes,
	isFetchingNextPageAccounts,
}: Props) => {
	const [selectedPage, setSelectedPage] = useState(RECIPES_TAB);
	const router = useRouter();

	function onOnlineRecipe(recipeSlug: string | undefined | null) {
		if (recipeSlug)
			router.push({
				pathname: "/(tabs)/(discover)/onlineRecipe",
				params: { recipeSlug },
			});
	}

	return (
		<View style={{ flex: 1 }}>
			<View style={{ zIndex: 10 }} collapsable={false}>
				<View>
					<TopNav
						selectedValue={selectedPage}
						style={{ gap: 60 }}
						options={[
							{ label: "Accounts", value: ACCOUNTS_TAB },
							{ label: "Recipes", value: RECIPES_TAB },
							{ label: "Cookbooks", value: COOKBOOKS_TAB },
						]}
						onSelect={setSelectedPage}
					/>
				</View>

				<View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
					{searchTerm ? (
						<H5 style={styles.heading}>
							Showing results for "{searchTerm}"
						</H5>
					) : null}
				</View>

				<View style={{ flex: 1, padding: 20 }}>
					{selectedPage === ACCOUNTS_TAB ? (
						<FlatList
							data={accounts}
							scrollEnabled={false}
							onEndReached={onEndReachedAccounts}
							onEndReachedThreshold={0.5}
							// A spinner-less footer keeps the list from jumping; the
							// heading already tells the user what was searched.
							ListEmptyComponent={
								<H5 style={styles.empty}>No accounts found</H5>
							}
							ListFooterComponent={
								isFetchingNextPageAccounts ? (
									<H5 style={styles.empty}>Loading…</H5>
								) : null
							}
							renderItem={({ item }) => (
								<AccountResultCard creator={item} />
							)}
							ItemSeparatorComponent={<View style={{ height: 8 }} />}
						/>
					) : selectedPage === RECIPES_TAB ? (
						<FlatList
							data={recipes}
							scrollEnabled={false}
							onEndReached={onEndReachedRecipes}
							onEndReachedThreshold={0.5}
							ListEmptyComponent={
								<H5 style={styles.empty}>No recipes found</H5>
							}
							ListFooterComponent={
								isFetchingNextPageRecipes ? (
									<H5 style={styles.empty}>Loading…</H5>
								) : null
							}
							renderItem={({ item }) => (
								<Pressable
									onPress={() =>
										onOnlineRecipe(item.recipeData.recipe_slug)
									}
								>
									<RecipeCard recipe={item} />
								</Pressable>
							)}
							ItemSeparatorComponent={<View style={{ height: 8 }} />}
						/>
					) : (
						// There is no cookbook search endpoint yet, so this tab is
						// explicitly not-yet rather than an empty result list that
						// implies a search ran and found nothing.
						<H5 style={styles.empty}>Cookbook search is coming soon</H5>
					)}
				</View>
			</View>
		</View>
	);
};

export default SearchRecipeResult;

const styles = StyleSheet.create({
	heading: {
		color: colors.medium_gray,
	},
	empty: {
		color: colors.inactive,
	},
});
