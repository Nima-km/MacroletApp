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
import { Tabs, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { H4, H5, H5_SemiBold } from "../UIComponents/Typography";

// Derived from expo-router's own Tabs (SDK 56+ deprecates importing React
// Navigation types directly in app code) so the prop shape cannot drift.
type TabBarProps = Parameters<
	NonNullable<React.ComponentProps<typeof Tabs>["tabBar"]>
>[0];
type QuickOption = {
	/** FindFood pager page this jumps to. */
	page: number;
	label: string;
	icon: "barcode" | "quick" | "recent";
	/** Degrees from straight up, positive to the right. */
	angle: number;
};

const FAN_RADIUS = 74;
/** Upward travel that fully opens the fan while swiping. */
const DRAG_OPEN_DISTANCE = 58;
/** Upward travel needed to commit a selection on release. */
const DRAG_COMMIT_DISTANCE = 26;
const FAN_OPTIONS: QuickOption[] = [
	{ page: 2, label: "Scan barcode", icon: "barcode", angle: -52 },
	{ page: 3, label: "Quick add", icon: "quick", angle: 0 },
	{ page: 0, label: "Recent foods", icon: "recent", angle: 52 },
];

const MyNavBar = ({ state, descriptors, navigation }: TabBarProps) => {
	const router = useRouter();
	const isFocused = (index: number) => state.index === index;
	const [open, setOpen] = useState(false);
	const updateMenu = useQuickMenuStore((state) => state.update);
	const setSelectedPage = useFindFoodSelectedPageStore(
		(s) => s.setSelectedPage,
	);
	const progress = useSharedValue(0);
	const toggleMenu = () => {
		if (open) closeMenu();
		else openMenu();
	};
	// The fan mounts the first time the menu opens and stays mounted, so the opening
	// animation is preserved without paying for three animated views at rest.
	const [hasOpened, setHasOpened] = useState(false);

	const markOpened = useCallback(() => {
		setHasOpened(true);
	}, []);

	const openMenu = useCallback(() => {
		setHasOpened(true);
		setOpen(true);
		progress.value = withSpring(1, {
			damping: 16,
			stiffness: 180,
			mass: 0.9,
		});
	}, [progress]);

	const closeMenu = useCallback(() => {
		setOpen(false);
		progress.value = withSpring(0, {
			damping: 18,
			stiffness: 220,
			mass: 0.9,
		});
	}, [progress]);

	const chooseOption = useCallback(
		(page: number) => {
			router.navigate({ pathname: "/(tabs)/(logs)/logFood" });
			setSelectedPage(page);
			closeMenu();
		},
		[router, setSelectedPage, closeMenu],
	);

	/**
	 * Hold-and-drag: opened by a long press, resolved by where the finger is released.
	 * The maths runs once, on release - nothing happens on the JS thread while dragging.
	 */
	const commitDrag = useCallback(
		(x: number, y: number) => {
			const angle = (Math.atan2(x, -y) * 180) / Math.PI;
			let nearest = FAN_OPTIONS[0];
			for (const option of FAN_OPTIONS) {
				if (
					Math.abs(angle - option.angle) <
					Math.abs(angle - nearest.angle)
				) {
					nearest = option;
				}
			}
			if (Math.abs(angle - nearest.angle) <= 45) {
				chooseOption(nearest.page);
			} else {
				closeMenu();
			}
		},
		[chooseOption, closeMenu],
	);

	/**
	 * Swipe up from the + to fan the menu open under the finger.
	 *
	 * The pan activates on upward travel alone - no hold - and its distance drives the
	 * same shared value the opening animation uses, so the fan grows with the gesture
	 * instead of animating after it. A tap never activates the pan, so `onPress` still
	 * opens the menu the old way.
	 */
	const swipeUp = Gesture.Pan()
		.activeOffsetY(-12)
		.onStart(() => {
			scheduleOnRN(markOpened, );
		})
		.onUpdate((event) => {
			const travel = -event.translationY;
			progress.value = Math.min(
				1,
				Math.max(0, travel / DRAG_OPEN_DISTANCE),
			);
		})
		.onEnd((event) => {
			if (-event.translationY >= DRAG_COMMIT_DISTANCE) {
				scheduleOnRN(commitDrag, event.translationX, event.translationY);
			} else {
				// A short, wobbly press still means "open", like a tap does.
				scheduleOnRN(openMenu, );
			}
		});
	/**
	 * Switch tabs through the navigator, not by navigating to a path.
	 *
	 * These buttons used to call `router.navigate` with deep paths: "/" for Home,
	 * "/(tabs)/discover" for Discover - a route that does not exist, since that tab's
	 * screen is `(discover)/discover` - and a *nested stack* path for Logs and
	 * Profile. Navigating into a tab's stack pushes or rebuilds the screen instead of
	 * resuming the one already mounted, which is why switching to Logs took seconds:
	 * the screen remounted and restarted the calorie chart's 1.25s animation.
	 *
	 * This is the logic the stock tab bar uses: emit `tabPress` so a screen can
	 * prevent it, bail out if it did, and only navigate when the tab isn't the
	 * current one. Tapping the active tab does nothing.
	 */
	const onTabPress = (index: number) => {
		const route = state.routes[index];
		if (!route) return;

		const event = navigation.emit({
			type: "tabPress",
			target: route.key,
			canPreventDefault: true,
		});
		if (event.defaultPrevented) return;
		if (state.index === index) return;

		navigation.navigate(route.name, route.params);
	};

	// One worklet for the whole fan. The options sit at fixed angles and the container
	// scales, fades and swings into place, so they bloom out of the button together
	// instead of each animating itself.
	const menuStyle = useAnimatedStyle(() => ({
		opacity: progress.value,
		transform: [
			{ scale: interpolate(progress.value, [0, 1], [0.4, 1]) },
			{ rotate: `${interpolate(progress.value, [0, 1], [-40, 0])}deg` },
		],
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
					(onTabPress(0), closeMenu());
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
					(onTabPress(1), closeMenu());
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
					{hasOpened ? (
						<Animated.View
							style={[styles.fan, menuStyle]}
							pointerEvents={open ? "box-none" : "none"}
						>
							{FAN_OPTIONS.map((option) => (
								<View
									key={option.page}
									style={[
										styles.fanSlot,
										{
											transform: [
												{
													rotate: `${option.angle}deg`,
												},
												{
													translateY: -FAN_RADIUS,
												},
											],
										},
									]}
								>
									<View
										style={{
											transform: [
												{
													rotate: `${-option.angle}deg`,
												},
											],
										}}
									>
										<TouchableOpacity
											style={[
												styles.fanButton,
												open
													? styles.boxWithShadow
													: {},
											]}
											onPress={() =>
												chooseOption(option.page)
											}
											accessibilityRole="button"
											accessibilityLabel={option.label}
										>
											{option.icon === "barcode" ? (
												<Barcode
													width={26}
													height={26}
													color={colors.primary}
													pointerEvents="none"
												/>
											) : option.icon === "quick" ? (
												<Quick
													width={26}
													height={26}
													color={colors.primary}
													pointerEvents="none"
												/>
											) : (
												<Logs
													width={26}
													height={26}
													color={colors.primary}
													pointerEvents="none"
												/>
											)}
										</TouchableOpacity>
									</View>
								</View>
							))}
						</Animated.View>
					) : null}
					<GestureDetector gesture={swipeUp}>
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
					</GestureDetector>
				</View>
			</View>
			<Pressable
				onPress={() => {
					(onTabPress(2), closeMenu());
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
					(onTabPress(3), closeMenu());
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
	fan: {
		position: "absolute",
		alignItems: "center",
		justifyContent: "center",
	},
	fanSlot: {
		position: "absolute",
		alignItems: "center",
		justifyContent: "center",
	},
	fanButton: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: colors.white,
		alignItems: "center",
		justifyContent: "center",
	},
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
