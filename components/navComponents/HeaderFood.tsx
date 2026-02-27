import { colors } from "@/theme";
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { H2, H4 } from "../UIComponents/Typography";
import HeaderCore from "./HeaderCore";

interface HeaderFoodProps {
    title: string;
    isEdit: boolean;
    onBack: () => void;
    onEdit: (value: boolean) => void;
}

const HeaderFood = ({ title, isEdit, onBack, onEdit }: HeaderFoodProps) => {
    return (
        <HeaderCore
            title={title}
            LeftButton={
                true ? (
                    <Pressable style={{}} onPress={onBack}>
                        <H2 style={{ color: colors.primary }}>{"<"}</H2>
                    </Pressable>
                ) : (
                    <Pressable style={{}} onPress={() => onEdit(false)}>
                        <H4 style={{ color: colors.primary }}>Cancel</H4>
                    </Pressable>
                )
            }
            RightButton={
                !isEdit ? (
                    <Pressable
                        style={{
                            flexDirection: "row",
                            justifyContent: "flex-end",
                        }}
                        onPress={() => onEdit(true)}
                    >
                        <H4 style={{ color: colors.primary }}>Edit</H4>
                    </Pressable>
                ) : (
                    <Pressable style={{}} onPress={() => onEdit(false)}>
                        <H4 style={{ color: colors.primary }}>Cancel</H4>
                    </Pressable>
                )
            }
        />
    );
};

export default HeaderFood;

const styles = StyleSheet.create({});
