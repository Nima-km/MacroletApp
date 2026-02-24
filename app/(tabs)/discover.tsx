import { fetchFilteredRecipes } from "@/api/searchRecipe";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import SearchFilterBottomSheet from "@/components/UIComponents/BottomSheet/SearchFilterBottomSheet";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { FormInputSearch } from "@/components/UIComponents/TextInputs/FormInput";
import { H5 } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import { useAuth } from "@clerk/clerk-expo";
import BottomSheet from "@gorhom/bottom-sheet";
import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

const discover = () => {
    const [search, setSearch] = useState("");
    const { isSignedIn, isLoaded, getToken } = useAuth();
    const [filters, setFilters] = useState<Record<string, string>>({});
    const sheetRef = useRef<BottomSheet>(null);
    async function onSearch() {
        const clerk_token = await getToken();
        const data = await fetchFilteredRecipes(
            filters,
            search,
            clerk_token ?? "",
        );
        //console.log("data is", data);
    }
    return (
        <KeyboardAware>
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
                <PrimaryButton onPress={onSearch}>Search</PrimaryButton>
            </View>
            <SearchFilterBottomSheet
                ref={sheetRef}
                onApply={(newFilters) => setFilters(newFilters)}
            />
        </KeyboardAware>
    );
};

export default discover;

const styles = StyleSheet.create({});
