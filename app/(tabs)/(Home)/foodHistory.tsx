import Chain from "@/assets/svg/chain.svg";
import Dash from "@/assets/svg/dash.svg";
import FoodLogChart from "@/components/chartComponents/LogHistoryCharts/FoodLogChart";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import StyledRadioButton from "@/components/UIComponents/Buttons/RadioButton";
import TopDateSelector from "@/components/UIComponents/Calendar/TopDateSelector";
import { H3, H4, H5, H5_SemiBold } from "@/components/UIComponents/Typography";
import { useGetNutriGoals } from "@/db/hooks/goals/nutritionGoal";
import { useGetDailyFoodSums } from "@/db/hooks/history/foodItemhistory";
import { Period } from "@/db/queries/history";
import { calculateCalories } from "@/helper/calculateCalories";
import { colors } from "@/theme";
import { MacroDateType } from "@/types/food";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Switch } from "react-native-gesture-handler";
const foodHistory = () => {
    const [fromDate, setFromDate] = useState(new Date());
    const [showWeight, setShowWeight] = useState(true);
    const [period, setPeriod] = useState<Period>("day");
    const [selectedDate, setSelectedDate] = useState<MacroDateType>();
    const sevenDaysAgo = new Date(fromDate);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 20);
    const { data, isLoading, error } = useGetDailyFoodSums(
        sevenDaysAgo,
        fromDate,
        period,
    );
    const {
        data: currentGoal,
        isLoading: currentGoalLoading,
        error: currentGoalError,
    } = useGetNutriGoals();

    const dummyData = [
        {
            date: new Date("2026-03-31"),
            fat: 65,
            carbs: 245,
            fiber: 28,
            protein: 125,
            calories: 2150,
        },
        {
            date: new Date("2026-04-01"),
            fat: 58,
            carbs: 210,
            fiber: 22,
            protein: 110,
            calories: 1950,
        },
        {
            date: new Date("2026-04-02"),
            fat: 72,
            carbs: 280,
            fiber: 30,
            protein: 140,
            calories: 2350,
        },
        {
            date: new Date("2026-04-03"),
            fat: 55,
            carbs: 190,
            fiber: 20,
            protein: 95,
            calories: 1800,
        },
        {
            date: new Date("2026-04-04"),
            fat: 0,
            carbs: 0,
            fiber: 0,
            protein: 0,
            calories: 0,
        },
        {
            date: new Date("2026-04-05"),
            fat: 62,
            carbs: 235,
            fiber: 25,
            protein: 118,
            calories: 2050,
        },
        {
            date: new Date("2026-04-06"),
            fat: 68,
            carbs: 250,
            fiber: 26,
            protein: 130,
            calories: 2160,
        },

        {
            date: new Date("2026-04-07"),
            fat: 90,
            carbs: 300,
            fiber: 30,
            protein: 200,
            calories: 2350,
        },
        {
            date: new Date("2026-04-08"),
            fat: 55,
            carbs: 190,
            fiber: 20,
            protein: 95,
            calories: 1800,
        },
        {
            date: new Date("2026-04-09"),
            fat: 0,
            carbs: 0,
            fiber: 0,
            protein: 0,
            calories: 0,
        },
    ];
    const dummyWeightData = [
        {
            timestamp: new Date("2026-03-31"),
            weight: 148,
        },
        {
            timestamp: new Date("2026-04-01"),
            weight: 152,
        },
        {
            timestamp: new Date("2026-04-02"),
            weight: 150,
        },
        {
            timestamp: new Date("2026-04-03"),
            weight: 155,
        },
        {
            timestamp: new Date("2026-04-04"),
            weight: 153,
        },
        {
            timestamp: new Date("2026-04-05"),
            weight: 153,
        },
        {
            timestamp: new Date("2026-04-06"),
            weight: 156,
        },

        {
            timestamp: new Date("2026-04-07"),
            weight: 155,
        },
        {
            timestamp: new Date("2026-04-08"),
            weight: 152,
        },
        {
            timestamp: new Date("2026-04-09"),
            weight: 154,
        },
    ];
    /* useEffect(() => {
        console.log("actual data is", data);
    }, [data]);
    useEffect(() => {
        console.log("actual isLoading is", isLoading);
    }, [isLoading]);
    useEffect(() => {
        console.log("actual error is", error);
    }, [error]);*/
    return (
        <View style={{ flex: 1 }}>
            <HeaderSimple title="History" />

            <View style={{ flex: 1, gap: 20 }}>
                <View
                    style={{
                        backgroundColor: colors.white,
                        padding: 20,
                        gap: 10,
                    }}
                >
                    <StyledRadioButton
                        options={[
                            { label: "Day", value: "day" },
                            { label: "Week", value: "week" },
                            { label: "Month", value: "month" },
                        ]}
                        onSelect={(item) => setPeriod(item)}
                    />
                    <TopDateSelector date={fromDate} setDate={setFromDate} />
                    <Switch
                        trackColor={{
                            false: colors.light_gray,
                            true: colors.primary_bg,
                        }}
                        thumbColor={showWeight ? colors.primary : colors.white}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={() => setShowWeight((prev) => !prev)}
                        value={showWeight}
                    />
                    <FoodLogChart
                        foodData={data}
                        weightData={dummyWeightData}
                        showWeight={showWeight}
                        goal={currentGoal?.[0]}
                        onSelect={(item) => setSelectedDate(item)}
                    />
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <Dash />
                        <H4>Daily Calorie Goal</H4>
                        <H3>{calculateCalories(currentGoal?.[0])} cal</H3>
                    </View>
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <Chain />
                        <H4>Weight Log History</H4>
                    </View>
                </View>
                {selectedDate && (
                    <View
                        style={{
                            backgroundColor: colors.white,
                            padding: 20,
                            gap: 16,
                            borderRadius: 8,
                            margin: 20,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <H4>{selectedDate?.date.toDateString()}</H4>
                            <H4>{calculateCalories(selectedDate)} Cals</H4>
                        </View>
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-around",
                            }}
                        >
                            <View style={{ gap: 12 }}>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        gap: 8,
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <View
                                        style={{
                                            backgroundColor: colors.protein,
                                            height: 17,
                                            width: 10,
                                            borderRadius: 10,
                                        }}
                                    />
                                    <H5_SemiBold>PROTEIN</H5_SemiBold>
                                </View>
                                <View style={{ marginLeft: 18 }}>
                                    <H5>{selectedDate?.protein} g</H5>
                                </View>
                            </View>
                            <View style={{ gap: 12 }}>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        gap: 8,
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <View
                                        style={{
                                            backgroundColor: colors.carbs,
                                            height: 17,
                                            width: 10,
                                            borderRadius: 10,
                                        }}
                                    />
                                    <H5_SemiBold>CARBS</H5_SemiBold>
                                </View>
                                <View style={{ marginLeft: 18 }}>
                                    <H5>{selectedDate?.carbs} g</H5>
                                </View>
                            </View>
                            <View style={{ gap: 12 }}>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        gap: 8,
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <View
                                        style={{
                                            backgroundColor: colors.fat,
                                            height: 17,
                                            width: 10,
                                            borderRadius: 10,
                                        }}
                                    />
                                    <H5_SemiBold>FATS</H5_SemiBold>
                                </View>
                                <View style={{ marginLeft: 18 }}>
                                    <H5>{selectedDate?.fat} g</H5>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};

export default foodHistory;

const styles = StyleSheet.create({});
