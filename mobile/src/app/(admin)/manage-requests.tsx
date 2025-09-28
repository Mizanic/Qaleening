import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export default function ManageRequests() {
    const { colors } = useTheme();
    return (
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.surface.primary }}>
            <Text style={{ color: colors.content.primary }}>Manage Cleaning Requests</Text>
        </View>
    );
}
