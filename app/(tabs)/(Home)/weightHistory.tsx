import Chain from "@/assets/svg/chain.svg";
import WeightChartFull from "@/components/chartComponents/LogHistoryCharts/WeightChartFull";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import TopDateSelector from "@/components/UIComponents/Calendar/TopDateSelector";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { FormInputNumber } from "@/components/UIComponents/TextInputs/FormInput";
import { H4 } from "@/components/UIComponents/Typography";
import { useGetNutriGoals } from "@/db/hooks/goals/nutritionGoal";
import {
    useGetWeightList,
    useInsertWeight,
} from "@/db/hooks/weight/useWeightLog";
import { Period } from "@/db/queries/history";
import { colors } from "@/theme";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
const weightHistory = () => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    const [fromDate, setFromDate] = useState(now);
    const [period, setPeriod] = useState<Period>("day");
    const [newWeightLog, setNewWeightLog] = useState("");
    const sevenDaysAgo = new Date(fromDate);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 8);
    const { data, isLoading, error } = useGetWeightList(sevenDaysAgo, fromDate);
    const { mutate: logWeight } = useInsertWeight();
    const {
        data: currentGoal,
        isLoading: currentGoalLoading,
        error: currentGoalError,
    } = useGetNutriGoals();
    useEffect(() => {
        console.log("data changed in weightHistory", data);
    }, [data]);
    useEffect(() => {
        console.log("data changed in weightHistory", data);
    }, [data]);
    return (
        <KeyboardAware>
            <HeaderSimple title="Weight history" />

            <View style={{ flex: 1, gap: 20 }}>
                <View
                    style={{
                        backgroundColor: colors.white,
                        padding: 20,
                        gap: 10,
                    }}
                >
                    {/*
                    <StyledRadioButton
                        options={[
                            { label: "Day", value: "day" },
                            { label: "Week", value: "week" },
                            { label: "Month", value: "month" },
                        ]}
                        onSelect={(item) => setPeriod(item)}
                    />*/}
                    <TopDateSelector date={fromDate} setDate={setFromDate} />

                    <WeightChartFull
                        weightData={data?.length == 0 ? undefined : data}
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
        </KeyboardAware>
    );
};

export default weightHistory;

const styles = StyleSheet.create({});
