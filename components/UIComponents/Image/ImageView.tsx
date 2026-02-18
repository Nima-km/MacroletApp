import { colors } from "@/theme";
import { Image } from "expo-image";
import React from "react";
import { ImageStyle, StyleSheet, View, ViewStyle } from "react-native";
interface Props {
    style?: ViewStyle;
    imageStyle?: ImageStyle;
    source: string | null | undefined;
}
const ImageView = ({ style, imageStyle, source }: Props) => {
    return (
        <View style={[style, { backgroundColor: colors.primary_bg, flex: 1 }]}>
            {source != "" && source && (
                <Image source={source} style={[imageStyle, { flex: 1 }]} />
            )}
        </View>
    );
};

export default ImageView;

const styles = StyleSheet.create({});
