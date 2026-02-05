import { colors } from "@/theme";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { DropdownOption } from "../DropDown/DropDownCore";
import { H3 } from "../Typography";
import { FormInputSearch } from "./FormInput";

interface Props {
    value: string;
    options: DropdownOption[];
    onChangeText: (newText: string) => void;
    onSelect?: (option: DropdownOption) => void;
    style?: any;
}

const ControlledTextInput = ({
    value,
    options,
    onChangeText,
    onSelect,
    style,
}: Props) => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<DropdownOption | null>(null);

    const height = useRef(new Animated.Value(0)).current;

    const toggle = () => {
        setOpen(!open);
        Animated.timing(height, {
            toValue: open ? 0 : options.length * 60, // auto size based on options
            duration: 200,
            useNativeDriver: false,
        }).start();
    };
    const toggleOpen = () => {
        setOpen(true);
        Animated.timing(height, {
            toValue: options.length * 50 + 20, // auto size based on options
            duration: 200,
            useNativeDriver: false,
        }).start();
    };
    const toggleClose = () => {
        setOpen(false);
        Animated.timing(height, {
            toValue: 0, // auto size based on options
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const handleSelect = (option: DropdownOption) => {
        setSelected(option);
        toggle();
        console.log("i got pressed", option.value);
        onSelect?.(option);
    };
    useEffect(() => {
        if (options.length && open) height.setValue(options.length * 50 + 20);
        else toggleClose();
    }, [options]);
    return (
        <View style={[{ width: "100%" }, style]}>
            {/* Selector button */}

            <FormInputSearch
                value={value}
                onChangeText={onChangeText}
                onFocus={() => toggleOpen()}
                onUnFocus={() => toggleOpen()}
            />
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
                        windowSize={options.length + 20}
                        initialNumToRender={options.length}
                        scrollEnabled={false}
                        style={{ marginTop: 12, marginHorizontal: 12 }}
                    />
                </ScrollView>
            </Animated.View>
        </View>
    );
};

export default ControlledTextInput;

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
