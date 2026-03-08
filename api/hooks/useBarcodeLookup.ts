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

            // Try local SQLite first
            try {
                if (barcodeValue != "") {
                    const localResult = await getFoodBarcode(barcodeValue);
                    console.log("localResult", localResult[0]);
                    if (localResult[0]) {
                        console.log("localResult", localResult[0]);
                        return localResult;
                    }
                } else throw new Error("No Barcode Provided");
            } catch (error) {
                console.warn("Local SQLite lookup failed:", error);
                // Continue to API fallback
            }
            // Fallback to API
            const apiResult = await FetchBarcode(barcodeValue);
            try {
                console.log("apiResult", apiResult);
                if (apiResult) {
                    const localResult = insertFood(apiResult);
                    return localResult;
                } else {
                    throw new Error("Insert Failed");
                }
            } catch (saveError) {
                console.warn("Cache save failed:", saveError);
                // Continue anyway - user still gets the result
            }
        },

        enabled: !!barcode, // Only run query if barcode exists
        retry: 1, // Adjust retry logic as needed
        staleTime: 1000 * 10 * 5, // 5 minutes
    });
};
