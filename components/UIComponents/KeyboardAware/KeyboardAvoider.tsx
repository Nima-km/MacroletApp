import React, { ReactNode, useEffect, useState } from "react";
import {
	Keyboard,
	KeyboardAvoidingView,
	KeyboardAvoidingViewProps,
	Platform,
} from "react-native";

interface Props {
	children: ReactNode;
}

/**
 * Keyboard avoidance **without** a ScrollView.
 *
 * The sibling of `KeyboardAware`, for screens that own their scrolling. `KeyboardAware`
 * wraps its children in a `ScrollView`, which is fine for a form, but fatal under a
 * `FlatList`: a vertical list inside a vertical ScrollView never gets its own viewport,
 * so it renders every row, never reports scroll events, and React Native warns
 * "VirtualizedLists should never be nested inside plain ScrollViews".
 *
 * `FindFood` is the case this exists for. Its tabs are the scrollers (the recent list
 * pages with `onEndReached`), and it has a search field, so it needs the keyboard
 * pushed out of the way but must not be wrapped in a scroller itself.
 *
 * Note there is no `onTouchStart` here. `KeyboardAware` calls the quick-menu store's
 * `setUpdate`, which *toggles* rather than closes - harmless on a wrapper nobody taps,
 * but wrong to repeat.
 */
const KeyboardAvoider = ({ children }: Props) => {
	const defaultValue: KeyboardAvoidingViewProps["behavior"] =
		Platform.OS === "ios" ? "padding" : "height";

	const [behaviour, setBehaviour] =
		useState<KeyboardAvoidingViewProps["behavior"]>(defaultValue);

	useEffect(() => {
		const showListener = Keyboard.addListener("keyboardDidShow", () => {
			setBehaviour(defaultValue);
		});
		const hideListener = Keyboard.addListener("keyboardDidHide", () => {
			setBehaviour(undefined);
		});

		return () => {
			showListener.remove();
			hideListener.remove();
		};
	}, []);

	return (
		<KeyboardAvoidingView
			behavior={behaviour}
			style={{ flex: 1 }}
			keyboardVerticalOffset={0}
		>
			{children}
		</KeyboardAvoidingView>
	);
};

export default KeyboardAvoider;
