import { useTags } from "@/api/hooks/useGetTags";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import StepIndicator from "@/components/recipeComponents/StepIndicator";
import {
	PrimaryButton,
	SecondaryButton,
	SubButton,
} from "@/components/UIComponents/Buttons/Button";
import { DetailedRadioButton } from "@/components/UIComponents/Buttons/RadioButton";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import ControlledTextInput from "@/components/UIComponents/TextInputs/ControlledTextInput";
import {
	FormInput,
	FormInputLong,
} from "@/components/UIComponents/TextInputs/FormInput";
import { H4, H5 } from "@/components/UIComponents/Typography";
import { useRecipeDraftStore } from "@/store/recipeStore/useRecipeStore";
import { useFindFoodSelectedPageStore } from "@/store/useStore";
import { colors } from "@/theme";
import { RecipeTags } from "@/types/recipe";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

const overview = () => {
	const router = useRouter();
	const {
		data: draft,
		visibility,
		setVisibility,
		updateRecipe,
		updateFood,
		updateIngredient,
	} = useRecipeDraftStore();
	const [tagText, setTagText] = useState("");
	const { filteredTags, isLoading } = useTags(tagText);
	const setSelectedPage = useFindFoodSelectedPageStore(
		(s) => s.setSelectedPage,
	);
	const [tagList, setTagList] = useState<RecipeTags[]>([]);
	function goNext() {
		if (
			draft.foodData.name &&
			draft.foodData.name.length > 3 &&
			draft.recipeData.description &&
			draft.recipeData.description?.length > 10
		) {
			setSelectedPage(0);
			router.push("/(tabs)/(logs)/CreateRecipe/ingredients");
		} else {
			console.log("finish the steps");
		}
	}
	return (
		<KeyboardAware>
			<View>
				<HeaderSimple title={"Create Recipe"} />
				<StepIndicator activeStep={0} />
				<View style={{ flex: 1, padding: 20, gap: 40 }}>
					<View style={{ gap: 10 }}>
						<H4>Visibility</H4>
						<H5 style={{ color: colors.medium_gray }}>
							Who can see this recipe?
						</H5>
						<DetailedRadioButton
							options={[
								{
									label: "Private",
									value: "private",
									description: "Only you can see it",
								},
								{
									label: "Public",
									value: "public",
									description: "Anyone on the Platform",
								},
							]}
							selected={visibility}
							onSelect={(newVisibility) =>
								setVisibility(newVisibility)
							}
						/>
					</View>
					<View style={{ gap: 10 }}>
						<View style={{ flexDirection: "row", gap: 8 }}>
							<H4>Recipe Name</H4>
							<H5 style={{ color: colors.inactive }}>required</H5>
						</View>
						<FormInput
							value={draft.foodData.name ?? ""}
							onChangeText={(text) => updateFood("name", text)}
							placeholder="Enter Recipe Name"
						/>
					</View>
					<View style={{ gap: 10 }}>
						<View style={{ flexDirection: "row", gap: 8 }}>
							<H4>Recipe Photo/Video</H4>
							<H5 style={{ color: colors.inactive }}>optional</H5>
						</View>
						<SecondaryButton>All Photos</SecondaryButton>
						<FormInput
							value={""}
							onChangeText={function (text: string): void {
								throw new Error("Function not implemented.");
							}}
							placeholder="Video link"
						/>
					</View>
					<View style={{ gap: 10 }}>
						<View style={{ flexDirection: "row", gap: 8 }}>
							<H4>Description</H4>
							<H5 style={{ color: colors.inactive }}>required</H5>
						</View>
						<FormInputLong
							value={draft.recipeData.description ?? ""}
							onChangeText={(text) =>
								updateRecipe("description", text)
							}
							placeholder="Write a short description for your recipe."
						/>
					</View>
					<View style={{ gap: 10 }}>
						<View style={{ flexDirection: "row", gap: 8 }}>
							<H4>Tags</H4>
							<H5 style={{ color: colors.inactive }}>
								{"required (min. 3)"}
							</H5>
						</View>
						<ControlledTextInput
							value={tagText}
							options={filteredTags.map((item) => ({
								label: item,
								value: item,
							}))}
							onChangeText={setTagText}
							onSelect={(selected) =>
								setTagList((prev) => [
									...prev,
									{ tag: selected.label },
								])
							}
						/>
						<FlatList
							data={tagList}
							renderItem={({ item }) => (
								<SubButton
									onPress={() =>
										setTagList((prev) =>
											prev.filter((i) => i != item),
										)
									}
								>
									{item.tag}
								</SubButton>
							)}
							horizontal
						/>
					</View>
					<PrimaryButton onPress={() => goNext()}>Next</PrimaryButton>
				</View>
			</View>
		</KeyboardAware>
	);
};

export default overview;

const styles = StyleSheet.create({});
