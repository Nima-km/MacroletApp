import FoodCardIngredient from "@/components/chartComponents/Cards/FoodCardIngredient";

import { useIngredientBottomSheetStore } from "@/store/useStore";
import { colors } from "@/theme";
import { FoodItemData } from "@/types/food";
import { IngredientFullData } from "@/types/recipe";
import BottomSheet from "@gorhom/bottom-sheet";
import React, { forwardRef, useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { H5_SemiBold } from "../Typography";
import { BottomSheetCore } from "./BottomSheetCore";
import IngredientBottomSheetFooter from "./IngredientBottomSheetFooter";

interface IngredientBottomSheet {
    ingredientFullData: IngredientFullData[];
    isNewRecipe?: boolean;
    onLogAll: () => void;
    onRemove: (index: number) => void;
    onModify: (
        index: number,
        food_id: number,
        ingredientItemData: FoodItemData,
    ) => void;
}

const IngredientBottomSheet = forwardRef<BottomSheet, IngredientBottomSheet>(
    (
        {
            ingredientFullData,
            isNewRecipe = false,
            onRemove,
            onModify,
            onLogAll,
        },
        ref,
    ) => {
        const setFoodFullData = useIngredientBottomSheetStore(
            (s) => s.setFoodFullData,
        );
        useEffect(() => {
            if (setFoodFullData) {
                setFoodFullData(ingredientFullData ?? []);
            }
        }, [ingredientFullData]);
        if (ingredientFullData.length == 0) {
            return <View></View>;
        }
        return (
            <BottomSheetCore
                ref={ref}
                footer={
                    <IngredientBottomSheetFooter
                        onLogAll={onLogAll}
                        isNewRecipe={isNewRecipe}
                    />
                }
                header={
                    ingredientFullData?.length > 0 ? (
                        <H5_SemiBold style={{ color: colors.primary }}>
                            {ingredientFullData?.length} ingredient
                            {ingredientFullData?.length > 1 ? "s" : ""} selected
                        </H5_SemiBold>
                    ) : null
                }
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: "space-between",
                        paddingHorizontal: 20,
                    }}
                >
                    <FlatList
                        data={ingredientFullData}
                        renderItem={({ item, index }) => (
                            <Pressable
                                onPress={() =>
                                    onModify(
                                        index,
                                        item.food.id,
                                        item.ingredientItem,
                                    )
                                }
                            >
                                <FoodCardIngredient
                                    food={item.food}
                                    ingredientItem={item.ingredientItem}
                                    onRemove={() => onRemove(index)}
                                />
                            </Pressable>
                        )}
                        //keyExtractor={(item, index) => item.food.name + index.toString()}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => (
                            <View
                                style={{
                                    height: 1,
                                    flex: 1,
                                    backgroundColor: colors.primary_bg,
                                    marginHorizontal: 20,
                                }}
                            />
                        )}
                    />
                </View>
            </BottomSheetCore>
        );
    },
);
export default IngredientBottomSheet;

const styles = StyleSheet.create({
    rowContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 0,
    },
    chartsContainer: {
        flexDirection: "row",
        marginLeft: 20,
        flex: 1,
        justifyContent: "space-around",
    },
});
