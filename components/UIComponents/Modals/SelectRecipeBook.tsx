import { RecipeBookInsert } from "@/types/recipe";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { PrimaryButton, SecondaryButton } from "../Buttons/Button";
import DropdownCore from "../DropDown/DropDownCore";
import ModalCore from "./ModalCore";

interface TextModalProps {
    onSelect: (selected: RecipeBookInsert | undefined) => void;
    onCreateNew: () => void;
    recipeBookList: RecipeBookInsert[] | undefined;
    onClose: () => void;
}
const SelectRecipeBook = ({
    onClose,
    onSelect,
    onCreateNew,
    recipeBookList,
}: TextModalProps) => {
    const [selected, setSelected] = useState<RecipeBookInsert>();
    return (
        <ModalCore title="Create New Recipe book" onClose={onClose}>
            <View style={{ flexDirection: "column-reverse" }}>
                <View style={styles.buttonsContainer}>
                    <View style={{ flex: 1 }}>
                        <SecondaryButton onPress={onClose}>
                            Cancel
                        </SecondaryButton>
                    </View>
                    <View style={{ flex: 1 }}>
                        <PrimaryButton
                            onPress={() => {
                                (onSelect(selected), onClose());
                            }}
                        >
                            Save
                        </PrimaryButton>
                    </View>
                </View>
                <View style={styles.mainContent}>
                    <DropdownCore
                        options={recipeBookList?.map((item) => ({
                            label: item.name,
                            value: item,
                        }))}
                        extraButtonText="Create New"
                        onSelect={(s) => setSelected(s.value)}
                        extraButton={() => onCreateNew()}
                    />
                </View>
            </View>
        </ModalCore>
    );
};

export default SelectRecipeBook;

const styles = StyleSheet.create({
    mainContent: {
        marginVertical: 20,
        height: 50,
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
