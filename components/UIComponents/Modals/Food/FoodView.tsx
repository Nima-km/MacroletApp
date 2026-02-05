import RecipeInfoCore from "@/components/recipeComponents/RecipeInfoCore";
import { useRecipeStateStore } from "@/store/recipeStore/useRecipeStore";
import { FoodInsert, FoodItemData } from "@/types/food";
import { IngredientFullData, RecipeInsert } from "@/types/recipe";
import { ServingSizeType } from "@/types/servingSize";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import FoodInfoCore from "./FoodInfoCore";

interface Props {
    foodData: FoodInsert;
    foodItemData: FoodItemData & Required<Pick<FoodItemData, "timestamp">>;
    recipeData?: RecipeInsert;
    servingData: Omit<ServingSizeType, "food_id">[];
    setNewServing?: (newServing: Omit<ServingSizeType, "food_id">) => void;
    primaryText: string;
    secondaryText?: string;
    ingredientItemsData: Array<IngredientFullData>;
    edit: boolean;
    setEdit: (item: boolean) => void;
    primaryButton: (food: FoodInsert, foodItem: FoodItemData) => void;
    secondaryButton?: (food: FoodInsert, foodItem: FoodItemData) => void;
}
const FoodView = ({
    foodData,
    foodItemData,
    recipeData,
    ingredientItemsData,
    edit,
    servingData,
    primaryText,
    secondaryText,
    primaryButton,
    secondaryButton,
    setNewServing,
    setEdit,
}: Props) => {
    const recipeStore = useRecipeStateStore((state) => state);
    const ingredientItemsStore = useRecipeStateStore(
        (state) => state.data.ingredientItemsData,
    );
    const foodStore = useRecipeStateStore((state) => state.data.foodData);
    const [foodItem, setFoodItem] = useState(foodItemData);
    const [food, setFood] = useState(foodData);
    useEffect(() => {
        if (recipeData && ingredientItemsData) {
            setEdit(true);
            recipeStore.initializeRecipe({
                recipeData,
                foodData,
                ingredientItemsData,
            });
            setFood((prev) => ({ ...prev, ...foodData }));
        }
        console.log(
            "FoodView, recipeData && ingredientItemsData : ",
            ingredientItemsData,
            recipeData,
        );
    }, [ingredientItemsData, recipeData]);
    useEffect(() => {
        if (recipeData && ingredientItemsData) {
            console.log("food got updated, foodView");
            setFood((prev) => ({ ...prev, ...foodStore }));
        }
    }, [foodStore]);
    return (
        <View style={{ flex: 1 }}>
            {recipeData && ingredientItemsData && edit ? (
                <RecipeInfoCore
                    servings={foodItem.servings}
                    setServings={(newServing) =>
                        setFoodItem((prev) => ({
                            ...prev,
                            servings: newServing,
                        }))
                    }
                    onLogRecipe={() => setEdit(false)}
                />
            ) : (
                <FoodInfoCore
                    foodData={food}
                    foodItemData={foodItem}
                    servingsData={servingData}
                    setNewServing={setNewServing}
                    primaryText={primaryText}
                    primaryButton={primaryButton}
                    secondaryText={secondaryText}
                    secondaryButton={secondaryButton}
                    edit={recipeData ? false : edit}
                    setEdit={setEdit}
                />
            )}
        </View>
    );
};

export default FoodView;

const styles = StyleSheet.create({});
