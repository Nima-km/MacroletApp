import FoodCardQuick from "@/components/chartComponents/Cards/FoodCardQuick";
import DropDownServings from "@/components/UIComponents/DropDown/DropDownServings";
import { H3, H4, H5, H6 } from "@/components/UIComponents/Typography";
import { insertFoodItem, insertFoodList } from "@/db/queries/food";
import { getRecentFoodNicknames } from "@/db/queries/voice";
import VoiceMicButton from "@/components/findFoodTabs/VoiceMicButton";
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

/** A failure with copy the user can act on, instead of a status code. */
class VoiceRequestError extends Error {
	constructor(
		readonly title: string,
		readonly detail: string,
	) {
		super(detail);
		this.name = "VoiceRequestError";
	}
}

/**
 * What to tell the user when a stage fails.
 *
 * "Couldn't read that" covered a 401, a 429, a dead model and a missing route, so the
 * only thing it communicated was that something happened. Each case now names a
 * different cause and, where it exists, a way out.
 *
 * The server's own `error` string is deliberately not shown: it is written for logs
 * ("Validation failed", a stack trace) and reads as noise in a toast.
 */
function voiceFailure(stage: "parse" | "resolve", status: number): VoiceRequestError {
	if (status === 401) {
		return new VoiceRequestError(
			"Session expired",
			"Sign in again to keep logging.",
		);
	}
	if (status === 404) {
		return new VoiceRequestError(
			"Voice log isn't available",
			"Type what you ate instead, or update the app.",
		);
	}
	if (status === 429) {
		return new VoiceRequestError(
			"One moment",
			"Too many requests just now. Try again in a few seconds.",
		);
	}
	if (status === 400) {
		return new VoiceRequestError(
			"Nothing to read there",
			'Say what you ate, like "two eggs and a slice of toast".',
		);
	}
	if (status >= 500) {
		return stage === "parse"
			? new VoiceRequestError(
					"Couldn't understand that",
					"The speech reader is having trouble. Try again, or type what you ate.",
				)
			: new VoiceRequestError(
					"Couldn't look those foods up",
					"Our food search is having trouble. Try again in a moment.",
				);
	}
	return stage === "parse"
		? new VoiceRequestError(
				"Couldn't understand that",
				"Try rewording it, or type what you ate.",
			)
		: new VoiceRequestError(
				"Couldn't look those foods up",
				"Try again, or log it by hand.",
			);
}

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
/**
 * The opening serving for an item.
 *
 * The parser reports units in speech ("piece", "slice", "300 grams"), and those are not
 * serving sizes — the picker only knows the food's own options, which always start with
 * "Serving" plus Gram/Lb/Oz when the weight is known. Putting the spoken word straight
 * into `serving_type` left the picker showing a value it could not offer, and worse,
 * "300 grams" was logged as **300 servings**.
 *
 * So the quantity is read as a count of whatever serving is chosen — except grams, which
 * map onto the Gram option whose multiplier already divides by the serving weight.
 */
function defaultDraft(
	food: { serving_100g: number } | null | undefined,
	quantity: number | undefined,
	unit: string | null | undefined,
) {
	const options = servingSizeProvider({
		servingData: [],
		serving_100g: food?.serving_100g ?? 0,
	});
	const spoken = (unit ?? "").trim().toLowerCase();
	const isWeight = ["gram", "grams", "g", "gr", "gm"].includes(spoken);
	const gramOption = isWeight
		? options.find((option) => option.serving_type.toLowerCase() === "gram")
		: undefined;
	// Fall back to the first option, which is always "Serving".
	const option = gramOption ?? options[0];

	// A weight with no serving weight to divide by cannot be converted, and treating
	// "300 grams" as 300 servings is wildly wrong. With nothing to go on, log one.
	const servings =
		isWeight && !gramOption ? 1 : Math.max(1, Math.round(quantity || 1));

	return {
		servings,
		serving_mult: option.serving_mult,
		serving_type: option.serving_type,
	};
}

/**
 * Whether a food can carry an adjustable amount at all.
 *
 * `serving_100g` is the serving's weight. At zero there is nothing to convert grams
 * against and no serving size to offer beyond "Serving", so the picker would be a
 * control that changes nothing meaningful.
 */
function hasPortionData(food: { serving_100g: number } | null | undefined) {
	return (food?.serving_100g ?? 0) > 0;
}

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
			if (!token) {
				throw new VoiceRequestError(
					"Session expired",
					"Sign in again to keep logging.",
				);
			}

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
				console.log(
					"voice/parse failed",
					parseRes.status,
					JSON.stringify(body).slice(0, 200),
				);
				throw voiceFailure("parse", parseRes.status);
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
				throw voiceFailure("resolve", res.status);
			}
			const body = await res.json();

			// Re-rank with this device's history. The resolver scores "Denny's, french
			// fries" and "Mcdonald's, french fries" identically; if the user always logs
			// the latter, it should be first. Matching is by nickname because the
			// candidates carry the server's ids, not ours.
			const recent = await getRecentFoodNicknames();
			const rank = new Map(recent.map((nickname, index) => [nickname, index]));
			const ordered = (body.items ?? []).map(
				(item: VoiceResolvedItem): VoiceResolvedItem => {
					const candidates = [...item.candidates].sort((a, b) => {
						const ra = rank.get(a.food?.nickname ?? "") ?? Number.MAX_SAFE_INTEGER;
						const rb = rank.get(b.food?.nickname ?? "") ?? Number.MAX_SAFE_INTEGER;
						return ra - rb;
					});
					return {
						...item,
						candidates,
						// The server's selection was an index into the old order.
						selected: candidates.length > 0 ? 0 : null,
					};
				},
			);
			setItems(ordered);
		} catch (error) {
			// A request that never reached the server throws TypeError from fetch; that is
			// a connection problem, not a reading problem.
			const offline =
				error instanceof TypeError ||
				/failed to fetch|network request failed/i.test(
					error instanceof Error ? error.message : "",
				);

			if (error instanceof VoiceRequestError) {
				Toast.show({ type: "error", text1: error.title, text2: error.detail });
			} else if (offline) {
				Toast.show({
					type: "error",
					text1: "No connection",
					text2: "Can't reach the server. Check your connection and try again.",
				});
			} else {
				console.log("voice log failed", error);
				Toast.show({
					type: "error",
					text1: "Couldn't log that",
					text2: "Try again, or type what you ate.",
				});
			}
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
			<H6 style={{ color: colors.inactive }}>
				Hold the mic and speak, or type below. Include how much, and the restaurant if
				it came from one.
			</H6>

			<VoiceMicButton
				onTranscript={(transcript) => setText(transcript)}
				disabled={pending}
			/>

			<View style={styles.inputWrap}>
				<TextInput
					value={text}
					onChangeText={setText}
					placeholder="two eggs and a big mac from mcdonalds"
					placeholderTextColor={colors.inactive}
					multiline
					// Not auto-focused: focusing opens the keyboard over the mic button.
					returnKeyType="search"
					onSubmitEditing={() => resolve()}
					blurOnSubmit
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
		items.map((item) =>
			defaultDraft(
				item.candidates[item.selected ?? 0]?.food ?? null,
				item.quantity,
				item.unit,
			),
		),
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
									showMacroBar
									food={food as never}
									foodItem={{
										// `FoodItemData` is the shape without `food_id`; the card
										// only needs the amount to render the macros.
										...draft,
										timestamp: new Date(),
									}}
								/>

								{/* And the app's serving picker, in place of free text.
								    Hidden when the food has no serving weight: the only option
								    left is "Serving", so the control would only offer to
								    change something the data cannot describe. */}
								{hasPortionData(food) ? (
									<DropDownServings
										options={optionsFor(food)}
										servings={draft.servings}
										placeholder={{
											serving_type: draft.serving_type,
											serving_mult: draft.serving_mult,
										}}
										setServings={(servings) =>
											updateDraft(index, { servings })
										}
										onSelect={(value) =>
											updateDraft(index, {
												serving_type: value.serving_type,
												serving_mult: value.serving_mult,
											})
										}
										setNewServing={() => {}}
									/>
								) : (
									<H6 style={{ color: colors.inactive }}>
										No portion data for this food, so the amount can't be
										adjusted. Logs as {draft.servings}{" "}
										{draft.serving_type.toLowerCase()}.
									</H6>
								)}

								{item.candidates.length > 1 ? (
									<View style={styles.alternatives}>
										<H6 style={{ color: colors.inactive }}>Not this one?</H6>
										{item.candidates.map((alt, altIndex) =>
											altIndex === choice[index] || !alt.food ? null : (
												<Pressable
													key={altIndex}
													onPress={() => {
														setChoice((prev) =>
															prev.map((v, i) => (i === index ? altIndex : v)),
														);
														// Keep the amount, but re-derive the serving: the food just chosen may
														// not offer the one the previous row had.
														const next = defaultDraft(
															alt.food ?? undefined,
															items[index].quantity,
															items[index].unit,
														);
														updateDraft(index, {
															serving_type: next.serving_type,
															serving_mult: next.serving_mult,
														});
													}}
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
	micHint: {
		gap: 4,
		paddingVertical: 4,
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
