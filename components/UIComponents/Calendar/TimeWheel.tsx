import { colors, typography } from "@/theme";
import React, { useCallback, useEffect, useRef } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { H2, H5_SemiBold } from "../Typography";

const ITEM_HEIGHT = 44;
/** Rows on screen. The compact sheet passes 3; the standalone picker keeps 5. */
const DEFAULT_VISIBLE = 5;
/**
 * Empty space above and below the rows.
 *
 * It exists so the first and last values can sit under the highlight band.
 *
 * Note what it does *not* affect: the band is a sibling of the list, positioned at
 * `PADDING` from the top of this view. A row at content offset `PADDING + i * ITEM`
 * therefore lands on the band when the list is scrolled to `i * ITEM` — the padding is
 * already in both. Adding it to the scroll offset as well put the wheel two rows off.
 */
const paddingFor = (visible: number) => ITEM_HEIGHT * ((visible - 1) / 2);

type Props = {
	/** Values to scroll through, in order. */
	values: string[];
	/** Index of the current value. */
	index: number;
	onIndexChange: (index: number) => void;
	width: number;
	/** Rows on screen. Default 5. */
	visibleRows?: number;
	/** Small label under the column ("hr", "min"). */
	suffix?: string;
};

/**
 * One scrolling column of a time picker.
 *
 * A FlatList that snaps to 44 pt rows, not a text field: typing minutes is slow and
 * error-prone, and a wheel is the gesture everyone already knows from a phone alarm.
 * The selected row is highlighted by a band drawn behind the list, so the centre value
 * reads as chosen even while scrolling.
 */
export default function TimeWheel({
	values,
	index,
	onIndexChange,
	width,
	visibleRows = DEFAULT_VISIBLE,
	suffix,
}: Props) {
	const padding = paddingFor(visibleRows);
	const listRef = useRef<FlatList<string>>(null);
	// Start at -1 so the first effect run positions the list even when the index has
	// not changed since mount.
	const lastIndex = useRef(-1);

	// Keep the list in step when the value changes from outside (opening the modal).
	useEffect(() => {
		if (lastIndex.current === index) return;
		lastIndex.current = index;
		listRef.current?.scrollToOffset({
			offset: index * ITEM_HEIGHT,
			animated: false,
		});
	}, [index]);

	const handleEnd = useCallback(
		(event: { nativeEvent: { contentOffset: { y: number } } }) => {
			const next = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
			const clamped = Math.max(0, Math.min(values.length - 1, next));
			lastIndex.current = clamped;
			if (clamped !== index) onIndexChange(clamped);
		},
		[index, onIndexChange, values.length],
	);

	return (
		<View style={{ width }}>
			{/* Fixed height: without it the list fills the card and one wheel swallows the
			    whole modal. */}
			<View style={{ height: ITEM_HEIGHT * visibleRows }}>
				<View style={[styles.band, { top: padding }]} pointerEvents="none" />
			<FlatList
				ref={listRef}
				data={values}
				keyExtractor={(item) => item}
				showsVerticalScrollIndicator={false}
				snapToInterval={ITEM_HEIGHT}
				decelerationRate="fast"
				getItemLayout={(_, i) => ({
					length: ITEM_HEIGHT,
					offset: ITEM_HEIGHT * i,
					index: i,
				})}
				contentContainerStyle={{
					paddingVertical: padding,
				}}
				// `initialScrollIndex` is deliberately not used: it ignores the padding
				// above and starts two rows early. The effect above scrolls precisely.
				initialNumToRender={visibleRows + 2}
				onMomentumScrollEnd={handleEnd}
				onScrollEndDrag={handleEnd}
				style={{ height: ITEM_HEIGHT * visibleRows }}
				renderItem={({ item, index: itemIndex }) => {
					const selected = itemIndex === index;
					return (
						<View style={styles.item}>
							{selected ? (
								<H2 style={{ color: colors.primary }}>{item}</H2>
							) : (
								<H5_SemiBold style={{ color: colors.inactive }}>
									{item}
								</H5_SemiBold>
							)}
						</View>
					);
				}}
			/>
			</View>
			{suffix ? (
				<View style={styles.suffix}>
					<H5_SemiBold style={{ color: colors.inactive }}>
						{suffix}
					</H5_SemiBold>
				</View>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	band: {
		position: "absolute",
		height: ITEM_HEIGHT,
		left: 0,
		right: 0,
		borderRadius: 8,
		backgroundColor: colors.primary_bg,
	},
	item: {
		height: ITEM_HEIGHT,
		alignItems: "center",
		justifyContent: "center",
	},
	suffix: {
		alignItems: "center",
		marginTop: 4,
	},
});
