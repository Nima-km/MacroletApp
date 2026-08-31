import { RecipeCardData } from "@/api/fetchDiscoverFeed";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import RecipeCard from "../chartComponents/Cards/RecipeCard";
import TopNav from "../navComponents/TopNav";
import { H5 } from "../UIComponents/Typography";

type Props = {
	recipes?: RecipeCardData[];
	accounts?: string[];
	cookBooks?: string[];
	onEndReachedRecipes: () => void;
	isFetchingNextPageRecipes: boolean;
};
const SearchRecipeResult = ({
	recipes,
	accounts,
	cookBooks,
	onEndReachedRecipes,
	isFetchingNextPageRecipes,
}: Props) => {
	const [selectedPage, setSelectedPage] = useState(1);
	const router = useRouter();
	function onOnlineRecipe(recipeSlug: string | undefined | null) {
		console.log("the online selected recipe is", recipeSlug);
		if (recipeSlug)
			router.push({
				pathname: "/(tabs)/(discover)/onlineRecipe",
				params: { recipeSlug },
			});
	}
	return (
		<View style={{ flex: 1 }}>
			<View
				style={{
					//backgroundColor: colors.off_white,
					//paddingVertical: 5,
					//marginHorizontal: -20,
					zIndex: 10,
				}}
				collapsable={false}
			>
				<View>
					<TopNav
						selectedValue={selectedPage}
						style={{
							gap: 60,
						}}
						options={[
							{ label: "Accounts", value: 0 },
							{ label: "Recipes", value: 1 },
							{ label: "Cookbooks", value: 2 },
						]}
						onSelect={setSelectedPage}
					/>
				</View>
				<View style={{ flex: 1, padding: 20 }}>
					<FlatList
						data={recipes}
						scrollEnabled={false}
						onEndReached={onEndReachedRecipes}
						ListEmptyComponent={<H5>No recipes found</H5>}
						onEndReachedThreshold={0.5}
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
				</View>
			</View>
		</View>
	);
};

export default SearchRecipeResult;

const styles = StyleSheet.create({});
