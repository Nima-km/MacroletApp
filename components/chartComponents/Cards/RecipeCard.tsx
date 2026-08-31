import Calorie from "@/assets/svg/calorie.svg";
import Clock from "@/assets/svg/clock.svg";
import Star from "@/assets/svg/star.svg";
import ImageView from "@/components/UIComponents/Image/ImageView";
import { H5, H5_SemiBold, H6 } from "@/components/UIComponents/Typography";
import { calculateCalories } from "@/helper/calculateCalories";
import { SimpleRound } from "@/helper/simpleRound";
import { colors } from "@/theme";
import { RecipeData } from "@/types/recipe";
import React from "react";
import { StyleSheet, View } from "react-native";
import MacroChart from "../MacroCharts/MacroChart";
interface Props {
	recipe: Omit<RecipeData, "ingredientItemsData">;
}
const RecipeCard = ({ recipe }: Props) => {
	// console.log("recipe card: ", recipe);
	return (
		<View
			style={{
				backgroundColor: colors.white,
				borderRadius: 8,
				height: 139,
			}}
		>
			<View
				style={{
					flexDirection: "row",
					gap: 16,
					padding: 12,
				}}
			>
				<View style={{ height: 115, width: 128 }}>
					<ImageView
						style={{ borderRadius: 8 }}
						imageStyle={{ borderRadius: 8 }}
						source={recipe.recipeData.bannerImage}
					/>
				</View>
				<View style={{ flex: 1, gap: 8 }}>
					<H5_SemiBold>{recipe.foodData.name}</H5_SemiBold>

					<View
						style={{
							flexDirection: "row",
							gap: 8,
							alignItems: "center",
						}}
					>
						<H5 style={{ color: colors.medium_gray }}>
							{recipe.recipeData.author ?? "by You"}
						</H5>
						<View
							style={{
								flexDirection: "row",
								gap: 4,
								alignItems: "center",
							}}
						>
							<Star pointerEvents="none" />
							<H6>4.5 (1,437)</H6>
						</View>
					</View>
					<View style={{ flexDirection: "row", gap: 12 }}>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "center",
								gap: 4,
							}}
						>
							<Clock
								width={18}
								height={18}
								pointerEvents="none"
								color={colors.primary}
							/>
							<H6 style={{ color: colors.primary }}>
								{(recipe.recipeData.cook_time ?? 0) +
									(recipe.recipeData.prep_time ?? 0)}{" "}
								min
							</H6>
						</View>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "center",
								gap: 4,
							}}
						>
							<Calorie pointerEvents="none" />
							<H6 style={{ color: colors.primary }}>
								{calculateCalories(recipe.foodData)}
							</H6>
						</View>
					</View>
					<MacroChart food={recipe.foodData} height={12} />
					<View style={styles.macroInfo}>
						<View style={styles.macroInfoSub}>
							<View
								style={[
									styles.macroBall,
									{ backgroundColor: colors.protein },
								]}
							/>

							<H6>{SimpleRound(recipe.foodData.protein)} g</H6>
						</View>
						<View style={styles.macroInfoSub}>
							<View
								style={[
									styles.macroBall,
									{ backgroundColor: colors.carbs },
								]}
							/>

							<H6>{SimpleRound(recipe.foodData.carbs)} g</H6>
						</View>
						<View style={styles.macroInfoSub}>
							<View
								style={[
									styles.macroBall,
									{ backgroundColor: colors.fat },
								]}
							/>

							<H6>{SimpleRound(recipe.foodData.fat)} g</H6>
						</View>
					</View>
				</View>
			</View>
		</View>
	);
};

export default RecipeCard;

const styles = StyleSheet.create({
	macroBall: {
		width: 10,
		height: 10,
		borderRadius: 10,
	},
	macroInfo: {
		flexDirection: "row",
		justifyContent: "space-around",
	},
	macroInfoSub: {
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		gap: 4,
	},
});
