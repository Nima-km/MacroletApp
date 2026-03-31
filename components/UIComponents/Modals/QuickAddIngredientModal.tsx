import {
    SimpleChartCarbsSmall,
    SimpleChartFatSmall,
    SimpleChartProteinSmall,
} from "@/components/chartComponents/SimpleChart/SimpleChartSmall";
import { colors } from "@/theme";
import { FoodGet, FoodItemData } from "@/types/food";
import { IngredientFullData } from "@/types/recipe";
import { ServingSizeType } from "@/types/servingSize";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
    InlineButton,
    PrimaryButton,
    SecondaryButton,
} from "../Buttons/Button";
import DropDownServings from "../DropDown/DropDownServings";
import ExpandableTextInput from "../TextInputs/ExpandableTextInput";
import { H1, H4, H5_SemiBold } from "../Typography";
import ModalCore from "./ModalCore";

interface AddIngredientProps {
    foodData: FoodGet;
    foodItemData?: FoodItemData;
    options: Omit<ServingSizeType, "food_id">[];
    setIngredient: (ingredientItem: IngredientFullData) => void;
    cleanUp?: () => void;
    onClose: () => void;
}

const QuickAddIngredientModal = ({
    foodData,
    foodItemData,
    options,
    onClose,
    cleanUp,
    setIngredient,
}: AddIngredientProps) => {
    const [servingAmount, setServingAmount] = useState(
        foodItemData?.servings ?? 1,
    );
    const [selectedServing, setSelectedServing] = useState<
        Omit<ServingSizeType, "food_id">
    >(
        foodItemData != undefined
            ? {
                  serving_mult: foodItemData.serving_mult,
                  serving_type: foodItemData.serving_type,
              }
            : options[0],
    );
    const total_macro =
        (foodData.carbs + foodData.fat + foodData.protein) *
        Number(servingAmount) *
        selectedServing.serving_mult;
    const [display_name, setDisplay_name] = useState<string>();
    const [prep_notes, setPrep_notes] = useState<string>();
    function onSave() {
        setIngredient({
            food: foodData,
            ingredientItem: {
                serving_mult: selectedServing.serving_mult,
                serving_type: selectedServing.serving_type,
                servings: Number(servingAmount),
                prep_notes,
                display_name,
            },
        });
        console.log("quickaddingredeintModal test");
        cleanUp?.();
    }
    const calories = calculate_final(
        (foodData.carbs + foodData.protein) * 4 +
            foodData.fat * 9 -
            foodData.fiber * 2,
    );

    function calculate_final(inp: number) {
        return inp * Number(servingAmount) * selectedServing.serving_mult;
    }
    return (
        <ModalCore title={foodData.name} onClose={onClose}>
            <View style={{ flexDirection: "column-reverse" }}>
                <View style={styles.buttonsContainer}>
                    <View style={{ flex: 1 }}>
                        <SecondaryButton
                            onPress={() => {
                                onClose();
                            }}
                        >
                            Cancel
                        </SecondaryButton>
                    </View>
                    <View style={{ flex: 1 }}>
                        <PrimaryButton
                            onPress={() => {
                                (onSave(), onClose());
                            }}
                        >
                            Save
                        </PrimaryButton>
                    </View>
                </View>
                <View style={styles.mainContent}>
                    <View style={{ marginTop: 20, gap: 20 }}>
                        <ExpandableTextInput
                            value={display_name ?? ""}
                            onChangeText={setDisplay_name}
                            collapsedPlaceholder="Ingredient Display Name"
                            placeholder="Enter display name for public recipes"
                        />
                        <ExpandableTextInput
                            value={prep_notes ?? ""}
                            onChangeText={setPrep_notes}
                            collapsedPlaceholder="Prep Notes"
                            placeholder="e.g chopped, cooked, screwed"
                        />
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                        <InlineButton>
                            <H5_SemiBold style={{ color: colors.primary }}>
                                View All Nutrition
                            </H5_SemiBold>
                        </InlineButton>
                    </View>
                    <View
                        style={[
                            styles.rowContainer,
                            { marginBottom: 20, gap: 10 },
                        ]}
                    >
                        <View
                            style={{
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <H1>{Math.floor(calories)}</H1>
                            <H4>Calories</H4>
                        </View>
                        <View style={[styles.chartsContainer, { flex: 1 }]}>
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

export default QuickAddIngredientModal;

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
        //gap: 8,
    },
    chartsContainer: {
        flexDirection: "row",
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
