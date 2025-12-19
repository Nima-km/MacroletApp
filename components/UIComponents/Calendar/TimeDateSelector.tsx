import { colors } from "@/theme";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { H5, H5_SemiBold } from "../Typography";

interface CalendarDatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
}

const WEEK_DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

export default function TimeDateSelector({
  value,
  onChange,
}: CalendarDatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = value ?? new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const selectedDate = value;

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

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
  }, [currentMonth]);

  function isSameDay(a?: Date, b?: Date) {
    if (!a || !b) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function prevMonth() {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function nextMonth() {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Pressable onPress={prevMonth}>
                <Text style={styles.nav}>{"<"}</Text>
            </Pressable>
            <Text style={styles.title}>
            {currentMonth.toLocaleString("default", {
                month: "long",
                year: "numeric",
            })}
            </Text>
            <Pressable onPress={nextMonth}>
                <Text style={styles.nav}>{">"}</Text>
            </Pressable>
        </View>

        <View style={styles.weekRow}>
            {WEEK_DAYS.map((d) => (
            <H5_SemiBold key={d} style={{flex: 1, color: colors.inactive, textAlign: 'center'}}>
                {d}
            </H5_SemiBold>
            ))}
        </View>

        <View style={styles.grid}>
            {days.map((date, idx) => {
            const selected = isSameDay(date ?? undefined, selectedDate);

            return (
                <Pressable
                    key={idx}
                    disabled={!date}
                    onPress={() => date && onChange?.(date)}
                    style={[
                        styles.cell,
                        
                    ]}
                >
                    <View style={[selected && styles.selectedCell, {padding: 0}]}>
                        <H5
                            style={[
                                selected && styles.selectedText,
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
  );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: 8,
        padding: 12,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
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
       // gap: 16,
        flexDirection: "row",
        flexWrap: "wrap",
    },
    cell: {
        width: "14.285%",
        aspectRatio: 0.9,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
        
    },
    cellText: {
        fontSize: 14,
    },
    selectedCell: {
        backgroundColor: colors.primary,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    selectedText: {
        color: "#fff",
    },
});
