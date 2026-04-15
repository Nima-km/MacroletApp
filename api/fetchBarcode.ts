import { FoodInsert } from "@/types/food";
import axios from "axios";
export const FetchBarcode = async (barcode: any) => {
    try {
        const response = await axios.get(
            `https://world.openfoodfacts.org/api/v3/product/${barcode}.json`,
        );
        const data: any = response.data.product;
        if (data) {
            const result: FoodInsert = {
                name: data.product_name,

                carbs: data.nutriments.carbohydrates_serving ?? 0,
                fat: data.nutriments.fat_serving ?? 0,
                protein: data.nutriments.proteins_serving ?? 0,
                fiber: data.nutriments.fiber_serving ?? 0,

                barcode: barcode,
                serving_100g: data.serving_quantity,

                volume_100ml: 0,
            };
            return result;
        }
    } catch (error: any) {
        console.log("SOMETHING WENT WRONG");
    }
};
