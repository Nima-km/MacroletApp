export const fetchApprovedTags = async (): Promise<string[]> => {
	const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/tag`);
	if (!res.ok) throw new Error("Failed to fetch tags");
	return res.json();
};
