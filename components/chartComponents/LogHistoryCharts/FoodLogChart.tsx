import { H5 } from "@/components/UIComponents/Typography";
import { bigRound } from "@/helper/bigRound";
import { calculateCalories } from "@/helper/calculateCalories";
import { colors, typography } from "@/theme";
import { MacroDateType } from "@/types/food";
import { nutritionGoalGet } from "@/types/goals";
import { WeightType } from "@/types/weight";
import React from "react";
import { StyleSheet, View } from "react-native";
import { BarChart, CurveType } from "react-native-gifted-charts";
interface Props {
    foodData?: MacroDateType[];
    weightData?: WeightType[];
    showWeight?: boolean;
    goal?: nutritionGoalGet;
    onSelect: (item: MacroDateType) => void;
}
const customDataPoint = () => {
    return (
        <View
            style={{
                width: 12,
                height: 12,
                backgroundColor: "white",
                borderWidth: 3,
                borderRadius: 10,
                borderColor: colors.primary,
            }}
        />
    );
};

const formatDailyFoodSumsForChart = (
    foodData: MacroDateType[],
    onSelect: (item: MacroDateType) => void,
) => {
    return foodData.map((item) => ({
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
const formatWeightForChart = (
    weightData: WeightType[],
    //  onSelect: (item: WeightType) => void,
) => {
    return weightData.map((item) => ({
        value: item.weight,
        label:
            item.timestamp.getMonth().toString() +
            "/" +
            item.timestamp.getDate().toString(),
    }));
};
const FoodLogChart = ({
    foodData,
    weightData,
    goal,
    showWeight,
    onSelect,
}: Props) => {
    const chartData = foodData
        ? formatDailyFoodSumsForChart(foodData, onSelect)
        : [];
    const lineData = weightData ? formatWeightForChart(weightData) : [];
    const minWeight = weightData?.reduce((a, b) =>
        a.weight < b.weight || b.weight == 0 ? a : b,
    );
    const maxWeight = weightData?.reduce((a, b) =>
        a.weight > b.weight ? a : b,
    );
    console.log("minWeight", minWeight);
    console.log("maxWeight", maxWeight);
    console.log(
        "biground",
        bigRound(maxWeight?.weight, 5) - bigRound(minWeight?.weight, 5),
    );
    return (
        <View style={{}}>
            <View
                style={{
                    //   backgroundColor: "blue",
                    flexDirection: "row",
                    justifyContent: "space-between",
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
                {showWeight && (
                    <H5
                        style={{
                            width: 31,

                            //    backgroundColor: "red",
                        }}
                    >
                        lbs
                    </H5>
                )}
            </View>

            <BarChart
                stackData={chartData}
                lineData={lineData}
                showLine={
                    showWeight &&
                    chartData != undefined &&
                    chartData.length != 0
                }
                width={290}
                yAxisTextNumberOfLines={1}
                showFractionalValues={false}
                barWidth={20}
                yAxisThickness={0}
                rulesType="dash"
                rulesColor={colors.light_gray}
                dashGap={2}
                yAxisTextStyle={[typography.h6, { color: colors.medium_gray }]}
                yAxisLabelWidth={44}
                yAxisLabelContainerStyle={{
                    width: 39,
                    marginRight: 7,
                    justifyContent: "flex-end",
                }}
                scrollToEnd
                dashWidth={1}
                stackBorderTopLeftRadius={5}
                stackBorderTopRightRadius={4}
                maxValue={
                    goal
                        ? bigRound(calculateCalories(goal) * 1.4, 500)
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
                secondaryYAxis={
                    showWeight && {
                        // stepValue: 5,

                        yAxisTextStyle: [
                            typography.h6,
                            { color: colors.black },
                        ],
                        yAxisLabelContainerStyle: {
                            marginLeft: -24,
                            //  justifyContent: "flex-end",
                            width: 39,
                        },
                        //  yAxisLabelWidth: 10,

                        yAxisThickness: 0,
                        yAxisOffset: bigRound(minWeight?.weight, 5) - 20,
                        maxValue: Math.max(
                            60,
                            bigRound(maxWeight?.weight, 5) -
                                bigRound(minWeight?.weight, 5) +
                                50,
                        ),
                        hideOrigin: true,
                    }
                }
                lineConfig={{
                    curved: true,
                    curveType: CurveType.CUBIC,
                    isSecondary: true,
                    color: colors.primary,
                    shiftY: 0,
                    initialSpacing: 21,
                    customDataPoint: customDataPoint,
                    dataPointsHeight: 2,
                    dataPointsWidth: 0,

                    // dataPointsShape: "",
                    thickness: 3,
                }}
            />
        </View>
    );
};

export default FoodLogChart;

const styles = StyleSheet.create({});
