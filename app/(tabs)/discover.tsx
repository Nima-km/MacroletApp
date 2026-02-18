import HeaderSimple from "@/components/navComponents/HeaderSimple";
import SearchFilterBottomSheet from "@/components/UIComponents/BottomSheet/SearchFilterBottomSheet";
import { FormInputSearch } from "@/components/UIComponents/TextInputs/FormInput";
import { H5 } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

const discover = () => {
    const [search, setSearch] = useState("");
    const sheetRef = useRef<BottomSheet>(null);
    return (
        <View style={{ flex: 1 }}>
            <HeaderSimple title="Discover" />
            <View style={{ flex: 1, padding: 20 }}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                    <View style={{ flex: 1 }}>
                        <FormInputSearch
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                    <Pressable
                        style={{
                            backgroundColor: colors.primary_bg,
                            borderRadius: 8,
                            justifyContent: "center",
                            alignItems: "center",
                            width: 50,
                            height: 50,
                        }}
                        onPress={() => sheetRef.current?.snapToIndex(2)}
                    >
                        <H5>PP</H5>
                    </Pressable>
                </View>
            </View>
            <SearchFilterBottomSheet ref={sheetRef} />
        </View>
    );
};

export default discover;

const styles = StyleSheet.create({});
