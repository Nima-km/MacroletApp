import StepsCardEdit from "@/components/chartComponents/Cards/StepsCardEdit";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import StepIndicator from "@/components/recipeComponents/StepIndicator";
import {
	PrimaryButton,
	SecondaryAddButton,
} from "@/components/UIComponents/Buttons/Button";
import PrepCookButton from "@/components/UIComponents/Buttons/PrepCookButton";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { H4, H5 } from "@/components/UIComponents/Typography";
import { generateId } from "@/helper/generateId";
import {
	addStep,
	deleteStep,
	updateStep,
} from "@/helper/recipeHelpers/stespUtil";
import { useRecipeDraftStore } from "@/store/recipeStore/useRecipeStore";
import { colors } from "@/theme";
import { DirectionStep } from "@/types/recipe";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

const directions = () => {
	const router = useRouter();
	const recipeObject = useRecipeDraftStore((state) => state);
	const draft = useRecipeDraftStore((state) => state.data);
	const [directions, setDirections] = useState<DirectionStep[]>(
		recipeObject.data.recipeData.directions ?? [],
	);
	function goToPreview() {
		if (
			draft.foodData.name &&
			draft.foodData.name.length > 3 &&
			draft.recipeData.description &&
			draft.recipeData.description?.length > 10 &&
			/*draft.recipeData.tags &&
			draft.recipeData.tags.length > 0 &&*/
			draft.ingredientItemsData.length > 0 &&
			draft.recipeData.servings_yield &&
			draft.recipeData.servings_yield >= 1 &&
			draft.recipeData.directions &&
			draft.recipeData.directions?.length > 0
		) {
			router.push("/(tabs)/(logs)/CreateRecipe/preview");
		} else console.log("complete all steps");
	}
	useEffect(() => {
		recipeObject.updateRecipe("directions", directions);
	}, [directions]);
	return (
		<KeyboardAware>
			<HeaderSimple title={"Create Recipe"} />
			<StepIndicator activeStep={2} />
			<View style={{ flex: 1, padding: 20, gap: 12 }}>
				<PrepCookButton
					prepTime={recipeObject.data.recipeData.prep_time ?? 0}
					cookTime={recipeObject.data.recipeData.cook_time ?? 0}
					setCookTime={(hour, mins) =>
						recipeObject.updateRecipe(
							"cook_time",
							Number(hour) * 60 + Number(mins),
						)
					}
					setPrepTime={(hour, mins) =>
						recipeObject.updateRecipe(
							"prep_time",
							Number(hour) * 60 + Number(mins),
						)
					}
				/>
				<View style={{ flexDirection: "row", gap: 8 }}>
					<H4>Directions</H4>
					<H5 style={{ color: colors.inactive }}>{"required"}</H5>
				</View>
				<FlatList
					data={directions}
					renderItem={({ item, index }) => (
						<StepsCardEdit
							item={item}
							index={index}
							onChangeText={(text) =>
								setDirections(
									updateStep(directions, item.id, {
										text: text,
									}),
								)
							}
							onChangePicture={(uri) =>
								setDirections(
									updateStep(directions, item.id, {
										photo: uri,
									}),
								)
							}
							onDelete={() =>
								setDirections(deleteStep(directions, item.id))
							}
						/>
					)}
					style={{ flexGrow: 0, marginBottom: 24 }}
					ItemSeparatorComponent={() => (
						<View style={{ marginVertical: 12 }} />
					)}
					scrollEnabled={false}
					keyExtractor={(item) => item.id}
				/>

				<SecondaryAddButton
					onPress={() =>
						setDirections(
							addStep(directions, {
								id: generateId(),
								text: "",
								photo: "",
							}),
						)
					}
				>
					Add Step
				</SecondaryAddButton>
				<PrimaryButton onPress={goToPreview}>
					Confirm steps
				</PrimaryButton>
			</View>
		</KeyboardAware>
	);
};

export default directions;

const styles = StyleSheet.create({});
