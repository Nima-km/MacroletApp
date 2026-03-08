import { useBarcodeLookup } from "@/api/hooks/useBarcodeLookup";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, View } from "react-native";
import { H4 } from "../UIComponents/Typography";
interface BarcodeComponentProps {
    onScan: (id: number) => void;
}
const BarcodeComponent = ({ onScan }: BarcodeComponentProps) => {
    const [scannedBarcode, setScannedBarcode] = useState("");
    const [permission, requestPermission] = useCameraPermissions();
    const [isScanned, setIsScanned] = useState(false);
    const {
        data: foodDataScanned,
        isLoading: barcodeLoading,
        error: barcodeError,
    } = useBarcodeLookup(scannedBarcode);
    const handleScanned = async (barcode: any) => {
        console.log("barcode is", barcode);
        setIsScanned(true);
        handleFetch(barcode);
    };

    const handleFetch = async (barcode: any) => {
        setScannedBarcode(barcode);
    };
    useEffect(() => {
        if (foodDataScanned?.[0]) onScan(foodDataScanned[0].id);
        console.log("barcodeCOmponent", foodDataScanned);
    }, [foodDataScanned]);
    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }
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
        </View>
    );
};

export default BarcodeComponent;

const styles = StyleSheet.create({});
