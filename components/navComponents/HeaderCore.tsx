import React, { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/theme";
import TopDateSelector from "../UIComponents/Calendar/TopDateSelector";
import { H1 } from "../UIComponents/Typography";

type Props = {
    title: string | undefined;

    LeftButton?: ReactNode;
    RightButton?: ReactNode;
};
function HeaderCore({ title, LeftButton, RightButton }: Props) {
    return (
        <SafeAreaView
            style={[styles.container, { paddingHorizontal: 20, gap: 20 }]}
            edges={["top", "right", "left"]}
        >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={styles.leftButton}>{LeftButton}</View>
                <View
                    style={[
                        {
                            flex: 1,
                            alignItems: "center",
                            justifyContent: "center",
                        },
                    ]}
                >
                    <H1>{title}</H1>
                </View>
                <View style={styles.rightButton}>{RightButton}</View>
            </View>
            <TopDateSelector />
        </SafeAreaView>
    );
}
export default HeaderCore;

const styles = StyleSheet.create({
    container: {
        paddingTop: 20,
        paddingBottom: 20,
        backgroundColor: colors.off_white,
        //  alignItems: "center",
    },
    leftButton: {
        width: 70,
    },
    rightButton: {
        width: 70,
    },
});
