import DropDownServings from "@/components/UIComponents/DropDown/DropDownServings";
import { calculateCalories } from "@/helper/calculateCalories";
import { macroSum } from "@/helper/calculateMacro";
import { CalculateMacroSumIngredient } from "@/helper/recipeMacroSum";
import { useRecipeStateStore } from "@/store/recipeStore/useRecipeStore";
import { DefaultServings } from "@/tests/testData";
import { colors } from "@/theme";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import {
    SimpleChartCarbsMacro,
    SimpleChartFatMacro,
    SimpleChartProteinMacro,
} from "../../chartComponents/SimpleChart/SimpleChartMacro";
import PrepCookButton from "../../UIComponents/Buttons/PrepCookButton";
import { H1, H2, H4, H6 } from "../../UIComponents/Typography";

type Props = {
    servings: number;
    setServings: (newServing: number) => void;
};

const Overview = ({ servings, setServings }: Props) => {
    //const foodData = useRecipeStateStore((state) => state.data.foodData);
    const recipeData = useRecipeStateStore((state) => state.data.recipeData);
    const ingredientItemsData = useRecipeStateStore(
        (state) => state.data.ingredientItemsData,
    );
    const foodData = CalculateMacroSumIngredient(ingredientItemsData);
    const options = [];
    function calculate_final(inp: number) {
        const mult = recipeData.servings_yield ?? 1;
        return (inp * servings) / mult;
    }
    useEffect(() => {
        console.log("recipe changed. Overview", ingredientItemsData);
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
                <H2>Overview</H2>
            </View>
            <View>
                <H4>{recipeData.note ?? ""}</H4>
            </View>
        </View>
    );
};

export default Overview;

const styles = StyleSheet.create({
    chartsContainer: {
        flexDirection: "row",

        //alignItems: 'center',
        justifyContent: "space-between",
        gap: 20,
    },
});
