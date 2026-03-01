import Home from "@/assets/svg/Home.svg";
import Discover from "@/assets/svg/compass.svg";
import Logs from "@/assets/svg/logs.svg";
import Plus from "@/assets/svg/plus-empty.svg";
import Profile from "@/assets/svg/profile.svg";
import { colors } from "@/theme";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { H4, H5, H5_SemiBold } from "../UIComponents/Typography";
const MyNavBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
    const router = useRouter();
    const isFocused = (index: number) => state.index === index;
    const [open, setOpen] = useState(false);
    const progress = useSharedValue(0);
    const toggleMenu = () => {
        setOpen(!open);
        progress.value = withSpring(open ? 0 : 1, {
            damping: 1500,
            stiffness: 1500,
        });
    };
    const option1Style = useAnimatedStyle(() => ({
        transform: [
            { translateY: interpolate(progress.value, [0, 1], [0, -10]) },
        ],
        opacity: progress.value,
    }));

    // Option 2 animation
    const option2Style = useAnimatedStyle(() => ({
        transform: [
            { translateY: interpolate(progress.value, [0, 1], [0, -80]) },
        ],
        opacity: progress.value,
    }));

    // Option 3 animation
    const option3Style = useAnimatedStyle(() => ({
        transform: [
            { translateY: interpolate(progress.value, [0, 1], [0, -150]) },
        ],
        opacity: progress.value,
    }));
    return (
        <View
            style={{
                flexDirection: "row",
                paddingHorizontal: 16,
                paddingTop: 20,
                paddingBottom: 20,
                justifyContent: "space-around",
                backgroundColor: colors.white,
            }}
        >
            <Pressable
                onPress={() => router.navigate("/")}
                style={{ height: 48, alignItems: "center", width: 65 }}
            >
                <Home
                    pointerEvents="none"
                    style={{
                        color: isFocused(0) ? colors.primary : colors.inactive,
                    }}
                />
                {isFocused(0) ? <H5_SemiBold>Home</H5_SemiBold> : <H5>Home</H5>}
            </Pressable>
            <Pressable
                onPress={() => router.navigate("/(tabs)/discover")}
                style={{ height: 48, alignItems: "center", width: 68 }}
            >
                <Discover
                    pointerEvents="none"
                    style={{
                        color: isFocused(1) ? colors.primary : colors.inactive,
                    }}
                />
                {isFocused(1) ? (
                    <H5_SemiBold>Discover</H5_SemiBold>
                ) : (
                    <H5>Discover</H5>
                )}
            </Pressable>
            <View
                style={{
                    width: 60,
                    // backgroundColor: "red",
                    marginTop: -40,
                    alignItems: "center",
                }}
            >
                <View
                    style={{
                        backgroundColor: colors.white,
                        width: 60,
                        height: 60,
                        borderRadius: 60,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Animated.View
                        style={[styles.option, option1Style]}
                        pointerEvents={open ? "auto" : "none"}
                    >
                        <TouchableOpacity
                            style={{
                                width: 50,
                                height: 50,
                                borderRadius: 50,
                                backgroundColor: colors.white,
                            }}
                            onPress={() => navigation.navigate("")}
                        ></TouchableOpacity>
                        <TouchableOpacity style={styles.optionBtn}>
                            <H4 style={{ color: colors.primary }}>
                                Scan Barcode
                            </H4>
                        </TouchableOpacity>
                    </Animated.View>
                    <Animated.View
                        style={[styles.option, option2Style]}
                        pointerEvents={open ? "auto" : "none"}
                    >
                        <TouchableOpacity
                            style={{
                                width: 50,
                                height: 50,
                                borderRadius: 50,
                                backgroundColor: colors.white,
                            }}
                        ></TouchableOpacity>
                        <TouchableOpacity style={styles.optionBtn}>
                            <H4 style={{ color: colors.primary }}>Quick Add</H4>
                        </TouchableOpacity>
                    </Animated.View>

                    <TouchableOpacity
                        style={{
                            backgroundColor: colors.primary,
                            width: 50,
                            height: 50,
                            borderRadius: 50,
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                        onPress={toggleMenu}
                    >
                        <Plus pointerEvents="none" />
                    </TouchableOpacity>
                </View>
            </View>
            <Pressable
                onPress={() => router.navigate("/(tabs)/(logs)/logs")}
                style={{ height: 48, alignItems: "center", width: 68 }}
            >
                <Logs
                    pointerEvents="none"
                    style={{
                        color: isFocused(2) ? colors.primary : colors.inactive,
                    }}
                />
                {isFocused(2) ? <H5_SemiBold>Logs</H5_SemiBold> : <H5>Logs</H5>}
            </Pressable>
            <Pressable
                onPress={() => router.navigate("/(tabs)/(profile)/profile")}
                style={{ height: 48, alignItems: "center", width: 65 }}
            >
                <Profile
                    pointerEvents="none"
                    style={{
                        color: isFocused(3) ? colors.primary : colors.inactive,
                    }}
                />
                {isFocused(3) ? (
                    <H5_SemiBold>Profile</H5_SemiBold>
                ) : (
                    <H5>Profile</H5>
                )}
            </Pressable>
        </View>
    );
};

export default MyNavBar;

const styles = StyleSheet.create({
    option: {
        flexDirection: "row",
        position: "absolute",
        bottom: 70,
        gap: 8,
        height: 50,
        alignItems: "center",
        backgroundColor: "red",
    },
    optionBtn: {
        width: 141,
        height: 50,
        borderRadius: 8,
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
        // marginBottom: 10,
    },
});
