import { useInsertFoodAndItem } from "@/db/hooks/food/useFood";
import { useRecipeStateStore } from "@/store/recipeStore/useRecipeStore";
import { FoodDefault, FoodItemDefault } from "@/tests/testData";
import { FoodInsert, FoodItemData } from "@/types/food";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import KeyboardAware from "../UIComponents/KeyboardAware/KeyboardAware";
import FoodView from "../UIComponents/Modals/Food/FoodView";

const QuickAddComponent = () => {
    const router = useRouter();
    const recipeStoreData = useRecipeStateStore((state) => state.data);
    const {
        mutate: logFoodAndItem,
        isPending: logFoodAndItemPending,
        error: logFoodAndItemError,
        isSuccess: logFoodAndItemSuccess,
    } = useInsertFoodAndItem();
    const [edit, setEdit] = useState(true);
    const [foodItem, setFoodItem] = useState({
        ...FoodItemDefault,
        timestamp: new Date(),
    });
    function LogNewFood(food: FoodInsert, foodItem: FoodItemData) {
        if (foodItem) {
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
            console.log(`something went wrong`);
        }
    }

    return (
        <KeyboardAware>
            <View style={{ marginHorizontal: 20 }}>
                <FoodView
                    foodData={FoodDefault}
                    foodItemData={foodItem}
                    servingData={[]}
                    primaryText={"Log"}
                    primaryButton={LogNewFood}
                    ingredientItemsData={[]}
                    edit={edit}
                    setEdit={setEdit}
                />
            </View>
        </KeyboardAware>
    );
};

export default QuickAddComponent;

const styles = StyleSheet.create({});
