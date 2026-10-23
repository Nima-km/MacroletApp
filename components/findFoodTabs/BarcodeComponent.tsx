import { useBarcodeLookup } from "@/api/hooks/useBarcodeLookup";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Button,
	Pressable,
	StyleSheet,
	View,
} from "react-native";
import { colors } from "@/theme";
import { H4, H5, H5_SemiBold } from "../UIComponents/Typography";

interface BarcodeComponentProps {
	onScan: (id: number) => void;
}

/** How long a failure stays on screen before the scanner re-arms itself. */
const REARM_AFTER_MS = 2600;

type Status = "idle" | "looking" | "not_found" | "error";

/**
 * Barcode scanner.
 *
 * The scanner used to go silent in the two cases that matter: a barcode it could not
 * resolve, and a lookup that failed. `isScanned` stayed true in both, so the camera
 * stopped scanning and nothing said why - the only way out was tapping the view, which
 * nothing advertised.
 *
 * Now every outcome is visible: a banner while looking, a message and an automatic
 * re-arm when the product is unknown or the lookup fails.
 */
const BarcodeComponent = ({ onScan }: BarcodeComponentProps) => {
	const [scannedBarcode, setScannedBarcode] = useState("");
	const [permission, requestPermission] = useCameraPermissions();
	const [status, setStatus] = useState<Status>("idle");
	const rearmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const {
		data: foodDataScanned,
		isFetching: barcodeLoading,
		error: barcodeError,
	} = useBarcodeLookup(scannedBarcode);

	const cancelRearm = useCallback(() => {
		if (rearmTimer.current) {
			clearTimeout(rearmTimer.current);
			rearmTimer.current = null;
		}
	}, []);

	const rearm = useCallback(() => {
		cancelRearm();
		setStatus("idle");
		setScannedBarcode("");
	}, [cancelRearm]);

	const scheduleRearm = useCallback(() => {
		cancelRearm();
		rearmTimer.current = setTimeout(rearm, REARM_AFTER_MS);
	}, [cancelRearm, rearm]);

	useEffect(() => cancelRearm, [cancelRearm]);

	useEffect(() => {
		if (!scannedBarcode) return;

		if (barcodeLoading) {
			setStatus("looking");
			return;
		}
		if (barcodeError) {
			setStatus("error");
			scheduleRearm();
			return;
		}
		const found = foodDataScanned?.[0];
		if (found) {
			setStatus("idle");
			onScan(found.id);
			return;
		}
		setStatus("not_found");
		scheduleRearm();
	}, [
		scannedBarcode,
		barcodeLoading,
		barcodeError,
		foodDataScanned,
		onScan,
		scheduleRearm,
	]);

	if (!permission) {
		// Permission state is still loading.
		return <View style={{ flex: 1 }} />;
	}
	if (!permission.granted) {
		return (
			<View style={styles.permission}>
				<H4>We need your permission to show the camera</H4>
				<H5 style={styles.muted}>It's only used to read a barcode.</H5>
				<Button onPress={requestPermission} title="Allow camera access" />
			</View>
		);
	}

	const busy = status === "looking";

	return (
		<View style={{ flex: 1 }}>
			<Pressable style={{ flex: 1 }} onPress={rearm}>
				<CameraView
					style={{ flex: 1 }}
					facing={"back"}
					barcodeScannerSettings={{
						barcodeTypes: ["upc_a", "ean13", "upc_e"],
					}}
					onBarcodeScanned={({ data }) => {
						if (busy || scannedBarcode) return;
						setScannedBarcode(data);
						setStatus("looking");
					}}
				/>
			</Pressable>

			{status === "idle" ? (
				<View style={styles.hint} pointerEvents="none">
					<H5 style={styles.hintText}>
						Point the camera at a barcode
					</H5>
				</View>
			) : null}

			{status === "looking" ? (
				<View style={styles.banner} pointerEvents="none">
					<ActivityIndicator color={colors.primary} />
					<H5_SemiBold>Looking that up…</H5_SemiBold>
				</View>
			) : null}

			{status === "not_found" ? (
				<Pressable style={styles.banner} onPress={rearm}>
					<H5_SemiBold>We don't have that product yet</H5_SemiBold>
					<H5 style={styles.muted}>
						Scanning again in a moment — tap to retry now.
					</H5>
				</Pressable>
			) : null}

			{status === "error" ? (
				<Pressable style={styles.banner} onPress={rearm}>
					<H5_SemiBold>Couldn't check that barcode</H5_SemiBold>
					<H5 style={styles.muted}>
						Check your connection — tap to try again.
					</H5>
				</Pressable>
			) : null}
		</View>
	);
};

export default BarcodeComponent;

const styles = StyleSheet.create({
	permission: {
		flex: 1,
		justifyContent: "center",
		padding: 20,
		gap: 12,
	},
	muted: {
		color: colors.inactive,
	},
	banner: {
		position: "absolute",
		left: 20,
		right: 20,
		bottom: 28,
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 16,
		gap: 4,
		alignItems: "center",
	},
	hint: {
		position: "absolute",
		top: 24,
		left: 20,
		right: 20,
		backgroundColor: colors.white,
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 12,
		alignItems: "center",
	},
	hintText: {
		color: colors.inactive,
	},
});
