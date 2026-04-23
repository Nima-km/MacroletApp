/**
 * Generates test macro tracking data for a date range
 * food_id: 9 = protein (g), food_id: 10 = carbs (g), food_id: 11 = fat (g)
 */

interface MacroRange {
    min: number;
    max: number;
}

interface MacroTestDataConfig {
    startDate: Date;
    endDate: Date;
    proteinRange: MacroRange;
    carbsRange: MacroRange;
    fatRange: MacroRange;
}

interface MacroEntry {
    food_id: number;
    serving_type: string;
    servings: number;
    serving_mult: number;
    timestamp: Date;
}

/**
 * Generate a random number within a range (inclusive)
 */
function getRandomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate test macro data for a single day
 */
function generateDayMacros(
    date: Date,
    config: MacroTestDataConfig,
): MacroEntry[] {
    return [
        {
            food_id: 9, // Protein
            serving_type: "Serving",
            servings: getRandomInRange(
                config.proteinRange.min,
                config.proteinRange.max,
            ),
            serving_mult: 1,
            timestamp: new Date(date),
        },
        {
            food_id: 10, // Carbs
            serving_type: "Serving",
            servings: getRandomInRange(
                config.carbsRange.min,
                config.carbsRange.max,
            ),
            serving_mult: 1,
            timestamp: new Date(date),
        },
        {
            food_id: 11, // Fat
            serving_type: "Serving",
            servings: getRandomInRange(
                config.fatRange.min,
                config.fatRange.max,
            ),
            serving_mult: 1,
            timestamp: new Date(date),
        },
    ];
}

/**
 * Generate macro test data for a date range
 * @param config - Configuration with date range and macro ranges
 * @returns Array of macro entries for all dates in range
 */
export function generateMacroTestData(
    config: MacroTestDataConfig,
): MacroEntry[] {
    const entries: MacroEntry[] = [];
    const currentDate = new Date(config.startDate);

    while (currentDate <= config.endDate) {
        const dayEntries = generateDayMacros(currentDate, config);
        entries.push(...dayEntries);

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return entries;
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

const INTAKETESTDATA = generateMacroTestData({
    startDate: new Date("2026-03-01"),
    endDate: new Date("2026-03-31"),
    proteinRange: { min: 80, max: 160 },
    carbsRange: { min: 200, max: 300 },
    fatRange: { min: 50, max: 100 },
});

console.log("Generated test data sample:");
console.log(INTAKETESTDATA.slice(0, 9)); // First 3 days (9 entries)
console.log(`Total entries: ${INTAKETESTDATA.length}`);

// ============================================================================
// HOW TO USE IN YOUR DRIZZLE INSERT
// ============================================================================

/*
import { db } from "./db"; // Your drizzle database instance
import { macroTrackingTable } from "./schema"; // Your table definition

// Generate and insert test data
async function seedMacroData() {
  const testData = generateMacroTestData({
    startDate: new Date("2026-03-01"),
    endDate: new Date("2026-03-31"),
    proteinRange: { min: 80, max: 160 },
    carbsRange: { min: 200, max: 300 },
    fatRange: { min: 50, max: 100 },
  });

  await db.insert(macroTrackingTable).values(testData);
  console.log(`Inserted ${testData.length} macro tracking entries`);
}

seedMacroData();
*/
