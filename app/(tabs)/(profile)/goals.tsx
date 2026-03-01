import HeaderSimple from "@/components/navComponents/HeaderSimple";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { FormInputNumber } from "@/components/UIComponents/TextInputs/FormInput";
import { H1, H2, H4 } from "@/components/UIComponents/Typography";
import {
    useGetNutriGoals,
    useInsertNutritionGoal,
} from "@/db/hooks/goals/nutritionGoal";

import { calculateCalories } from "@/helper/calculateCalories";
import { colors } from "@/theme";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

const goals = () => {
    const { mutate: addNewGoal } = useInsertNutritionGoal();
    const { data: nutriGoals, isLoading: nutriGoalsLoading } =
        useGetNutriGoals();
    const [protein, setProtein] = useState("0");
    const [carbs, setCarbs] = useState("0");
    const [fat, setFat] = useState("0");
    function addGoal() {
        addNewGoal({
            protein: Number(protein),
            carbs: Number(carbs),
            fat: Number(fat),
        });
    }
    useEffect(() => {
        if (nutriGoals?.[0]) {
            setProtein(nutriGoals[0].protein.toString());
            setCarbs(nutriGoals[0].carbs.toString());
            setFat(nutriGoals[0].fat.toString());
        }
    }, [nutriGoals]);
    if (nutriGoalsLoading) return <H1>Loading</H1>;
    return (
        <KeyboardAware>
            <HeaderSimple title="Goals" />
            <View style={{ flex: 1, padding: 20, gap: 20 }}>
                <H2>Calorie Goal</H2>
                <View
                    style={{ justifyContent: "center", alignItems: "center" }}
                >
                    <H1>
                        {calculateCalories({
                            carbs: Number(carbs),
                            fat: Number(fat),
                            protein: Number(protein),
                        })}{" "}
                        Cals
                    </H1>
                </View>
                <H2>Macro Split</H2>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-around",
                    }}
                >
                    <View>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                            <View
                                style={{
                                    height: 22,
                                    width: 10,
                                    borderRadius: 8,
                                    backgroundColor: colors.protein,
                                }}
                            />
                            <H4>PROTEIN</H4>
                        </View>

                        <View style={{ width: 58 }}>
                            <FormInputNumber
                                value={protein}
                                onChangeText={setProtein}
                            />
                        </View>
                    </View>
                    <View>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                            <View
                                style={{
                                    height: 22,
                                    width: 10,
                                    borderRadius: 8,
                                    backgroundColor: colors.carbs,
                                }}
                            />
                            <H4>CARBS</H4>
                        </View>

                        <View style={{ width: 58 }}>
                            <FormInputNumber
                                value={carbs}
                                onChangeText={setCarbs}
                            />
                        </View>
                    </View>
                    <View>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                            <View
                                style={{
                                    height: 22,
                                    width: 10,
                                    borderRadius: 8,
                                    backgroundColor: colors.fat,
                                }}
                            />
                            <H4>FAT</H4>
                        </View>

                        <View style={{ width: 58 }}>
                            <FormInputNumber
                                value={fat}
                                onChangeText={setFat}
                            />
                        </View>
                    </View>
                </View>
                <PrimaryButton onPress={addGoal}>Apply</PrimaryButton>
            </View>
        </KeyboardAware>
    );
};

export default goals;

const styles = StyleSheet.create({});
