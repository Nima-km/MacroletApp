import { db } from "@/db/client";
import { macroProfile } from "@/db/schema";
import { MacroCheckpoint } from "@/helper/macroProfile";
import { asc, eq } from "drizzle-orm";

export type MacroProfileRow = {
	id: number;
	name: string;
	preset: string | null;
	active: boolean;
	checkpoints: MacroCheckpoint[];
};

function parseCheckpoints(raw: string): MacroCheckpoint[] {
	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed
			.filter(
				(entry) =>
					typeof entry?.calories === "number" &&
					typeof entry?.protein === "number" &&
					typeof entry?.fat === "number",
			)
			.map((entry) => ({
				calories: entry.calories,
				protein: entry.protein,
				fat: entry.fat,
			}))
			.sort((a, b) => a.calories - b.calories);
	} catch {
		return [];
	}
}

export async function getMacroProfiles(): Promise<MacroProfileRow[]> {
	const rows = await db.select().from(macroProfile).orderBy(asc(macroProfile.id));
	return rows.map((row) => ({
		id: row.id,
		name: row.name,
		preset: row.preset,
		active: row.active === 1,
		checkpoints: parseCheckpoints(row.checkpoints),
	}));
}

/**
 * Create or update a profile. The first profile saved becomes the active one, because a
 * set of profiles with none selected produces no macros at all.
 */
export async function saveMacroProfile(input: {
	id?: number;
	name: string;
	preset?: string | null;
	checkpoints: MacroCheckpoint[];
}): Promise<number> {
	const checkpoints = [...input.checkpoints].sort((a, b) => a.calories - b.calories);
	const payload = {
		name: input.name,
		preset: input.preset ?? null,
		checkpoints: JSON.stringify(checkpoints),
		updated_at: new Date(),
	};

	if (input.id !== undefined) {
		await db.update(macroProfile).set(payload).where(eq(macroProfile.id, input.id));
		return input.id;
	}

	const existing = await db.select({ id: macroProfile.id }).from(macroProfile);
	const inserted = await db
		.insert(macroProfile)
		.values({ ...payload, active: existing.length === 0 ? 1 : 0 })
		.returning({ id: macroProfile.id });
	return inserted[0]?.id ?? 0;
}

export async function setActiveMacroProfile(id: number): Promise<void> {
	await db.update(macroProfile).set({ active: 0 });
	await db.update(macroProfile).set({ active: 1 }).where(eq(macroProfile.id, id));
}

export async function deleteMacroProfile(id: number): Promise<void> {
	const rows = await db.select().from(macroProfile).where(eq(macroProfile.id, id));
	const wasActive = rows[0]?.active === 1;
	await db.delete(macroProfile).where(eq(macroProfile.id, id));
	if (wasActive) {
		// Deleting the active profile must leave the set usable.
		const rest = await db.select({ id: macroProfile.id }).from(macroProfile).limit(1);
		if (rest[0]) await setActiveMacroProfile(rest[0].id);
	}
}
