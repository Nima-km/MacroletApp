import ArrowUp from "@/assets/svg/arrow-up.svg";
import DropDownComment from "@/components/UIComponents/DropDown/DropDownComment";
import { H5, H5_SemiBold } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import { ReviewType } from "@/types/review";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import RatedChart from "../RatedChart";
type Props = {
	review: ReviewType;
};
const ReviewCard = ({ review }: Props) => {
	const [response, setResponse] = useState("");
	return (
		<View
			style={{
				backgroundColor: colors.white,
				padding: 16,
				marginBottom: 10,
				borderRadius: 8,
				gap: 12,
			}}
		>
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
				}}
			>
				<View
					style={{
						flexDirection: "row",
						gap: 8,
						alignItems: "center",
					}}
				>
					<View
						style={{
							width: 30,
							height: 30,
							borderRadius: 15,
							backgroundColor: colors.primary_bg,
						}}
					/>
					<H5>{review.review.username}</H5>
				</View>
				<View
					style={{
						flexDirection: "row",
						gap: 8,
						alignItems: "center",
					}}
				>
					<H5>{review.review.created_at.toDateString()}</H5>
					<DropDownComment />
				</View>
			</View>
			<RatedChart rating={review.review.rating} />
			<H5>{review.review.content}</H5>
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
				}}
			>
				<View
					style={{
						flexDirection: "row",
						gap: 8,
						alignItems: "center",
					}}
				>
					{/* upvote/downvote reviews
					<View
						style={{
							flexDirection: "row",
							backgroundColor: colors.light_green,
							borderWidth: 1,
							padding: 8,
							gap: 4,
							borderRadius: 25,
							borderColor: colors.dark_green,
						}}
					>
						<ThumbsUp color={colors.dark_green} />

						<H6 style={{ color: colors.dark_green }}>(21)</H6>
					</View>
					<View
						style={{
							flexDirection: "row",
							backgroundColor: colors.light_blue,
							borderWidth: 1,
							padding: 8,
							borderRadius: 25,
							gap: 4,
							borderColor: colors.dark_blue,
						}}
					>
						<ThumbsDown color={colors.dark_blue} />

						<H6 style={{ color: colors.dark_blue }}>(21)</H6>
					</View>*/}
				</View>
				<Pressable>
					<H5_SemiBold style={{ color: colors.primary }}>
						Reply
					</H5_SemiBold>
				</Pressable>
			</View>
			{!review.response ? (
				<View
					style={{
						borderWidth: 2,
						borderColor: colors.primary,
						borderRadius: 8,
						paddingHorizontal: 13,
						paddingVertical: 4,
						flexDirection: "row",
						alignItems: "center",
					}}
				>
					<TextInput
						onChangeText={setResponse}
						value={response}
						style={{ flex: 1 }}
						multiline
					/>
					<Pressable
						style={{
							width: 30,
							height: 30,
							borderRadius: 15,
							backgroundColor: colors.primary_bg,
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<ArrowUp color={colors.primary} />
					</Pressable>
				</View>
			) : (
				<View
					style={{
						borderLeftWidth: 2,
						borderColor: colors.line_break,
						paddingLeft: 12,
						gap: 12,
					}}
				>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
						}}
					>
						<View
							style={{
								flexDirection: "row",
								gap: 8,
								alignItems: "center",
							}}
						>
							<View
								style={{
									width: 30,
									height: 30,
									borderRadius: 15,
									backgroundColor: colors.primary_bg,
								}}
							/>
							<H5>{review.response.creator_username}</H5>
						</View>
						<View
							style={{
								flexDirection: "row",

								alignItems: "center",
							}}
						>
							<H5>{review.response.created_at.toDateString()}</H5>
						</View>
					</View>
					<H5>{review.response.content}</H5>
				</View>
			)}
		</View>
	);
};

export default ReviewCard;

const styles = StyleSheet.create({});
