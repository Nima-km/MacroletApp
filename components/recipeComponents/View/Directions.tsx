import StepsCard from "@/components/chartComponents/Cards/StepsCard";
import { H2 } from "@/components/UIComponents/Typography";
import {
	useRecipeDraftStore,
	useRecipeStateStore,
} from "@/store/recipeStore/useRecipeStore";

import React from "react";
import { StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
type MODETYPES = "draft" | "state";
interface Props {
	mode?: MODETYPES;
}
const Directions = ({ mode = "state" }: Props) => {
	const directions =
		mode == "state"
			? useRecipeStateStore((state) => state.data.recipeData.directions)
			: useRecipeDraftStore((state) => state.data.recipeData.directions);

	return (
		<View style={{ flex: 1, gap: 20 }}>
			<H2>Directions</H2>
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
