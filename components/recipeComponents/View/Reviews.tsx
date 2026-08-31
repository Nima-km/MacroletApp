import StarEmpty from "@/assets/svg/star-empty.svg";

import ReviewCard from "@/components/chartComponents/Cards/ReviewCard";
import Star from "@/components/chartComponents/Star";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import DropdownCore from "@/components/UIComponents/DropDown/DropDownCore";
import { FormInputLong } from "@/components/UIComponents/TextInputs/FormInput";
import { H2, H3, H5, H5_SemiBold } from "@/components/UIComponents/Typography";
import { RecipeReviews } from "@/types/review";
import React from "react";
import { StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
type Props = {
	reviews: RecipeReviews;
};
const Reviews = ({ reviews }: Props) => {
	const testData = [1, 2, 3, 4, 5, 6];
	return (
		<View style={{ flex: 1, gap: 20 }}>
			<H2>Reviews</H2>
			<View style={{ flexDirection: "row", gap: 4 }}>
				<View style={{ flexDirection: "row", gap: 4 }}>
					<Star offset={Number(reviews.stats.averageRating)} />
					<Star offset={Number(reviews.stats.averageRating) - 1} />
					<Star offset={Number(reviews.stats.averageRating) - 2} />
					<Star offset={Number(reviews.stats.averageRating) - 3} />
					<Star offset={Number(reviews.stats.averageRating) - 4} />
				</View>
				<H5_SemiBold>
					{Number(reviews.stats.averageRating)} out of 5
				</H5_SemiBold>
			</View>
			<H3>Rate this Recipe</H3>
			<View style={{ flexDirection: "row", gap: 4 }}>
				<StarEmpty />
				<StarEmpty />
				<StarEmpty />
				<StarEmpty />
				<StarEmpty />
			</View>
			<H3>Write a Review</H3>
			<FormInputLong
				value={""}
				placeholder="What do you think about this recipe?"
				onChangeText={() => {}}
			/>
			<PrimaryButton>Submit</PrimaryButton>
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<View style={{ flex: 1 }}>
					<H5>10 reviews</H5>
				</View>
				<View style={{ flex: 1 }}>
					<DropdownCore
						defaultOption={0}
						options={[{ value: "top Review", label: "Top Review" }]}
					/>
				</View>
			</View>
			<FlatList
				scrollEnabled={false}
				data={reviews.reviews}
				renderItem={({ item }) => <ReviewCard review={item} />}
			/>
		</View>
	);
};

export default Reviews;

const styles = StyleSheet.create({});
