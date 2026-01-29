import RecipeNav from "@/components/recipeComponents/RecipeNav";
import Directions from "@/components/recipeComponents/View/Directions";
import Ingredients from "@/components/recipeComponents/View/Ingredients";
import Overview from "@/components/recipeComponents/View/Overview";
import {
    PrimaryButton,
    SubButton,
} from "@/components/UIComponents/Buttons/Button";
import { H2, H5 } from "@/components/UIComponents/Typography";
import {
    useRecipeStateStore
} from "@/store/recipeStore/useRecipeStore";
import { colors } from "@/theme";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { View } from "react-native";

interface Props {
    servings: number;
    setServings: (newServing: number) => void;
    onLogRecipe?: () => void;
}

const RecipeInfoCore = ({ servings, setServings, onLogRecipe }: Props) => {
    const ingredientItemsData = useRecipeStateStore(
        (state) => state.data.ingredientItemsData,
    );
    const foodData = useRecipeStateStore((state) => state.data.foodData);
    const recipeData = useRecipeStateStore((state) => state.data.recipeData);
    const router = useRouter();
    const [selectedPage, setSelectedPage] = useState(0);
    const renderPage = useMemo(() => {
        switch (selectedPage) {
            case 0:
                return (
                    <Overview servings={servings} setServings={setServings} />
                );
            case 1:
                return (
                    <Ingredients
                        servings={servings}
                        setServings={setServings}
                        addIngredient={() => {}}
                    />
                );
            case 2:
                return <Directions />;
            default:
                return null;
        }
    }, [selectedPage, servings, foodData]);
    return (
        <View style={{ flex: 1 }}>
            <View
                style={{ backgroundColor: colors.primary_bg, height: 180 }}
            ></View>
            <View
                style={{
                    flex: 1,
                    paddingHorizontal: 20,
                    paddingTop: 12,
                    gap: 20,
                }}
            >
                <View style={{ gap: 12, flex: 1 }}>
                    <H2>{foodData.name}</H2>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <H5 style={{ color: colors.medium_gray }}>
                            Private recipe
                        </H5>
                        <SubButton>Shrimp</SubButton>
                        <SubButton>Chinese</SubButton>
                    </View>
                    <H5 style={{ color: colors.medium_gray }}>
                        {recipeData.description}
                    </H5>
                    {onLogRecipe && (
                        <View style={{ paddingVertical: 12 }}>
                            <PrimaryButton onPress={onLogRecipe}>
                                Log
                            </PrimaryButton>
                        </View>
                    )}
                    <View style={{ flex: 1, gap: 20 }}>
                        <RecipeNav
                            selectedValue={selectedPage}
                            onSelect={setSelectedPage}
                        />
                        {renderPage}
                    </View>
                </View>
            </View>
        </View>
    );
};

export default RecipeInfoCore;
