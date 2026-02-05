import CameraIcon from "@/assets/svg/camera.svg";
import ExpandableTextInput from "@/components/UIComponents/TextInputs/ExpandableTextInput";
import { H3, H4 } from "@/components/UIComponents/Typography";
import { useImageManager } from "@/helper/useImageManager";
import { colors } from "@/theme";
import { DirectionStep } from "@/types/recipe";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface Props {
    item: DirectionStep;
    index: number;
    onChangeText: (text: string) => void;
    onChangePicture: (uri: string) => void;
    onDelete: () => void;
}

const StepsCardEdit = ({
    item,
    index,
    onChangeText,
    onChangePicture,
    onDelete,
}: Props) => {
    const { addImageFromGallery } = useImageManager();
    const onAddImage = async () => {
        const image = await addImageFromGallery();
        if (!image) return;
        onChangePicture(image.uri);
    };

    return (
        <ExpandableTextInput
            value={item.text}
            onChangeText={onChangeText}
            onDelete={onDelete}
            collapsedPlaceholder={"Step " + (index + 1).toString()}
            expandedHeight={120 + (item.photo != "" ? 90 : 0)}
            placeholder="Start typing your directions."
        >
            <View
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 28,
                }}
            >
                {item.photo == "" ? (
                    <Pressable
                        onPress={() => onAddImage()}
                        style={{ flexDirection: "row", gap: 8 }}
                    >
                        <CameraIcon />
                        <H4>Add Photo</H4>
                    </Pressable>
                ) : (
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            //alignItems: "center",
                        }}
                    >
                        <Pressable
                            style={{
                                height: 30,
                                width: 30,
                                marginLeft: -15,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            onPress={() => onChangePicture("")}
                        >
                            <H3
                                style={{
                                    color: colors.primary,
                                }}
                            >
                                X
                            </H3>
                        </Pressable>
                        <Image
                            source={item.photo}
                            style={{ width: 90, height: 90, borderRadius: 10 }}
                            contentFit="cover"
                        />
                    </View>
                )}
            </View>
        </ExpandableTextInput>
    );
};

export default StepsCardEdit;

const styles = StyleSheet.create({});
