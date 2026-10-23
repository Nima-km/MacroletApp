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
import {
	directionsRequirements,
	firstUnmet,
} from "@/helper/recipeDraftValidation";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
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
		const unmet = firstUnmet(directionsRequirements(draft));
		if (unmet) {
			// This used to log to the console, so pressing the button looked broken.
			Toast.show({
				type: "warning",
				text1: "Almost there",
				text2: unmet.label,
			});
			return;
		}
		router.push("/(tabs)/(logs)/CreateRecipe/preview");
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
				{/* Mapped, not virtualised: a recipe has a handful of steps, and a
				    FlatList here is nested in KeyboardAware's ScrollView. */}
				<View style={{ gap: 12, marginBottom: 24 }}>
					{directions.map((item, index) => (
						<StepsCardEdit
							key={item.id}
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
					))}
				</View>

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
