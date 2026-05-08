import { colors, typography } from "@/theme";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import StyledRadioButton from "../Buttons/RadioButton";
import { FormInputNumber } from "../TextInputs/FormInput";
import { H2, H4, H5, H5_SemiBold } from "../Typography";

interface CalendarDatePickerProps {
    value: Date;
    isTime: boolean;
    onChange: (date: Date) => void;
}

const WEEK_DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const MONTHS = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
];

export default function TimeDateSelector({
    value,
    isTime,
    onChange,
}: CalendarDatePickerProps) {
    const [currentMonthYear, setCurrentMonthYear] = useState(() => {
        const d = value ?? new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });
    const [isPM, setIsPM] = useState(value.getHours() > 12 ? 1 : 0);
    const [hour, setHour] = useState(
        (value.getHours() > 12
            ? value.getHours() - 12
            : value.getHours()
        ).toString(),
    );
    const [minute, setMinute] = useState(value.getMinutes().toString());
    const selectedDate = value;
    const RadioOptions = [
        { label: "AM", value: 0 },
        { label: "PM", value: 1 },
    ];
    const days = useMemo(() => {
        const year = currentMonthYear.getFullYear();
        const month = currentMonthYear.getMonth();

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const result: (Date | null)[] = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            result.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            result.push(new Date(year, month, day));
        }

        return result;
    }, [currentMonthYear]);
    const months = useMemo(() => {
        const year = currentMonthYear.getFullYear();
        const month = currentMonthYear.getMonth();

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const result: (Date | null)[] = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            result.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            result.push(new Date(year, month, day));
        }

        return result;
    }, [currentMonthYear]);
    const [monthVisible, setMonthVisible] = useState(false);
    function isSameDay(a?: Date, b?: Date) {
        if (!a || !b) return false;
        return (
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate()
        );
    }
    function prevMonth() {
        setCurrentMonthYear(
            (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1),
        );
    }

    function nextMonth() {
        setCurrentMonthYear(
            (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1),
        );
    }
    function prevYear() {
        setCurrentMonthYear(
            (d) => new Date(d.getFullYear() - 1, d.getMonth(), 1),
        );
    }

    function nextYear() {
        setCurrentMonthYear(
            (d) => new Date(d.getFullYear() + 1, d.getMonth(), 1),
        );
    }
    function setMonth(newMonth: number) {
        setCurrentMonthYear((d) => new Date(d.getFullYear(), newMonth, 1));
    }
    function onChangeHour(newHour: string) {
        setHour(newHour);
        console.log("testing time", Number(newHour) + isPM * 12);
        onChange(
            new Date(
                value.getFullYear(),
                value.getMonth(),
                value.getDate(),
                Number(newHour) + isPM * 12,
                value.getMinutes(),
            ),
        );
    }
    function onChangeMinute(newMinute: string) {
        try {
            setMinute(newMinute);
            onChange(
                new Date(
                    value.getFullYear(),
                    value.getMonth(),
                    value.getDate(),
                    value.getHours(),
                    Number(newMinute),
                ),
            );
        } catch {
            console.log("something went wrong with the clock");
        }
    }
    function ToggleAMPM(newIsPM: number) {
        if (newIsPM != isPM) {
            setIsPM(newIsPM);
            console.log("testing time", Number(hour) + (newIsPM ?? -1) * 12);
            onChange(
                new Date(
                    value.getFullYear(),
                    value.getMonth(),
                    value.getDate(),
                    Number(hour) + (newIsPM ?? -1) * 12,
                    value.getMinutes(),
                ),
            );
        }
    }
    return (
        <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
            <View style={styles.container}>
                {!monthVisible ? (
                    <View>
                        <View style={styles.header}>
                            <Pressable onPress={prevMonth}>
                                <H2 style={{ color: colors.primary }}>{"<"}</H2>
                            </Pressable>
                            <Pressable onPress={() => setMonthVisible(true)}>
                                <H4>
                                    {currentMonthYear.toLocaleString(
                                        "default",
                                        {
                                            month: "long",
                                            year: "numeric",
                                        },
                                    )}
                                </H4>
                            </Pressable>
                            <Pressable onPress={nextMonth}>
                                <H2 style={{ color: colors.primary }}>{">"}</H2>
                            </Pressable>
                        </View>

                        <View style={styles.weekRow}>
                            {WEEK_DAYS.map((d) => (
                                <H5_SemiBold
                                    key={d}
                                    style={{
                                        flex: 1,
                                        color: colors.inactive,
                                        textAlign: "center",
                                    }}
                                >
                                    {d}
                                </H5_SemiBold>
                            ))}
                        </View>
                        <View style={styles.grid}>
                            {days.map((date, idx) => {
                                const selected = isSameDay(
                                    date ?? undefined,
                                    selectedDate,
                                );

                                return (
                                    <Pressable
                                        key={idx}
                                        disabled={!date}
                                        onPress={() =>
                                            date &&
                                            onChange?.(
                                                new Date(
                                                    new Date(
                                                        date.getFullYear(),
                                                        date.getMonth(),
                                                        date.getDate(),
                                                        value.getHours(),
                                                        value.getMinutes(),
                                                    ),
                                                ),
                                            )
                                        }
                                        style={[styles.dayCell]}
                                    >
                                        <View
                                            style={[
                                                selected &&
                                                    styles.selectedDayCell,
                                                { padding: 0 },
                                            ]}
                                        >
                                            <H5
                                                style={[
                                                    selected &&
                                                        styles.selectedDayText,
                                                    {},
                                                ]}
                                            >
                                                {date ? date.getDate() : ""}
                                            </H5>
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                ) : (
                    <View>
                        <View style={{ flexDirection: "row" }}>
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Pressable
                                    onPress={() => setMonthVisible(false)}
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: 10,
                                    }}
                                >
                                    <H2 style={{ color: colors.primary }}>
                                        {"<"}
                                    </H2>
                                    <H4>BACK</H4>
                                </Pressable>
                            </View>
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Pressable>
                                    <H4>
                                        {currentMonthYear.toLocaleString(
                                            "default",
                                            {
                                                year: "numeric",
                                            },
                                        )}
                                    </H4>
                                </Pressable>
                            </View>
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: 20,
                                    flex: 1,
                                }}
                            >
                                <Pressable onPress={prevYear}>
                                    <H2 style={{ color: colors.primary }}>
                                        {"<"}
                                    </H2>
                                </Pressable>
                                <Pressable onPress={nextYear}>
                                    <H2 style={{ color: colors.primary }}>
                                        {">"}
                                    </H2>
                                </Pressable>
                            </View>
                        </View>
                        <View style={styles.grid}>
                            {MONTHS.map((month, idx) => {
                                const selected =
                                    currentMonthYear?.getMonth() == idx;

                                return (
                                    <Pressable
                                        key={idx}
                                        // disabled={!date}
                                        onPress={() => setMonth(idx)}
                                        style={[styles.monthCell]}
                                    >
                                        <View
                                            style={[
                                                selected &&
                                                    styles.selectedMonthCell,
                                                { padding: 10 },
                                            ]}
                                        >
                                            <H5
                                                style={[
                                                    selected &&
                                                        styles.selectedMonthText,
                                                    {},
                                                ]}
                                            >
                                                {month ? month : ""}
                                            </H5>
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                )}

                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <H4>Time</H4>
                    <View style={{ flexDirection: "row", flex: 1, gap: 8 }}>
                        <View
                            style={{
                                flexDirection: "row",
                                flex: 1,
                                justifyContent: "flex-end",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <FormInputNumber
                                value={hour}
                                onChangeText={(text) => onChangeHour(text)}
                                style={[
                                    typography.h5_SemiBold,
                                    { color: colors.primary },
                                ]}
                                viewStyle={{
                                    backgroundColor: colors.primary_bg,
                                }}
                                upperLimit={12}
                            />
                            <H4>:</H4>
                            <FormInputNumber
                                value={minute}
                                onChangeText={(text) => onChangeMinute(text)}
                                style={[
                                    typography.h5_SemiBold,
                                    { color: colors.primary },
                                ]}
                                viewStyle={{
                                    backgroundColor: colors.primary_bg,
                                }}
                                upperLimit={60}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <StyledRadioButton
                                options={RadioOptions}
                                defaultOption={isPM}
                                onSelect={(value) => {
                                    ToggleAMPM(value);
                                }}
                            />
                        </View>
                    </View>
                </View>
            </View>
            <View style={{ flex: 0.5 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 360,
        height: 460,
        backgroundColor: colors.white,
        borderRadius: 8,
        padding: 12,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
        paddingHorizontal: 14,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
    },
    nav: {
        fontSize: 18,
        paddingHorizontal: 12,
    },
    weekRow: {
        flexDirection: "row",
        marginBottom: 4,
    },
    weekDay: {
        flex: 1,
        textAlign: "center",
        fontSize: 12,
        color: "#666",
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    dayCell: {
        width: "14.285%",
        aspectRatio: 0.9,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
    },
    monthCell: {
        width: "33.33%",
        aspectRatio: 1.5,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
    },
    selectedMonthCell: {
        backgroundColor: colors.primary_bg,
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
    },
    selectedDayCell: {
        backgroundColor: colors.primary,
        width: 32,
        height: 32,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
    },
    selectedDayText: {
        color: "#fff",
    },
    selectedMonthText: {
        color: colors.primary,
    },
});
