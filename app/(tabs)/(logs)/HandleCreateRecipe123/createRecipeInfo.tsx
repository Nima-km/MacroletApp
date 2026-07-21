import { useTags } from "@/api/hooks/useGetTags";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import {
	PrimaryButton,
	SubButton,
} from "@/components/UIComponents/Buttons/Button";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import ControlledTextInput from "@/components/UIComponents/TextInputs/ControlledTextInput";
import {
	FormInput,
	FormInputLong,
} from "@/components/UIComponents/TextInputs/FormInput";
import { H4 } from "@/components/UIComponents/Typography";
import {
	useRecipeDraftStore,
	validateRecipeDraft,
} from "@/store/recipeStore/useRecipeStore";
import { RecipeTags } from "@/types/recipe";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

const createRecipeInfo = () => {
	const router = useRouter();
	const {
		data: draft,
		updateRecipe,
		updateFood,
		updateIngredient,
	} = useRecipeDraftStore();
	const options = [
		{ label: "Chicken", value: 0 },
		{ label: "Chinese", value: 1 },
		{ label: "Milk", value: 2 },
		{ label: "High Calorie", value: 3 },
		{ label: "Low Calorie", value: 4 },
		{ label: "Low Protein", value: 5 },
		{ label: "High Protein", value: 6 },
	];
	const [tagList, setTagList] = useState<RecipeTags[]>(
		draft.recipeData.tags ?? [],
	);
	const [tagText, setTagText] = useState("");
	const [errorName, setErrorName] = useState(false);
	const { filteredTags, isLoading } = useTags(tagText);
	function onContinue() {
		const validated = validateRecipeDraft(draft);
		const nameErrors = validated.errors.filter((error) =>
			error.includes("Food name"),
		);
		const isNameValid = nameErrors.length === 0;
		console.log("isNameValid", isNameValid);
		if (isNameValid) {
			setErrorName(false);
			router.push("/(tabs)/(logs)/HandleCreateRecipe/createRecipe");
		} else {
			setErrorName(true);
		}
	}
	useEffect(() => {
		updateRecipe("tags", tagList);
	}, [tagList]);
	useEffect(() => {
		console.log("oi mate got some tags for you", isLoading);
	}, [isLoading]);
	return (
		<KeyboardAware>
			<View style={{ flex: 1 }}>
				<HeaderSimple title="CREATE RECIPE" />
				<View style={{ padding: 20, flex: 1, gap: 32 }}>
					<FormInput
						value={draft.foodData.name ?? ""}
						placeholder="Enter recipe name"
						error={
							errorName && (draft.foodData.name ?? "") == ""
								? "This field cannot be empty"
								: null
						}
						onChangeText={(text) => updateFood("name", text)}
					/>
					<View style={{ gap: 12 }}>
						<H4>Description</H4>
						<FormInputLong
							value={draft.recipeData.description ?? ""}
							placeholder="Write a short description for your recipe"
							error={undefined}
							onChangeText={(text) =>
								updateRecipe("description", text)
							}
						/>
					</View>
					<View style={{ gap: 12 }}>
						<H4>Tags</H4>
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
					</View>
				</View>
				<PrimaryButton
					style={{ marginHorizontal: 20 }}
					onPress={onContinue}
				>
					Continue
				</PrimaryButton>
			</View>
		</KeyboardAware>
	);
};

export default createRecipeInfo;

const styles = StyleSheet.create({});
