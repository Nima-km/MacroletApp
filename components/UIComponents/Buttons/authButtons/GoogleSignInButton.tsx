import { colors } from "@/theme";
import { useSSO } from "@clerk/clerk-expo";
import { makeRedirectUri } from "expo-auth-session";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { H5_SemiBold } from "../../Typography";

export default function GoogleSignInButton() {
    const { startSSOFlow } = useSSO();

    const handleGoogleSignIn = async () => {
        try {
            const redirectUrl = makeRedirectUri({
                path: "sso-callback",
            });

            const { createdSessionId, setActive, signIn, signUp } =
                await startSSOFlow({ strategy: "oauth_google", redirectUrl });
            if (createdSessionId) {
                setActive!({ session: createdSessionId });
                console.log("ur logged in my man");
            } else {
                console.log("ur not logged in my man", createdSessionId);
                // If there is no `createdSessionId`,
                // there are missing requirements, such as MFA
                // Use the `signIn` or `signUp` returned from `startSSOFlow`
                // to handle next steps
            }
        } catch (error) {
            console.error("Google Sign-In Error:", error);
        }
    };

    return (
        <TouchableOpacity style={styles.button} onPress={handleGoogleSignIn}>
            <H5_SemiBold>Sign in with Google</H5_SemiBold>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.white, // Google blue
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
});
