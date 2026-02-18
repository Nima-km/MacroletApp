import ImageView from "@/components/UIComponents/Image/ImageView";
import { H5, H5_SemiBold } from "@/components/UIComponents/Typography";
import { RecipeBookWithItems } from "@/types/recipe";
import React from "react";
import { StyleSheet, View } from "react-native";
interface Props {
    recipeBookData: RecipeBookWithItems;
}
const RecipeBookCard = ({ recipeBookData }: Props) => {
    const borderRadius = 8;
    return (
        <View style={{}}>
            <View
                style={{
                    height: 136,
                    width: 165,
                    gap: 2,
                    //backgroundColor: "red",
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        flex: 1,
                        gap: 2,
                    }}
                >
                    <ImageView
                        style={{ borderTopLeftRadius: borderRadius }}
                        imageStyle={{ borderTopLeftRadius: borderRadius }}
                        source={recipeBookData.pictures?.[0]}
                    />
                    <ImageView
                        style={{ borderTopRightRadius: borderRadius }}
                        imageStyle={{ borderTopRightRadius: borderRadius }}
                        source={recipeBookData.pictures?.[1]}
                    />
                </View>
                <View
                    style={{
                        flexDirection: "row",
                        flex: 1,
                        gap: 2,
                    }}
                >
                    <ImageView
                        style={{ borderBottomLeftRadius: borderRadius }}
                        imageStyle={{ borderBottomLeftRadius: borderRadius }}
                        source={recipeBookData.pictures?.[2]}
                    />
                    <ImageView
                        style={{ borderBottomRightRadius: borderRadius }}
                        imageStyle={{ borderBottomRightRadius: borderRadius }}
                        source={recipeBookData.pictures?.[3]}
                    />
                </View>
            </View>
            <H5_SemiBold>{recipeBookData.name}</H5_SemiBold>
            <H5>
                {recipeBookData.items.length} recipe
                {recipeBookData.items.length != 1 ? "s" : ""}
            </H5>
        </View>
    );
};

export default RecipeBookCard;

const styles = StyleSheet.create({});
