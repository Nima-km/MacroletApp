import Calendar from "@/assets/svg/calendar.svg";
import ArrowLeft from "@/assets/svg/chevron-left.svg";
import ArrowRight from "@/assets/svg/chevron-right.svg";
import { formatDate } from "@/helper/formatDate";
import { colors } from "@/theme";
import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import KeyboardAware from "../KeyboardAware/KeyboardAware";
import { H4 } from "../Typography";
import DatePickerSheet from "./DatePickerSheet";

interface CalendarDatePickerProps {
	date: Date;
	setDate: (date: Date) => void;
}

const TopDateSelector = ({ date, setDate }: CalendarDatePickerProps) => {
	const [calendarVisible, setCalendarVisible] = useState(false);
	const handleDateChange = (dateDelta: number) => {
		const newDate = new Date(date);
		newDate.setDate(newDate.getDate() + dateDelta);
		setDate(newDate);
	};
	return (
		<View style={{}}>
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
						alignItems: "center",
				}}
			>
				<Pressable
					style={{
						height: 50,
						width: 50,
						justifyContent: "center",
						alignItems: "center",
					}}
					onPress={() => handleDateChange(-1)}
				>
					<ArrowLeft color={colors.black} />
				</Pressable>
				<Pressable
					style={{
						flexDirection: "row",
						alignItems: "center",
						gap: 9,
					}}
					onPress={() => setCalendarVisible(true)}
				>
					<Calendar pointerEvents="none" />
					<H4>{formatDate(date)}</H4>
				</Pressable>
				<Pressable
					style={{
						height: 50,
						width: 50,
						justifyContent: "center",
						alignItems: "center",
					}}
					onPress={() => handleDateChange(1)}
				>
					<ArrowRight color={colors.black} />
				</Pressable>
			</View>
			<DatePickerSheet
				visible={calendarVisible}
				value={date}
				onChange={setDate}
				onClose={() => setCalendarVisible(false)}
			/>
		</View>
	);
};

export default TopDateSelector;

const styles = StyleSheet.create({});
