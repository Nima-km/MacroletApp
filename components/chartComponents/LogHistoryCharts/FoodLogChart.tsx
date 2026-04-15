import { H5 } from "@/components/UIComponents/Typography";
import { calculateCalories } from "@/helper/calculateCalories";
import { colors, typography } from "@/theme";
import { MacroDateType } from "@/types/food";
import { nutritionGoalGet } from "@/types/goals";
import React from "react";
import { StyleSheet, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
interface Props {
    data?: MacroDateType[];
    goal?: nutritionGoalGet;
    onSelect: (item: MacroDateType) => void;
}
const formatDailyFoodSumsForChart = (
    data: MacroDateType[],
    onSelect: (item: MacroDateType) => void,
) => {
    return data.map((item) => ({
        stacks: [
            {
                value: item.protein * 4,
                color: colors.protein,
            },
            { value: item.carbs * 4, color: colors.carbs, marginBottom: 0 },
            { value: item.fat * 9, color: colors.fat, marginBottom: 0 },
        ],
        label:
            item.date.getMonth().toString() +
            "/" +
            item.date.getDate().toString(),
        onPress: () => onSelect(item),
    }));
};
const FoodLogChart = ({ data, goal, onSelect }: Props) => {
    const chartData = data ? formatDailyFoodSumsForChart(data, onSelect) : [];
    console.log("foodLogChart", chartData);
    return (
        <View>
            <View
                style={{
                    width: 40,
                    alignItems: "center",
                    //   backgroundColor: "blue",
                }}
            >
                <H5
                    style={{
                        width: 31,

                        //    backgroundColor: "red",
                    }}
                >
                    Cals
                </H5>
            </View>

            <BarChart
                stackData={chartData}
                width={300}
                noOfSections={4}
                barWidth={20}
                yAxisThickness={0}
                rulesType="dash"
                rulesColor={colors.light_gray}
                dashGap={2}
                yAxisTextStyle={[typography.h6, { color: colors.medium_gray }]}
                yAxisLabelWidth={40}
                yAxisLabelContainerStyle={{
                    width: 38,
                    marginRight: 7,
                    justifyContent: "flex-end",
                }}
                scrollToEnd
                dashWidth={1}
                stackBorderTopLeftRadius={5}
                stackBorderTopRightRadius={4}
                maxValue={
                    goal
                        ? Math.round((calculateCalories(goal) * 1.2) / 500) *
                          500
                        : undefined
                }
                stepValue={500}
                showReferenceLine1={goal !== undefined}
                referenceLine1Position={calculateCalories(goal)}
                referenceLine1Config={{
                    color: colors.primary,
                    thickness: 1,
                    dashGap: 3,
                    dashWidth: 2,
                }}
                spacing={24}
                secondaryYAxis
            />
        </View>
    );
};

export default FoodLogChart;

const styles = StyleSheet.create({});
