import ImageView from "@/components/UIComponents/Image/ImageView";
import { H5, H5_SemiBold, H6 } from "@/components/UIComponents/Typography";
import { calculateCalories } from "@/helper/calculateCalories";
import { colors } from "@/theme";
import { RecipeData } from "@/types/recipe";
import React from "react";
import { StyleSheet, View } from "react-native";
interface Props {
    recipe: Omit<RecipeData, "ingredientItemsData">;
}
const RecipeCard = ({ recipe }: Props) => {
    return (
        <View
            style={{
                backgroundColor: colors.white,
                borderRadius: 8,
                height: 139,
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    gap: 16,
                    padding: 12,
                }}
            >
                <View style={{ height: 115, width: 128 }}>
                    <ImageView
                        style={{ borderRadius: 8 }}
                        imageStyle={{ borderRadius: 8 }}
                        source={recipe.recipeData.bannerImage}
                    />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                    <View style={{ flexDirection: "row" }}>
                        <H6>
                            {(recipe.recipeData.cook_time ?? 0) +
                                (recipe.recipeData.prep_time ?? 0)}
                        </H6>
                        <H6 style={{ color: colors.primary }}>
                            {calculateCalories(recipe.foodData)}
                        </H6>
                    </View>
                    <H5_SemiBold>{recipe.foodData.name}</H5_SemiBold>
                    <H5>{recipe.recipeData.recipe_slug ?? "by You"}</H5>
                    <View style={{ flexDirection: "row" }}>
                        <H6>X</H6>
                        <H6>4.5 (1,437)</H6>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default RecipeCard;

const styles = StyleSheet.create({});
