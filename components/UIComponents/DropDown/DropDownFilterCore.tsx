import ArrowDown from "@/assets/svg/chevron-down.svg";
import { colors, typography } from "@/theme";
import React, {
	memo,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	Animated as RNAnimated,
	LayoutChangeEvent,
	Pressable,
	StyleSheet,
	View,
	TextInput,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
	useAnimatedProps,
	useAnimatedReaction,
	useAnimatedStyle,
	useSharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { FormInputNumberStyled } from "../TextInputs/FormInput";
import { H3 } from "../Typography";

const THUMB = 26;

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
interface Props {
	placeholder?: string;
	unit?: string;
	minValue: string;
	maxValue: string;
	setMinValue: (newVal: string) => void;
	setMaxValue: (newVal: string) => void;
	/**
	 * Optional domain for a two-thumb slider. The numeric inputs stay: dragging is good
	 * for "somewhere around here", typing is good for an exact bound.
	 */
	sliderDomain?: { min: number; max: number };
	/** Smallest allowed gap, in domain units. */
	sliderStep?: number;
	/** Smallest gap between the two bounds, in domain units. */
	sliderMinGap?: number;
}
interface MinMax {
	min: string;
	max: string;
}
const DropDownFilterCore = ({
	placeholder,
	minValue,
	unit,
	maxValue,
	setMaxValue,
	setMinValue,
	sliderDomain,
	sliderStep = 1,
	sliderMinGap = 0,
}: Props) => {
	const [open, setOpen] = useState(false);
	const iconWidth = 25;
	const height = useRef(new RNAnimated.Value(0)).current;

	const toggle = () => {
		setOpen(!open);
		RNAnimated.timing(height, {
			toValue: open ? 0 : sliderDomain ? 180 : 100, // room for a slider when there is one
			duration: 150,
			useNativeDriver: false,
		}).start();
	};

	// ---------------------------------------------------------------------------
	// Slider. Inlined from RangeSlider, which had exactly this body.
	// ---------------------------------------------------------------------------
	const min = sliderDomain?.min ?? 0;
	const max = sliderDomain?.max ?? 1;
	const low = Number(minValue) || min;
	const high = Number(maxValue) || max;

	const [width, setWidth] = useState(0);
	const domain = Math.max(1, max - min);

	const lowX = useSharedValue(0);
	const highX = useSharedValue(0);
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

	const onChange = useCallback(
		(lo: number, hi: number) => {
			setMinValue(String(Math.round(lo)));
			setMaxValue(String(Math.round(hi)));
		},
		[setMinValue, setMaxValue],
	);

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
					scheduleOnRN(commit, lowX.value, highX.value);
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
	// "Calorie Range · 0–1000", or the plain title when there is no slider.
	const headerLabel = sliderDomain
		? `${placeholder} · ${Math.round(low)}–${Math.round(high)}${
				unit ? ` ${unit}` : ""
			}`
		: placeholder;

	// ---------------------------------------------------------------------------
	// End slider
	// ---------------------------------------------------------------------------
	const animatedProps = useAnimatedProps(() => {
		// summarize, rebuilt inline: "0–1000 cal", "from 300 cal", "up to 700 cal",
		// or nothing when both bounds are at zero.
		const lo = Math.round(
			valueAt(lowX.value, min, domain, trackWidth.value),
		);
		const hi = Math.round(
			valueAt(highX.value, min, domain, trackWidth.value),
		);
		const suffix = unit ? ` ${unit}` : "";

		let range = "";
		if (lo !== 0 && hi !== 0) range = `${lo}–${hi}${suffix}`.trim();
		else if (lo !== 0) range = `from ${lo}${suffix}`.trim();
		else if (hi !== 0) range = `up to ${hi}${suffix}`.trim();

		return {
			text: `${range}`,
		} as any; // Cast as any because TextInput text prop isn't traditionally animated
	});
	/** "300–700 cal", "from 300", "up to 700", or nothing when the range is unset. */
	const summarize = (range: MinMax, unit = "") => {
		const min = range.min !== "0" ? range.min : "";
		const max = range.max !== "0" ? range.max : "";
		if (min && max) return `${min}–${max} ${unit}`.trim();
		if (min) return `from ${min} ${unit}`.trim();
		if (max) return `up to ${max} ${unit}`.trim();
		return "";
	};
	return (
		<View style={[{ width: "100%" }]}>
			{/* Selector button */}
			<Pressable style={styles.selector} onPress={toggle}>
				<View style={{ flexDirection: "row", alignItems: "center" }}>
					<H3>{placeholder}</H3>
					{
						<AnimatedTextInput
							underlineColorAndroid="transparent"
							editable={false}
							style={typography.h3}
							value={`${summarize(
								{
									min: minValue.toString(),
									max: maxValue.toString(),
								},
								"",
							)} ${unit}`}
							animatedProps={[animatedProps]}
						/>
					}
				</View>
				<ArrowDown
					pointerEvents="none"
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
			<RNAnimated.View style={[styles.dropdown, { height }]}>
				{sliderDomain ? (
					<GestureDetector gesture={pan}>
						<View onLayout={onLayout} style={styles.container}>
							<View style={styles.track} />
							<Animated.View style={[styles.thumb, lowStyle]} />

							<Animated.View style={[styles.thumb, highStyle]} />
						</View>
					</GestureDetector>
				) : null}
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
			</RNAnimated.View>
		</View>
	);
};

/** Position on the track to a domain value. Worklet: called from the UI runtime. */
function valueAt(x: number, min: number, domain: number, width: number) {
	"worklet";
	return min + (x / Math.max(1, width)) * domain;
}

export default memo(DropDownFilterCore);

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
