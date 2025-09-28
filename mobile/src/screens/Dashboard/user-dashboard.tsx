import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/hooks/useTheme";

const UserDashboard: React.FC = () => {
    const { colors } = useTheme();

    return (
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.surface.primary }}>
            <Text style={{ color: colors.content.primary }}>User Dashboard</Text>
        </View>
    );
};

export default UserDashboard;
