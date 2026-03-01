import HeaderSimple from "@/components/navComponents/HeaderSimple";
import DirectionsEdit from "@/components/recipeComponents/Edit/DirectionsEdit";
import IngredientsEdit from "@/components/recipeComponents/Edit/IngredientsEdit";
import OverviewEdit from "@/components/recipeComponents/Edit/OverviewEdit";
import RecipeNav from "@/components/recipeComponents/RecipeNav";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import ExpandableFlatlist from "@/components/UIComponents/CustomFlatlist/ExpandableFlatlist";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { H2, H5 } from "@/components/UIComponents/Typography";
import { useImageManager } from "@/helper/useImageManager";
import { useRecipeDraftStore } from "@/store/recipeStore/useRecipeStore";
import { colors } from "@/theme";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
const createRecipe = () => {
    const router = useRouter();
    const [selectedPage, setSelectedPage] = useState(0);

    const { addImageFromGallery } = useImageManager();
    const draft = useRecipeDraftStore();
    const [bannerImageUri, setBannerImageUri] = useState(
        draft.data.recipeData.bannerImage ?? "",
    );
    const [servingsYield, setServingsYield] = useState(
        draft.data.recipeData.servings_yield?.toString() ?? "1",
    );
    const onAddImage = async () => {
        const image = await addImageFromGallery();
        if (!image) return;
        setBannerImageUri(image.uri);
    };
    useEffect(() => {
        draft.updateRecipe("bannerImage", bannerImageUri);
    }, [bannerImageUri]);
    return (
        <KeyboardAware>
            <HeaderSimple title="Create Recipe" />
            <Pressable onPress={onAddImage}>
                <View
                    style={{ backgroundColor: colors.primary_bg, height: 180 }}
                >
                    {bannerImageUri != "" && (
                        <Image
                            source={bannerImageUri}
                            style={{ width: 400, height: 180 }}
                            contentFit="cover"
                        />
                    )}
                </View>
            </Pressable>
            <View
                style={{
                    flex: 1,
                    paddingHorizontal: 20,
                    paddingTop: 12,
                    gap: 20,
                }}
            >
                <View style={{ gap: 12, flex: 1 }}>
                    <H2>{draft.data.foodData.name}</H2>
                    <View
                        style={{
                            flexDirection: "row",
                            // alignItems: "center",

                            gap: 8,
                        }}
                    >
                        <View style={{}}>
                            <H5 style={{ color: colors.medium_gray }}>
                                Private recipe
                            </H5>
                        </View>

                        {draft.data.recipeData.tags && (
                            <View style={{ flexDirection: "row" }}>
                                <ExpandableFlatlist
                                    data={draft.data.recipeData.tags.map(
                                        (tag) => {
                                            return {
                                                id: tag.tag,
                                                text: tag.tag,
                                            };
                                        },
                                    )}
                                />
                            </View>
                        )}
                    </View>
                    <H5 style={{ color: colors.medium_gray }}>
                        {draft.data.recipeData.description}
                    </H5>
                    <View style={{ flex: 1, gap: 20 }}>
                        <RecipeNav
                            selectedValue={selectedPage}
                            onSelect={setSelectedPage}
                        />
                        <View
                            style={{
                                display: selectedPage === 0 ? "flex" : "none",
                            }}
                        >
                            {
                                <OverviewEdit
                                    // recipeObject={draft}
                                    servingsYield={servingsYield}
                                    setServingsYield={setServingsYield}
                                />
                            }
                        </View>
                        <View
                            style={{
                                display: selectedPage === 1 ? "flex" : "none",
                            }}
                        >
                            {
                                <IngredientsEdit
                                    //   recipeObject={draft}
                                    servingsYield={servingsYield}
                                    setServingsYield={setServingsYield}
                                    onAddIngredient={() =>
                                        router.push(
                                            "/(tabs)/(logs)/HandleCreateRecipe/AddIngredient",
                                        )
                                    }
                                />
                            }
                        </View>
                        <View
                            style={{
                                display: selectedPage === 2 ? "flex" : "none",
                            }}
                        >
                            {<DirectionsEdit recipeObject={draft} />}
                        </View>
                    </View>
                </View>
                <PrimaryButton
                    onPress={() =>
                        router.push(
                            "/(tabs)/(logs)/HandleCreateRecipe/PreviewRecipe",
                        )
                    }
                >
                    Preview
                </PrimaryButton>
            </View>
        </KeyboardAware>
    );
};

export default createRecipe;

const styles = StyleSheet.create({});
