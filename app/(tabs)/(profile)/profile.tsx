import HeaderSimple from "@/components/navComponents/HeaderSimple";
import GoogleSignInButton from "@/components/UIComponents/Buttons/authButtons/GoogleSignInButton";
import SignOutButton from "@/components/UIComponents/Buttons/authButtons/SignOutButton";
import { SecondaryButton } from "@/components/UIComponents/Buttons/Button";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

const profile = () => {
    const router = useRouter();
    const { isSignedIn, isLoaded } = useAuth();

    return (
        <View style={{ flex: 1 }}>
            <HeaderSimple title="Profile" />
            <View style={{ flex: 1, padding: 20, gap: 8 }}>
                {isSignedIn ? <SignOutButton /> : <GoogleSignInButton />}
                <SecondaryButton
                    onPress={() => router.push("/(tabs)/(profile)/goals")}
                >
                    goals
                </SecondaryButton>
            </View>
        </View>
    );
};

export default profile;

const styles = StyleSheet.create({});
