import {
    SimpleChartCarbsSmall,
    SimpleChartFatSmall,
    SimpleChartProteinSmall,
} from "@/components/chartComponents/SimpleChart/SimpleChartSmall";
import { calculateCalories } from "@/helper/calculateCalories";
import { CalculateMacroSum } from "@/helper/recipeMacroSum";

import { useFoodBottomSheetStore } from "@/store/useStore";
import { colors } from "@/theme";
import { FoodFullData } from "@/types/food";
import React from "react";
import { StyleSheet, View } from "react-native";
import { PrimaryButton } from "../Buttons/Button";
import { H1, H3, H4 } from "../Typography";

type Props = {
    onLogAll: (foodObject: FoodFullData[]) => void;
};

const FoodBottomSheetFooter = ({ onLogAll }: Props) => {
    const { foodFullData } = useFoodBottomSheetStore();
    const foodData = CalculateMacroSum(foodFullData);
    const calories = calculateCalories(foodData);
    const total_macro = foodData.carbs + foodData.fat + foodData.protein;

    return (
        <View
            style={{ backgroundColor: colors.off_white, padding: 16, gap: 20 }}
        >
            <H3>Nutrition Details</H3>

            <View style={[styles.rowContainer, { marginBottom: 20 }]}>
                <View
                    style={{ justifyContent: "center", alignItems: "center" }}
                >
                    <H1>{Math.floor(calories)}</H1>
                    <H4>Calories</H4>
                </View>
                <View style={styles.chartsContainer}>
                    <SimpleChartProteinSmall
                        target={total_macro}
                        progress={foodData.protein}
                        backgroundColor={colors.white}
                    />
                    <SimpleChartCarbsSmall
                        target={total_macro}
                        progress={foodData.carbs}
                        backgroundColor={colors.white}
                    />
                    <SimpleChartFatSmall
                        target={total_macro}
                        progress={foodData.fat}
                        backgroundColor={colors.white}
                    />
                </View>
            </View>
            <PrimaryButton onPress={() => onLogAll(foodFullData ?? [])}>
                Log All
            </PrimaryButton>
        </View>
    );
};

export default FoodBottomSheetFooter;

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
