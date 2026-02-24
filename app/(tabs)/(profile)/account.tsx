import { createUsername } from "@/api/createUsername";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import GoogleSignInButton from "@/components/UIComponents/Buttons/authButtons/GoogleSignInButton";
import SignOutButton from "@/components/UIComponents/Buttons/authButtons/SignOutButton";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { FormInput } from "@/components/UIComponents/TextInputs/FormInput";
import { H3 } from "@/components/UIComponents/Typography";
import { useAuth } from "@clerk/clerk-expo";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

const account = () => {
    const { isSignedIn, isLoaded, getToken } = useAuth();
    const [username, setUsername] = useState("");
    async function onUsername() {
        const clerk_token = await getToken();
        const response = await createUsername(username, clerk_token ?? "");
        console.log("response from create username", response);
    }
    return (
        <KeyboardAware>
            <View style={{ flex: 1 }}>
                <HeaderSimple title="User Settings" />
                <View style={{ flex: 1, padding: 20, gap: 12 }}>
                    {isSignedIn ? (
                        <View style={{ gap: 12 }}>
                            <SignOutButton />
                            <H3>Change username</H3>
                            <FormInput
                                value={username}
                                onChangeText={setUsername}
                            />
                        </View>
                    ) : (
                        <GoogleSignInButton />
                    )}
                </View>
            </View>
        </KeyboardAware>
    );
};

export default account;

const styles = StyleSheet.create({});
