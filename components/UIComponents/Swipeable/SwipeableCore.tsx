import React, { memo, ReactNode, useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

type SwipeableCoreProps = {
	children: ReactNode;
	underChildren: ReactNode;
	backgroundColor: string;
	autoClose?: boolean;
	onPress: () => void;
	onSwipe?: () => void;
};

/** How far the row slides to reveal the action. */
const OPEN_DISTANCE = 60;
/** Drag past this, or fling, and the row opens on release. */
const OPEN_THRESHOLD = 30;
const ANIMATION_MS = 160;

const CONTAINER_STYLE = { paddingHorizontal: 0 };

/**
 * Swipe-to-reveal row, purpose-built.
 *
 * This replaces `ReanimatedSwipeable` from react-native-gesture-handler, which
 * allocated per instance: 9 shared values, 3 animated styles, 3 spring animations,
 * 3 animated refs and two nested gesture detectors - and eagerly rendered its action
 * panel. The library pays for generality this app does not use (left *and* right
 * actions, overshoot physics, progress callbacks, tap-to-close configuration).
 *
 * This is the swipe the app actually performs: one pan gesture, one tap gesture that
 * only recognises while the row is open, three shared values, two animated styles.
 * The prop interface is unchanged, so every caller inherits the change.
 */
function SwipeableCore({
	children,
	onPress,
	underChildren,
	backgroundColor,
	autoClose = false,
	onSwipe = () => {},
}: SwipeableCoreProps) {
	const translateX = useSharedValue(0);
	const startX = useSharedValue(0);
	const [isOpen, setIsOpen] = useState(false);

	const close = useCallback(() => {
		setIsOpen(false);
		translateX.value = withTiming(0, { duration: ANIMATION_MS });
	}, [translateX]);

	// Fires once, when the row reaches open - the swipe itself is the action.
	const handleOpen = useCallback(() => {
		onSwipe();
		if (autoClose) {
			translateX.value = withTiming(0, { duration: ANIMATION_MS });
			setIsOpen(false);
			return;
		}
		setIsOpen(true);
	}, [onSwipe, autoClose, translateX]);

	const handleClose = useCallback(() => {
		setIsOpen(false);
	}, []);

	const pan = Gesture.Pan()
		// Let the vertical list scroll win: start only on horizontal intent, and give
		// up as soon as the finger travels further vertically than horizontally.
		.activeOffsetX([-12, 12])
		.failOffsetY([-14, 14])
		.onStart(() => {
			startX.value = translateX.value;
		})
		.onUpdate((event) => {
			// Right-to-left only, clamped to the action's width.
			const next = startX.value + event.translationX;
			translateX.value = Math.min(0, Math.max(next, -OPEN_DISTANCE));
		})
		.onEnd((event) => {
			const shouldOpen =
				translateX.value < -OPEN_THRESHOLD || event.velocityX < -500;
			if (shouldOpen) {
				translateX.value = withTiming(-OPEN_DISTANCE, {
					duration: ANIMATION_MS,
				});
				scheduleOnRN(handleOpen, );
			} else {
				translateX.value = withTiming(0, { duration: ANIMATION_MS });
				scheduleOnRN(handleClose, );
			}
		});

	const contentStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }],
	}));

	const actionStyle = useAnimatedStyle(() => ({
		opacity: translateX.value < 0 ? 1 : 0,
	}));

	return (
		<View style={[styles.container, CONTAINER_STYLE]}>
			<Animated.View style={[styles.action, actionStyle]}>
				<Pressable
					onPress={onPress}
					style={[styles.actionButton, { backgroundColor }]}
				>
					{underChildren}
				</Pressable>
			</Animated.View>

			<GestureDetector gesture={pan}>
				<Animated.View style={[styles.content, contentStyle]}>
					{children}
				</Animated.View>
			</GestureDetector>

			{/* While open, taps close the row instead of reaching its controls. It
			    stops short of the action strip, which the content has slid away from,
			    so the action underneath stays pressable. */}
			{isOpen ? (
				<Pressable
					style={[StyleSheet.absoluteFill, { right: OPEN_DISTANCE }]}
					onPress={close}
				/>
			) : null}
		</View>
	);
}

export default memo(SwipeableCore);

const styles = StyleSheet.create({
	container: {
		overflow: "hidden",
		borderRadius: 8,
	},
	action: {
		position: "absolute",
		right: 0,
		top: 0,
		bottom: 0,
		width: OPEN_DISTANCE,
		borderTopRightRadius: 8,
		borderBottomRightRadius: 8,
	},
	actionButton: {
		flex: 1,
		borderTopRightRadius: 8,
		borderBottomRightRadius: 8,
		justifyContent: "center",
	},
	content: {},
});
