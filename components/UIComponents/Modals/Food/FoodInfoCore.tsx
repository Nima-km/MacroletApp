import { useInsertFood } from "@/api/hooks/useInsertFood";
import {
	SimpleChartCarbsMacro,
	SimpleChartFatMacro,
	SimpleChartProteinMacro,
} from "@/components/chartComponents/SimpleChart/SimpleChartMacro";
import { calculateCalories } from "@/helper/calculateCalories";
import { macroSum } from "@/helper/calculateMacro";
import formatDateTime from "@/helper/formatDateTime";
import { servingSizeProvider } from "@/helper/ServingSizeProvider";
import { SimpleRound } from "@/helper/simpleRound";
import { FoodDefault, FoodItemDefault } from "@/tests/testData";
import { FoodInsert, FoodItemData } from "@/types/food";
import { ServingSizeType } from "@/types/servingSize";
import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import {
	DateButton,
	InlineButton,
	PrimaryButton,
	SecondaryButton,
} from "../../Buttons/Button";
import TimeDateSelector from "../../Calendar/TimeDateSelector";
import DropDownServings from "../../DropDown/DropDownServings";
import KeyboardAware from "../../KeyboardAware/KeyboardAware";
import { FormInput } from "../../TextInputs/FormInput";
import { H1 } from "../../Typography";

interface FoodInfoProps {
	foodData?: FoodInsert | undefined;
	foodItemData?: FoodItemData & Required<Pick<FoodItemData, "timestamp">>;
	servingsData: Omit<ServingSizeType, "food_id">[];
	primaryText: string;
	secondaryText?: string;
	edit?: boolean;
	setEdit?: (edit: boolean) => void;
	primaryButton: (food: FoodInsert, foodItem: FoodItemData) => void;
	secondaryButton?: (food: FoodInsert, foodItem: FoodItemData) => void;
	setNewServing?: (newServing: Omit<ServingSizeType, "food_id">) => void;
}

const FoodInfoCore = ({
	foodData,
	foodItemData,
	servingsData,
	primaryText,
	secondaryText,
	primaryButton,
	secondaryButton,
	setNewServing,
	edit = false,
	setEdit = () => {},
}: FoodInfoProps) => {
	const [food, setFood] = useState(foodData ?? FoodDefault);
	const [calendarVisible, setCalendarVisible] = useState(false);
	const { mutate: insertFood, isPending, error } = useInsertFood();

	const [servingTypes, setServingTypes] = useState<
		Omit<ServingSizeType, "food_id">[]
	>(
		servingSizeProvider({
			servingData: servingsData,
			serving_100g: food.serving_100g,
		}),
	);
	const [foodItem, setFoodItem] = useState(
		foodItemData ?? { ...FoodItemDefault, timestamp: new Date() },
	);
	function onCancelEdit() {
		setEdit(false);

		setFood((prev) => ({
			...prev,
			protein: foodData?.protein ?? 0,
			carbs: foodData?.carbs ?? 0,
			fat: foodData?.fat ?? 0,
			fiber: foodData?.fiber ?? 0,
		}));
	}
	function uploadFood() {
		insertFood(food, {
			onSuccess: (data) => console.log("Food inserted:", data),
			onError: (error) => console.warn("Failed:", error.message),
		});
	}
	function multiplyServing(inp?: number) {
		return (inp ?? 0) * foodItem.serving_mult * foodItem.servings;
	}
	return (
		<View style={{ flex: 1, gap: 20 }}>
			{edit ? (
				<FormInput
					value={food.name}
					placeholder="Enter food name"
					onChangeText={(newName) =>
						setFood((prev) => ({ ...prev, name: newName }))
					}
				/>
			) : (
				<H1>{food.name}</H1>
			)}
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
				}}
			>
				<H1>
					{SimpleRound(
						calculateCalories(food) *
							foodItem.serving_mult *
							foodItem.servings,
					)}{" "}
					cal
				</H1>
				<DateButton onPress={() => setCalendarVisible(true)}>
					{formatDateTime(foodItem.timestamp)}
				</DateButton>
			</View>
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
				}}
			>
				<SimpleChartProteinMacro
					target={multiplyServing(macroSum(food))}
					progress={multiplyServing(food.protein)}
					backgroundColor={"black"}
					edit={edit}
					value={food.protein?.toString()}
					onChangeText={(val) =>
						setFood((prev) => ({ ...prev, protein: Number(val) }))
					}
				/>
				<SimpleChartCarbsMacro
					target={multiplyServing(macroSum(food))}
					progress={multiplyServing(food.carbs)}
					backgroundColor={"black"}
					edit={edit}
					value={food.carbs?.toString()}
					onChangeText={(val) =>
						setFood((prev) => ({ ...prev, carbs: Number(val) }))
					}
				/>
				<SimpleChartFatMacro
					target={multiplyServing(macroSum(food))}
					progress={multiplyServing(food.fat)}
					backgroundColor={"black"}
					edit={edit}
					value={food.fat?.toString()}
					onChangeText={(val) =>
						setFood((prev) => ({ ...prev, fat: Number(val) }))
					}
				/>
			</View>
			<InlineButton onPress={uploadFood}>Upload this food</InlineButton>
			<View style={{ flexDirection: "column-reverse", gap: 20 }}>
				{edit ? (
					<View style={{ flexDirection: "row", gap: 8 }}>
						<SecondaryButton
							style={{ flex: 1 }}
							onPress={() => onCancelEdit()}
						>
							Cancel
						</SecondaryButton>
						<PrimaryButton
							style={{ flex: 1 }}
							onPress={() => setEdit(false)}
						>
							Save
						</PrimaryButton>
					</View>
				) : (
					<View style={{ flexDirection: "row", gap: 8 }}>
						{secondaryButton && (
							<SecondaryButton
								style={{ flex: 1 }}
								onPress={() => secondaryButton(food, foodItem)}
							>
								{secondaryText}
							</SecondaryButton>
						)}
						<PrimaryButton
							style={{ flex: 1 }}
							onPress={() => primaryButton(food, foodItem)}
						>
							{primaryText}
						</PrimaryButton>
					</View>
				)}

				<DropDownServings
					options={servingTypes}
					placeholder={{
						serving_type: foodItem.serving_type,
						serving_mult: foodItem.serving_mult,
					}}
					servings={foodItem.servings}
					setNewServing={setNewServing}
					setServings={(servings) =>
						setFoodItem((prev) => ({ ...prev, servings: servings }))
					}
					onSelect={(value) =>
						setFoodItem((prev) => ({
							...prev,
							serving_type: value.serving_type,
							serving_mult: value.serving_mult,
						}))
					}
				/>
			</View>
			<Modal
				visible={calendarVisible}
				transparent
				// animationType='fade'
				onRequestClose={() => {
					setCalendarVisible(false);
				}}
			>
				<KeyboardAware scrollEnabled={false}>
					<Pressable
						style={{
							flex: 1,
							backgroundColor: "rgba(0,0,0,0.5)",
							justifyContent: "center",
							alignItems: "center",
						}}
						onPress={() => setCalendarVisible(false)}
					>
						<Pressable
							style={{
								backgroundColor: "red",
								width: "80%",
							}}
						>
							<TimeDateSelector
								value={foodItem.timestamp}
								onChange={(newDate) =>
									setFoodItem((prev) => ({
										...prev,
										timestamp: newDate,
									}))
								}
								isTime={false}
							/>
						</Pressable>
					</Pressable>
				</KeyboardAware>
			</Modal>
		</View>
	);
};

export default FoodInfoCore;

const styles = StyleSheet.create({});
