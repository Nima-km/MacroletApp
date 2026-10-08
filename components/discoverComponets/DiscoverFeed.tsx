import { DiscoverSection } from "@/api/fetchDiscoverFeed";
import { FoodInsert } from "@/types/food";
import { RecipeInsert } from "@/types/recipe";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import RecipeCardSmall from "../chartComponents/Cards/RecipeCardSmall";
import { H2 } from "../UIComponents/Typography";

type RecipeCardData = {
	recipeData: RecipeInsert;
	foodData: FoodInsert;
};

type Props = {
	feedData?: DiscoverSection[];
};

const DiscoverFeed = ({ feedData }: Props) => {
	const router = useRouter();
	function onOnlineRecipe(recipeSlug: string | undefined | null) {
		console.log("the online selected recipe is", recipeSlug);
		if (recipeSlug)
			router.push({
				pathname: "/(tabs)/(discover)/onlineRecipe",
				params: { recipeSlug },
			});
	}

	// TEMP DIAGNOSTIC (remove with the ones in useDiscoverFeed): runs after the
	// first commit, so the gap from "discover screen mounted" is the render cost.
	const cardCount =
		feedData?.reduce((n, section) => n + section.recipes.length, 0) ?? 0;
	React.useEffect(() => {
		const t =
			typeof performance !== "undefined"
				? Math.round(performance.now())
				: 0;
		console.log(`[startup] feed rendered @${t}ms (${cardCount} cards)`);
	}, [cardCount]);

	return (
		<View style={{ flex: 1, paddingHorizontal: 20 }}>
			<View style={{ gap: 40 }}>
				{feedData?.map((item, index) => (
					<View style={{ gap: 12 }} key={index}>
						<H2>{item.title}</H2>
						<FlatList
							data={item.recipes}
							horizontal
							// Only ~2 cards fit on screen, so FlatList's default of
							// building 10 per section put ~20 cards (and ~20 image
							// requests) through the first paint for nothing.
							initialNumToRender={4}
							maxToRenderPerBatch={4}
							windowSize={3}
							renderItem={({ item }) => (
								<Pressable
									onPress={() =>
										onOnlineRecipe(
											item.recipeData.recipe_slug,
										)
									}
								>
									<RecipeCardSmall recipe={item} />
								</Pressable>
							)}
							scrollEnabled={true}
							ItemSeparatorComponent={
								<View style={{ height: 12, width: 12 }} />
							}
						/>
					</View>
				))}
			</View>
		</View>
	);
};

export default DiscoverFeed;

const styles = StyleSheet.create({});
