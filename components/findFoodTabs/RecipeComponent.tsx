import CreateRecipe from "@/assets/svg/create-recipe.svg";
import FindRecipe from "@/assets/svg/find-recipe.svg";
import {
	useGetAllRecipeList,
	useGetRecentRecipeList,
	useGetRecipeBookList,
} from "@/db/hooks/recipeBook/getRecipeBookList";
import { useInsertRecipeBook } from "@/db/hooks/recipeBook/useRecipeBook";
import { useImageManager } from "@/helper/useImageManager";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Modal, Pressable, View } from "react-native";
import RecipeBookCard from "../chartComponents/Cards/RecipeBookCard";
import RecipeCard from "../chartComponents/Cards/RecipeCard";
import { SecondaryButton } from "../UIComponents/Buttons/Button";
import KeyboardAware from "../UIComponents/KeyboardAware/KeyboardAware";
import CreateRecipeBook from "../UIComponents/Modals/CreateRecipeBook";
import { H2, H3 } from "../UIComponents/Typography";
import SwipeableAdd from "../UIComponents/Swipeable/SwipeableAdd";
import { FoodItemDefault } from "@/tests/testData";
import { FoodFullData } from "@/types/food";

const RecipeComponent = ({
	onAddFood,
	search = "",
}: {
	/** Swiping a row adds it to the current log, as in the Recent tab. */
	onAddFood?: (item: FoodFullData) => void;
	/** FindFood's search bar, shared with the Recent tab. */
	search?: string;
}) => {
	const router = useRouter();
	const [testpics, setTestPics] = useState<string[]>([]);
	const { addImageFromGallery } = useImageManager();
	const [showCreateRecipe, setShowCreateRecipe] = useState(false);
	const onAddImage = async () => {
		const image = await addImageFromGallery();
		if (!image) return;
		setTestPics((prev) => [...prev, image.uri]);
	};
	const {
		data: recipeBookList,
		isLoading: recipeBookLoading,
		error: recipeBookError,
	} = useGetRecipeBookList();
	const {
		data: recipeList,
		isLoading: recipeListLoading,
		error: recipeListError,
	} = useGetAllRecipeList();
	const { data: recentRecipes } = useGetRecentRecipeList();
	const { mutate: insertRecipeBook } = useInsertRecipeBook();

	const term = search.trim().toLowerCase();
	const matches = (name?: string | null) =>
		!term || (name ?? "").toLowerCase().includes(term);
	const visibleBooks = (recipeBookList ?? []).filter((book) =>
		matches(book.name),
	);
	const visibleRecipes = (recipeList ?? []).filter((item) =>
		matches(item.foodData?.name),
	);
	const visibleRecent = (recentRecipes ?? []).filter((item) =>
		matches(item.foodData?.name),
	);

	function createRecipeBook(newName: string) {
		insertRecipeBook(
			{ name: newName },
			{ onSuccess: () => console.log("logged") },
		);
	}
	function onRecipeBook(recipeBook_name: string, recipeBook_id: number) {
		router.push({
			pathname: "/(tabs)/(logs)/recipeBook",
			params: { recipeBook_name, recipeBook_id },
		});
	}

	return (
		<KeyboardAware>
			<View style={{ flex: 1, marginHorizontal: 20 }}>
				<View style={{ flex: 1, gap: 12 }}>
					<View
						style={{
							flexDirection: "row",
							gap: 20,
						}}
					>
						<SecondaryButton
							onPress={() =>
								router.push(
									"/(tabs)/(logs)/CreateRecipe/overview",
								)
							}
							style={{}}
							icon={<CreateRecipe pointerEvents="none" />}
						>
							Create Recipe
						</SecondaryButton>
						<SecondaryButton
							onPress={() => router.push("/discover")}
							style={{ flex: 1 }}
							icon={<FindRecipe pointerEvents="none" />}
						>
							Find Recipe
						</SecondaryButton>
					</View>
					{!term && visibleRecent.length > 0 ? (
						<>
							<H3>Recently used</H3>
							<View>
								{visibleRecent.map((item) => (
									<View key={`row-${item.foodData.id}`} style={{ paddingVertical: 10 }}>
									<SwipeableAdd
										onSwipe={() => onAddFood?.({ food: item.foodData, foodItem: FoodItemDefault })}
									>
										<Pressable
											onPress={() => router.push({ pathname: "/food", params: { food_id: item.foodData.id } })}
																					>
											<RecipeCard recipe={item} />
										</Pressable>
									</SwipeableAdd>
									</View>
								))}
							</View>
						</>
					) : null}

					<H2>Saved</H2>

					<View>
						<FlatList
							data={visibleBooks}
							renderItem={({ item }) => (
								<Pressable
									onPress={() =>
										onRecipeBook(item.name, item.id)
									}
								>
									<RecipeBookCard recipeBookData={item} />
								</Pressable>
							)}
							horizontal
							ItemSeparatorComponent={() => (
								<View style={{ width: 16 }} />
							)}
						/>
					</View>
					<View style={{ gap: 8 }}>
						<H2>All Recipes</H2>
						{/* Mapped, not virtualised: this is the local recipe list inside
						    KeyboardAware's ScrollView, which is what triggers "VirtualizedLists should
						    never be nested". A recipe collection is short enough not to need windowing. */}
						{visibleRecipes.map((item) => (
							<View
								key={`row-${item.foodData.id}`}
								style={{ paddingVertical: 10 }}
							>
							<SwipeableAdd
								key={item.foodData.id}
								onSwipe={() => onAddFood?.({ food: item.foodData, foodItem: FoodItemDefault })}
							>
							<Pressable
								key={item.foodData.id}
								onPress={() =>
									router.push({
									    pathname: "/food",
									    params: { food_id: item.foodData.id },
								})
								}
															>
								<RecipeCard recipe={item} />
							</Pressable>
							</SwipeableAdd>
									</View>
						))}
					</View>
				</View>
				<Modal
					visible={showCreateRecipe}
					transparent
					animationType="fade"
					onRequestClose={() => {
						setShowCreateRecipe(false);
					}}
				>
					<CreateRecipeBook
						setText={(newName) => createRecipeBook(newName)}
						onClose={() => setShowCreateRecipe(false)}
						error={""}
					/>
				</Modal>
			</View>
		</KeyboardAware>
	);
};

export default RecipeComponent;
