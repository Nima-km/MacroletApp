import { signUpload } from "@/api/uploads";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";

/**
 * Pick an image, upload it, and return the storage path to save on the row.
 *
 * Constraints that matter:
 *
 * - **Square crop** (`aspect: [1, 1]`) so every avatar has the same shape and nothing
 *   has to guess how to fit it.
 * - **`quality: 0.8`** re-encodes the image, which also drops most EXIF - GPS in a
 *   portrait is a privacy leak. `allowsEditing`'s crop forces the same re-encode.
 * - The **server** enforces the type allowlist and the byte cap; this never trusts
 *   `asset.mimeType` or `asset.fileSize` to be present.
 * - Returns `null` when the user cancels, so callers can treat that as "no change".
 */
export async function pickAndUploadAvatar(
	token: string,
): Promise<string | null> {
	const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
	if (!permission.granted) {
		throw new Error("Photo access is needed to choose a profile picture.");
	}

	const result = await ImagePicker.launchImageLibraryAsync({
		mediaTypes: ["images"],
		allowsEditing: true,
		aspect: [1, 1],
		quality: 0.8,
	});
	if (result.canceled) return null;

	const asset = result.assets[0];
	if (!asset?.uri) {
		throw new Error("That image couldn't be read.");
	}

	const contentType =
		asset.mimeType === "image/png"
			? "image/png"
			: asset.mimeType === "image/webp"
				? "image/webp"
				: "image/jpeg";

	const signed = await signUpload(token, {
		kind: "avatar",
		contentType,
		// The server is the authority on size; a missing value is sent as 0 and
		// rejected there rather than guessed at here.
		sizeBytes: asset.fileSize ?? 0,
	});

	const uploaded = await FileSystem.uploadAsync(signed.uploadUrl, asset.uri, {
		httpMethod: "PUT",
		headers: { "Content-Type": contentType },
		uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
	});

	if (uploaded.status < 200 || uploaded.status >= 300) {
		throw new Error(`The upload didn't complete (${uploaded.status}).`);
	}

	return signed.path;
}
