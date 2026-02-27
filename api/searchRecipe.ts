import { transformRecipesFromAPI } from "./tranformers";

export async function fetchFilteredRecipes({
    filters,
    title,
    token,
}: {
    filters: Record<string, any>;
    title: string;
    token: string;
}) {
    const query = new URLSearchParams();

    if (title?.trim()) {
        query.append("search", title.trim());
    }

    Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
            query.append(k, String(v));
        }
    });

    const response = await fetch(
        `http://192.168.1.239:8000/recipes/?${query.toString()}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );

    if (!response.ok) {
        throw new Error("Failed to fetch recipes");
    }

    const data = await response.json();
    return transformRecipesFromAPI(data);
}
