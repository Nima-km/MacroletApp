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
    return (
        <View style={{}}>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    backgroundColor: "red",
                    alignItems: "center",
                }}
            >
                <H2>{"<"}</H2>
                <Pressable
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 9,
                    }}
                    onPress={() => setCalendarVisible(true)}
                >
                    <Calendar />
                    <H4>{formatDate(date)}</H4>
                </Pressable>

                <H2>{">"}</H2>
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
