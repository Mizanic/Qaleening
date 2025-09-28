import React, { useState } from "react";
import { View, Text, Pressable, TextInput, Alert } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useRouter } from "expo-router";
import { useAuth } from "@/stores/authStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LoginScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const router = useRouter();
    const { login, isLoading } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        const result = await login(email, password);
        if (result.success) {
            router.replace("/(user)/(tabs)");
        } else {
            const msg =
                result.message ||
                (result.code === "UserNotConfirmedException"
                    ? "Your account is not confirmed. Please check your email for the confirmation link."
                    : "Invalid email or password");
            Alert.alert("Error", msg);
        }
    };

    return (
        <View className="flex-1 px-lg justify-center items-center" style={{ backgroundColor: colors.surface.primary }}>
            <View className="items-center pb-xl mb-md px-1" style={{ paddingTop: insets.top }}>
                <Text className="text-4xl font-bold mb-md" style={[{ color: colors.content.primary }]}>
                    Kaleening
                </Text>
            </View>
            <Text className="text-2xl font-bold mb-md" style={[{ color: colors.content.primary }]}>
                Log in to your account
            </Text>
            <View className="flex-col w-full justify-center items-center">
                <TextInput
                    className="w-full p-md rounded-md border mb-md"
                    style={[
                        {
                            backgroundColor: colors.surface.secondary,
                            color: colors.content.primary,
                            borderColor: colors.border.secondary,
                        },
                    ]}
                    placeholder="Email"
                    placeholderTextColor={colors.content.secondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput
                    className="w-full p-md rounded-md border mb-md"
                    style={[
                        {
                            backgroundColor: colors.surface.secondary,
                            color: colors.content.primary,
                            borderColor: colors.border.secondary,
                        },
                    ]}
                    placeholder="Password"
                    placeholderTextColor={colors.content.secondary}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <Pressable
                    className="w-full p-md rounded-md items-center"
                    style={[
                        {
                            backgroundColor: isLoading ? colors.interactive.primary.disabled : colors.interactive.primary.default,
                        },
                    ]}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    <Text className="font-bold" style={[{ color: colors.content.primary }]}>
                        {isLoading ? "Logging in..." : "Log In"}
                    </Text>
                </Pressable>

                <Pressable className="w-full items-center py-md" onPress={() => router.push("/(auth)/signup")}>
                    <Text className="font-bold" style={[{ color: colors.content.primary }]}>{`Don't have an account? Sign Up`}</Text>
                </Pressable>
            </View>
        </View>
    );
};

export default LoginScreen;
