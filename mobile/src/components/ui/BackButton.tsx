import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";

interface BackButtonProps {
    fallbackRoute?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ fallbackRoute = "(user)/(tabs)" }) => {
    const { colors } = useTheme();

    const handleBack = () => {
        // For drawer screens, directly navigate to fallback instead of using router.back()
        // This prevents navigation history issues with drawer navigation
        router.replace(fallbackRoute as any);
    };

    return (
        <TouchableOpacity onPress={handleBack} style={{ marginLeft: 8, padding: 8 }}>
            <Ionicons name="arrow-back" size={24} color={colors.content.primary} />
        </TouchableOpacity>
    );
};

export default BackButton;
