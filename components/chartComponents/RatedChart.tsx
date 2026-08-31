import StarEmpty from "@/assets/svg/star-empty.svg";
import Star from "@/assets/svg/star.svg";
import React from "react";
import { StyleSheet, View } from "react-native";
type Props = {
	rating: number;
};

const RatedChart = ({ rating }: Props) => {
	return (
		<View style={{ flexDirection: "row", gap: 4 }}>
			<Star width={20} height={20} />
			<Star width={20} height={20} />
			<Star width={20} height={20} />
			<StarEmpty width={20} height={20} />
			<StarEmpty width={20} height={20} />
		</View>
	);
};

export default RatedChart;

const styles = StyleSheet.create({});
