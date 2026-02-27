import { useFilteredRecipes } from "@/api/hooks/useSearchRecipe";
import RecipeCard from "@/components/chartComponents/Cards/RecipeCard";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import SearchFilterBottomSheet from "@/components/UIComponents/BottomSheet/SearchFilterBottomSheet";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { FormInputSearch } from "@/components/UIComponents/TextInputs/FormInput";
import { H5 } from "@/components/UIComponents/Typography";
import { useRecipeStateStore } from "@/store/recipeStore/useRecipeStore";
import { colors } from "@/theme";
import { RecipeData } from "@/types/recipe";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

const discover = () => {
    const router = useRouter();
    const initializeRecipe = useRecipeStateStore(
        (state) => state.initializeRecipe,
    );
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState<Record<string, string>>({});
    function useDebounce<T>(value: T, delay: number) {
        const [debounced, setDebounced] = React.useState(value);

        React.useEffect(() => {
            const handler = setTimeout(() => {
                setDebounced(value);
            }, delay);

            return () => clearTimeout(handler);
        }, [value, delay]);

        return debounced;
    }
    const debouncedSearch = useDebounce(search, 400);
    const { data, isLoading, error, isFetching } = useFilteredRecipes(
        filters,
        debouncedSearch,
    );
    const sheetRef = useRef<BottomSheet>(null);
    function onOnlineRecipe(selectedRecipe: RecipeData) {
        console.log("the online selected recipe is", selectedRecipe);
        initializeRecipe(selectedRecipe);
        router.push("/(tabs)/(logs)/onlineRecipe");
    }
    return (
        <View style={{ flex: 1 }}>
            <KeyboardAware>
                <HeaderSimple title="Discover" />
                <View style={{ flex: 1, padding: 20 }}>
                    <View
                        style={{
                            flexDirection: "row",
                            gap: 8,
                            marginBottom: 20,
                        }}
                    >
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
                    <View>
                        <FlatList
                            data={data}
                            renderItem={({ item }) => (
                                <Pressable onPress={() => onOnlineRecipe(item)}>
                                    <RecipeCard recipe={item} />
                                </Pressable>
                            )}
                            scrollEnabled={false}
                        />
                    </View>
                </View>
            </KeyboardAware>
            <SearchFilterBottomSheet
                ref={sheetRef}
                onApply={(newFilters) => setFilters(newFilters)}
            />
        </View>
    );
};

export default discover;

const styles = StyleSheet.create({});
