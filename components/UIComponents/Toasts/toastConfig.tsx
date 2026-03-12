import Recipes from "@/assets/svg/recipe-book.svg";
import { colors } from "@/theme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { BaseToast } from "react-native-toast-message";
import { H5_SemiBold } from "../Typography";
type ToastType = "success" | "error" | "info";

interface ToastProps {
    text1?: string;
    text2?: string;
}

export const toastConfig: Record<
    ToastType,
    (props: ToastProps) => React.ReactNode
> = {
    success: (props) => (
        <View style={[styles.toastContainer, styles.boxWithShadow]}>
            <Recipes
                width={28}
                height={28}
                style={{ color: colors.primary }}
                pointerEvents="none"
            />
            <H5_SemiBold style={{ color: colors.primary }}>
                {props.text1}
            </H5_SemiBold>
        </View>
    ),

    error: (props) => (
        <View style={[styles.toastContainer, styles.boxWithShadow]}>
            <H5_SemiBold style={{ color: colors.error }}>
                {props.text1}
            </H5_SemiBold>
        </View>
    ),

    info: (props) => (
        <BaseToast
            {...props}
            style={{ borderLeftColor: "pink" }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{
                fontSize: 15,
                fontWeight: "400",
            }}
        />
    ),
};

const styles = StyleSheet.create({
    toastContainer: {
        flexDirection: "row",
        width: 350,
        height: 50,
        gap: 8,
        alignItems: "center",
        paddingHorizontal: 24,
        backgroundColor: colors.white,
        borderRadius: 8,
    },
    boxWithShadow: {
        //   shadowColor: "#433b39",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
});
