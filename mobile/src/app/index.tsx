import { Redirect } from "expo-router";
import { useAuth } from "@/stores/authStore";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "@/hooks/useTheme";

const Index: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const { colors } = useTheme();

    // Show loading spinner while checking auth status
    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.surface.primary }}>
                <ActivityIndicator size="large" color={colors.interactive.primary.default} />
            </View>
        );
    }

    // Redirect based on authentication status
    // Protected routes will handle access control, but we still need initial navigation
    if (isAuthenticated) {
        return <Redirect href="/(user)/(tabs)" />;
    } else {
        return <Redirect href="/(auth)/login" />;
    }
};

export default Index;
