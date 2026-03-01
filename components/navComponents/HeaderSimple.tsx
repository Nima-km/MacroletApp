import { colors } from "@/theme";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { H2 } from "../UIComponents/Typography";
import HeaderCore from "./HeaderCore";

interface HeaderSimpleProps {
    title: string;

    back?: boolean;
    dateSelector?: boolean;
}

const HeaderSimple = ({
    title,
    back = true,
    dateSelector = false,
}: HeaderSimpleProps) => {
    const router = useRouter();
    return (
        <HeaderCore
            title={title}
            dateSelector={dateSelector}
            LeftButton={
                back ? (
                    <Pressable style={{}} onPress={() => router.back()}>
                        <H2 style={{ color: colors.primary }}>{"<"}</H2>
                    </Pressable>
                ) : null
            }
        />
    );
};

export default HeaderSimple;

const styles = StyleSheet.create({});
