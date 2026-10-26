import Check from "@/assets/svg/check.svg";
import {
	allMet,
	directionsRequirements,
	ingredientsRequirements,
	overviewRequirements,
} from "@/helper/recipeDraftValidation";
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
	const visibility = useRecipeDraftStore((state) => state.visibility);
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
			active: allMet(overviewRequirements(draft, visibility)),
		},
		{
			name: "Directions",

			link: () => router.push("/(tabs)/(logs)/CreateRecipe/directions"),
			active: allMet(ingredientsRequirements(draft, visibility)),
		},
		{
			name: "Preview",

			link: () => {},
			active: false,
		},
	];
	/**
	 * Completion comes from the same rules the screens gate on, by tier - the tracker
	 * used to keep its own copy, which demanded a description even for a private recipe
	 * and marked Overview complete no matter what was typed.
	 */
	function isCompleted(step: string) {
		if (step === "Overview") {
			return allMet(overviewRequirements(draft, visibility));
		}
		if (step === "Ingredients") {
			return allMet(ingredientsRequirements(draft, visibility));
		}
		if (step === "Directions") {
			// Directions are done when the recipe is ready for preview.
			return allMet(directionsRequirements(draft, visibility));
		}
		return false;
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
