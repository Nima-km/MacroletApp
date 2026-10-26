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
import {
	firstUnmet,
	MIN_DESCRIPTION_LENGTH,
	MIN_NAME_LENGTH,
	MIN_TAGS,
	overviewRequirements,
} from "@/helper/recipeDraftValidation";
import { useRecipeDraftStore } from "@/store/recipeStore/useRecipeStore";
import Toast from "react-native-toast-message";
import { useFindFoodSelectedPageStore } from "@/store/useStore";
import { colors } from "@/theme";
import { RecipeTags } from "@/types/recipe";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
	const [tagList, setTagList] = useState<RecipeTags[]>(
		draft.recipeData.tags ?? [],
	);

	// The requirement reads `draft.recipeData.tags`, and the tag picker writes to local
	// state - so without this mirror the checklist never saw a single tag.
	useEffect(() => {
		updateRecipe("tags", tagList);
	}, [tagList]);
	const requirements = overviewRequirements(draft, visibility);
	const [attempted, setAttempted] = useState(false);

	function goNext() {
		setAttempted(true);
		const unmet = firstUnmet(requirements);
		if (unmet) {
			// The old code logged to the console here, so the button looked dead.
			Toast.show({
				type: "warning",
				text1: "Almost there",
				text2: unmet.label,
			});
			return;
		}
		setSelectedPage(0);
		router.push("/(tabs)/(logs)/CreateRecipe/ingredients");
	}

	/** Field-level state: quiet until the first attempt, then specific. */
	const state = (id: string) => {
		const requirement = requirements.find((r) => r.id === id);
		if (!requirement) return undefined;
		if (!attempted) return undefined;
		return requirement.met ? undefined : "error";
	};
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
							<H5 style={{ color: colors.inactive }}>
								required
							</H5>
						</View>
						<FormInput
							value={draft.foodData.name ?? ""}
							onChangeText={(text) => updateFood("name", text)}
							placeholder="Enter Recipe Name"
							// The input renders its own red border and message.
							error={
								state("name") === "error"
									? `At least ${MIN_NAME_LENGTH} characters`
									: undefined
							}
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
							{/* Only a published recipe needs a description. */}
							<H5 style={{ color: colors.inactive }}>
								{visibility === "public" ? "required" : "optional"}
							</H5>
						</View>
						<FormInputLong
							value={draft.recipeData.description ?? ""}
							onChangeText={(text) =>
								updateRecipe("description", text)
							}
							placeholder="Write a short description for your recipe."
							// The input renders its own red border and message.
							error={
								state("description") === "error"
									? `At least ${MIN_DESCRIPTION_LENGTH} characters`
									: undefined
							}
						/>
					</View>
					<View style={{ gap: 10 }}>
						<View style={{ flexDirection: "row", gap: 8 }}>
							<H4>Tags</H4>
							<H5
								style={{
									color:
										state("tags") === "error"
											? colors.error
											: colors.inactive,
								}}
							>
								{state("tags") === "error"
									? `Add at least ${MIN_TAGS} tags`
									: visibility === "public"
										? `required (min. ${MIN_TAGS})`
										: "optional"}
							</H5>
						</View>
						<ControlledTextInput
							value={tagText}
							// The dropdown highlights these using the same selected
							// style the rest of the app uses.
							selectedValues={tagList.map((tag) => tag.tag)}
							options={filteredTags.slice(0, 8).map((item) => ({
								label: item,
								value: item,
							}))}
							onChangeText={setTagText}
							onSelect={(selected) => {
								// Tap toggles, and a tag can only be in the list once.
								setTagList((prev) =>
									prev.some((t) => t.tag === selected.value)
										? prev.filter(
												(t) => t.tag !== selected.value,
											)
										: [...prev, { tag: selected.value }],
								);
							}}
						/>
						{/* A mapped row, not a FlatList: this is a short horizontal set,
						    and a virtualised list inside KeyboardAware's ScrollView is
						    what triggers "VirtualizedLists should never be nested". */}
						<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
							{tagList.map((item) => (
								<SubButton
									key={item.tag}
									onPress={() =>
										setTagList((prev) =>
											prev.filter((i) => i != item),
										)
									}
								>
									{item.tag}
								</SubButton>
							))}
						</View>
					</View>
					<PrimaryButton onPress={() => goNext()}>Next</PrimaryButton>
				</View>
			</View>
		</KeyboardAware>
	);
};

export default overview;

const styles = StyleSheet.create({});
