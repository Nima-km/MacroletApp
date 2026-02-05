import StepsCardEdit from "@/components/chartComponents/Cards/StepsCardEdit";
import { SecondaryAddButton } from "@/components/UIComponents/Buttons/Button";
import { generateId } from "@/helper/generateId";
import {
    addStep,
    deleteStep,
    updateStep,
} from "@/helper/recipeHelpers/stespUtil";
import { RecipeDraftType } from "@/store/recipeStore/useRecipeStore";
import { DirectionStep } from "@/types/recipe";

import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

type Props = {
    recipeObject: RecipeDraftType;
};

const DirectionsEdit = ({ recipeObject }: Props) => {
    const [directions, setDirections] = useState<DirectionStep[]>(
        recipeObject.data.recipeData.directions ?? [],
    );

    useEffect(() => {
        recipeObject.updateRecipe("directions", directions);
    }, [directions]);
    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={directions}
                renderItem={({ item, index }) => (
                    <StepsCardEdit
                        item={item}
                        index={index}
                        onChangeText={(text) =>
                            setDirections(
                                updateStep(directions, item.id, { text: text }),
                            )
                        }
                        onChangePicture={(uri) =>
                            setDirections(
                                updateStep(directions, item.id, { photo: uri }),
                            )
                        }
                        onDelete={() =>
                            setDirections(deleteStep(directions, item.id))
                        }
                    />
                )}
                style={{ flexGrow: 0, marginBottom: 24 }}
                ItemSeparatorComponent={() => (
                    <View style={{ marginVertical: 12 }} />
                )}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
            />

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
        </View>
    );
};

export default DirectionsEdit;

const styles = StyleSheet.create({});
