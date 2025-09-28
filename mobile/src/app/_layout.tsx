import React from "react";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useAuth } from "@/stores/authStore";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { getRandomBytes } from "expo-crypto";
import "@/styles/global.css";

// Set up global crypto object for AWS SDK
if (typeof global.crypto === "undefined") {
    global.crypto = {
        getRandomValues: (array: any) => {
            const randomBytes = getRandomBytes(array.length);
            for (let i = 0; i < array.length; i++) {
                array[i] = randomBytes[i];
            }
            return array;
        },
    } as any;
}

const RootLayout: React.FC = () => {
    const { isAuthenticated, isAdmin } = useAuth();
    console.log("[Router] Guards", { isAuthenticated, isAdmin });

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
                <SafeAreaProvider initialMetrics={initialWindowMetrics}>
                    <StatusBar />
                    <Stack screenOptions={{ headerShown: false }}>
                        {/* Public routes - always accessible */}
                        <Stack.Screen name="index" />

                        {/* Auth routes - only accessible if NOT authenticated */}
                        <Stack.Protected guard={!isAuthenticated}>
                            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                        </Stack.Protected>

                        {/* User routes - only accessible if authenticated */}
                        <Stack.Protected guard={isAuthenticated && !isAdmin}>
                            <Stack.Screen name="(user)" options={{ headerShown: false }} />
                        </Stack.Protected>

                        {/* Admin routes - only accessible if authenticated and isAdmin */}
                        <Stack.Protected guard={isAuthenticated && isAdmin}>
                            <Stack.Screen name="(admin)" options={{ headerShown: false }} />
                        </Stack.Protected>
                    </Stack>
                </SafeAreaProvider>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
};

export default RootLayout;
