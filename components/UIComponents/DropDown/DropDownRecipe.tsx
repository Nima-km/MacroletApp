import Delete from "@/assets/svg/bin.svg";
import { colors } from "@/theme";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import DropdownButton from "./DropDownButton";

const DropDownRecipe = () => {
	const [open, setOpen] = useState(false);
	return (
		<DropdownButton
			open={open}
			setOpen={setOpen}
			options={[
				{
					value: "value2",
					label: "Archive",
					color: colors.error,
					icon: <Delete color={colors.error} />,
				},
				{
					value: "value3",
					label: "Add to Cookbook",
					color: colors.error,
					icon: <Delete color={colors.error} />,
				},
			]}
		>
			<View
				style={{
					width: 30,
					height: 50,

					backgroundColor: open ? colors.primary_bg : "transparent",
					borderRadius: 15,
					overflow: "hidden",
					justifyContent: "center",
					gap: 3,
					alignItems: "center",
					flexDirection: "row",
				}}
			>
				<View
					style={{
						width: 4,
						height: 4,
						borderRadius: 4,
						backgroundColor: colors.primary,
					}}
				/>
				<View
					style={{
						width: 4,
						height: 4,
						borderRadius: 4,
						backgroundColor: colors.primary,
					}}
				/>
				<View
					style={{
						width: 4,
						height: 4,
						borderRadius: 4,
						backgroundColor: colors.primary,
					}}
				/>
			</View>
		</DropdownButton>
	);
};

export default DropDownRecipe;

const styles = StyleSheet.create({});
