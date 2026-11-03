import Mic from "@/assets/svg/mic.svg";
import { H6 } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import {
	ExpoSpeechRecognitionModule,
	useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";

type Props = {
	/** Called with the accumulated transcript; may fire repeatedly while holding. */
	onTranscript: (text: string) => void;
	disabled?: boolean;
};

/**
 * Hold to speak.
 *
 * Push-to-talk rather than a tap toggle: a tap leaves a microphone open with no visible
 * way to stop it, and the OS keeps listening. Holding maps the gesture to the lifetime
 * of the recording exactly.
 *
 * Transcription is the platform recogniser (`SpeechRecognizer` / `SFSpeechRecognizer`)
 * via `expo-speech-recognition`, which needs a native rebuild — this module is not in
 * the current binary.
 */
const VoiceMicButton = ({ onTranscript, disabled = false }: Props) => {
	const [listening, setListening] = useState(false);
	const [requesting, setRequesting] = useState(false);

	useSpeechRecognitionEvent("result", (event) => {
		const transcript = event.results?.[0]?.transcript ?? "";
		if (transcript) onTranscript(transcript);
	});

	useSpeechRecognitionEvent("end", () => setListening(false));

	useSpeechRecognitionEvent("error", (event) => {
		setListening(false);
		// `no-speech` is the normal case when someone holds and says nothing.
		if (event.error === "no-speech") return;
		Toast.show({
			type: "error",
			text1: "Couldn't hear that",
			text2: event.message ?? event.error,
		});
	});

	const start = useCallback(async () => {
		if (disabled || listening || requesting) return;
		try {
			setRequesting(true);
			const permission =
				await ExpoSpeechRecognitionModule.requestPermissionsAsync();
			if (!permission.granted) {
				Toast.show({
					type: "warning",
					text1: "Microphone needed",
					text2: "Allow microphone and speech recognition in Settings.",
				});
				return;
			}
			onTranscript("");
			ExpoSpeechRecognitionModule.start({
				lang: "en-US",
				interimResults: true,
				continuous: true,
			});
			setListening(true);
		} catch (error) {
			Toast.show({
				type: "error",
				text1: "Couldn't start listening",
				text2: error instanceof Error ? error.message : undefined,
			});
		} finally {
			setRequesting(false);
		}
	}, [disabled, listening, requesting, onTranscript]);

	const stop = useCallback(() => {
		if (!listening) return;
		ExpoSpeechRecognitionModule.stop();
		setListening(false);
	}, [listening]);

	return (
		<View style={styles.wrap}>
			<Pressable
				onPressIn={start}
				onPressOut={stop}
				disabled={disabled}
				accessibilityRole="button"
				accessibilityLabel="Hold to speak"
				style={[
					styles.button,
					listening && styles.buttonActive,
					disabled && { opacity: 0.5 },
				]}
			>
				{requesting ? (
					<ActivityIndicator color={colors.white} />
				) : (
					<Mic width={28} height={28} color={colors.white} />
				)}
			</Pressable>
			<H6 style={{ color: listening ? colors.primary : colors.inactive }}>
				{listening ? "Listening… release to stop" : "Hold to speak"}
			</H6>
		</View>
	);
};

export default VoiceMicButton;

const styles = StyleSheet.create({
	wrap: { alignItems: "center", gap: 8 },
	button: {
		width: 72,
		height: 72,
		borderRadius: 36,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.primary,
	},
	buttonActive: {
		backgroundColor: colors.protein,
	},
});
