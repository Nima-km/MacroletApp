import { useCreatorProfile, useCreatorRecipes } from "@/api/hooks/useCreator";
import ArrowRight from "@/assets/svg/arrow-right.svg";
import InstagramIcon from "@/assets/svg/instagram.svg";
import TiktokIcon from "@/assets/svg/tiktok.svg";
import YoutubeIcon from "@/assets/svg/youtube.svg";
import RecipeCardSmall from "@/components/chartComponents/Cards/RecipeCardSmall";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import TopNav from "@/components/navComponents/TopNav";
import { FormInputSearch } from "@/components/UIComponents/TextInputs/FormInput";
import { H2, H3, H4, H5, H6 } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import { RecipeData } from "@/types/recipe";
import { useLocalSearchParams } from "expo-router";
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
	const { data: profile, isLoading } = useCreatorProfile(username);
	const {
		data: recipes,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useCreatorRecipes(username);
	const allRecipes = recipes?.pages.flatMap((page) => page.recipes) ?? [];

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
	const flatListRefs = useRef(new Map()).current;
	const scrollOffsets = useRef(new Map()).current;

	const scrollBookList = (name: string, amount = 150) => {
		const ref = flatListRefs.get(name);
		if (!ref) return;
		const currentOffset = scrollOffsets.get(name) || 0;
		const newOffset = currentOffset + amount;

		ref.scrollToOffset({ offset: newOffset, animated: true });
		scrollOffsets.set(name, newOffset);
	};
	useEffect(() => {
		console.log("all recupes", recipes?.pages[0]);
	}, [allRecipes]);
	if (!allRecipes || allRecipes.length == 0) {
		return <H2>LOADING</H2>;
	}

	if (!profile) {
		console.log(profile);
		return <H2>LOADING PROFILE</H2>;
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
							<H3>13</H3>
							<H5 style={{ color: colors.medium_gray }}>
								Recipes
							</H5>
						</View>
						<View style={{ gap: 4, alignItems: "center" }}>
							<H3>905</H3>
							<H5 style={{ color: colors.medium_gray }}>
								Followers
							</H5>
						</View>
						<View style={{ gap: 4, alignItems: "center" }}>
							<H3>4.8</H3>
							<H5 style={{ color: colors.medium_gray }}>
								rating
							</H5>
						</View>
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
					style={{
						backgroundColor: colors.primary,
						borderRadius: 8,
						alignItems: "center",
						margin: 20,
						padding: 10,
					}}
				>
					<H4 style={{ color: colors.white }}>Follow</H4>
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
													scrollBookList(item.name)
												}
											>
												<ArrowRight />
											</Pressable>
										</View>
										<View>
											<FlatList
												horizontal
												data={item.recipes}
												ref={(ref) => {
													if (ref)
														flatListRefs.set(
															item.name,
															ref,
														);
												}}
												renderItem={({
													item: recipeItem,
												}) => (
													<Pressable>
														<RecipeCardSmall
															recipe={recipeItem}
														/>
													</Pressable>
												)}
												onMomentumScrollEnd={(e) => {
													scrollOffsets.set(
														item.name,
														e.nativeEvent
															.contentOffset.x,
													);
												}}
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
								numColumns={2}
								scrollEnabled={false}
								showsVerticalScrollIndicator={false}
								keyExtractor={(item) =>
									item?.recipeData.recipe_slug!
								}
								showsHorizontalScrollIndicator={false}
								renderItem={({ item: recipeItem }) => (
									<Pressable>
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

const styles = StyleSheet.create({});
