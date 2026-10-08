import { useRecipeBookRecipes } from "@/api/hooks/useRecipeBook";
import RecipeCard from "@/components/chartComponents/Cards/RecipeCard";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import { H5 } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

/**
 * One online cookbook, styled like the Discover search's recipe results: the same
 * wide `RecipeCard`, a single column, and infinite scroll.
 *
 * Reached from the button beside a cookbook on the creator profile, which used to
 * just scroll the horizontal strip instead of opening anything.
 */
const onlineRecipeBook = () => {
	const { recipeBook_slug, bookName } = useLocalSearchParams<{
		recipeBook_slug: string;
		bookName?: string;
	}>();
	const router = useRouter();

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
	} = useRecipeBookRecipes(recipeBook_slug);

	const recipes = data?.pages.flatMap((page) => page.recipes) ?? [];

	/** Same navigation the recipe cards use everywhere else. */
	function onOnlineRecipe(recipeSlug: string | undefined | null) {
		if (recipeSlug)
			router.push({
				pathname: "/(tabs)/(discover)/onlineRecipe",
				params: { recipeSlug },
			});
	}

	if (isLoading) {
		return (
			<View style={{ flex: 1 }}>
				<HeaderSimple title={bookName ?? "Cookbook"} />
				<View
					style={{
						flex: 1,
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<ActivityIndicator />
				</View>
			</View>
		);
	}

	return (
		<View style={{ flex: 1 }}>
			<HeaderSimple title={bookName ?? "Cookbook"} />

			<FlatList
				data={recipes}
				scrollEnabled={true}
				showsVerticalScrollIndicator={false}
				keyExtractor={(item, index) =>
					item.recipeData.recipe_slug ?? String(index)
				}
				contentContainerStyle={{ padding: 20 }}
				renderItem={({ item: recipeItem }) => (
					<Pressable
						onPress={() =>
							onOnlineRecipe(recipeItem.recipeData.recipe_slug)
						}
					>
						<RecipeCard recipe={recipeItem} />
					</Pressable>
				)}
				onEndReached={() => {
					if (hasNextPage && !isFetchingNextPage) fetchNextPage();
				}}
				onEndReachedThreshold={0.5}
				ItemSeparatorComponent={<View style={{ height: 8 }} />}
				ListFooterComponent={
					isFetchingNextPage ? (
						<H5 style={{ color: colors.inactive }}>Loading…</H5>
					) : null
				}
				ListEmptyComponent={
					isError ? (
						<H5 style={{ color: colors.inactive }}>
							Could not load this cookbook
						</H5>
					) : (
						<H5 style={{ color: colors.inactive }}>
							No recipes in this cookbook yet
						</H5>
					)
				}
			/>
		</View>
	);
};

export default onlineRecipeBook;
