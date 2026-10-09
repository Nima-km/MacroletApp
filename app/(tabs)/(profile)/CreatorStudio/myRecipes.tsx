import {
	useArchiveRecipe,
	useCreatorOverview,
	useDashboardRecipes,
	useTopPerformingRecipes,
} from "@/api/hooks/useCreatorDashboard";
import Bars from "@/assets/svg/bar-chart.svg";
import ChevronRight from "@/assets/svg/chevron-right.svg";
import Dollar from "@/assets/svg/dollar-frame.svg";
import RecipeBookCard from "@/components/chartComponents/Cards/RecipeBookCard";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import StyledRadioButton from "@/components/UIComponents/Buttons/RadioButton";
import DropDownRecipe from "@/components/UIComponents/DropDown/DropDownRecipe";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { FormInputSearch } from "@/components/UIComponents/TextInputs/FormInput";
import { H1, H5, H5_SemiBold, H6 } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
const myRecipes = () => {
	const { data: overview, isLoading: overviewLoading } = useCreatorOverview();
	const { data: recipes, isLoading: recipesLoading } = useDashboardRecipes();
	const { data: top } = useTopPerformingRecipes();
	const { mutate: archive } = useArchiveRecipe();
	const allRecipes = recipes?.pages.flatMap((page) => page.data) ?? [];
	return (
		<KeyboardAware>
			<HeaderSimple title={"My Recipes"} />
			<View style={{ flex: 1, padding: 20, gap: 12 }}>
				<View style={{ flexDirection: "row", gap: 8 }}>
					<View
						style={{
							backgroundColor: colors.white,
							borderRadius: 8,
							padding: 12,
							flex: 1,
							gap: 12,
						}}
					>
						<H5>Total Logs</H5>
						<H1>{overview?.totalLogs}</H1>
						<View style={{ flexDirection: "row" }}>
							<H6 style={{ color: "green" }}>%9 </H6>
							<H6>from last month</H6>
						</View>
					</View>
					<View
						style={{
							backgroundColor: colors.white,
							borderRadius: 8,
							padding: 12,
							flex: 1,
							gap: 12,
						}}
					>
						<H5>Total Impressions</H5>
						<H1>{overview?.totalImpressions}</H1>
						<View style={{ flexDirection: "row" }}>
							<H6 style={{ color: "green" }}>%9 </H6>
							<H6>from last month</H6>
						</View>
					</View>
				</View>
				<View style={{ flexDirection: "row", gap: 8 }}>
					<View
						style={{
							backgroundColor: colors.white,
							borderRadius: 8,
							padding: 12,
							gap: 12,
							flex: 1,
						}}
					>
						<H5>Published Recipes</H5>
						<H1>{overview?.totalRecipes}</H1>
					</View>
					<View
						style={{
							backgroundColor: colors.light_blue,
							borderRadius: 8,
							padding: 12,
							gap: 12,
							flex: 1,
						}}
					>
						<H5 style={{ color: colors.dark_blue }}>
							Pending Payout
						</H5>
						<H1 style={{ color: colors.dark_blue }}>
							{overview?.pendingBalanceCents}
						</H1>
					</View>
				</View>
				<Pressable
					style={{
						flexDirection: "row",
						backgroundColor: colors.white,
						paddingHorizontal: 12,
						paddingVertical: 13,
						borderRadius: 8,
						gap: 4,
					}}
				>
					<Dollar />
					<View style={{ flex: 1 }}>
						<H5_SemiBold>View Payout History</H5_SemiBold>
					</View>
					<ChevronRight color={colors.primary} />
				</Pressable>
				<View style={{ marginTop: 45, gap: 12 }}>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<View style={{ flex: 1 }}>
							<H1>Top Recipes</H1>
						</View>

						<View style={{ flex: 1 }}>
							<StyledRadioButton
								options={[
									{
										label: "By logs",
										value: "logs",
									},
									{
										label: "By views",
										value: "views",
									},
								]}
								onSelect={() => {}}
							/>
						</View>
					</View>
					<FlatList
						scrollEnabled={false}
						data={top?.byLogs}
						renderItem={({ item, index }) => (
							<Pressable
								style={{
									padding: 12,
									borderRadius: 8,
									flexDirection: "row",
									alignItems: "center",
									gap: 12,
									backgroundColor: colors.white,
								}}
							>
								<View
									style={{
										width: 30,
										height: 30,
										borderRadius: 15,
										backgroundColor: colors.primary_bg,
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<H5 style={{ color: colors.primary }}>
										{index + 1}
									</H5>
								</View>
								<View
									style={{
										height: 64,
										width: 64,
										borderRadius: 8,
										backgroundColor: colors.primary_bg,
									}}
								></View>
								<View
									style={{
										gap: 12,
									}}
								>
									<H5_SemiBold>{item.name}</H5_SemiBold>
									<View
										style={{ flexDirection: "row", gap: 4 }}
									>
										<Bars />
										<H5
											style={{
												color: colors.medium_gray,
											}}
										>
											{item.totalLogs}
										</H5>
									</View>
								</View>
							</Pressable>
						)}
						ItemSeparatorComponent={<View style={{ height: 8 }} />}
					/>
				</View>
				<View style={{ marginTop: 45, gap: 12 }}>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<View style={{ flex: 1 }}>
							<H1>Cookbooks</H1>
						</View>
					</View>
					<FlatList
						data={undefined}
						renderItem={({ item }) => (
							<RecipeBookCard
								recipeBookData={{
									id: 2,
									name: "test",
									pictures: null,
									items: [],
								}}
							/>
						)}
					/>
				</View>
				<View style={{ marginTop: 45, gap: 12 }}>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<View style={{ flex: 1 }}>
							<H1>All Recipes</H1>
						</View>

						<View style={{ flex: 1 }}>
							<StyledRadioButton
								options={[
									{
										label: "By logs",
										value: "logs",
									},
									{
										label: "By views",
										value: "views",
									},
								]}
								onSelect={() => {}}
							/>
						</View>
					</View>
					<FormInputSearch
						style={{ paddingHorizontal: 20 }}
						value={""}
						placeholder="Search foods"
						//onSubmitEditing={handleSearch}
						onChangeText={() => {}}
					/>
					<FlatList
						scrollEnabled={false}
						data={allRecipes}
						renderItem={({ item, index }) => (
							<Pressable
								style={{
									padding: 12,
									borderRadius: 8,
									flexDirection: "row",
									alignItems: "center",
									gap: 12,
									backgroundColor: colors.white,
								}}
							>
								<View
									style={{
										height: 92,
										width: 92,
										borderRadius: 8,
										backgroundColor: colors.primary_bg,
									}}
								></View>
								<View
									style={{
										gap: 8,
										flex: 1,
										alignItems: "flex-start",
									}}
								>
									<H5_SemiBold>
										{item.foodData.name}
									</H5_SemiBold>
									<View
										style={{
											paddingVertical: 7,
											paddingHorizontal: 12,

											borderRadius: 20,
											backgroundColor:
												item.recipeStats.status !=
												"Archived"
													? colors.light_yellow
													: colors.light_blue,
										}}
									>
										<H6
											style={{
												color:
													item.recipeStats.status !=
													"Archived"
														? colors.dark_yellow
														: colors.dark_blue,
											}}
										>
											{item.recipeStats.status ==
											"archived"
												? "Archived"
												: "Public"}
										</H6>
									</View>
									<View
										style={{
											flexDirection: "row",
											gap: 12,
										}}
									>
										{/* Rating row removed: it was a hardcoded "4.5 (1,437)"
										    on every recipe, and this screen's payload
										    (GET /dashboard/recipes) carries no rating at
										    all, so there is nothing real to show. */}
										<View
											style={{
												flexDirection: "row",
												gap: 4,
												alignItems: "center",
											}}
										>
											<Bars />
											<H5
												style={{
													color: colors.medium_gray,
												}}
											>
												{item.recipeStats.totalLogs}
											</H5>
										</View>
									</View>
								</View>
								<View style={{ alignSelf: "flex-start" }}>
									<DropDownRecipe />
								</View>
							</Pressable>
						)}
						ItemSeparatorComponent={<View style={{ height: 8 }} />}
					/>
				</View>
			</View>
		</KeyboardAware>
	);
};

export default myRecipes;

const styles = StyleSheet.create({});
