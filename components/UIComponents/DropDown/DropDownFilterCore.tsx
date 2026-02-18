import ArrowDown from "@/assets/svg/chevron-down.svg";
import { colors } from "@/theme";
import React, { useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { FormInputNumberStyled } from "../TextInputs/FormInput";
import { H3 } from "../Typography";

interface Props {
    placeholder?: string;
    unit?: string;
    minValue: string;
    maxValue: string;
    setMinValue: (newVal: string) => void;
    setMaxValue: (newVal: string) => void;
}
const DropDownFilterCore = ({
    placeholder,
    minValue,
    unit,
    maxValue,
    setMaxValue,
    setMinValue,
}: Props) => {
    const [open, setOpen] = useState(false);
    const iconWidth = 25;
    const height = useRef(new Animated.Value(0)).current;

    const toggle = () => {
        setOpen(!open);
        Animated.timing(height, {
            toValue: open ? 0 : 100, // auto size based on options
            duration: 150,
            useNativeDriver: false,
        }).start();
    };

    return (
        <View style={[{ width: "100%" }]}>
            {/* Selector button */}
            <Pressable style={styles.selector} onPress={toggle}>
                <H3>{placeholder}</H3>
                <ArrowDown
                    width={iconWidth + 5}
                    height={iconWidth - 5}
                    style={{
                        marginLeft: 0,
                        marginRight: -18,
                        transform: [{ rotate: open ? "180deg" : "0deg" }],
                    }}
                />
            </Pressable>

            {/* Dropdown list */}
            <Animated.View style={[styles.dropdown, { height }]}>
                <View
                    style={{
                        flexDirection: "row",

                        justifyContent: "center",
                        gap: 20,
                    }}
                >
                    <FormInputNumberStyled
                        value={minValue}
                        unit={unit}
                        leftText="Min"
                        onChangeText={setMinValue}
                    />
                    <FormInputNumberStyled
                        value={maxValue}
                        unit={unit}
                        leftText="Max"
                        onChangeText={setMaxValue}
                    />
                </View>
            </Animated.View>
        </View>
    );
};

export default DropDownFilterCore;

const styles = StyleSheet.create({
    selector: {
        paddingVertical: 14,
        // height: 50,
        //paddingHorizontal: 24,

        borderRadius: 10,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    dropdown: {
        overflow: "hidden",
        marginTop: 1,
    },
    option: {
        paddingVertical: 14,
        paddingHorizontal: 18,

        borderRadius: 8,
    },
    extraButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderTopColor: colors.light_gray,
        borderTopWidth: 1,
        borderRadius: 8,
    },
    selectedOption: {
        backgroundColor: colors.primary_bg,
        paddingHorizontal: 12,
    },
    selectedOptionText: {
        color: colors.primary,
    },
    optionText: {
        color: colors.inactive,
    },
});
