import Home from "@/assets/svg/Home.svg";
import Barcode from "@/assets/svg/barcode.svg";
import Discover from "@/assets/svg/compass.svg";
import Logs from "@/assets/svg/logs.svg";
import Plus from "@/assets/svg/plus-empty.svg";
import Profile from "@/assets/svg/profile.svg";
import Quick from "@/assets/svg/quick.svg";
import {
	useFindFoodSelectedPageStore,
	useQuickMenuStore,
} from "@/store/useStore";
import { colors } from "@/theme";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
	const updateMenu = useQuickMenuStore((state) => state.update);
	const setSelectedPage = useFindFoodSelectedPageStore(
		(s) => s.setSelectedPage,
	);
	const progress = useSharedValue(0);
	const toggleMenu = () => {
		setOpen(!open);
		progress.value = withSpring(open ? 0 : 1, {
			damping: 3000,
			stiffness: 3000,
		});
	};
	const closeMenu = () => {
		setOpen(false);
		progress.value = withSpring(0, {
			damping: 3000,
			stiffness: 3000,
		});
	};
	const option1Style = useAnimatedStyle(() => ({
		transform: [
			{ translateY: interpolate(progress.value, [0, 1], [0, -10]) },
		],
		opacity: progress.value,
		//   shadowColor: "black",
	}));

	// Option 2 animation
	const option2Style = useAnimatedStyle(() => ({
		transform: [
			{ translateY: interpolate(progress.value, [0, 1], [0, -80]) },
		],
		opacity: progress.value,
		//   shadowColor: "white",
	}));

	// Option 3 animation
	const option3Style = useAnimatedStyle(() => ({
		transform: [
			{ translateY: interpolate(progress.value, [0, 1], [0, -150]) },
		],
		opacity: progress.value,
	}));
	useEffect(() => {
		closeMenu();
	}, [updateMenu]);
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
				onPress={() => {
					(router.navigate("/"), closeMenu());
				}}
				style={{ height: 48, alignItems: "center", width: 65 }}
			>
				<Home
					pointerEvents="none"
					color={isFocused(0) ? colors.primary : colors.inactive}
				/>
				{isFocused(0) ? (
					<H5_SemiBold style={{ color: colors.primary }}>
						Home
					</H5_SemiBold>
				) : (
					<H5 style={{ color: colors.inactive }}>Home</H5>
				)}
			</Pressable>
			<Pressable
				onPress={() => {
					(router.navigate("/(tabs)/discover"), closeMenu());
				}}
				style={{ height: 48, alignItems: "center", width: 68 }}
			>
				<Discover
					pointerEvents="none"
					color={isFocused(1) ? colors.primary : colors.inactive}
				/>
				{isFocused(1) ? (
					<H5_SemiBold style={{ color: colors.primary }}>
						Discover
					</H5_SemiBold>
				) : (
					<H5 style={{ color: colors.inactive }}>Discover</H5>
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
							style={[
								open ? styles.boxWithShadow : {},
								{
									width: 50,
									height: 50,
									borderRadius: 50,
									backgroundColor: colors.white,
									justifyContent: "center",
									alignItems: "center",
								},
							]}
							onPress={() => {
								(router.navigate({
									pathname: "/(tabs)/(logs)/logFood",
								}),
									setSelectedPage(2),
									toggleMenu());
							}}
						>
							<Barcode
								width={27}
								height={27}
								color={colors.primary}
								pointerEvents="none"
							/>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								open ? styles.boxWithShadow : {},
								styles.optionBtn,
							]}
							onPress={() => {
								(router.navigate({
									pathname: "/(tabs)/(logs)/logFood",
								}),
									setSelectedPage(2),
									toggleMenu());
							}}
						>
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
							style={[
								open ? styles.boxWithShadow : {},
								{
									width: 50,
									height: 50,
									borderRadius: 50,
									backgroundColor: colors.white,
									justifyContent: "center",
									alignItems: "center",
								},
							]}
							onPress={() => {
								(router.navigate({
									pathname: "/(tabs)/(logs)/logFood",
								}),
									setSelectedPage(3),
									toggleMenu());
							}}
						>
							<Quick
								width={27}
								height={27}
								color={colors.primary}
								pointerEvents="none"
							/>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								open ? styles.boxWithShadow : {},
								styles.optionBtn,
							]}
							onPress={() => {
								(router.navigate({
									pathname: "/(tabs)/(logs)/logFood",
								}),
									setSelectedPage(3),
									toggleMenu());
							}}
						>
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
						<Plus pointerEvents="none" color={colors.white} />
					</TouchableOpacity>
				</View>
			</View>
			<Pressable
				onPress={() => {
					(router.navigate("/(tabs)/(logs)/logs"), closeMenu());
				}}
				style={{ height: 48, alignItems: "center", width: 68 }}
			>
				<Logs
					pointerEvents="none"
					color={isFocused(2) ? colors.primary : colors.inactive}
				/>
				{isFocused(2) ? (
					<H5_SemiBold style={{ color: colors.primary }}>
						Logs
					</H5_SemiBold>
				) : (
					<H5 style={{ color: colors.inactive }}>Logs</H5>
				)}
			</Pressable>
			<Pressable
				onPress={() => {
					(router.navigate("/(tabs)/(profile)/profile"), closeMenu());
				}}
				style={{ height: 48, alignItems: "center", width: 65 }}
			>
				<Profile
					pointerEvents="none"
					color={isFocused(3) ? colors.primary : colors.inactive}
				/>
				{isFocused(3) ? (
					<H5_SemiBold style={{ color: colors.primary }}>
						Profile
					</H5_SemiBold>
				) : (
					<H5 style={{ color: colors.inactive }}>Profile</H5>
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
		// backgroundColor: "red",
		elevation: 5,
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
	boxWithShadow: {
		shadowColor: "#D1BBB3",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.8,
		shadowRadius: 2,
		elevation: 5,
	},
});
