import ArrowUp from "@/assets/svg/arrow-up.svg";
import { H5, H5_SemiBold } from "@/components/UIComponents/Typography";
import { formatDate } from "@/helper/formatDate";
import { colors } from "@/theme";
import { ReviewType } from "@/types/review";
import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import RatedChart from "../RatedChart";

type Props = {
	review: ReviewType;
	/** True when the viewer owns the recipe and may reply. */
	canRespond?: boolean;
	onSubmitResponse?: (content: string) => void;
	isSubmittingResponse?: boolean;
};

/** The API sends ISO strings; `formatDate` expects a `Date`. */
function formatReviewDate(value: string | undefined): string {
	if (!value) return "";
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? "" : formatDate(date);
}

const ReviewCard = ({
	review,
	canRespond = false,
	onSubmitResponse,
	isSubmittingResponse = false,
}: Props) => {
	const [response, setResponse] = useState("");
	const [showReply, setShowReply] = useState(false);

	const trimmedResponse = response.trim();
	const submitResponse = () => {
		if (!trimmedResponse || isSubmittingResponse) return;
		onSubmitResponse?.(trimmedResponse);
		setResponse("");
		setShowReply(false);
	};

	return (
		<View style={styles.card}>
			<View style={styles.headerRow}>
				<View style={styles.authorRow}>
					<View style={styles.avatar} />
					<H5>{review.review.username}</H5>
				</View>
				<View style={styles.authorRow}>
					<H5>{formatReviewDate(review.review.created_at)}</H5>
					{/* Report/delete menu lands with the report phase; the report
					    endpoint targets a recipe, not an individual review. */}
				</View>
			</View>
			<RatedChart rating={review.review.rating} />
			{!!review.review.content && <H5>{review.review.content}</H5>}
			{!review.response && canRespond && !showReply && (
				<View style={styles.footerRow}>
					<Pressable onPress={() => setShowReply(true)}>
						<H5_SemiBold style={{ color: colors.primary }}>
							Reply
						</H5_SemiBold>
					</Pressable>
				</View>
			)}
			{!review.response && canRespond && showReply && (
				<View style={styles.replyInput}>
					<TextInput
						onChangeText={setResponse}
						value={response}
						style={{ flex: 1 }}
						placeholder="Reply to this review"
						placeholderTextColor={colors.inactive}
						maxLength={1000}
						multiline
					/>
					<Pressable
						onPress={submitResponse}
						disabled={!trimmedResponse || isSubmittingResponse}
						style={[
							styles.sendButton,
							(!trimmedResponse || isSubmittingResponse) && {
								opacity: 0.5,
							},
						]}
					>
						<ArrowUp color={colors.primary} />
					</Pressable>
				</View>
			)}
			{!!review.response && (
				<View style={styles.responseBlock}>
					<View style={styles.headerRow}>
						<View style={styles.authorRow}>
							<View style={styles.avatar} />
							<H5>{review.response.creator_username}</H5>
						</View>
						<View style={styles.authorRow}>
							<H5>
								{formatReviewDate(review.response.created_at)}
							</H5>
						</View>
					</View>
					<H5>{review.response.content}</H5>
				</View>
			)}
		</View>
	);
};

export default ReviewCard;

const styles = StyleSheet.create({
	card: {
		backgroundColor: colors.white,
		padding: 16,
		marginBottom: 10,
		borderRadius: 8,
		gap: 12,
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	authorRow: {
		flexDirection: "row",
		gap: 8,
		alignItems: "center",
	},
	avatar: {
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: colors.primary_bg,
	},
	footerRow: {
		flexDirection: "row",
		justifyContent: "flex-end",
	},
	replyInput: {
		borderWidth: 2,
		borderColor: colors.primary,
		borderRadius: 8,
		paddingHorizontal: 13,
		paddingVertical: 4,
		flexDirection: "row",
		alignItems: "center",
	},
	sendButton: {
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: colors.primary_bg,
		justifyContent: "center",
		alignItems: "center",
	},
	responseBlock: {
		borderLeftWidth: 2,
		borderColor: colors.line_break,
		paddingLeft: 12,
		gap: 12,
	},
});
