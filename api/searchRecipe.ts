import { transformRecipesFromAPI } from "./tranformers";

export async function fetchFilteredRecipes(
    filters: Record<string, any>,
    title: string,
    token: string,
) {
    const query = new URLSearchParams();
    if (title && title.trim().length > 0) {
        query.append("search", title.trim());
    }
    Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) query.append(k, v.toString());
    });

    const response = await fetch(
        `http://192.168.1.239:8000/recipes/?${query.toString()}`,
        {
            headers: { Authorization: `Bearer ${token}` },
        },
    );

    if (!response.ok) throw new Error("Failed to fetch recipes");
    const data = await response.json();
    console.log("data is from fetchfilteredRecipes", data);
    return transformRecipesFromAPI(data); // map with transformRecipeFromAPI if needed
}
