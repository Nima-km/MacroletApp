import Chain from "@/assets/svg/chain.svg";
import WeightChartFull from "@/components/chartComponents/LogHistoryCharts/WeightChartFull";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import StyledRadioButton from "@/components/UIComponents/Buttons/RadioButton";
import TopDateSelector from "@/components/UIComponents/Calendar/TopDateSelector";
import { FormInputNumber } from "@/components/UIComponents/TextInputs/FormInput";
import { H4 } from "@/components/UIComponents/Typography";
import { useGetNutriGoals } from "@/db/hooks/goals/nutritionGoal";
import {
    useGetWeightList,
    useInsertWeight,
} from "@/db/hooks/weight/useWeightLog";
import { Period } from "@/db/queries/history";
import { colors } from "@/theme";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
const weightHistory = () => {
    const [fromDate, setFromDate] = useState(new Date());
    const [period, setPeriod] = useState<Period>("day");
    const [newWeightLog, setNewWeightLog] = useState("");
    const sevenDaysAgo = new Date(fromDate);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data, isLoading, error } = useGetWeightList(fromDate, sevenDaysAgo);
    const { mutate: logWeight } = useInsertWeight();
    const {
        data: currentGoal,
        isLoading: currentGoalLoading,
        error: currentGoalError,
    } = useGetNutriGoals();
    console.log("test");
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
    const dummyGoal = {
        fat: 68,
        carbs: 250,
        fiber: 26,
        protein: 130,
        calories: 2160,
    };
    return (
        <View style={{ flex: 1 }}>
            <HeaderSimple title="Weight history" />

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

                    <WeightChartFull
                        weightData={dummyWeightData}
                        onSelect={(item) => console.log("hi")}
                    />

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
                    <View
                        style={{ flexDirection: "row", gap: 12, marginTop: 20 }}
                    >
                        <View style={{ width: 100 }}>
                            <FormInputNumber
                                value={newWeightLog}
                                unit={"lbs"}
                                viewStyle={{
                                    backgroundColor: colors.off_white,
                                }}
                                onChangeText={setNewWeightLog}
                            />
                        </View>
                        <PrimaryButton
                            onPress={() =>
                                logWeight({ weight: Number(newWeightLog) })
                            }
                        >
                            Log Weight
                        </PrimaryButton>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default weightHistory;

const styles = StyleSheet.create({});
