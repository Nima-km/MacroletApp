import RecipeCard from "@/components/chartComponents/Cards/RecipeCard";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import { H1, H2 } from "@/components/UIComponents/Typography";
import { useGetRecipeBook } from "@/db/hooks/recipeBook/useRecipeBook";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

const recipeBook = () => {
    const router = useRouter();

    const { recipeBook_id } = useLocalSearchParams();
    const { recipeBook_name } = useLocalSearchParams();
    const {
        data: recipeBookData,
        isLoading: recipeBookLoading,
        error: errorRecipeBook,
    } = useGetRecipeBook(Number(recipeBook_id));
    function onRecipe(food_id: number) {
        router.push({
            pathname: "/food",
            params: { food_id },
        });
    }
    if (recipeBookLoading) {
        return <H1>Loading</H1>;
    }
    if (!recipeBookData) {
        return <H1>COULD NOT LOAD RECIPEBOOK</H1>;
    }
    return (
        <View style={{ flex: 1 }}>
            <HeaderSimple title="Saved Recipes" />
            <View style={{ flex: 1, padding: 20, gap: 12 }}>
                <H2>{recipeBook_name}</H2>
                <FlatList
                    data={recipeBookData}
                    renderItem={({ item }) => (
                        <Pressable onPress={() => onRecipe(item.foodData.id)}>
                            <RecipeCard recipe={item} />
                        </Pressable>
                    )}
                />
            </View>
        </View>
    );
};

export default recipeBook;

const styles = StyleSheet.create({});
