import Bin from "@/assets/svg/bin.svg";
import { colors } from "@/theme";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
    Animated,
    Pressable,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { H4 } from "../Typography";

interface ExpandableTextInputProps {
    value: string;
    onChangeText: (text: string) => void;
    onDelete?: () => void;
    placeholder?: string;
    collapsedPlaceholder?: string;
    children?: ReactNode;
    expandedHeight?: number;
}

export default function ExpandableTextInput({
    value,
    onChangeText,
    onDelete,
    placeholder = "Type something...",
    collapsedPlaceholder = "Add note",
    expandedHeight = 60,
    children,
}: ExpandableTextInputProps) {
    const [expanded, setExpanded] = useState(false);
    const animatedHeight = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current; // 0 = +, 1 = x

    const toggle = () => {
        const next = !expanded;
        setExpanded(next);

        // height expand/collapse
        Animated.timing(animatedHeight, {
            toValue: next ? expandedHeight : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();

        // rotate the plus into an X
        Animated.timing(rotateAnim, {
            toValue: next ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "45deg"], // + rotated 45deg becomes an X
    });
    useEffect(() => {
        Animated.timing(animatedHeight, {
            toValue: expandedHeight,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [expandedHeight]);
    return (
        <View style={styles.mainContainer}>
            {/* COLLAPSED HEADER */}
            <TouchableOpacity style={styles.header} onPress={toggle}>
                <View
                    style={[
                        styles.headerContent,
                        { justifyContent: "space-between" },
                    ]}
                >
                    <View style={styles.headerContent}>
                        <Animated.Text
                            style={[
                                styles.icon,
                                { transform: [{ rotate: rotation }] },
                            ]}
                        >
                            +
                        </Animated.Text>
                        <H4 style={styles.headerText}>
                            {collapsedPlaceholder}
                        </H4>
                    </View>
                    {onDelete && (
                        <Pressable onPress={onDelete}>
                            <Bin
                                style={{ color: colors.primary }}
                                pointerEvents="none"
                            />
                        </Pressable>
                    )}

                    {/* + → X icon */}
                </View>
            </TouchableOpacity>

            {/* EXPANDING INPUT */}
            <Animated.View
                style={[styles.animatedContainer, { height: animatedHeight }]}
            >
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    multiline
                    placeholder={placeholder}
                    autoFocus={expanded}
                    placeholderTextColor={colors.inactive}
                />
                {children}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: colors.white,
        borderRadius: 10,
    },
    header: {
        padding: 12,
    },
    headerContent: {
        flexDirection: "row",
        // justifyContent: "space-between",
        alignItems: "center",
    },
    headerText: {
        color: colors.primary,
    },
    icon: {
        fontSize: 22,
        marginRight: 5,
        fontWeight: "bold",
        color: colors.primary,
    },
    animatedContainer: {
        overflow: "hidden",
        marginHorizontal: 8,
    },
    input: {
        padding: 12,
        borderRadius: 10,
        backgroundColor: colors.off_white,
        color: colors.black,
    },
});
