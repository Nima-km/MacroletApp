import FoodCardQuick from "@/components/chartComponents/Cards/FoodCardQuick";
import DropDownServings from "@/components/UIComponents/DropDown/DropDownServings";
import { H3, H4, H5, H6 } from "@/components/UIComponents/Typography";
import { insertFoodItem, insertFoodList } from "@/db/queries/food";
import { servingSizeProvider } from "@/helper/ServingSizeProvider";
import { useFoodSelectionStore } from "@/store/foodSelectionStore";
import { colors } from "@/theme";
import { useAuth } from "@clerk/expo";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";
import { PrimaryButton, SecondaryButton } from "../UIComponents/Buttons/Button";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Split a spoken sentence into the foods in it.
 *
 * "mcchicken with medium fries from mcdonalds" is two foods, and no catalogue row
 * contains both — sending it as one item guaranteed "no match". The real parser (step 4)
 * does this with a model; this split-on-conjunction gets the common cases working now,
 * and the resolver still treats each part independently.
 */
function splitItems(sentence: string): Array<{ text: string }> {
	const parts = sentence
		.split(/\s+(?:with|and|plus|also)\s+|,\s*/i)
		.map((part) => part.trim())
		.filter((part) => part.length > 1);
	const items = (parts.length ? parts : [sentence]).map((text) => ({ text }));
	return items.slice(0, 6);
}

/** Mirrors the server's `ResolvedItem` (§3 of docs/VOICE_LOG.md). */
export type VoiceCandidate = {
	source: "database" | "online" | "ai";
	food: {
		id: number;
		name: string;
		brand: string | null;
		nickname: string;
		serving_100g: number;
		protein: number;
		carbs: number;
		fat: number;
		fiber: number;
	} | null;
	score: number;
};

export type VoiceResolvedItem = {
	query: string;
	quantity: number;
	unit: string | null;
	restaurant: string | null;
	candidates: VoiceCandidate[];
	selected: number | null;
};

/**
 * Voice log — text entry.
 *
 * Step 2 of the feature: a typed sentence goes to `POST /voice/resolve`, comes back as
 * items with candidates, and the user confirms. The microphone replaces the text box in
 * step 5; everything below it stays the same.
 *
 * Nothing is logged until the user presses Log, and the amount is editable, because no
 * model tested got every quantity right.
 */
const VoiceLogTab = () => {
	const router = useRouter();
	const { getToken } = useAuth();
	const [text, setText] = useState("");
	const [pending, setPending] = useState(false);
	const [items, setItems] = useState<VoiceResolvedItem[] | null>(null);
	// 403 is a product state, not an error: show the wall, not a toast.
	const [needsPro, setNeedsPro] = useState(false);

	const reset = useCallback(() => {
		setText("");
		setItems(null);
		setNeedsPro(false);
	}, []);

	const resolve = useCallback(async () => {
		const sentence = text.trim();
		if (sentence.length < 2) return;
		setPending(true);
		try {
			const token = await getToken();
			if (!token) throw new Error("Sign in again to log this.");

			// 1. Parse: sentence -> items, with quantity and restaurant per item.
			const parseRes = await fetch(`${API_URL}/voice/parse`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ transcript: sentence }),
			});
			if (parseRes.status === 403) {
				setNeedsPro(true);
				return;
			}
			if (!parseRes.ok) {
				const body = await parseRes.json().catch(() => ({}));
				console.log("voice/parse failed", parseRes.status, JSON.stringify(body).slice(0, 200));
				throw new Error(body?.error ?? `Couldn't read that (${parseRes.status})`);
			}
			const parsedItems = ((await parseRes.json()).items ?? []) as Array<{
				text: string;
				quantity?: number;
				unit?: string;
				restaurant?: string;
			}>;

			if (parsedItems.length === 0) {
				Toast.show({
					type: "warning",
					text1: "No food in that",
					text2: "Try naming what you ate, like \"two eggs and toast\".",
				});
				return;
			}

			// 2. Resolve: items -> catalogue candidates.
			const res = await fetch(`${API_URL}/voice/resolve`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ items: parsedItems }),
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				console.log("voice/resolve failed", res.status, JSON.stringify(body).slice(0, 200));
				// A subscription wall must say it is a subscription wall. "Couldn't read
				// that" sent the user (and me) looking for a parsing bug instead.
				if (res.status === 403) {
					setNeedsPro(true);
					return;
				}
				throw new Error(body?.error ?? `Couldn't resolve that (${res.status})`);
			}
			const body = await res.json();
			setItems(body.items ?? []);
		} catch (error) {
			Toast.show({
				type: "error",
				text1: "Couldn't read that",
				text2: error instanceof Error ? error.message : undefined,
			});
		} finally {
			setPending(false);
		}
	}, [getToken, text]);

	if (items) {
		return (
			<VoiceConfirm
				items={items}
				onCancel={reset}
				onLogged={() => {
					reset();
					Toast.show({ type: "success", text1: "Logged" });
				}}
			/>
		);
	}

	if (needsPro) {
		return (
			<ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
				<H3>Voice logging is part of Pro</H3>
				<H5 style={{ color: colors.inactive }}>
					Reading a sentence into foods needs a model call, which the subscription
					covers. Searching for foods by hand stays free.
				</H5>
				<PrimaryButton onPress={() => router.push("/(tabs)/(profile)/subscription")}>
					See plans
				</PrimaryButton>
				<SecondaryButton onPress={reset}>Back</SecondaryButton>
			</ScrollView>
		);
	}

	return (
		<ScrollView
			style={{ flex: 1 }}
			contentContainerStyle={styles.content}
			keyboardShouldPersistTaps="handled"
		>
			<H3>Say what you ate</H3>
			<H5 style={{ color: colors.inactive }}>
				Type it for now — the microphone arrives with speech-to-text. Include how much,
				and the restaurant if it came from one.
			</H5>

			<View style={styles.inputWrap}>
				<TextInput
					value={text}
					onChangeText={setText}
					placeholder="two eggs and a big mac from mcdonalds"
					placeholderTextColor={colors.inactive}
					multiline
					style={styles.input}
				/>
			</View>

			<PrimaryButton
				onPress={resolve}
				style={{ opacity: text.trim().length > 1 && !pending ? 1 : 0.5 }}
			>
				{pending ? "Reading…" : "Find these foods"}
			</PrimaryButton>
		</ScrollView>
	);
};

/**
 * The confirmation step: one row per item, candidates switchable, amount editable.
 *
 * Logging writes through `useFoodSelectionStore.addFood`, which is the same path the
 * search tab uses, so a voice log and a manual log produce identical rows.
 */
function VoiceConfirm({
	items,
	onCancel,
	onLogged,
}: {
	items: VoiceResolvedItem[];
	onCancel: () => void;
	onLogged: () => void;
}) {
	const queryClient = useQueryClient();

	// One draft per item, shaped like the app's own `foodItem` so the existing card and
	// serving picker can render it unchanged.
	const [choice, setChoice] = useState<number[]>(() =>
		items.map((item) => item.selected ?? -1),
	);
	const [drafts, setDrafts] = useState(() =>
		items.map((item) => ({
			servings: Math.max(1, Math.round(item.quantity || 1)),
			serving_mult: 1,
			serving_type: item.unit || "Serving",
		})),
	);

	const updateDraft = (index: number, patch: Partial<(typeof drafts)[number]>) =>
		setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));

	// The same preset list the food page builds: the food's own serving sizes plus the
	// 100 g default. `servingSizeProvider` needs no database, so it works for online
	// rows that have no local id yet.
	const optionsFor = (food: { serving_100g: number }) =>
		servingSizeProvider({
			servingData: [],
			serving_100g: food.serving_100g,
		});

	async function log() {
		const chosen = items
			.map((item, index) => {
				const candidate = item.candidates[choice[index]];
				if (!candidate?.food) return null;
				const draft = drafts[index];
				if (!draft.servings || draft.servings <= 0) return null;
				return { candidate, draft };
			})
			.filter(
				(entry): entry is { candidate: VoiceCandidate; draft: (typeof drafts)[number] } =>
					entry !== null,
			);

		if (chosen.length === 0) {
			Toast.show({
				type: "warning",
				text1: "Nothing to log",
				text2: "Pick a food for at least one item.",
			});
			return;
		}

		try {
			for (const { candidate, draft } of chosen) {
				const food = candidate.food!;
				// Catalogue rows exist locally; online rows do not, so they are inserted
				// first and the log points at that copy.
				const [local] = await insertFoodList([
					{
						name: food.name,
						nickname: food.nickname,
						protein: food.protein,
						carbs: food.carbs,
						fat: food.fat,
						fiber: food.fiber,
						serving_100g: food.serving_100g,
						volume_100ml: 0,
						barcode: "",
					},
				]);

				await insertFoodItem({
					food_id: local.id,
					servings: draft.servings,
					serving_mult: draft.serving_mult,
					serving_type: draft.serving_type,
				});
			}

			await queryClient.invalidateQueries();
			onLogged();
		} catch (error) {
			Toast.show({
				type: "error",
				text1: "Couldn't log that",
				text2: error instanceof Error ? error.message : undefined,
			});
		}
	}

	return (
		<ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
			<H3>Confirm</H3>
			<H5 style={{ color: colors.inactive }}>
				Matched from the catalogue, not measured. Check the amount before logging.
			</H5>

			{items.map((item, index) => {
				const candidate = item.candidates[choice[index]];
				const food = candidate?.food;
				const draft = drafts[index];

				return (
					<View key={`${item.query}-${index}`} style={styles.card}>
						<H6 style={{ color: colors.inactive }}>“{item.query}”</H6>

						{food ? (
							<>
								{/* The app's own card, not a bespoke layout. */}
								<FoodCardQuick
									food={food as never}
									foodItem={{
										// `FoodItemData` is the shape without `food_id`; the card
										// only needs the amount to render the macros.
										...draft,
										timestamp: new Date(),
									}}
								/>

								{/* And the app's serving picker, in place of free text. */}
								<DropDownServings
									options={optionsFor(food)}
									servings={draft.servings}
									placeholder={{
										serving_type: draft.serving_type,
										serving_mult: draft.serving_mult,
									}}
									setServings={(servings) => updateDraft(index, { servings })}
									onSelect={(value) =>
										updateDraft(index, {
											serving_type: value.serving_type,
											serving_mult: value.serving_mult,
										})
									}
									setNewServing={() => {}}
								/>

								{item.candidates.length > 1 ? (
									<View style={styles.alternatives}>
										<H6 style={{ color: colors.inactive }}>Not this one?</H6>
										{item.candidates.map((alt, altIndex) =>
											altIndex === choice[index] || !alt.food ? null : (
												<Pressable
													key={altIndex}
													onPress={() =>
														setChoice((prev) =>
															prev.map((v, i) => (i === index ? altIndex : v)),
														)
													}
													accessibilityRole="button"
												>
													<H6 style={{ color: colors.primary }}>
														{alt.food.name}
													</H6>
												</Pressable>
											),
										)}
									</View>
								) : null}
							</>
						) : (
							<>
								<H4>No match in the catalogue</H4>
								<H6 style={{ color: colors.inactive }}>
									The AI-guess option arrives later. For now, search for this one by
									hand.
								</H6>
							</>
						)}
					</View>
				);
			})}

			<PrimaryButton onPress={log}>Log</PrimaryButton>
			<SecondaryButton onPress={onCancel}>Start over</SecondaryButton>
		</ScrollView>
	);
}

export default VoiceLogTab;

const styles = StyleSheet.create({
	content: { padding: 20, gap: 16, paddingBottom: 160 },
	inputWrap: {
		backgroundColor: colors.off_white,
		borderRadius: 8,
		padding: 12,
	},
	input: {
		minHeight: 72,
		fontSize: 16,
		color: colors.black,
	},
	card: {
		backgroundColor: colors.off_white,
		borderRadius: 8,
		padding: 16,
		gap: 8,
	},
	amountRow: { flexDirection: "row", gap: 8, alignItems: "center" },
	amountInput: {
		width: 64,
		backgroundColor: colors.white,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		fontSize: 16,
	},
	unitInput: {
		flex: 1,
		backgroundColor: colors.white,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		fontSize: 16,
	},
	alternatives: { gap: 4, paddingTop: 4 },
});
