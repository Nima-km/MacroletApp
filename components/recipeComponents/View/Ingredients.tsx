import FoodCardIngredient from "@/components/chartComponents/Cards/FoodCardIngredient";
import { calculateCalories } from "@/helper/calculateCalories";
import { macroSum } from "@/helper/calculateMacro";
import { colors } from "@/theme";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

import {
    SimpleChartCarbsMacro,
    SimpleChartFatMacro,
    SimpleChartProteinMacro,
} from "@/components/chartComponents/SimpleChart/SimpleChartMacro";
import { SecondaryAddButton } from "@/components/UIComponents/Buttons/Button";
import DropDownServings from "@/components/UIComponents/DropDown/DropDownServings";
import IngredientModal from "@/components/UIComponents/Modals/IngredientModal";
import { useRecipeStateStore } from "@/store/recipeStore/useRecipeStore";
import { DefaultServings } from "@/tests/testData";
import PrepCookButton from "../../UIComponents/Buttons/PrepCookButton";
import { H1, H2, H6 } from "../../UIComponents/Typography";

type Props = {
    servings: number;
    setServings: (newServing: number) => void;
    addIngredient: () => void;
};
const Ingredients = ({ servings, addIngredient, setServings }: Props) => {
    const foodData = useRecipeStateStore((state) => state.data.foodData);
    const recipeData = useRecipeStateStore((state) => state.data.recipeData);
    const ingredientItemsData = useRecipeStateStore(
        (state) => state.data.ingredientItemsData,
    );
    const updateIngredient = useRecipeStateStore(
        (state) => state.updateIngredient,
    );
    const removeIngredient = useRecipeStateStore(
        (state) => state.removeIngredient,
    );
    const [showIngredientModal, setShowIngredientModal] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState(0);
    function calculate_final(inp: number) {
        return inp * servings;
    }
    useEffect(() => {
        //console.log("recipe changed, ingredient", foodData);
    }, [foodData]);
    const calories = calculateCalories(foodData);
    const total_macro = macroSum(foodData);
    return (
        <View style={{ flex: 1, gap: 24 }}>
            <PrepCookButton
                prepTime={recipeData.prep_time ?? 0}
                cookTime={recipeData.cook_time ?? 0}
                setCookTime={(hour, mins) => {}}
                setPrepTime={(hour, mins) => {}}
                disable
            />

            <View style={{ flexDirection: "row" }}>
                <View style={{ justifyContent: "center", flex: 1 }}>
                    <H1>{Math.floor(calculate_final(calories))} cal</H1>
                </View>
                <View style={{ flex: 1 }}>
                    <DropDownServings
                        options={DefaultServings}
                        placeholder={{
                            serving_type: "Serving",
                            serving_mult: 1,
                        }}
                        servings={servings}
                        setServings={setServings}
                    />
                </View>
            </View>
            <H6>Nutritional information shown are per serving</H6>
            <View style={styles.chartsContainer}>
                <SimpleChartProteinMacro
                    target={total_macro}
                    progress={calculate_final(foodData.protein ?? 0)}
                    backgroundColor={colors.white}
                />
                <SimpleChartCarbsMacro
                    target={total_macro}
                    progress={calculate_final(foodData.carbs ?? 0)}
                    backgroundColor={colors.white}
                />
                <SimpleChartFatMacro
                    target={total_macro}
                    progress={calculate_final(foodData.fat ?? 0)}
                    backgroundColor={colors.white}
                />
            </View>

            <View style={{ flexDirection: "row" }}>
                <H2>Ingredients</H2>
            </View>
            <FlatList
                data={ingredientItemsData}
                renderItem={({ item, index }) => (
                    <Pressable
                        onPress={() => {
                            (setSelectedIngredient(index),
                                setShowIngredientModal(true));
                        }}
                    >
                        <FoodCardIngredient
                            style={{ backgroundColor: "" }}
                            food={item.food}
                            ingredientItem={item.ingredientItem}
                        />
                    </Pressable>
                )}
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
                extraData={showIngredientModal}
            />
            <View>
                <SecondaryAddButton onPress={addIngredient}>
                    Add Ingredient
                </SecondaryAddButton>
            </View>
            <View>
                <Modal
                    visible={showIngredientModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => {
                        setShowIngredientModal(false);
                    }}
                >
                    <IngredientModal
                        foodData={ingredientItemsData[selectedIngredient].food}
                        ingredientData={
                            ingredientItemsData[selectedIngredient]
                                .ingredientItem
                        }
                        options={[...DefaultServings]}
                        selectedOption={0}
                        setIngredient={(updatedIngredient) =>
                            updateIngredient(
                                selectedIngredient,
                                updatedIngredient,
                            )
                        }
                        onClose={() => setShowIngredientModal(false)}
                        onSwap={() =>
                            console.log(
                                "implement onSwap for ingredientModal in Ingredients.tsx",
                            )
                        }
                        onDelete={() =>
                            ingredientItemsData.length > 1
                                ? (setSelectedIngredient(0),
                                  removeIngredient(selectedIngredient))
                                : () => {}
                        }
                    />
                </Modal>
            </View>
        </View>
    );
};

export default Ingredients;

const styles = StyleSheet.create({
    chartsContainer: {
        flexDirection: "row",

        //alignItems: 'center',
        justifyContent: "space-between",
        gap: 20,
    },
});
