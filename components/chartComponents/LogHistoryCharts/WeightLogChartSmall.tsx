import React from "react";
import { StyleSheet, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

const WeightLogChartSmall = () => {
    const data = [{ value: 15 }, { value: 30 }, { value: 26 }, { value: 40 }];
    return (
        <View style={{}}>
            <LineChart data={data} />
        </View>
    );
};

export default WeightLogChartSmall;

const styles = StyleSheet.create({});
