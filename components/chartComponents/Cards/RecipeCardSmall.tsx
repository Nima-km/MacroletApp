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
	scale?: number;
}
const RecipeCardSmall = ({ recipe, scale = 1 }: Props) => {
	return (
		<View
			style={{
				backgroundColor: colors.white,
				borderRadius: 8,
				width: 159 * scale,
				height: 313 * ((scale - 1) / 2 + 1),
				gap: 0,
			}}
		>
			<View style={{ height: 122 * scale }}>
				<ImageView
					style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
					imageStyle={{
						borderTopLeftRadius: 8,
						borderTopRightRadius: 8,
					}}
					source={recipe.recipeData.bannerImage}
				/>
			</View>
			<View style={{ padding: 12, gap: 8, flex: 1 }}>
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
				<View style={{ flex: 1 }}>
					<H5_SemiBold numberOfLines={2}>
						{recipe.foodData.name}
					</H5_SemiBold>
				</View>
				<H5 style={{ color: colors.medium_gray }}>
					{recipe.recipeData.author}
				</H5>
				<View style={{ flexDirection: "row", gap: 4 }}>
					<Star pointerEvents="none" />
					<H6>4.5 (1,437)</H6>
				</View>
				<MacroChart food={recipe.foodData} height={12} />
				<View
					style={{
						flexDirection: "row",
						justifyContent: "space-around",
					}}
				>
					<View
						style={
							{
								//width: 30,
							}
						}
					>
						<H6>
							{SimpleRound((recipe.foodData.protein ?? 0) / 10) *
								10}{" "}
							g
						</H6>
						<View
							style={{
								height: 3,
								borderRadius: 2,
								backgroundColor: colors.protein,
							}}
						/>
					</View>
					<View
						style={
							{
								//width: 30,
							}
						}
					>
						<H6>
							{SimpleRound((recipe.foodData.carbs ?? 0) / 10) *
								10}{" "}
							g
						</H6>
						<View
							style={{
								height: 3,
								borderRadius: 2,
								backgroundColor: colors.carbs,
							}}
						/>
					</View>
					<View
						style={
							{
								//width: 30,
							}
						}
					>
						<H6>
							{SimpleRound((recipe.foodData.fat ?? 0) / 10) * 10}{" "}
							g
						</H6>
						<View
							style={{
								height: 3,
								borderRadius: 2,
								backgroundColor: colors.fat,
							}}
						/>
					</View>
				</View>
			</View>
		</View>
	);
};

export default RecipeCardSmall;

const styles = StyleSheet.create({});
