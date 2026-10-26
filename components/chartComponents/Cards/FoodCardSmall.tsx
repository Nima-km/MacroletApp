import { H4, H5, H5_SemiBold, H6 } from "@/components/UIComponents/Typography";
import { calculateCalories } from "@/helper/calculateCalories";
import { calculateMacro } from "@/helper/calculateMacro";
import { SimpleRound } from "@/helper/simpleRound";
import { colors } from "@/theme";
import { FoodFullData } from "@/types/food";
import React from "react";
import { StyleSheet, View } from "react-native";
import Check from "@/assets/svg/check.svg";
import MacroChart from "../MacroCharts/MacroChart";

type Props = FoodFullData & {
	/** How many times this food is in the selection. 0 hides the badge. */
	selectedCount?: number;
};

const FoodCardSmall = ({ food, foodItem, selectedCount = 0 }: Props) => {
	const foodData = calculateMacro(
		food,
		foodItem.serving_mult * foodItem.servings,
	);
	return (
		<View
			style={[
				styles.container,
				{
					borderColor:
						selectedCount > 0 ? colors.primary : colors.off_white,
					borderWidth: 1,
				},
			]}
		>
			<View
				style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
			>
				{selectedCount > 0 ? (
					<View style={styles.selectedBadge}>
						{selectedCount === 1 ? (
							<Check
								width={16}
								height={16}
								color={colors.white}
							/>
						) : (
							<H6 style={styles.selectedCount}>
								{selectedCount}
							</H6>
						)}
					</View>
				) : null}

				<View style={{ flex: 1, gap: 8 }}>
					{/* A check once, the count when the same food was added more than once. */}

					<View style={[styles.rowContainer, {}]}>
						<View style={{ width: 150 }}>
							<H4 numberOfLines={1}>{food.name}</H4>
							{/* Without this, three imported foods all called "Apple" are
					    indistinguishable rows. */}
							{food.brand ? (
								<H6
									numberOfLines={1}
									style={{ color: colors.inactive }}
								>
									{food.brand}
								</H6>
							) : null}
						</View>
						<H4>
							{foodItem.servings} {foodItem.serving_type}
							{foodItem.servings > 1 && "s"}
						</H4>
					</View>
					<MacroChart food={food} />
					<View style={styles.macroInfo}>
						<View style={styles.macroInfoSub}>
							<H5_SemiBold>
								{calculateCalories(foodData)} cal
							</H5_SemiBold>
						</View>
						<View style={styles.macroInfoSub}>
							<View
								style={[
									styles.macroBall,
									{ backgroundColor: colors.protein },
								]}
							/>
							<H5_SemiBold>P</H5_SemiBold>
							<H6>{SimpleRound(foodData.protein)} g</H6>
						</View>
						<View style={styles.macroInfoSub}>
							<View
								style={[
									styles.macroBall,
									{ backgroundColor: colors.carbs },
								]}
							/>
							<H5_SemiBold>C</H5_SemiBold>
							<H6>{SimpleRound(foodData.carbs)} g</H6>
						</View>
						<View style={styles.macroInfoSub}>
							<View
								style={[
									styles.macroBall,
									{ backgroundColor: colors.fat },
								]}
							/>
							<H5_SemiBold>F</H5_SemiBold>
							<H6>{SimpleRound(foodData.fat)} g</H6>
						</View>
					</View>
				</View>
			</View>
		</View>
	);
};

export default FoodCardSmall;

const styles = StyleSheet.create({
	selectedBadge: {
		width: 28,
		height: 28,
		borderRadius: 14,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.primary,
		zIndex: 1,
	},
	selectedCount: {
		color: colors.white,
	},
	container: {
		backgroundColor: colors.white,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 8,
		gap: 8,
	},
	rowContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	progressBar: {
		height: 15,
	},
	macroInfo: {
		flexDirection: "row",
		justifyContent: "space-around",
	},
	macroInfoSub: {
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		gap: 8,
	},
	macroBall: {
		width: 10,
		height: 10,
		borderRadius: 10,
	},
});
