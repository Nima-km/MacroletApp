import HeaderFood from "@/components/navComponents/HeaderFood";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import FoodView from "@/components/UIComponents/Modals/Food/FoodView";
import { H1 } from "@/components/UIComponents/Typography";
import {
    useGetFood,
    useInsertFoodAndItem,
    useUpdateFoodAndItem,
} from "@/db/hooks/food/useFood";
import {
    useDeleteFoodItem,
    useGetFoodItem,
    useInsertFoodItem,
    useUpdateFoodItem,
} from "@/db/hooks/food/useFoodItem";
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
import { FoodInsert, FoodItemData } from "@/types/food";
import { ServingSizeType } from "@/types/servingSize";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

const foodItem = () => {
    const router = useRouter();
    const { food_id, foodItem_id } = useLocalSearchParams();
    const recipeStoreData = useRecipeStateStore((state) => state.data);
    const {
        data: foodData,
        isLoading: foodDataLoading,
        error: errorfoodData,
    } = useGetFood(Number(food_id));
    const recipeStore = useRecipeStateStore();
    const {
        data: foodItemData,
        isLoading: foodItemDataLoading,
        error: errorfoodItemData,
    } = useGetFoodItem(Number(foodItem_id));
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
        mutate: updateFoodAndItem,
        isPending: updateFoodAndItemPending,
        error: updateFoodAndItemError,
        isSuccess: updateFoodAndItemSuccess,
    } = useUpdateFoodAndItem();
    const {
        mutate: logFoodAndItem,
        isPending: logFoodAndItemPending,
        error: logFoodAndItemError,
        isSuccess: logFoodAndItemSuccess,
    } = useInsertFoodAndItem();
    const {
        mutate: updateFoodItem,
        isPending: updateFoodItemPending,
        error: updateFoodItemError,
        isSuccess: updateFoodItemSuccess,
    } = useUpdateFoodItem();
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
    const { mutate: deleteFoodItem } = useDeleteFoodItem();
    const [edit, setEdit] = useState(false);
    const [servings, setServings] = useState(1);

    function LogNewFood(food: FoodInsert, foodItem: FoodItemData) {
        if (foodItem) {
            if (
                recipeData?.[0]?.recipe &&
                ingredients != recipeStoreData.ingredientItemsData
            ) {
                if (isValidRecipeDraft(recipeStoreData))
                    logAndCreateRecipe({
                        recipeData: { ...recipeStoreData },
                        foodItem,
                    });
            } else if (food != foodData?.[0]) {
                logFoodAndItem(
                    { foodData: food, foodItemData: foodItem },
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
    function LogUpdateFoodItem(food: FoodInsert, foodItem: FoodItemData) {
        if (foodItem)
            if (
                recipeData?.[0]?.recipe &&
                ingredients != recipeStoreData.ingredientItemsData
            ) {
                if (isValidRecipeDraft(recipeStoreData)) {
                    logAndCreateRecipe({
                        recipeData: { ...recipeStoreData },
                        foodItem,
                    });
                    deleteFoodItem(Number(foodItem_id), {
                        onSuccess: (item) => {
                            console.log(`Removed from history`);
                            //  context.setDate(new Date(context.date.getDate() + 1)) FOR DEBUGGING
                        },
                        onError: (item) => {
                            console.log(`Something Went Wrong`, item);
                        },
                    });
                }
            } else if (food != foodData?.[0]) {
                updateFoodAndItem(
                    {
                        foodData: food,
                        foodItemData: foodItem,
                        foodItemID: Number(foodItem_id),
                    },
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
            } else {
                updateFoodItem(
                    { data: foodItem, id: Number(foodItem_id) },
                    {
                        onSuccess: () => {
                            console.log(`${food.name} has been logged`);
                            router.replace("/(tabs)/(logs)/logs");
                        },
                        onError: (err) => {
                            console.error("Insert failed:", err);
                        },
                    },
                );
            }
        else {
            console.log(`something went wrong`);
        }
    }
    useEffect(() => {
        console.log("RecipeData?.[0] && ingredients &&", ingredients);
        if (recipeData?.[0] && ingredients) {
            setEdit(true);
            recipeStore.initializeRecipe({
                recipeData: recipeData[0].recipe,
                foodData: recipeData[0].food,
                ingredientItemsData: ingredients,
            });
        }
    }, [recipeData, ingredients]);
    if (foodDataLoading || foodItemDataLoading) {
        return <H1>loading</H1>;
    }
    if (foodData == undefined || foodItemData == undefined) {
        return <H1>Couldn't Load Food</H1>;
    }
    return (
        <KeyboardAware>
            <HeaderFood
                title={"View Meal"}
                isEdit={edit}
                onEdit={setEdit}
                onBack={() => console.log("back pressed")}
            />
            <View style={{ padding: 20 }}>
                <FoodView
                    foodData={foodData[0]}
                    foodItemData={foodItemData[0]}
                    recipeData={recipeData?.[0]?.recipe}
                    servingData={servingData}
                    primaryText={"Update"}
                    primaryButton={LogUpdateFoodItem}
                    secondaryText={"Log New"}
                    secondaryButton={LogNewFood}
                    setNewServing={AddNewServing}
                    ingredientItemsData={ingredients ?? []}
                    edit={edit}
                    setEdit={setEdit}
                />
            </View>
        </KeyboardAware>
    );
};

export default foodItem;

const styles = StyleSheet.create({});
