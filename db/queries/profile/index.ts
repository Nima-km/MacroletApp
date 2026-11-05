import { db } from "@/db/client";
import { profile as profileTable } from "@/db/schema";
import { ACTIVITY_FACTORS, ActivityLevel, BodyProfile, Sex } from "@/helper/profile";

export type StoredProfile = Partial<BodyProfile>;

/** The single profile row, or null before anything has been saved. */
export async function getProfile(): Promise<StoredProfile | null> {
	const rows = await db.select().from(profileTable).limit(1);
	const row = rows[0];
	if (!row) return null;
	return {
		heightCm: row.height_cm ?? undefined,
		birthYear: row.birth_year ?? undefined,
		sex: row.sex === "male" || row.sex === "female" ? (row.sex as Sex) : undefined,
		activity:
			row.activity && row.activity in ACTIVITY_FACTORS
				? (row.activity as ActivityLevel)
				: undefined,
	};
}

/**
 * Write the profile, merging with whatever is already stored.
 *
 * One statement rather than one per field: the estimator reads all four together, and a
 * half-written profile from a failed second write is not a state worth being able to
 * reach. Unknown fields are left as they were.
 */
export async function saveProfile(changes: StoredProfile): Promise<void> {
	const existing = (await getProfile()) ?? {};
	const next = { ...existing, ...changes };

	await db
		.insert(profileTable)
		.values({
			id: 1,
			height_cm: next.heightCm ?? null,
			birth_year: next.birthYear ?? null,
			sex: next.sex ?? null,
			activity: next.activity ?? null,
			updated_at: new Date(),
		})
		.onConflictDoUpdate({
			target: profileTable.id,
			set: {
				height_cm: next.heightCm ?? null,
				birth_year: next.birthYear ?? null,
				sex: next.sex ?? null,
				activity: next.activity ?? null,
				updated_at: new Date(),
			},
		});
}
