import Calorie from "@/assets/svg/calorie.svg";
import Clock from "@/assets/svg/clock.svg";
import Star from "@/assets/svg/star.svg";
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
    console.log("recipe card: ", recipe);
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
                    <View style={{ flexDirection: "row", gap: 12 }}>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 4,
                            }}
                        >
                            <Clock
                                width={18}
                                height={18}
                                pointerEvents="none"
                                style={{ color: colors.primary }}
                            />
                            <H6 style={{ color: colors.primary }}>
                                {(recipe.recipeData.cook_time ?? 0) +
                                    (recipe.recipeData.prep_time ?? 0)}{" "}
                                min
                            </H6>
                        </View>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 4,
                            }}
                        >
                            <Calorie pointerEvents="none" />
                            <H6 style={{ color: colors.primary }}>
                                {calculateCalories(recipe.foodData)}
                            </H6>
                        </View>
                    </View>
                    <H5_SemiBold>{recipe.foodData.name}</H5_SemiBold>
                    <H5>{recipe.recipeData.recipe_slug ?? "by You"}</H5>

                    <View style={{ flexDirection: "row", gap: 4 }}>
                        <Star pointerEvents="none" />
                        <H6>4.5 (1,437)</H6>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default RecipeCard;

const styles = StyleSheet.create({});
