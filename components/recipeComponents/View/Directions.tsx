import StepsCard from "@/components/chartComponents/Cards/StepsCard";
import {
    useRecipeStateStore
} from "@/store/recipeStore/useRecipeStore";

import React from "react";
import { StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

const Directions = () => {
    const directions = useRecipeStateStore(
        (state) => state.data.recipeData.directions,
    );

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={directions}
                renderItem={({ item, index }) => (
                    <StepsCard item={item} index={index} />
                )}
                style={{ flexGrow: 0, marginBottom: 24 }}
                ItemSeparatorComponent={() => (
                    <View style={{ marginVertical: 12 }} />
                )}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
            />
        </View>
    );
};

export default Directions;

const styles = StyleSheet.create({});
