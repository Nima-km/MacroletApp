import { useGetFoodItemSum } from "@/db/hooks/history/foodItemhistory";
import { Text, View } from "react-native";

export default function Index() {
    const date = new Date()
    const {data: LiveFood, isLoading: liveFoodLoading, error: liveFoodError} = useGetFoodItemSum(
        new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        new Date(date.getFullYear(), date.getMonth(), date.getDate(), 24)
    )
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Text>Home</Text>
        </View>
    );
}
