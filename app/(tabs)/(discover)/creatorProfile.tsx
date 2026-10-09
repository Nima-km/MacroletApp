import { useCreatorProfile, useCreatorRecipes } from "@/api/hooks/useCreator";
import { useToggleFollow } from "@/api/hooks/useFollowCreator";
import ArrowRight from "@/assets/svg/arrow-right.svg";
import InstagramIcon from "@/assets/svg/instagram.svg";
import TiktokIcon from "@/assets/svg/tiktok.svg";
import YoutubeIcon from "@/assets/svg/youtube.svg";
import RecipeCardSmall from "@/components/chartComponents/Cards/RecipeCardSmall";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import TopNav from "@/components/navComponents/TopNav";
import { FormInputSearch } from "@/components/UIComponents/TextInputs/FormInput";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import { H2, H3, H4, H5, H6 } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import { RecipeData } from "@/types/recipe";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Keyboard,
	KeyboardAvoidingView,
	KeyboardAvoidingViewProps,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import PagerView, {
	PagerViewOnPageSelectedEvent,
} from "react-native-pager-view";
type cookBookType = {
	name: string;
	recipes: Omit<RecipeData, "ingredientItemsData">[];
};
const creatorProfile = () => {
	const [selectedPage, setSelectedPage] = useState(0);
	const { username } = useLocalSearchParams<{ username: string }>();
	const {
		data: profile,
		isLoading: profileLoading,
		isError: profileError,
		refetch: refetchProfile,
	} = useCreatorProfile(username);
	const {
		data: recipes,
		isLoading: recipesLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useCreatorRecipes(username);
	const allRecipes = recipes?.pages.flatMap((page) => page.recipes) ?? [];

	const router = useRouter();

	// Follow is a toggle driven by the server's `is_following`, so the button can
	// never be out of step with what the API thinks.
	const { mutate: toggleFollow, isPending: followPending } = useToggleFollow();

	/** Same navigation DiscoverFeed uses when a recipe card is tapped. */
	function onOnlineRecipe(recipeSlug: string | undefined | null) {
		if (recipeSlug)
			router.push({
				pathname: "/(tabs)/(discover)/onlineRecipe",
				params: { recipeSlug },
			});
	}

	const currentPagerPage = useRef(selectedPage);
	const pagerRef = useRef<PagerView>(null);
	const defaultValue: KeyboardAvoidingViewProps["behavior"] =
		Platform.OS === "ios" ? "padding" : "height";

	const [behaviour, setBehaviour] =
		useState<KeyboardAvoidingViewProps["behavior"]>(defaultValue);
	const goToPage = useCallback((index: number) => {
		pagerRef.current?.setPage(index);
	}, []);
	const onPageSelected = useCallback((e: PagerViewOnPageSelectedEvent) => {
		currentPagerPage.current = e.nativeEvent.position;
		setSelectedPage(e.nativeEvent.position);
	}, []);
	useEffect(() => {
		if (currentPagerPage.current !== selectedPage) {
			currentPagerPage.current = selectedPage;
			goToPage(selectedPage);
		}
	}, [selectedPage]);
	useEffect(() => {
		const showListener = Keyboard.addListener("keyboardDidShow", () => {
			setBehaviour(defaultValue);
		});
		const hideListener = Keyboard.addListener("keyboardDidHide", () => {
			setBehaviour(undefined);
		});

		return () => {
			showListener.remove();
			hideListener.remove();
		};
	}, []);
	// Loading is a query state; empty is a result. This screen used to answer "no
	// recipes yet" with LOADING, so a creator who has published nothing - including
	// your own profile before your first publish - spun forever and the header, the
	// follow button and the cookbooks were never reachable.
	if (profileLoading || recipesLoading) {
		return (
			<View style={styles.centre}>
				<ActivityIndicator />
			</View>
		);
	}

	// There was no error branch at all: a failed request left `profile` undefined
	// and looked exactly like loading.
	if (profileError || !profile) {
		return (
			<View style={styles.centre}>
				<H5 style={styles.muted}>Couldn't load this creator</H5>
				<PrimaryButton onPress={() => refetchProfile()}>
					Try again
				</PrimaryButton>
			</View>
		);
	}
	return (
		<KeyboardAvoidingView
			behavior={behaviour}
			style={{
				flex: 1,
			}}
			keyboardVerticalOffset={100} // adjust if header is present
		>
			<HeaderSimple title="" />
			<ScrollView
				style={{ flex: 1, paddingHorizontal: 0 }}
				contentContainerStyle={{ flexGrow: 1 }}
				//scrollEventThrottle={16}
				stickyHeaderIndices={[3]}
				nestedScrollEnabled={true}
			>
				<View
					style={{
						backgroundColor: colors.primary_bg,
						height: 160,
						marginHorizontal: -20,
						marginBottom: 20,
					}}
				></View>

				<View
					style={{
						alignItems: "center",

						gap: 8,
						paddingHorizontal: 20,
					}}
				>
					<View
						style={{
							width: 70,
							height: 70,
							borderRadius: 35,
							backgroundColor: colors.line_break,
							marginTop: -55,
						}}
					></View>
					<View style={{ alignItems: "center", gap: 4 }}>
						<H2>{profile?.author.display_name}</H2>
						<H5 style={{ color: colors.medium_gray }}>
							@{profile.author.username}
						</H5>
					</View>
					<H5 style={{ textAlign: "center" }}>
						{profile.author.about}
					</H5>
					<View
						style={{ flexDirection: "row", gap: 32, marginTop: 8 }}
					>
						<View style={{ gap: 4, alignItems: "center" }}>
							<H3>{profile.stats.recipes}</H3>
							<H5 style={{ color: colors.medium_gray }}>
								Recipes
							</H5>
						</View>
						<View style={{ gap: 4, alignItems: "center" }}>
							<H3>{profile.stats.followers}</H3>
							<H5 style={{ color: colors.medium_gray }}>
								Followers
							</H5>
						</View>
						{/* Omitted entirely rather than shown as a zero: nobody has
						    reviewed yet, which is not the same as a bad rating. */}
						{profile.stats.avg_rating != null ? (
							<View style={{ gap: 4, alignItems: "center" }}>
								<H3>
									{profile.stats.avg_rating.toFixed(1)}
								</H3>
								<H5 style={{ color: colors.medium_gray }}>
									rating
								</H5>
							</View>
						) : null}
					</View>
					<View
						style={{ flexDirection: "row", gap: 8, marginTop: 8 }}
					>
						<Pressable
							style={{
								gap: 4,
								flexDirection: "row",
								paddingHorizontal: 12,
								borderRadius: 25,
								alignItems: "center",
								paddingVertical: 7,
								backgroundColor: colors.light_blue,
							}}
						>
							<InstagramIcon />
							<H6 style={{ color: colors.dark_blue }}>
								Instagram
							</H6>
						</Pressable>
						<Pressable
							style={{
								gap: 4,
								flexDirection: "row",
								paddingHorizontal: 12,
								paddingVertical: 7,
								borderRadius: 25,
								alignItems: "center",
								backgroundColor: colors.light_blue,
							}}
						>
							<YoutubeIcon />
							<H6 style={{ color: colors.dark_blue }}>Youtube</H6>
						</Pressable>
						<Pressable
							style={{
								gap: 4,
								flexDirection: "row",
								paddingHorizontal: 12,
								paddingVertical: 7,
								borderRadius: 25,
								alignItems: "center",
								backgroundColor: colors.light_blue,
							}}
						>
							<TiktokIcon />
							<H6 style={{ color: colors.dark_blue }}>Tiktok</H6>
						</Pressable>
					</View>
				</View>

				<Pressable
					disabled={followPending}
					onPress={() =>
						toggleFollow({
							username: profile.author.username,
							following: profile.is_following,
						})
					}
					accessibilityRole="button"
					accessibilityLabel={
						profile.is_following
							? `Unfollow ${profile.author.display_name}`
							: `Follow ${profile.author.display_name}`
					}
					style={{
						backgroundColor: colors.primary,
						borderRadius: 8,
						alignItems: "center",
						margin: 20,
						padding: 10,
						opacity: followPending ? 0.6 : 1,
					}}
				>
					<H4 style={{ color: colors.white }}>
						{profile.is_following ? "Following" : "Follow"}
					</H4>
				</Pressable>
				<View
					style={{
						backgroundColor: colors.off_white,
						//paddingVertical: 5,
						zIndex: 10,
					}}
					collapsable={false}
				>
					<TopNav
						selectedValue={selectedPage}
						options={[
							{ label: "Cookbooks", value: 0 },
							{ label: "All Recipes", value: 1 },
						]}
						onSelect={setSelectedPage}
					/>
				</View>
				<View style={{ flex: 1 }}>
					{selectedPage == 0 && (
						<View
							key="0"
							style={{
								flex: 1,
								padding: 20,
								gap: 20,
							}}
						>
							{profile.recipeBooks.length === 0 ? (
								<H5 style={styles.muted}>
									No cookbooks yet
								</H5>
							) : null}
							{profile.recipeBooks.map((item) => {
								return (
									<View key={item.name} style={{ gap: 12 }}>
										<View
											style={{
												flexDirection: "row",
												justifyContent: "space-between",
											}}
										>
											<H2>{item.name}</H2>
											<Pressable
												style={{
													width: 24,
													height: 24,
													borderRadius: 12,
													backgroundColor:
														colors.primary_bg,
													justifyContent: "center",
													alignItems: "center",
												}}
												onPress={() =>
													router.push({
														pathname:
															"/(tabs)/(discover)/onlineRecipeBook",
														params: {
															recipeBook_slug:
																item.recipeBook_slug,
															bookName: item.name,
														},
													})
												}
											>
												<ArrowRight />
											</Pressable>
										</View>
										<View>
											<FlatList
												horizontal
												data={item.recipes}
												renderItem={({
													item: recipeItem,
												}) => (
													<Pressable
														onPress={() =>
															onOnlineRecipe(
																recipeItem
																	.recipeData
																	.recipe_slug,
															)
														}
													>
														<RecipeCardSmall
															recipe={recipeItem}
														/>
													</Pressable>
												)}
												ItemSeparatorComponent={
													<View
														style={{
															height: 12,
															width: 12,
														}}
													/>
												}
											/>
										</View>
									</View>
								);
							})}
						</View>
					)}
					{selectedPage == 1 && (
						<View
							key="1"
							style={{
								flex: 1,
								padding: 20,
							}}
						>
							<View
								style={{
									gap: 8,
									marginBottom: 20,
									flex: 1,
								}}
							>
								<FormInputSearch
									value={""}
									placeholder="Search"
									onSubmitEditing={() => {}}
									onChangeText={() => {}}
								/>
							</View>
							<FlatList
								data={allRecipes}
								ListEmptyComponent={
									<H5 style={styles.muted}>
										No recipes yet
									</H5>
								}
								numColumns={2}
								scrollEnabled={false}
								showsVerticalScrollIndicator={false}
								keyExtractor={(item) =>
									item?.recipeData.recipe_slug!
								}
								showsHorizontalScrollIndicator={false}
								renderItem={({ item: recipeItem }) => (
									<Pressable
										onPress={() =>
											onOnlineRecipe(
												recipeItem.recipeData.recipe_slug,
											)
										}
									>
										<RecipeCardSmall
											recipe={recipeItem}
											scale={1.15}
										/>
									</Pressable>
								)}
								onEndReached={() => {
									if (hasNextPage && !isFetchingNextPage)
										fetchNextPage();
								}}
								onEndReachedThreshold={0.5}
								ListFooterComponent={
									isFetchingNextPage ? (
										<ActivityIndicator />
									) : null
								}
								contentContainerStyle={{
									gap: 12,
								}}
								columnWrapperStyle={{
									gap: 12,
								}}
							/>
						</View>
					)}
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

export default creatorProfile;

const styles = StyleSheet.create({
	centre: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: 16,
		padding: 20,
	},
	muted: {
		color: colors.medium_gray,
		textAlign: "center",
	},
});
