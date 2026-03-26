import HeaderSimple from "@/components/navComponents/HeaderSimple";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { H2, H5, H6 } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import React from "react";
import { StyleSheet, View } from "react-native";

const myRecipes = () => {
    return (
        <KeyboardAware>
            <HeaderSimple title={"My Recipes"} />
            <View style={{ flex: 1, padding: 20, gap: 8 }}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                    <View
                        style={{
                            backgroundColor: colors.white,
                            borderRadius: 8,
                            padding: 12,
                            flex: 1,
                            gap: 12,
                            height: 108,
                        }}
                    >
                        <H5>Logs</H5>
                        <H2>12,382</H2>
                        <View style={{ flexDirection: "row" }}>
                            <H6 style={{ color: "green" }}>%9 </H6>
                            <H6>from last month</H6>
                        </View>
                    </View>
                    <View
                        style={{
                            backgroundColor: colors.white,
                            borderRadius: 8,
                            padding: 12,
                            flex: 1,
                            gap: 12,
                            height: 108,
                        }}
                    >
                        <H5>Logs</H5>
                        <H2>12,382</H2>
                        <View style={{ flexDirection: "row" }}>
                            <H6 style={{ color: "green" }}>%9 </H6>
                            <H6>from last month</H6>
                        </View>
                    </View>
                </View>
                <View
                    style={{
                        backgroundColor: colors.white,
                        borderRadius: 8,
                        padding: 12,
                        gap: 12,
                        height: 108,
                    }}
                >
                    <H5>Projected Earnings</H5>
                    <H2>$15.43</H2>
                    <View style={{ flexDirection: "row" }}>
                        <H6 style={{ color: "green" }}>%9 </H6>
                        <H6>from last month</H6>
                    </View>
                </View>
            </View>
        </KeyboardAware>
    );
};

export default myRecipes;

const styles = StyleSheet.create({});
