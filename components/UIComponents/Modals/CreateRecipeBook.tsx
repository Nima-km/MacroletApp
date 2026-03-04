import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { PrimaryButton, SecondaryButton } from "../Buttons/Button";
import { FormInput } from "../TextInputs/FormInput";
import ModalCore from "./ModalCore";

interface TextModalProps {
    setText: (servingName: string) => void;
    onClose: () => void;
    error: string;
}
const CreateRecipeBook = ({ setText, onClose, error }: TextModalProps) => {
    const [textInp, setTextInp] = useState("");
    return (
        <ModalCore title="Create New Recipe book" onClose={onClose}>
            <View style={styles.mainContent}>
                <View style={styles.rowContainer}>
                    <View style={styles.nameTextContainer}>
                        <FormInput
                            onChangeText={setTextInp}
                            value={textInp}
                            placeholder="Enter Name"
                            error={error}
                        />
                    </View>
                </View>
            </View>
            <View style={styles.buttonsContainer}>
                <View style={{ flex: 1 }}>
                    <SecondaryButton onPress={onClose}>Cancel</SecondaryButton>
                </View>
                <View style={{ flex: 1 }}>
                    <PrimaryButton
                        onPress={() => {
                            (setText(textInp), onClose());
                        }}
                    >
                        Save
                    </PrimaryButton>
                </View>
            </View>
        </ModalCore>
    );
};

export default CreateRecipeBook;

const styles = StyleSheet.create({
    mainContent: {
        marginVertical: 20,
    },
    buttonsContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    rowContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    nameTextContainer: {
        flex: 1,
    },
    ratioTextContainer: {
        height: 46,
        width: 50,
    },
    referenceServingContainer: {
        height: 46,
        flex: 1,
    },
});
