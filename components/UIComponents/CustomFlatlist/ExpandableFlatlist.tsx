import { colors } from "@/theme";
import React, { useState } from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { SubButton } from "../Buttons/Button";
import { H1 } from "../Typography";

type Data = {
    id: string;
    text: string;
};

interface Props {
    data: Data[];
    style?: ViewStyle;
    onPressItem?: (id: string) => void;
}

const ExpandableFlatlist = ({ data, style, onPressItem }: Props) => {
    const [expanded, setExpanded] = useState(false);
    const limit = data.slice(0, 2);
    return (
        <View
            style={[
                style,
                {
                    flexDirection: "row",
                    flexWrap: "wrap",
                },
            ]}
        >
            {(expanded ? data : limit).map((item) => {
                return (
                    <SubButton
                        onPress={() => onPressItem?.(item.id)}
                        key={item.id}
                    >
                        {item.text}
                    </SubButton>
                );
            })}
            <Pressable
                onPress={() => setExpanded((prev) => !prev)}
                style={{ alignItems: "center" }}
            >
                <H1
                    style={{
                        color: colors.primary,

                        marginTop: -8,
                    }}
                >
                    ...
                </H1>
            </Pressable>
        </View>
    );
};

export default ExpandableFlatlist;

const styles = StyleSheet.create({});
