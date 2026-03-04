import HeaderFood from "@/components/navComponents/HeaderFood";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import FoodView from "@/components/UIComponents/Modals/Food/FoodView";
import { H1 } from "@/components/UIComponents/Typography";
import { useGetFood, useInsertFoodAndItem } from "@/db/hooks/food/useFood";
import { useInsertFoodItem } from "@/db/hooks/food/useFoodItem";
import { useCreateAndLogRecipeWithFoodAndIngredients } from "@/db/hooks/recipe/useCreateRecipe";
import {
    useGetIngredientsFromFoodID,
    useGetRecipeFromFoodID,
} from "@/db/hooks/recipe/useGetRecipe";
import {
    useGetFoodServingSize,
    useInsertServingSize,
} from "@/db/hooks/servings/useServings";
import {
    isValidRecipeDraft,
    useRecipeStateStore,
} from "@/store/recipeStore/useRecipeStore";
import { FoodItemDefault } from "@/tests/testData";
import { FoodInsert, FoodItemData } from "@/types/food";

import { ServingSizeType } from "@/types/servingSize";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

const food = () => {
    const router = useRouter();
    const { food_id, foodItem_id } = useLocalSearchParams();
    const recipeStoreData = useRecipeStateStore((state) => state.data);
    const {
        data: foodData,
        isLoading: foodDataLoading,
        error: errorfoodData,
    } = useGetFood(Number(food_id));
    const {
        data: recipeData,
        isLoading: RecipeDataLoading,
        error: errorRecipeData,
    } = useGetRecipeFromFoodID(Number(food_id));
    const {
        data: ingredients,
        isLoading: ingredientsDataLoading,
        error: erroringredientsData,
    } = useGetIngredientsFromFoodID(Number(food_id));
    const {
        data: servingData,
        isLoading: servingDataLoading,
        error: errorservingData,
    } = useGetFoodServingSize(Number(food_id));
    const {
        mutate: logFoodItem,
        isPending: logFoodItemPending,
        error: logFoodItemError,
        isSuccess: logFoodItemSuccess,
    } = useInsertFoodItem();
    const {
        mutate: logFoodAndItem,
        isPending: logFoodAndItemPending,
        error: logFoodAndItemError,
        isSuccess: logFoodAndItemSuccess,
    } = useInsertFoodAndItem();
    const {
        mutate: logAndCreateRecipe,
        isPending: logAndCreateRecipePending,
        error: logAndCreateRecipeError,
        isSuccess: logAndCreateRecipeSuccess,
    } = useCreateAndLogRecipeWithFoodAndIngredients();
    const {
        mutate: logServing,
        isPending: logServingPending,
        error: logServingError,
        isSuccess: logServingSuccess,
    } = useInsertServingSize();
    const [edit, setEdit] = useState(false);
    const [foodItem, setFoodItem] = useState({
        ...FoodItemDefault,
        timestamp: new Date(),
    });
    function LogNewFood(food: FoodInsert, foodItem: FoodItemData) {
        if (foodItem) {
            if (
                recipeData?.[0]?.recipe &&
                ingredients != recipeStoreData.ingredientItemsData
            ) {
                if (isValidRecipeDraft(recipeStoreData))
                    logAndCreateRecipe({
                        recipeData: recipeStoreData,
                        foodItem,
                    });
            } else {
                logFoodItem(
                    { ...foodItem, food_id: Number(food_id) },
                    {
                        onSuccess: () => {
                            console.log(`${food.name} has been logged`);
                            router.push("/(tabs)/(logs)/logs");
                        },
                        onError: (err) => {
                            console.error("Insert failed:", err);
                        },
                    },
                );
            }
        } else {
            console.log(`something went wrong`);
        }
    }
    function AddNewServing(newServing: Omit<ServingSizeType, "food_id">) {
        if (newServing) {
            console.log("the new serving is", newServing);
            logServing({ ...newServing, food_id: Number(food_id) });
        } else {
            console.log(`something went wrong`);
        }
    }
    if (foodDataLoading) {
        return <H1>loading</H1>;
    }
    if (foodData == undefined) {
        return <H1>Couldn't Load Food</H1>;
    }
    return (
        <KeyboardAware>
            <HeaderFood
                title={"View Meal"}
                isEdit={edit}
                onEdit={setEdit}
                onBack={() => router.back()}
            />
            <View style={{ padding: 20 }}>
                <FoodView
                    foodData={foodData[0]}
                    foodItemData={foodItem}
                    recipeData={recipeData?.[0]?.recipe}
                    servingData={servingData ?? []}
                    primaryText={"Log"}
                    primaryButton={LogNewFood}
                    setNewServing={AddNewServing}
                    ingredientItemsData={ingredients ?? []}
                    edit={edit}
                    setEdit={setEdit}
                />
            </View>
        </KeyboardAware>
    );
};

export default food;

const styles = StyleSheet.create({});
