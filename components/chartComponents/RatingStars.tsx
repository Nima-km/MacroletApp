import StarEmpty from "@/assets/svg/star-empty.svg";
import Star from "@/components/chartComponents/Star";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

type Props = {
	/** 0–5. Fractional values render partially filled stars. */
	rating: number;
	size?: number;
	color?: string;
	gap?: number;
	/** When provided the stars become a 1–5 input. */
	onRate?: (rating: number) => void;
};

const STAR_INDICES = [0, 1, 2, 3, 4];

const RatingStars = ({
	rating,
	size = 23,
	color = "#FEC92D",
	gap = 4,
	onRate,
}: Props) => {
	const safeRating = Number.isFinite(rating) ? rating : 0;

	return (
		<View style={[styles.row, { gap }]}>
			{STAR_INDICES.map((index) => {
				// Each star shows the slice of the rating that falls on it.
				const fill = Math.min(Math.max(safeRating - index, 0), 1);
				// An unfilled star uses the plain outline asset (grey stroke,
				// white fill); a filled or partial one uses the yellow gradient.
				const star =
					fill > 0 ? (
						<Star
							width={size}
							height={size}
							offset={fill}
							color={color}
						/>
					) : (
						<StarEmpty width={size} height={size} />
					);

				if (!onRate) return <View key={index}>{star}</View>;

				return (
					<Pressable
						key={index}
						onPress={() => onRate(index + 1)}
						hitSlop={6}
						accessibilityRole="button"
						accessibilityLabel={`Rate ${index + 1} out of 5`}
					>
						{star}
					</Pressable>
				);
			})}
		</View>
	);
};

export default RatingStars;

const styles = StyleSheet.create({
	row: { flexDirection: "row", alignItems: "center" },
});
