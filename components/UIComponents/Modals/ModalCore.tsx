import { colors } from "@/theme";
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import KeyboardAware from "../KeyboardAware/KeyboardAware";
import { H3 } from "../Typography";

interface ModalProps {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}

const ModalCore = ({ children, title, onClose }: ModalProps) => {
    return (
        <KeyboardAware scrollEnabled={false}>
            <Pressable style={styles.container} onPress={onClose}>
                <Pressable style={styles.subContainer}>
                    <H3>{title}</H3>
                    {children}
                </Pressable>
            </Pressable>
        </KeyboardAware>
    );
};

export default ModalCore;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    subContainer: {
        backgroundColor: colors.off_white,
        borderRadius: 8,
        padding: 16,
        margin: 20,
        flex: 1,
    },
});
