import { toApiError } from "./errors";

/**
 * Image uploads.
 *
 * The client never chooses where an object lands and never holds a storage key: it
 * asks the API to sign one upload for one image, PUTs the bytes to the returned URL,
 * then saves the returned *path* through the endpoint that owns the row. See
 * `Macrolet-Express/docs/IMAGE_PIPELINE.md`.
 */

export type UploadKind = "avatar" | "banner" | "recipe" | "recipe_book";

export type SignedUpload = {
	/** Where to PUT the bytes. Short-lived. */
	uploadUrl: string;
	/** Convenience only - the row stores `path`. */
	publicUrl: string;
	/** Store this. */
	path: string;
};

export const signUpload = async (
	token: string,
	input: { kind: UploadKind; contentType: string; sizeBytes: number },
): Promise<SignedUpload> => {
	const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/uploads/sign`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			kind: input.kind,
			content_type: input.contentType,
			size_bytes: input.sizeBytes,
		}),
	});
	if (!res.ok) throw await toApiError(res);
	return res.json();
};
