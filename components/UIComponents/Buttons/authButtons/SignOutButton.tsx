import { colors } from "@/theme";
import { useClerk } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
const SignOutButton = () => {
    // Use `useClerk()` to access the `signOut()` function
    const { signOut } = useClerk();
    const handleSignOut = async () => {
        try {
            await signOut();
            // Redirect to your desired page
            Linking.openURL(Linking.createURL("/"));
        } catch (err) {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2));
        }
    };
    return (
        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
            <Text>Sign out</Text>
        </TouchableOpacity>
    );
};

export default SignOutButton;

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.white, // Google blue
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
});
