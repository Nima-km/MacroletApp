import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { nanoid } from "nanoid/non-secure";

const IMAGE_DIR = FileSystem.documentDirectory + "images/";
async function ensurePermissions() {
    const media = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const camera = await ImagePicker.requestCameraPermissionsAsync();

    if (!media.granted || !camera.granted) {
        throw new Error("Image permissions not granted");
    }
}

async function persistImage(tempUri: string) {
    await FileSystem.makeDirectoryAsync(IMAGE_DIR, {
        intermediates: true,
    });

    const filename = `${nanoid()}.jpg`;
    const newUri = IMAGE_DIR + filename;

    await FileSystem.copyAsync({
        from: tempUri,
        to: newUri,
    });

    return newUri;
}

export function useImageManager() {
    const pickFromGallery = async () => {
        await ensurePermissions();

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (result.canceled) return null;
        return result.assets[0].uri;
    };

    const takePhoto = async () => {
        await ensurePermissions();

        const result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
        });

        if (result.canceled) return null;
        return result.assets[0].uri;
    };

    const processImage = async (tempUri: string | null) => {
        if (!tempUri) return null;

        const persistedUri = await persistImage(tempUri);

        return {
            id: nanoid(),
            uri: persistedUri,
        };
    };

    const addImageFromGallery = async () => {
        const uri = await pickFromGallery();
        return await processImage(uri);
    };

    const addImageFromCamera = async () => {
        const uri = await takePhoto();
        return await processImage(uri);
    };

    const deleteImage = async (uri: string) => {
        await FileSystem.deleteAsync(uri, { idempotent: true });
    };

    return {
        addImageFromGallery,
        addImageFromCamera,
        deleteImage,
    };
}
