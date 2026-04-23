import { colors } from "@/theme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

const TestChart = () => {
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
    const data = [
        { value: 134 },
        { value: 138 },
        { value: 136 },
        { value: 140 },
        { value: 141 },
    ];
    const data2 = [
        { value: 134 - 0 },
        { value: 138 - 0 },
        { value: 136 - 0 },
        { value: 140 - 0 },
        { value: 141 - 0 },
    ];

    return (
        <View style={{}}>
            <BarChart
                data={[]}
                //showLine
                width={270}
                stepValue={50}
                secondaryYAxis={{
                    yAxisLabelContainerStyle: {
                        width: 38,
                        marginLeft: 10,
                    },
                    yAxisLabelWidth: 60,
                    yAxisThickness: 0,
                    yAxisOffset: 50,
                    //maxValue: 50,
                }}
            />
        </View>
    );
};

export default TestChart;

const styles = StyleSheet.create({});
