import Alert from "@/assets/svg/alert-triangle.svg";
import Delete from "@/assets/svg/bin.svg";
import { colors } from "@/theme";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import DropdownButton from "./DropDownButton";

const DropDownComment = ({
	onReport,
	onDelete,
}: {
	onReport?: () => void;
	onDelete?: () => void;
}) => {
	const [open, setOpen] = useState(false);
	// Only offer what the caller can act on: a delete option with no handler is a
	// dead control, and the same is true of report.
	const options = [
		...(onReport
			? [
					{
						value: "report",
						label: "Report",
						color: colors.black,
						icon: <Alert />,
					},
				]
			: []),
		...(onDelete
			? [
					{
						value: "delete",
						label: "Delete",
						color: colors.error,
						icon: <Delete color={colors.error} />,
					},
				]
			: []),
	];
	return (
		<DropdownButton
			open={open}
			setOpen={setOpen}
			options={options}
			onSelect={(option) => {
				setOpen(false);
				if (option.value === "report") onReport?.();
				if (option.value === "delete") onDelete?.();
			}}
		>
			<View
				style={{
					width: 30,
					height: 30,

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

export default DropDownComment;

const styles = StyleSheet.create({});
