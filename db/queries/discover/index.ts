import { db } from "@/db/client";
import { tagPreference } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * The user's Discovery tags.
 *
 * Stored as tag *slugs* (`high-protein`), because that is what the API matches
 * against `tag.name`. Display labels are a client concern (`tagLabel`).
 */
export type TagRole = "required" | "preferred";

export const getTagPreferences = () => db.select().from(tagPreference);

/**
 * Add a tag, or move it between roles.
 *
 * An upsert rather than read-then-write, so promoting a tag is a single statement
 * and two quick taps cannot interleave into a duplicate.
 */
export const setTagPreference = async (tag_name: string, role: TagRole) =>
	db
		.insert(tagPreference)
		.values({ tag_name, role })
		.onConflictDoUpdate({ target: tagPreference.tag_name, set: { role } });

export const removeTagPreference = async (tag_name: string) =>
	db.delete(tagPreference).where(eq(tagPreference.tag_name, tag_name));

export const clearTagPreferences = async () => db.delete(tagPreference);
