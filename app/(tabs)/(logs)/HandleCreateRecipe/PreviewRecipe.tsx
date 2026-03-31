import HeaderSimple from "@/components/navComponents/HeaderSimple";
import RecipeInfoCore from "@/components/recipeComponents/RecipeInfoCore";
import {
    PrimaryButton,
    SecondaryButton,
} from "@/components/UIComponents/Buttons/Button";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { H1 } from "@/components/UIComponents/Typography";
import { useCreateRecipeWithFoodAndIngredients } from "@/db/hooks/recipe/useCreateRecipe";
import { CalculateMacroSumIngredient } from "@/helper/recipeMacroSum";
import {
    isValidRecipeDraft,
    useRecipeDraftStore,
    useRecipeStateStore,
} from "@/store/recipeStore/useRecipeStore";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

const PreviewRecipe = () => {
    const router = useRouter();
    const [selectedPage, setSelectedPage] = useState(0);
    const draft = useRecipeDraftStore((state) => state.data);
    const resetDraft = useRecipeDraftStore((state) => state.reset);
    const setRecipeState = useRecipeStateStore(
        (state) => state.initializeRecipe,
    );
    const { mutate: saveRecipe } = useCreateRecipeWithFoodAndIngredients();
    const [servings, setServings] = useState(1);
    const foodData = CalculateMacroSumIngredient(draft.ingredientItemsData);
    function handleSave() {
        if (isValidRecipeDraft(draft)) {
            console.log("recipe to add", draft.ingredientItemsData);
            saveRecipe(
                {
                    ...draft,
                    foodData: {
                        ...draft.foodData,
                    },
                },
                {
                    onSuccess: (item) => {
                        resetDraft();
                        router.dismissAll();
                        router.navigate({
                            pathname: "/(tabs)/(logs)/food",
                            params: { food_id: item.food.id },
                        });
                    },
                },
            );
            //router.navigate('')
        } else {
            console.log("not valid recipe", draft);
        }
    }
    useEffect(() => {
        if (isValidRecipeDraft(draft)) setRecipeState(draft);
    }, []);
    if (!isValidRecipeDraft(draft)) {
        return <H1>NOT VALID RECIPE</H1>;
    }
    return (
        <KeyboardAware>
            <HeaderSimple title="Preview Recipe" />
            <View
                style={{
                    flex: 1,
                    paddingTop: 12,
                    gap: 20,
                    paddingBottom: 20,
                    //paddingHorizontal: 20,
                }}
            >
                <RecipeInfoCore
                    onLogRecipe={() => console.log()}
                    canModifyIngredient={false}
                    servings={servings}
                    setServings={setServings}
                />
                <View
                    style={{
                        flexDirection: "row",
                        gap: 12,
                        paddingHorizontal: 20,
                    }}
                >
                    <SecondaryButton
                        style={{ flex: 1 }}
                        onPress={() =>
                            router.replace(
                                "/(tabs)/(logs)/HandleCreateRecipe/createRecipe",
                            )
                        }
                    >
                        Edit
                    </SecondaryButton>
                    <PrimaryButton
                        style={{ flex: 1 }}
                        onPress={() => handleSave()}
                    >
                        Save
                    </PrimaryButton>
                </View>
            </View>
        </KeyboardAware>
    );
};

export default PreviewRecipe;
