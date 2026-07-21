import Calendar from "@/assets/svg/calendar.svg";
import ArrowLeft from "@/assets/svg/chevron-left.svg";
import ArrowRight from "@/assets/svg/chevron-right.svg";
import { formatDate } from "@/helper/formatDate";
import { colors } from "@/theme";
import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import KeyboardAware from "../KeyboardAware/KeyboardAware";
import { H4 } from "../Typography";
import TimeDateSelector from "./TimeDateSelector";

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
					//backgroundColor: "red",
					alignItems: "center",
				}}
			>
				<Pressable
					style={{
						height: 50,
						width: 50,
						// backgroundColor: "red",
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
						// backgroundColor: "red",
						justifyContent: "center",
						alignItems: "center",
					}}
					onPress={() => handleDateChange(1)}
				>
					<ArrowRight color={colors.black} />
				</Pressable>
			</View>
			<Modal
				visible={calendarVisible}
				// animationType='fade'
				transparent
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
								value={date}
								onChange={setDate}
								isTime={false}
							/>
						</Pressable>
					</Pressable>
				</KeyboardAware>
			</Modal>
		</View>
	);
};

export default TopDateSelector;

const styles = StyleSheet.create({});
