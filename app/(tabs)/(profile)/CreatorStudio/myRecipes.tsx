import Bars from "@/assets/svg/bar-chart.svg";
import ChevronRight from "@/assets/svg/chevron-right.svg";
import Dollar from "@/assets/svg/dollar-frame.svg";
import Star from "@/assets/svg/star.svg";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import StyledRadioButton from "@/components/UIComponents/Buttons/RadioButton";
import DropDownComment from "@/components/UIComponents/DropDown/DropDownComment";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { FormInputSearch } from "@/components/UIComponents/TextInputs/FormInput";
import { H1, H5, H5_SemiBold, H6 } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
const myRecipes = () => {
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
						<H1>769</H1>
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
						<H1>12,382</H1>
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
						<H1>20</H1>
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
						<H1 style={{ color: colors.dark_blue }}>$15.43</H1>
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
						data={[
							{ name: "Orange Honey Glazed Salmon", logs: 75 },
							{ name: "Smash Cheeseburger", logs: 56 },
							{ name: "Shrimp Fried Rice", logs: 44 },
							{ name: "Beef Noodle Soup", logs: 40 },
							{ name: "Easy Hummus", logs: 28 },
						]}
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
											{item.logs}
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
						data={[
							{
								name: "Orange Honey Glazed Salmon",
								logs: 75,
								avgRating: 4.7,
								totalRating: 675,
								isArchied: true,
							},
							{
								name: "Smash Cheeseburger",
								logs: 56,
								avgRating: 4.7,
								totalRating: 675,
								isArchied: false,
							},
							{
								name: "Shrimp Fried Rice",
								logs: 44,
								avgRating: 4.7,
								totalRating: 675,
								isArchied: false,
							},
							{
								name: "Beef Noodle Soup",
								logs: 40,
								avgRating: 4.7,
								totalRating: 675,
								isArchied: true,
							},
							{
								name: "Easy Hummus",
								logs: 28,
								avgRating: 4.7,
								totalRating: 675,
								isArchied: true,
							},
						]}
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
									<H5_SemiBold>{item.name}</H5_SemiBold>
									<View
										style={{
											paddingVertical: 7,
											paddingHorizontal: 12,

											borderRadius: 20,
											backgroundColor: item.isArchied
												? colors.light_yellow
												: colors.light_blue,
										}}
									>
										<H6
											style={{
												color: item.isArchied
													? colors.dark_yellow
													: colors.dark_blue,
											}}
										>
											{item.isArchied
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
										<View
											style={{
												flexDirection: "row",
												gap: 4,
												alignItems: "center",
											}}
										>
											<Star pointerEvents="none" />
											<H6>4.5 (1,437)</H6>
										</View>
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
												{item.logs}
											</H5>
										</View>
									</View>
								</View>
								<View style={{ alignSelf: "flex-start" }}>
									<DropDownComment />
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
