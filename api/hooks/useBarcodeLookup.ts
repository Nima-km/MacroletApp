// queryClient setup (in your root component or app entry point)
import { getFoodBarcode, insertFood } from "@/db/queries/food";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

// Your custom hook
import { useQuery } from "@tanstack/react-query";
import { FetchBarcode } from "../fetchBarcode";
export const useBarcodeLookup = (barcode: string) => {
    return useQuery({
        queryKey: ["barcode", barcode],
        queryFn: async ({ queryKey }) => {
            const [, barcodeValue] = queryKey;

            // Validate barcode
            if (!barcodeValue) {
                throw new Error("No Barcode Provided");
            }

            // Try local SQLite first
            try {
                const localResult = await getFoodBarcode(barcodeValue);
                if (localResult?.[0]) {
                    console.log("Found locally:", localResult[0]);
                    return localResult;
                }
            } catch (error) {
                console.warn("Local SQLite lookup failed:", error);
                // Continue to API fallback
            }

            // Fallback to API
            try {
                const apiResult = await FetchBarcode(barcodeValue);
                if (apiResult) {
                    console.log("Found via API:", apiResult);
                    const savedResult = await insertFood(apiResult);
                    return savedResult; // ← This was missing!
                } else {
                    throw new Error("No results from API");
                }
            } catch (apiError) {
                console.warn("API lookup and cache save failed:", apiError);
                throw apiError; // ← Throw to trigger error state instead of undefined
            }
        },
        enabled: !!barcode,
        retry: 1,
        staleTime: 1000 * 60 * 5, // 5 minutes (also fixed the math here)
    });
};
