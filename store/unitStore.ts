import { getSetting, setSetting } from "@/db/queries/settings";
import { localeWeightUnit, WeightUnit } from "@/helper/units";
import { create } from "zustand";

const SETTING_KEY = "weight_unit";
const STORED = new Set<string>(["lb", "kg"]);

type UnitState = {
	unit: WeightUnit;
	/** False until the stored preference has been read; screens can render regardless. */
	hydrated: boolean;
	hydrate: (hasExistingWeights: boolean) => Promise<void>;
	setUnit: (unit: WeightUnit) => Promise<void>;
};

/**
 * The display unit for body weight.
 *
 * Storage is always grams (`helper/units.ts`); this is only what the user reads. Held in
 * a store so a change repaints every screen at once instead of needing a query
 * invalidation per surface.
 *
 * Hydration takes `hasExistingWeights` because an install that already has weigh-ins was
 * using pounds before units existed. Silently switching those people to kilograms on
 * update would rewrite their history in front of them, so the stored default is pounds
 * for existing data and the device locale only for a fresh start.
 */
export const useUnitStore = create<UnitState>((set) => ({
	unit: "lb",
	hydrated: false,
	hydrate: async (hasExistingWeights) => {
		let stored: string | null = null;
		try {
			stored = await getSetting(SETTING_KEY);
		} catch (error) {
			console.log("could not read the weight unit", error);
		}
		const unit: WeightUnit = STORED.has(stored ?? "")
			? (stored as WeightUnit)
			: hasExistingWeights
				? "lb"
				: localeWeightUnit();
		set({ unit, hydrated: true });
	},
	setUnit: async (unit) => {
		set({ unit });
		try {
			await setSetting(SETTING_KEY, unit);
		} catch (error) {
			console.log("could not save the weight unit", error);
		}
	},
}));
