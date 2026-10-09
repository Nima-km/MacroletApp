import { useScrollStore } from "@/store/scrollStore";
import { useQuickMenuStore } from "@/store/useStore";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
	Keyboard,
	KeyboardAvoidingView,
	KeyboardAvoidingViewProps,
	NativeScrollEvent,
	NativeSyntheticEvent,
	Platform,
	ScrollView,
	StyleSheet,
} from "react-native";
interface KeyboardScreenProps {
	children: ReactNode;
	scrollEnabled?: boolean;
	contentPadding?: number;
	/**
	 * Optional. This wrapper owns the ScrollView, so a screen that wants
	 * pull-to-refresh has to hand the control down rather than attach its own.
	 * Typed off ScrollView itself, since its `refreshControl` wants a specific
	 * element type rather than a bare ReactElement.
	 */
	refreshControl?: React.ComponentProps<typeof ScrollView>["refreshControl"];
}

const KeyboardAware = ({
	children,
	scrollEnabled = true,
	contentPadding = 16,
	refreshControl,
}: KeyboardScreenProps) => {
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
	const scrollViewRef = useRef<ScrollView>(null);
	const newScrollPos = useScrollStore((s) => s.scrollPos);
	const setOpen = useQuickMenuStore((state) => state.setUpdate);
	const [scrollPositions, setScrollPositions] = useState(0);
	const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const scrollY = event.nativeEvent.contentOffset.y;

		setScrollPositions((prev) => scrollY);
		console.log("scroll position", scrollY);
	};
	useEffect(() => {
		scrollViewRef.current?.scrollTo({ y: newScrollPos, animated: true });
	}, [newScrollPos]);
	return (
		<KeyboardAvoidingView
			behavior={behaviour}
			style={{
				flex: 1,
			}}
			keyboardVerticalOffset={0} // adjust if header is present
		>
			<ScrollView
				ref={scrollViewRef}
				nestedScrollEnabled={true}
				onScroll={handleScroll}
				keyboardDismissMode="none"
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={{
					flexGrow: 1,
					minHeight: 700,
				}}
				scrollEnabled={scrollEnabled}
				onTouchStart={() => setOpen()}
				refreshControl={refreshControl}
			>
				{children}
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

export default KeyboardAware;

const styles = StyleSheet.create({});
