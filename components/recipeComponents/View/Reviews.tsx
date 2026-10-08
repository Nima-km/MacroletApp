import {
	useCreateReview,
	useCreatorResponse,
	useRecipeReviews,
} from "@/api/hooks/useReview";
import ReviewCard from "@/components/chartComponents/Cards/ReviewCard";
import RatingStars from "@/components/chartComponents/RatingStars";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import DropdownCore from "@/components/UIComponents/DropDown/DropDownCore";
import { FormInputLong } from "@/components/UIComponents/TextInputs/FormInput";
import { H2, H3, H5, H5_SemiBold } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import { RecipeReviews } from "@/types/review";
import { useAuth } from "@clerk/expo";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

type Props = {
	recipe_slug: string;
};

type SortValue = "recent" | "highest" | "lowest";

const SORT_OPTIONS: { label: string; value: SortValue }[] = [
	{ label: "Most Recent", value: "recent" },
	{ label: "Highest Rated", value: "highest" },
	{ label: "Lowest Rated", value: "lowest" },
];

function sortReviews(reviews: RecipeReviews["reviews"], sort: SortValue) {
	const sorted = [...reviews];
	if (sort === "highest") {
		sorted.sort((a, b) => b.review.rating - a.review.rating);
	} else if (sort === "lowest") {
		sorted.sort((a, b) => a.review.rating - b.review.rating);
	} else {
		sorted.sort(
			(a, b) =>
				new Date(b.review.created_at).getTime() -
				new Date(a.review.created_at).getTime(),
		);
	}
	return sorted;
}

const Reviews = ({ recipe_slug }: Props) => {
	const { userId } = useAuth();
	const [rating, setRating] = useState(0);
	const [content, setContent] = useState("");
	const [sort, setSort] = useState<SortValue>("recent");

	const { data, isLoading, isError } = useRecipeReviews(recipe_slug);
	const { mutate: createReview, isPending: isSubmittingReview } =
		useCreateReview(recipe_slug);
	const { mutate: respondToReview, isPending: isSubmittingResponse } =
		useCreatorResponse();

	const sortedReviews = useMemo(
		() => sortReviews(data?.reviews ?? [], sort),
		[data?.reviews, sort],
	);

	// Create-only for now: the backend also supports PATCH, but editing is not
	// exposed in the UI yet, so the form is hidden once the user has reviewed.
	// `is_own` is computed server-side; no Clerk id reaches the device.
	const myReview = data?.reviews.find((item) => item.review.is_own);

	const submitReview = () => {
		if (!rating || isSubmittingReview) return;
		createReview(
			{ rating, content: content.trim() || undefined },
			{
				onSuccess: () => {
					setRating(0);
					setContent("");
					Toast.show({
						type: "success",
						text1: "Review posted",
						visibilityTime: 2500,
					});
				},
			},
		);
	};

	const averageRating = data?.stats.averageRating ?? null;
	const totalReviews = data?.stats.totalReviews ?? 0;

	// Draft recipes have no slug yet, so there is nothing to fetch.
	if (!recipe_slug) {
		return (
			<View style={{ flex: 1, gap: 20 }}>
				<H2>Reviews</H2>
				<H5 style={{ color: colors.medium_gray }}>
					Reviews will be available once this recipe is published.
				</H5>
			</View>
		);
	}

	if (isLoading) {
		return (
			<View style={{ flex: 1, gap: 20 }}>
				<H2>Reviews</H2>
				<ActivityIndicator color={colors.primary} />
			</View>
		);
	}

	if (isError || !data) {
		return (
			<View style={{ flex: 1, gap: 20 }}>
				<H2>Reviews</H2>
				<H5 style={{ color: colors.medium_gray }}>
					Reviews are unavailable right now.
				</H5>
			</View>
		);
	}

	return (
		<View style={{ flex: 1, gap: 20 }}>
			<H2>Reviews</H2>
			<View
				style={{ flexDirection: "row", gap: 4, alignItems: "center" }}
			>
				<RatingStars rating={averageRating ?? 0} />
				<H5_SemiBold>
					{averageRating != null
						? `${averageRating.toFixed(1)} out of 5`
						: "No ratings yet"}
				</H5_SemiBold>
			</View>

			{myReview ? (
				<View style={{ gap: 8 }}>
					<H3>Your Review</H3>
					<RatingStars rating={myReview.review.rating} />
					{!!myReview.review.content && (
						<H5>{myReview.review.content}</H5>
					)}
					<H5 style={{ color: colors.medium_gray }}>
						You have already reviewed this recipe.
					</H5>
				</View>
			) : (
				<View style={{ gap: 20 }}>
					<View style={{ gap: 4 }}>
						<H3>Rate this Recipe</H3>
						<RatingStars
							rating={rating}
							onRate={setRating}
							size={32}
						/>
					</View>
					<View style={{ gap: 4 }}>
						<H3>Write a Review</H3>
						<FormInputLong
							value={content}
							placeholder="What do you think about this recipe?"
							onChangeText={setContent}
						/>
					</View>
					<PrimaryButton
						onPress={submitReview}
						disabled={!rating || isSubmittingReview}
						style={(!rating || isSubmittingReview) && { opacity: 0.5 }}
					>
						{isSubmittingReview ? "Submitting..." : "Submit"}
					</PrimaryButton>
					{!rating && (
						<H5 style={{ color: colors.medium_gray }}>
							Pick a star rating to submit your review.
						</H5>
					)}
				</View>
			)}

			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					gap: 12,
				}}
			>
				<View style={{ flex: 1 }}>
					<H5>
						{totalReviews} {totalReviews === 1 ? "review" : "reviews"}
					</H5>
				</View>
				{totalReviews > 1 && (
					<View style={{ flex: 1 }}>
						<DropdownCore
							defaultOption={0}
							options={SORT_OPTIONS}
							onSelect={(option) => setSort(option.value)}
						/>
					</View>
				)}
			</View>

			<FlatList
				scrollEnabled={false}
				data={sortedReviews}
				keyExtractor={(item) => item.review.id.toString()}
				ListEmptyComponent={
					<H5 style={{ color: colors.medium_gray }}>
						No reviews yet — be the first to review this recipe.
					</H5>
				}
				renderItem={({ item }) => (
					<ReviewCard
						review={item}
						canRespond={data.viewer.isCreator}
						isSubmittingResponse={isSubmittingResponse}
						onSubmitResponse={(responseContent) =>
							respondToReview({
								review_id: item.review.id,
								recipe_slug,
								content: responseContent,
							})
						}
					/>
				)}
			/>
		</View>
	);
};

export default Reviews;
