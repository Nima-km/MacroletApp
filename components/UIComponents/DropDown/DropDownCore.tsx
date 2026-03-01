import ArrowDown from "@/assets/svg/chevron-down.svg";
import { colors } from "@/theme";
import React, { useRef, useState } from "react";
import { Animated, FlatList, Pressable, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { H3 } from "../Typography";
export interface DropdownOption {
    label: string;
    value: any;
}

interface DropdownSelectProps {
    options: DropdownOption[] | undefined;
    placeholder?: string;
    extraButtonText?: string;
    onSelect?: (option: DropdownOption) => void;
    extraButton?: (value: any) => void;
    style?: any;
}
const iconWidth = 25;
export default function DropdownCore({
    options,
    placeholder = "Dropdown",
    onSelect,
    extraButton,
    extraButtonText,
    style,
}: DropdownSelectProps) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<DropdownOption | null>(null);

    const height = useRef(new Animated.Value(0)).current;

    const toggle = () => {
        setOpen(!open);
        Animated.timing(height, {
            toValue: open ? 0 : 200 + (extraButton ? 50 : 0), // auto size based on options
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const handleSelect = (option: DropdownOption) => {
        setSelected(option);
        /* setOpen(false);
        Animated.timing(height, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
        */
        toggle();
        console.log("i got pressed", option.value);
        onSelect?.(option);
    };

    return (
        <View style={[{ width: "100%" }, style]}>
            {/* Selector button */}
            <Pressable style={styles.selector} onPress={toggle}>
                <H3>{selected ? selected.label : placeholder}</H3>
                <ArrowDown
                    pointerEvents="none"
                    width={iconWidth + 5}
                    height={iconWidth - 5}
                    style={{ marginLeft: 0, marginRight: -18 }}
                />
            </Pressable>

            {/* Dropdown list */}
            <Animated.View style={[styles.dropdown, { height }]}>
                <ScrollView>
                    <FlatList
                        data={options}
                        keyExtractor={(item) => item.label}
                        nestedScrollEnabled
                        renderItem={({ item }) => (
                            <Pressable
                                style={[
                                    styles.option,
                                    selected?.value === item.value &&
                                        styles.selectedOption,
                                ]}
                                onPress={() => handleSelect(item)}
                            >
                                <H3
                                    style={[
                                        styles.optionText,
                                        selected?.value === item.value &&
                                            styles.selectedOptionText,
                                    ]}
                                >
                                    {item.label}
                                </H3>
                            </Pressable>
                        )}
                        removeClippedSubviews={false}
                        windowSize={options?.length ?? 0 + 20}
                        initialNumToRender={options?.length ?? 0}
                        scrollEnabled={false}
                        style={{ marginTop: 12, marginHorizontal: 12 }}
                    />
                </ScrollView>
                {extraButton && (
                    <Pressable onPress={extraButton} style={styles.extraButton}>
                        <H3 style={{ color: colors.primary }}>
                            {extraButtonText}
                        </H3>
                    </Pressable>
                )}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    selector: {
        padding: 14,
        // height: 50,
        paddingHorizontal: 24,
        backgroundColor: colors.white,
        borderRadius: 10,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    dropdown: {
        overflow: "hidden",
        borderRadius: 8,
        marginTop: 1,
        backgroundColor: colors.white,
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
