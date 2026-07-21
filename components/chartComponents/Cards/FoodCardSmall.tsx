import { H4, H5_SemiBold, H6 } from "@/components/UIComponents/Typography";
import { calculateCalories } from "@/helper/calculateCalories";
import { calculateMacro } from "@/helper/calculateMacro";
import { SimpleRound } from "@/helper/simpleRound";
import { colors } from "@/theme";
import { FoodFullData } from "@/types/food";
import React from "react";
import { StyleSheet, View } from "react-native";

const FoodCardSmall = ({ food, foodItem }: FoodFullData) => {
	const foodData = calculateMacro(
		food,
		foodItem.serving_mult * foodItem.servings,
	);
	return (
		<View style={styles.container}>
			<View style={styles.rowContainer}>
				<View style={{ width: 240 }}>
					<H4 numberOfLines={1}>{food.name}</H4>
				</View>
				<H4>
					{foodItem.servings} {foodItem.serving_type}
					{foodItem.servings > 1 && "s"}
				</H4>
			</View>
			<View style={[{ flexDirection: "row" }]}>
				<View
					style={[
						styles.progressBar,
						{
							backgroundColor: colors.protein,
							borderTopLeftRadius: 8,
							borderBottomLeftRadius: 8,

							flex: food.protein,
						},
						food.fat + food.carbs == 0
							? {
									borderTopRightRadius: 8,
									borderBottomRightRadius: 8,
								}
							: {},
					]}
				/>
				<View
					style={[
						styles.progressBar,
						{
							backgroundColor: colors.carbs,
							flex: food.carbs,
						},
						food.fat == 0
							? {
									borderTopRightRadius: 8,
									borderBottomRightRadius: 8,
								}
							: {},
						food.protein == 0
							? {
									borderTopLeftRadius: 8,
									borderBottomLeftRadius: 8,
								}
							: {},
					]}
				/>
				<View
					style={[
						styles.progressBar,
						{
							backgroundColor: colors.fat,
							borderTopRightRadius: 8,
							borderBottomRightRadius: 8,
							flex: food.fat,
						},
						food.protein + food.carbs == 0
							? {
									borderTopLeftRadius: 8,
									borderBottomLeftRadius: 8,
								}
							: {},
					]}
				/>
			</View>
			<View style={styles.macroInfo}>
				<View style={styles.macroInfoSub}>
					<H5_SemiBold>{calculateCalories(foodData)} cal</H5_SemiBold>
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
	);
};

export default FoodCardSmall;

const styles = StyleSheet.create({
	container: {
		backgroundColor: colors.white,
		padding: 16,
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
