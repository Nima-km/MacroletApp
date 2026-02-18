import { H1, H4, H5_SemiBold, H6 } from "@/components/UIComponents/Typography";
import { calculateCalories } from "@/helper/calculateCalories";
import { calculateMacro } from "@/helper/calculateMacro";
import { colors } from "@/theme";
import { FoodFullData } from "@/types/food";
import React from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";

interface FoodCardQuickProps {
    onRemove?: () => void;
    style?: ViewStyle;
}

const FoodCardQuick = ({
    food,
    style,
    foodItem,
    onRemove,
}: FoodFullData & FoodCardQuickProps) => {
    const foodData = calculateMacro(
        food,
        foodItem.serving_mult * foodItem.servings,
    );
    return (
        <View style={[styles.container, style]}>
            <View style={{ flex: 1 }}>
                <View style={styles.rowContainer}>
                    <H4>{food.name}</H4>
                    <H4>
                        {foodItem.servings} serving
                        {foodItem.servings > 1 && "s"}
                    </H4>
                </View>
                <View style={styles.macroInfo}>
                    <View style={{}}>
                        <H5_SemiBold>
                            {calculateCalories(foodData)} cal
                        </H5_SemiBold>
                    </View>
                    <View style={styles.macroInfoSub}>
                        <View
                            style={[
                                styles.macroBall,
                                { backgroundColor: colors.protein },
                            ]}
                        />
                        <H5_SemiBold>P</H5_SemiBold>
                        <H6>{foodData.protein} g</H6>
                    </View>
                    <View style={styles.macroInfoSub}>
                        <View
                            style={[
                                styles.macroBall,
                                { backgroundColor: colors.carbs },
                            ]}
                        />
                        <H5_SemiBold>C</H5_SemiBold>
                        <H6>{foodData.carbs} g</H6>
                    </View>
                    <View style={styles.macroInfoSub}>
                        <View
                            style={[
                                styles.macroBall,
                                { backgroundColor: colors.fat },
                            ]}
                        />
                        <H5_SemiBold>F</H5_SemiBold>
                        <H6>{foodData.fat} g</H6>
                    </View>
                </View>
            </View>
            {onRemove && (
                <Pressable onPress={onRemove}>
                    <View style={{ paddingLeft: 13 }}>
                        <H1 style={{ color: colors.primary }}>x</H1>
                    </View>
                </Pressable>
            )}
        </View>
    );
};

export default FoodCardQuick;

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        flexDirection: "row",
        gap: 8,
    },
    rowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    progressBar: {
        height: 15,
    },
    macroInfo: {
        flexDirection: "row",
        // justifyContent: 'space-between',
        gap: 20,
    },
    macroInfoSub: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        gap: 2,
    },
    macroBall: {
        width: 10,
        height: 10,
        borderRadius: 10,
    },
});
