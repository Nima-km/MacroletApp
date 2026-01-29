import { ServingSizeType } from "@/types/servingSize";
import React, { useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import CustomServingModal from "../Modals/CustomServingModal";
import { FormInputNumber } from "../TextInputs/FormInput";
import DropdownCore, { DropdownOption } from "./DropDownCore";

interface DropdownSelectProps {
    options: Omit<ServingSizeType, "food_id">[];
    extraButtonText?: string;
    placeholder: Omit<ServingSizeType, "food_id">;
    servings: number;
    setServings: (inp: number) => void;
    onSelect?: (option: Omit<ServingSizeType, "food_id">) => void;
    setNewServing?: (newServing: Omit<ServingSizeType, "food_id">) => void;
}

const DropDownServings = ({
    options,
    servings,
    placeholder,
    setServings,
    onSelect = (option: Omit<ServingSizeType, "food_id">) => {},
    setNewServing,
}: DropdownSelectProps) => {
    const processedOption = options.map((item) => {
        return { label: item.serving_type, value: item };
    });
    const [text, setText] = useState(servings.toString());
    const [customServingModalVisible, setCustomServingModalVisible] =
        useState(false);
    function onSelectProcessed(value: DropdownOption) {
        onSelect(value.value);
    }
    return (
        <View>
            <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ height: 50, width: 50 }}>
                    <FormInputNumber
                        onChangeText={(inp) => {
                            (setServings(Number(inp)), setText(inp));
                        }}
                        value={text}
                    />
                </View>
                <View style={{ flex: 1, height: 50 }}>
                    <DropdownCore
                        options={processedOption}
                        onSelect={onSelectProcessed}
                        extraButton={() => setCustomServingModalVisible(true)}
                        extraButtonText="Add New"
                        placeholder={placeholder.serving_type}
                    />
                </View>
            </View>
            <Modal
                visible={customServingModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setCustomServingModalVisible(false);
                }}
            >
                <CustomServingModal
                    options={processedOption}
                    setNewServing={(servingName, servingMultiplyer) => {
                        if (setNewServing) {
                            setNewServing({
                                serving_type: servingName,
                                serving_mult: servingMultiplyer,
                            });
                        } else {
                            console.log("serving went wrong");
                        }
                    }}
                    onClose={() => setCustomServingModalVisible(false)}
                />
            </Modal>
        </View>
    );
};

export default DropDownServings;

const styles = StyleSheet.create({});
