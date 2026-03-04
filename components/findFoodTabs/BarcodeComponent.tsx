import { FetchBarcode } from "@/api/fetchBarcode";
import { useInsertFoodAndItem } from "@/db/hooks/food/useFood";
import { FoodInsert, FoodItemData } from "@/types/food";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Button, StyleSheet, View } from "react-native";
import FoodInfoCore from "../UIComponents/Modals/Food/FoodInfoCore";
import { H4 } from "../UIComponents/Typography";
const BarcodeComponent = () => {
    const router = useRouter();
    const [foodData, setFoodData] = useState<FoodInsert>();
    const [permission, requestPermission] = useCameraPermissions();
    const { mutate: insertFoodAndItem } = useInsertFoodAndItem();
    const [isScanned, setIsScanned] = useState(false);
    const handleScanned = async (barcode: any) => {
        console.log("barcode is", barcode);
        setIsScanned(true);
        handleFetch(barcode);
    };
    function LogNewFood(food: FoodInsert, foodItem: FoodItemData) {
        insertFoodAndItem(
            { foodData: food, foodItemData: foodItem },
            {
                onSuccess: () => {
                    console.log(`${food.name} has been logged`);
                    router.push("/(tabs)/(logs)/logs");
                },
                onError: (err) => {
                    console.error("Insert failed:", err);
                },
            },
        );
    }
    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }
    const handleFetch = async (barcode: any) => {
        try {
            const res = await FetchBarcode(barcode);
            if (res) {
                console.log("food data from barcode", res);
                setFoodData(res);
                setIsScanned(true);
            }
        } catch (error: any) {
            console.log("SOMETHING WENT WRONG");
            setIsScanned(false);
        }
    };
    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={{ flex: 1 }}>
                <H4>We need your permission to show the camera</H4>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }
    return (
        <View style={{ flex: 1 }}>
            {!isScanned || !foodData ? (
                <View style={{ flex: 1 }}>
                    <CameraView
                        style={{ flex: 1 }}
                        facing={"back"}
                        barcodeScannerSettings={{
                            barcodeTypes: ["upc_a", "ean13", "upc_e"],
                        }}
                        onBarcodeScanned={({ data }) => {
                            !isScanned ? handleScanned(data) : null;
                        }}
                    ></CameraView>
                </View>
            ) : (
                <View
                    style={{
                        flex: 1,
                        marginHorizontal: 20,
                    }}
                >
                    <FoodInfoCore
                        servingsData={[]}
                        foodData={foodData}
                        primaryText={"Log"}
                        primaryButton={LogNewFood}
                    />
                </View>
            )}
        </View>
    );
};

export default BarcodeComponent;

const styles = StyleSheet.create({});
