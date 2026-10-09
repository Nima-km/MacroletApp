import { tagLabel } from "@/api/fetchTags";
import { usePopularTags } from "@/api/hooks/useTags";
import Check from "@/assets/svg/check.svg";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import { H2, H3, H5, H6 } from "@/components/UIComponents/Typography";
import { FormInputSearch } from "@/components/UIComponents/TextInputs/FormInput";
import {
	useRemoveTagPreference,
	useSetTagRole,
	useTagPreferences,
} from "@/db/hooks/discover/useTagPreferences";
import { colors } from "@/theme";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";

/**
 * Discovery Preferences.
 *
 * The vocabulary comes from `GET /tag/popular` - never a hardcoded list, because
 * tag names are free to change and a tag that does not exist (or has no recipes)
 * has no cached feed section: choosing it shows nothing and explains nothing. Each
 * suggestion therefore carries its recipe count, and dead ends are hidden.
 *
 * There is no Save button: every change writes to the local `tagPreference` table
 * through a mutation that invalidates the feed, and a toast confirms it.
 */

/** Three required tags already means "recipes with all three", which is usually empty. */
const MAX_REQUIRED = 3;

const toastSaved = () =>
	Toast.show({
		type: "success",
		text1: "Preferences saved",
		visibilityTime: 1200,
	});

/** One interactive tag chip. Selected states differ by fill *and* a tick, not colour alone. */
function TagChip({
	name,
	count,
	role,
	onPress,
}: {
	name: string;
	count: number;
	role: "required" | "preferred" | null;
	onPress: () => void;
}) {
	return (
		<Pressable
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel={`${tagLabel(name)}, ${
				role ?? "not selected"
			}, ${count} recipes`}
			style={({ pressed }) => [
				styles.chip,
				role === "preferred" && styles.chipPreferred,
				role === "required" && styles.chipRequired,
				pressed && styles.chipPressed,
			]}
		>
			{role === "required" ? (
				<Check
					width={14}
					height={14}
					color={colors.white}
					pointerEvents="none"
				/>
			) : null}
			<H6
				style={[
					styles.chipText,
					role === "preferred" && styles.chipTextPreferred,
					role === "required" && styles.chipTextRequired,
				]}
			>
				{tagLabel(name)}
			</H6>
			<H6
				style={[
					styles.chipCount,
					role === "required" && styles.chipTextRequired,
				]}
			>
				{count}
			</H6>
		</Pressable>
	);
}

/** A chosen tag, with the action that moves it between the two roles and a remove. */
function ChosenRow({
	name,
	count,
	actionLabel,
	onAction,
	onRemove,
	isLast,
}: {
	name: string;
	count: number | undefined;
	actionLabel: string;
	onAction: () => void;
	onRemove: () => void;
	isLast?: boolean;
}) {
	return (
		<View style={[styles.chosenRow, !isLast && styles.chosenRowDivider]}>
			<View style={styles.chosenText}>
				<H3>{tagLabel(name)}</H3>
				{count === 0 ? (
					<H6 style={styles.muted}>
						No recipes yet — this will show nothing
					</H6>
				) : null}
			</View>
			<Pressable
				onPress={onAction}
				accessibilityRole="button"
				accessibilityLabel={`${actionLabel} ${tagLabel(name)}`}
				hitSlop={8}
			>
				<H5 style={styles.action}>{actionLabel}</H5>
			</Pressable>
			<Pressable
				onPress={onRemove}
				accessibilityRole="button"
				accessibilityLabel={`Remove ${tagLabel(name)}`}
				hitSlop={8}
			>
				<H5 style={styles.remove}>Remove</H5>
			</Pressable>
		</View>
	);
}

const DiscoveryPreferences = () => {
	const { data: tags, isLoading: tagsLoading } = usePopularTags();
	const {
		required,
		preferred,
		isLoading: preferencesLoading,
	} = useTagPreferences();
	const setRole = useSetTagRole();
	const removeTag = useRemoveTagPreference();
	const [search, setSearch] = useState("");

	const supply = useMemo(() => {
		const map = new Map<string, number>();
		for (const tag of tags ?? []) map.set(tag.name, tag.recipe_count);
		return map;
	}, [tags]);

	const chosen = useMemo(
		() => new Set([...required, ...preferred]),
		[required, preferred],
	);

	const roleOf = (name: string): "required" | "preferred" | null =>
		required.includes(name)
			? "required"
			: preferred.includes(name)
				? "preferred"
				: null;

	const term = search.trim().toLowerCase();
	const suggestions = (tags ?? []).filter((tag) => {
		// A tag with nothing behind it is a dead end, unless the user picked it
		// already - then it must stay visible so it can be removed.
		if (tag.recipe_count === 0 && !chosen.has(tag.name)) return false;
		return !term || tagLabel(tag.name).toLowerCase().includes(term);
	});
	const hiddenDeadEnds = (tags ?? []).filter(
		(tag) => tag.recipe_count === 0 && !chosen.has(tag.name),
	).length;

	const add = (name: string, role: "required" | "preferred") => {
		if (role === "required" && required.length >= MAX_REQUIRED) {
			Toast.show({
				type: "warning",
				text1: "That's enough required tags",
				text2: `Every recipe has to match all of them, so ${MAX_REQUIRED} is the limit.`,
				visibilityTime: 2500,
			});
			return;
		}
		setRole.mutate({ tag_name: name, role }, { onSuccess: toastSaved });
	};

	const move = (name: string, to: "required" | "preferred") => {
		if (to === "preferred") {
			setRole.mutate(
				{ tag_name: name, role: "preferred" },
				{ onSuccess: toastSaved },
			);
			return;
		}
		add(name, "required");
	};

	const remove = (name: string) =>
		removeTag.mutate(name, { onSuccess: toastSaved });

	const toggleSuggestion = (name: string) => {
		const role = roleOf(name);
		// Tapping an unselected tag makes it *preferred*: the softer of the two, and
		// the one that decides which sections appear. Promote it from the list above.
		if (role === null) add(name, "preferred");
		else if (role === "preferred") move(name, "required");
		else remove(name);
	};

	if (tagsLoading || preferencesLoading) {
		return (
			<View style={styles.screen}>
				<HeaderSimple title="Discovery Preferences" />
				<View style={styles.centred}>
					<ActivityIndicator />
				</View>
			</View>
		);
	}

	return (
		<View style={styles.screen}>
			<HeaderSimple title="Discovery Preferences" />
			<ScrollView
				contentContainerStyle={styles.content}
				keyboardShouldPersistTaps="handled"
			>
				<H5 style={styles.muted}>
					Required tags are promises: every recipe in your feed will
					have all of them. Preferred tags are the kinds of food you
					want sections for.
				</H5>

				<FormInputSearch
					value={search}
					onChangeText={setSearch}
					placeholder="Search tags"
				/>

				<View style={styles.section}>
					<H2>Required filters</H2>
					{required.length === 0 ? (
						<H6 style={styles.muted}>
							None yet. Recipes matching any of your preferred tags
							can appear.
						</H6>
					) : (
						<View style={styles.card}>
							{required.map((name, index) => (
								<ChosenRow
									key={name}
									name={name}
									count={supply.get(name)}
									actionLabel="Make preferred"
									onAction={() => move(name, "preferred")}
									onRemove={() => remove(name)}
									isLast={index === required.length - 1}
								/>
							))}
						</View>
					)}
				</View>

				<View style={styles.section}>
					<H2>Preferred filters</H2>
					{preferred.length === 0 ? (
						<H6 style={styles.muted}>
							None yet. Add one below to get a section for it.
						</H6>
					) : (
						<View style={styles.card}>
							{preferred.map((name, index) => (
								<ChosenRow
									key={name}
									name={name}
									count={supply.get(name)}
									actionLabel="Make required"
									onAction={() => move(name, "required")}
									onRemove={() => remove(name)}
									isLast={index === preferred.length - 1}
								/>
							))}
						</View>
					)}
				</View>

				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<H2>Suggested tags</H2>
						<H6 style={styles.muted}>
							{required.length}/{MAX_REQUIRED} required
						</H6>
					</View>
					{suggestions.length === 0 ? (
						<H6 style={styles.muted}>
							{term
								? `No tags match "${search.trim()}".`
								: "No tags available yet."}
						</H6>
					) : (
						<View style={styles.chips}>
							{suggestions.map((tag) => (
								<TagChip
									key={tag.name}
									name={tag.name}
									count={tag.recipe_count}
									role={roleOf(tag.name)}
									onPress={() =>
										toggleSuggestion(tag.name)
									}
								/>
							))}
						</View>
					)}
					{hiddenDeadEnds > 0 ? (
						<H6 style={styles.muted}>
							{hiddenDeadEnds}{" "}
							{hiddenDeadEnds === 1 ? "tag has" : "tags have"} no
							recipes yet and {hiddenDeadEnds === 1 ? "is" : "are"}{" "}
							hidden — they would give you an empty section.
						</H6>
					) : null}
				</View>

				<H6 style={styles.footnote}>
					Filtering decides what you are offered, not what you will
					enjoy — a recipe can match every tag and still not be for you.
				</H6>
			</ScrollView>
		</View>
	);
};

export default DiscoveryPreferences;

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	centred: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	content: {
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 40,
		gap: 20,
	},
	muted: {
		color: colors.medium_gray,
	},
	footnote: {
		color: colors.inactive,
	},
	section: {
		gap: 12,
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "baseline",
	},
	card: {
		backgroundColor: colors.white,
		borderRadius: 8,
		paddingHorizontal: 16,
	},
	chosenRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
		paddingVertical: 14,
	},
	chosenRowDivider: {
		borderBottomWidth: 1,
		borderColor: colors.light_gray,
	},
	chosenText: {
		flex: 1,
	},
	action: {
		color: colors.primary,
	},
	remove: {
		color: colors.error,
	},
	chips: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	// Status-pair recipe from the style guide (§7.5): light fill, dark ink, 1px
	// border, radius 25.
	chip: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderRadius: 25,
		borderWidth: 1,
		borderColor: colors.light_gray,
		backgroundColor: colors.white,
	},
	chipPreferred: {
		backgroundColor: colors.primary_bg,
		borderColor: colors.primary,
	},
	chipRequired: {
		backgroundColor: colors.primary,
		borderColor: colors.primary,
	},
	chipPressed: {
		opacity: 0.7,
	},
	chipText: {
		color: colors.medium_gray,
	},
	chipTextPreferred: {
		color: colors.primary,
	},
	chipTextRequired: {
		color: colors.white,
	},
	chipCount: {
		color: colors.inactive,
	},
});
