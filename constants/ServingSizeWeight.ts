import { ServingSizeType } from "@/types/servingSize";

export const ServingSizeWeight: Omit<ServingSizeType, "food_id">[] = [
    { serving_type: "Gram", serving_mult: 1 },
    { serving_type: "Lb", serving_mult: 453.592 },
    { serving_type: "Oz", serving_mult: 28.3495 },
];
