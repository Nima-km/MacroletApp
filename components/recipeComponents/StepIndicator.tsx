import Check from "@/assets/svg/check.svg";
import { useRecipeDraftStore } from "@/store/recipeStore/useRecipeStore";
import { useFindFoodSelectedPageStore } from "@/store/useStore";
import { colors } from "@/theme";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { H5, H6 } from "../UIComponents/Typography";
interface Props {
	activeStep: number;
}
const StepIndicator = ({ activeStep }: Props) => {
	const router = useRouter();
	const { data: draft } = useRecipeDraftStore();
	const setSelectedPage = useFindFoodSelectedPageStore(
		(s) => s.setSelectedPage,
	);
	const steps = [
		{
			name: "Overview",

			link: () => router.push("/(tabs)/(logs)/CreateRecipe/overview"),
			active: true,
		},
		{
			name: "Ingredients",

			link: () => {
				(router.push("/(tabs)/(logs)/CreateRecipe/ingredients"),
					setSelectedPage(0));
			},
			active:
				draft.foodData.name &&
				draft.foodData.name.length > 3 &&
				draft.recipeData.description &&
				draft.recipeData.description?.length > 10,
		},
		{
			name: "Directions",

			link: () => router.push("/(tabs)/(logs)/CreateRecipe/directions"),
			active:
				draft.ingredientItemsData.length > 0 &&
				draft.recipeData.servings_yield &&
				draft.recipeData.servings_yield >= 1,
		},
		{
			name: "Preview",

			link: () => {},
			active: false,
		},
	];
	function isCompleted(step: string) {
		if (step == "Overview") {
			return (
				draft.foodData.name &&
				draft.foodData.name.length > 3 &&
				draft.recipeData.description &&
				draft.recipeData.description?.length > 10 /*&&
				draft.recipeData.tags &&
				draft.recipeData.tags.length > 0*/
			);
		} else if (step == "Ingredients") {
			return (
				draft.ingredientItemsData.length > 0 &&
				draft.recipeData.servings_yield &&
				draft.recipeData.servings_yield >= 1
			);
		} else if (step == "Directions") {
			return (
				draft.recipeData.directions &&
				draft.recipeData.directions?.length > 0
			);
		}
	}
	return (
		<View>
			<View
				style={{
					flexDirection: "row",
					paddingBottom: 12,
					paddingLeft: 30,
					//	paddingRight: 40,

					gap: 10,
				}}
			>
				{steps.map((item, ind) => (
					<View
						key={ind}
						style={{
							flexDirection: "row",
							gap: 10,

							alignItems: "center",
						}}
					>
						<Pressable
							style={{
								justifyContent: "center",
								alignItems: "center",
								gap: 12,
							}}
							onPress={item.active ? item.link : () => {}}
						>
							<View
								style={{
									width: 33,
									height: 33,
									borderRadius: 30,
									backgroundColor:
										activeStep == ind
											? colors.primary_bg
											: colors.white,
									justifyContent: "center",
									alignItems: "center",
									borderColor:
										activeStep == ind
											? colors.primary
											: colors.white,
									borderWidth: 1,
								}}
							>
								{isCompleted(item.name) ? (
									<View
										key={ind}
										style={{
											width: 28,
											height: 28,
											borderRadius: 28,
											backgroundColor: colors.primary,
											justifyContent: "center",
											alignItems: "center",
										}}
									>
										<Check />
									</View>
								) : (
									<H5
										style={{
											color:
												activeStep == ind
													? colors.primary
													: colors.black,
										}}
									>
										{ind + 1}
									</H5>
								)}
							</View>
							{/*<H5>{item.name}</H5>*/}
						</Pressable>
						{ind !== 3 && (
							<View
								style={{
									//	flex: 1,
									width: ind != 2 ? 58 : 46,
									height: 1,
									backgroundColor: colors.light_gray,
								}}
							/>
						)}
					</View>
				))}
			</View>
			<View
				style={{
					flexDirection: "row",
					paddingBottom: 12,
					paddingHorizontal: 20,
					justifyContent: "space-between",
					gap: 10,
				}}
			>
				{steps.map((item, ind) => (
					<View
						key={ind}
						style={{
							//	backgroundColor: "red",
							flexDirection: "row",

							gap: 10,
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<Pressable
							style={{
								justifyContent: "center",
								alignItems: "center",
								//gap: 12,
							}}
							onPress={item.active ? item.link : () => {}}
						>
							{<H6>{item.name}</H6>}
						</Pressable>
					</View>
				))}
			</View>
		</View>
	);
};

export default StepIndicator;

const styles = StyleSheet.create({});
