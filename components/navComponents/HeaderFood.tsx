import ArrowLeft from "@/assets/svg/chevron-left.svg";
import { colors } from "@/theme";
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { H4 } from "../UIComponents/Typography";
import HeaderCore from "./HeaderCore";
interface HeaderFoodProps {
	title: string;
	isEdit: boolean;
	onBack: () => void;
	onEdit: (value: boolean) => void;
}

const HeaderFood = ({ title, isEdit, onBack, onEdit }: HeaderFoodProps) => {
	return (
		<HeaderCore
			title={title}
			LeftButton={
				true ? (
					<Pressable
						style={{
							height: 50,
							width: 70,
							justifyContent: "center",
						}}
						onPress={onBack}
					>
						<ArrowLeft color={colors.primary} />
					</Pressable>
				) : (
					<Pressable
						style={{
							height: 50,
							width: 70,
							justifyContent: "center",
						}}
						onPress={() => onEdit(false)}
					>
						<H4 style={{ color: colors.primary }}>Cancel</H4>
					</Pressable>
				)
			}
			RightButton={
				!isEdit ? (
					<Pressable
						style={{
							flexDirection: "row",

							height: 50,
							width: 70,
							alignItems: "center",
							justifyContent: "flex-end",
						}}
						onPress={() => onEdit(true)}
					>
						<H4 style={{ color: colors.primary }}>Edit</H4>
					</Pressable>
				) : (
					<Pressable
						style={{
							flexDirection: "row",

							height: 50,
							width: 70,
							alignItems: "center",
							justifyContent: "flex-end",
						}}
						onPress={() => onEdit(false)}
					>
						<H4 style={{ color: colors.primary }}>Cancel</H4>
					</Pressable>
				)
			}
		/>
	);
};

export default HeaderFood;

const styles = StyleSheet.create({});
