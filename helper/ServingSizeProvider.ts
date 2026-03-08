import { ServingSizeWeight } from "@/constants/ServingSizeWeight";
import { ServingSizeType } from "@/types/servingSize";

interface Props {
    servingData: Omit<ServingSizeType, "food_id">[];
    serving_100g?: number;
}
export function servingSizeProvider({ servingData, serving_100g }: Props) {
    console.log("servingsizeprovider", servingData, serving_100g);
    const weight =
        serving_100g != 0
            ? ServingSizeWeight.map((item) => ({
                  serving_type: item.serving_type,
                  serving_mult: item.serving_mult / (serving_100g ?? 1),
              }))
            : [];

    return [
        ...weight,
        { serving_mult: 1, serving_type: "Serving" },
        ...servingData,
    ];
}
