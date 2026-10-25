import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, TextInput, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
	SharedValue,
	useAnimatedProps,
	useAnimatedReaction,
	useAnimatedStyle,
	useSharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { colors } from "@/theme";

type Props = {
	/** Domain the values map onto. */
	min: number;
	max: number;
	/** The two values. Not ordered: the left thumb may end up above the right. */
	low: number;
	high: number;
	lowX: SharedValue<number>;
	highX: SharedValue<number>;
	onChange: (low: number, high: number) => void;
};

const THUMB = 26;
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export default function RangeSlider({
	min,
	max,
	low,
	high,
	lowX,
	highX,
	onChange,
}: Props) {
	const [width, setWidth] = useState(0);
	const domain = Math.max(1, max - min);

	const trackWidth = useSharedValue(0);
	/** Which thumb is being dragged: 0, 1, or -1 for none. */
	const activeThumb = useSharedValue(-1);
	const startX = useSharedValue(0);

	const onLayout = useCallback(
		(event: LayoutChangeEvent) => {
			const next = Math.max(0, event.nativeEvent.layout.width - THUMB);
			trackWidth.value = next;
			setWidth(next);
		},
		[trackWidth],
	);

	// Follow the props when they change from outside (Reset, the numeric inputs).
	useEffect(() => {
		if (width <= 0) return;
		// While a thumb is held, the shared values are the truth; the props lag by a
		// render and would drag the thumb backwards.
		if (activeThumb.value !== -1) return;
		lowX.value = ((low - min) / domain) * width;
		highX.value = ((high - min) / domain) * width;
	}, [low, high, width, domain, min, lowX, highX, activeThumb]);

	const commit = useCallback(
		(x1: number, x2: number) => {
			const toValue = (x: number) =>
				min + (x / Math.max(1, width)) * domain;
			onChange(toValue(x1), toValue(x2));
		},
		[width, domain, min, onChange],
	);

	// Memoised: a fresh Gesture.Pan() on every render makes gesture-handler re-attach
	// its handler, and during a drag that is the hitch you feel.
	const pan = useMemo(
		() =>
			Gesture.Pan()
				.activeOffsetX([-6, 6])
				.onStart((event) => {
					const x = event.x - THUMB / 2;
					const useLow =
						Math.abs(x - lowX.value) <= Math.abs(x - highX.value);
					activeThumb.value = useLow ? 0 : 1;
					startX.value = useLow ? lowX.value : highX.value;
				})
				.onUpdate((event) => {
					// Clamped to the track only - the thumbs may touch but not cross.
					const next = Math.min(
						trackWidth.value,
						Math.max(0, startX.value + event.translationX),
					);
					if (activeThumb.value === 0) {
						const tmp = Math.min(next, highX.value);
						lowX.value = tmp;
					} else {
						const tmp = Math.max(next, lowX.value);
						highX.value = tmp;
					}
				})
				.onEnd(() => {
					activeThumb.value = -1;
					//scheduleOnRN(commit, lowX.value, highX.value);
				}),
		[activeThumb, commit, highX, lowX, startX, trackWidth],
	);

	// Live values: the numbers follow the thumbs, but React only hears about it when
	// the rounded value actually changes.
	const reportStep = Math.max(1, Math.round(domain / 20));
	/*
	useAnimatedReaction(
		() =>
			Math.round(
				valueAt(lowX.value, min, domain, trackWidth.value) / reportStep,
			) * reportStep,
		(current, previous) => {
			if (previous === null || current === previous) return;
			scheduleOnRN(
				onChange,
				current,
				Math.round(
					valueAt(highX.value, min, domain, trackWidth.value) /
						reportStep,
				) * reportStep,
			);
		},
	);
	useAnimatedReaction(
		() =>
			Math.round(
				valueAt(highX.value, min, domain, trackWidth.value) /
					reportStep,
			) * reportStep,
		(current, previous) => {
			if (previous === null || current === previous) return;
			scheduleOnRN(
				onChange,
				Math.round(
					valueAt(lowX.value, min, domain, trackWidth.value) /
						reportStep,
				) * reportStep,
				current,
			);
		},
	);
	*/
	const lowStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: lowX.value }],
	}));
	const highStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: highX.value }],
	}));
	const animatedProps = useAnimatedProps(() => {
		return {
			// Math.round keeps it looking clean during transitions
			text: `${Math.round(lowX.value)}`,
		} as any; // Cast as any because TextInput text prop isn't traditionally animated
	});

	return (
		<GestureDetector gesture={pan}>
			<View onLayout={onLayout} style={styles.container}>
				<View style={styles.track} />
				<Animated.View style={[styles.thumb, lowStyle]} />

				<Animated.View style={[styles.thumb, highStyle]} />
				{/*<AnimatedTextInput
					underlineColorAndroid="transparent"
					editable={false}
					value={`${lowX.value}`}
					animatedProps={animatedProps}
				/>*/}
			</View>
		</GestureDetector>
	);
}

/** Position on the track to a domain value. Worklet: called from the UI runtime. */
function valueAt(x: number, min: number, domain: number, width: number) {
	"worklet";
	return min + (x / Math.max(1, width)) * domain;
}

const styles = StyleSheet.create({
	container: {
		height: 44,
		justifyContent: "center",
	},
	track: {
		height: 4,
		borderRadius: 2,
		backgroundColor: colors.light_gray,
	},
	thumb: {
		position: "absolute",
		marginLeft: -THUMB / 2,
		width: THUMB,
		height: THUMB,
		borderRadius: THUMB / 2,
		backgroundColor: colors.white,
		borderWidth: 2,
		borderColor: colors.primary,
	},
});
