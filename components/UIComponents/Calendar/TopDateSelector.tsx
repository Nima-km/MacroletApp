import Calendar from "@/assets/svg/calendar.svg";
import { formatDate } from "@/helper/formatDate";
import { useDateStore } from "@/store/dateStore";
import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { H2, H4 } from "../Typography";
import TimeDateSelector from "./TimeDateSelector";

const TopDateSelector = () => {
    const date = useDateStore((state) => state.date);
    const setDate = useDateStore((state) => state.setDate);
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
                    // backgroundColor: "red",
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
                    <H2>{"<"}</H2>
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
                    <H2>{">"}</H2>
                </Pressable>
            </View>
            <Modal
                visible={calendarVisible}
                transparent
                // animationType='fade'
                onRequestClose={() => {
                    setCalendarVisible(false);
                }}
            >
                <View style={{ flex: 1 }}>
                    <TimeDateSelector
                        value={date}
                        onChange={setDate}
                        isTime={false}
                    />
                </View>
            </Modal>
        </View>
    );
};

export default TopDateSelector;

const styles = StyleSheet.create({});
