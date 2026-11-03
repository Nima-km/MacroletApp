import { colors } from "@/theme";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import TimeWheel from "./TimeWheel";
import { H2, H4, H5, H5_SemiBold } from "../Typography";

interface CalendarDatePickerProps {
    value: Date;
    isTime: boolean;
    onChange: (date: Date) => void;
}

const WEEK_DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

/** Wheel columns. Hours 1-12 with AM/PM separate; minutes padded to two digits. */
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const PERIODS = ["AM", "PM"];
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
    const [isPM, setIsPMState] = useState(value.getHours() >= 12 ? 1 : 0);
    const hourIndex = (value.getHours() % 12 || 12) - 1;
    const minuteIndex = value.getMinutes();
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
      /** Rebuild the timestamp from the three wheel positions. 12 AM is hour 0. */
      function setTime(nextHourIndex: number, nextMinuteIndex: number, nextPM: number) {
          const hour24 = ((nextHourIndex + 1) % 12) + (nextPM === 1 ? 12 : 0);
          onChange(
              new Date(
                  value.getFullYear(),
                  value.getMonth(),
                  value.getDate(),
                  hour24,
                  nextMinuteIndex,
              ),
          );
      }
      function setHourIndex(next: number) {
          setTime(next, minuteIndex, isPM);
      }
      function setMinuteIndex(next: number) {
          setTime(hourIndex, next, isPM);
      }
      function setIsPM(next: number) {
          setIsPMState(next);
          setTime(hourIndex, minuteIndex, next);
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

                  {/* A wheel, not two number fields: minutes are impossible to
                      type quickly, and the wheel is the gesture people know. */}
                  <View style={styles.timeSection}>
                      <H4>Time</H4>
                      <View style={styles.wheels}>
                          <TimeWheel
                              values={HOURS}
                              index={hourIndex}
                              onIndexChange={setHourIndex}
                              width={72}
                          />
                          <TimeWheel
                              values={MINUTES}
                              index={minuteIndex}
                              onIndexChange={setMinuteIndex}
                              width={72}
                          />
                          <TimeWheel
                              values={PERIODS}
                              index={isPM}
                              onIndexChange={setIsPM}
                              width={72}
                          />
                      </View>
                  </View>
            </View>
            <View style={{ flex: 0.5 }} />
        </View>
    );
}

const styles = StyleSheet.create({
      container: {
          width: 340,
          backgroundColor: colors.white,
          borderRadius: 8,
          padding: 20,
          gap: 12,
      },
      timeSection: {
          gap: 8,
      },
      wheels: {
          flexDirection: "row",
          justifyContent: "center",
          gap: 4,
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
