import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import ExpandableFlatlist from "@/components/UIComponents/CustomFlatlist/ExpandableFlatlist";
import { DropdownOption } from "@/components/UIComponents/DropDown/DropDownCore";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import ControlledTextInput from "@/components/UIComponents/TextInputs/ControlledTextInput";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

const test2 = () => {
    const options = [
        { label: "Chicken", value: 0 },
        { label: "Chinese", value: 1 },
        { label: "Milk", value: 2 },
        { label: "High Calorie", value: 3 },
        { label: "Low Calorie", value: 4 },
        { label: "Low Protein", value: 5 },
        { label: "High Protein", value: 6 },
    ];
    const data = [
        { text: "Chicken", id: "Chicken" },
        { text: "Chinese", id: "Chinese" },
        { text: "Milk", id: "Milk" },
        { text: "High Calorie", id: "High Calorie" },
        { text: "Low Calorie", id: "Low Calorie" },
        { text: "Low Protein", id: "Low Protein" },
        { text: "High Protein", id: "High Protein" },
    ];
    const [filteredData, setFilteredData] = useState<DropdownOption[]>(options);
    const [text, setText] = useState("");
    useEffect(() => {
        setFilteredData(
            options
                ?.filter((item) =>
                    item.label.toLowerCase().includes(`${text}`.toLowerCase()),
                )
                .slice(0, 4),
        );
        //console.log("recent history", errorSectionList, loadingSectionList);
    }, [text]);

    return (
        <KeyboardAware>
            <View style={{ marginTop: 50 }}>
                <ControlledTextInput
                    value={text}
                    options={filteredData}
                    onChangeText={setText}
                    onSelect={(selected) => console.log(selected)}
                />
                <PrimaryButton>Hi</PrimaryButton>
                <View
                    style={{
                        flexDirection: "row",
                        backgroundColor: "red",
                    }}
                >
                    <ExpandableFlatlist data={data} />
                </View>
            </View>
        </KeyboardAware>
    );
};

export default test2;

const styles = StyleSheet.create({});
