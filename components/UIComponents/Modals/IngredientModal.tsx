import Bin from "@/assets/svg/bin.svg";
import Swap from "@/assets/svg/swap.svg";
import {
    SimpleChartCarbsSmall,
    SimpleChartFatSmall,
    SimpleChartProteinSmall,
} from "@/components/chartComponents/SimpleChart/SimpleChartSmall";
import { calculateCalories } from "@/helper/calculateCalories";
import { colors } from "@/theme";
import { FoodType } from "@/types/food";
import { IngredientItemDetails } from "@/types/recipe";
import { ServingSizeType } from "@/types/servingSize";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
    InlineButton,
    PrimaryButton,
    SecondaryButton,
} from "../Buttons/Button";
import DropDownServings from "../DropDown/DropDownServings";
import { H1, H4, H5_SemiBold } from "../Typography";
import ModalCore from "./ModalCore";

interface AddIngredientProps {
    foodData: FoodType;
    ingredientData: Omit<IngredientItemDetails, "prep_notes" | "display_name">;
    options: Omit<ServingSizeType, "food_id">[];
    selectedOption: number;
    setIngredient: (
        ingredientItem: Omit<
            IngredientItemDetails,
            "prep_notes" | "display_name"
        >,
    ) => void;
    onClose: () => void;
    onSwap: () => void;
    onDelete: () => void;
}

const IngredientModal = ({
    foodData,
    ingredientData,
    options,
    selectedOption,
    onClose,
    onSwap,
    onDelete,
    setIngredient,
}: AddIngredientProps) => {
    const [servingAmount, setServingAmount] = useState(ingredientData.servings);
    const [selectedServing, setSelectedServing] = useState<
        Omit<ServingSizeType, "food_id">
    >({
        serving_mult: ingredientData.serving_mult,
        serving_type: ingredientData.serving_type,
    });

    const total_macro =
        (foodData.carbs + foodData.fat + foodData.protein) *
        Number(servingAmount) *
        selectedServing.serving_mult;
    function onSave() {
        setIngredient({
            serving_mult: selectedServing.serving_mult,
            serving_type: selectedServing.serving_type,
            servings: Number(servingAmount),
        });
    }
    const calories = calculate_final(calculateCalories(foodData));

    function calculate_final(inp: number) {
        return inp * Number(servingAmount) * selectedServing.serving_mult;
    }
    return (
        <ModalCore title={foodData.name}>
            <View style={{ flexDirection: "column-reverse" }}>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginTop: 20,
                    }}
                >
                    <InlineButton
                        style={{ justifyContent: "center" }}
                        onPress={onSwap}
                    >
                        <Swap width={20} height={20} pointerEvents="none" />
                        <View style={{ paddingLeft: 9 }}>
                            <H5_SemiBold
                                style={{
                                    color: colors.primary,
                                    textDecorationLine: "underline",
                                }}
                            >
                                Swap ingredient
                            </H5_SemiBold>
                        </View>
                    </InlineButton>
                    <Pressable
                        onPress={() => {
                            (onClose(), onDelete());
                        }}
                    >
                        <Bin width={24} height={24} pointerEvents="none" />
                    </Pressable>
                </View>
                <View style={styles.buttonsContainer}>
                    <View style={{ flex: 1 }}>
                        <SecondaryButton
                            onPress={() => {
                                onClose();
                            }}
                        >
                            Reset
                        </SecondaryButton>
                    </View>
                    <View style={{ flex: 1 }}>
                        <PrimaryButton
                            onPress={() => {
                                (onClose(), onSave());
                            }}
                        >
                            Update
                        </PrimaryButton>
                    </View>
                </View>
                <View style={styles.mainContent}>
                    <View style={{ alignItems: "flex-end" }}>
                        <InlineButton>
                            <H5_SemiBold style={{ color: colors.primary }}>
                                View All Nutrition
                            </H5_SemiBold>
                        </InlineButton>
                    </View>
                    <View style={[styles.rowContainer, { marginBottom: 20 }]}>
                        <View
                            style={{
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <H1>{Math.floor(calories)}</H1>
                            <H4>Calories</H4>
                        </View>
                        <View style={styles.chartsContainer}>
                            <SimpleChartProteinSmall
                                target={total_macro}
                                progress={calculate_final(foodData.protein)}
                                backgroundColor={colors.white}
                            />
                            <SimpleChartCarbsSmall
                                target={total_macro}
                                progress={calculate_final(foodData.carbs)}
                                backgroundColor={colors.white}
                            />
                            <SimpleChartFatSmall
                                target={total_macro}
                                progress={calculate_final(foodData.fat)}
                                backgroundColor={colors.white}
                            />
                        </View>
                    </View>

                    <View style={[{ marginBottom: 20 }]}>
                        <DropDownServings
                            options={options}
                            placeholder={selectedServing}
                            servings={servingAmount}
                            setNewServing={setSelectedServing}
                            setServings={(servings) =>
                                setServingAmount(servings)
                            }
                            onSelect={(value) =>
                                setSelectedServing({
                                    serving_type: value.serving_type,
                                    serving_mult: value.serving_mult,
                                })
                            }
                        />
                    </View>
                </View>
            </View>
        </ModalCore>
    );
};

export default IngredientModal;

const styles = StyleSheet.create({
    mainContent: {
        marginVertical: 20,
        flexDirection: "column-reverse",
    },
    buttonsContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    rowContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    chartsContainer: {
        flexDirection: "row",
        flex: 1,
        alignItems: "center",
        justifyContent: "space-between",
    },
    nameTextContainer: {
        flex: 1,
    },
    ratioTextContainer: {
        height: 46,
        width: 75,
    },
    referenceServingContainer: {
        height: 46,
        flex: 1,
    },
});
