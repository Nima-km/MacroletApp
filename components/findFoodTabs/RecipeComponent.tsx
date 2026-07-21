import CreateRecipe from "@/assets/svg/create-recipe.svg";
import FindRecipe from "@/assets/svg/find-recipe.svg";
import {
	useGetAllRecipeList,
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
import { H2 } from "../UIComponents/Typography";

const RecipeComponent = () => {
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
	const { mutate: insertRecipeBook } = useInsertRecipeBook();

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
					<H2>Saved</H2>

					<View>
						<FlatList
							data={recipeBookList}
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
						<FlatList
							data={recipeList}
							renderItem={({ item }) => (
								<Pressable
									onPress={() =>
										router.push({
											pathname: "/food",
											params: {
												food_id: item.foodData.id,
											},
										})
									}
									style={{ paddingVertical: 10 }}
								>
									<RecipeCard recipe={item} />
								</Pressable>
							)}
							scrollEnabled={false}
						/>
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
