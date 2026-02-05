import { H4, H5 } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import { DirectionStep } from "@/types/recipe";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";

interface Props {
    item: DirectionStep;
    index: number;
}

const StepsCard = ({ item, index }: Props) => {
    return (
        <View
            style={{
                borderRadius: 8,
                padding: 12,
                gap: 12,
                backgroundColor: colors.white,
            }}
        >
            <H4 style={{ color: colors.primary }}>Step {index + 1}</H4>
            <H5 style={{ flexWrap: "wrap" }}>{item.text}</H5>
            {item.photo != "" && (
                <View
                    style={{ justifyContent: "center", alignItems: "center" }}
                >
                    <Image
                        source={item.photo}
                        style={{ width: 164, height: 164, borderRadius: 10 }}
                        contentFit="cover"
                    />
                </View>
            )}
        </View>
    );
};

export default StepsCard;

const styles = StyleSheet.create({});
