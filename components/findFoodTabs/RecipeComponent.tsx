import CreateRecipe from "@/assets/svg/create-recipe.svg";
import FindRecipe from "@/assets/svg/find-recipe.svg";
import { useGetRecipeBookList } from "@/db/hooks/recipeBook/getRecipeBookList";
import { useInsertRecipeBook } from "@/db/hooks/recipeBook/useRecipeBook";
import { useImageManager } from "@/helper/useImageManager";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, View } from "react-native";
import { SecondaryButton } from "../UIComponents/Buttons/Button";
import CreateRecipeBook from "../UIComponents/Modals/CreateRecipeBook";
import { H2 } from "../UIComponents/Typography";
import RecipeBookCard from "../chartComponents/Cards/RecipeBookCard";

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
    useEffect(() => {
        console.log("RecipeComponent", recipeBookList);
    }, [recipeBookList]);
    return (
        <View style={{ flex: 1 }}>
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
                                "/(tabs)/(logs)/HandleCreateRecipe/createRecipeInfo",
                            )
                        }
                        style={{}}
                        icon={<CreateRecipe pointerEvents="none" />}
                    >
                        Create Recipe
                    </SecondaryButton>
                    <SecondaryButton
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
                                onPress={() => onRecipeBook(item.name, item.id)}
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
                <View>
                    <H2>All Recipes</H2>
                    <View>
                        <SecondaryButton
                            onPress={() => setShowCreateRecipe(true)}
                        >
                            create recipebook
                        </SecondaryButton>
                    </View>
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
    );
};

export default RecipeComponent;

const styles = StyleSheet.create({});
