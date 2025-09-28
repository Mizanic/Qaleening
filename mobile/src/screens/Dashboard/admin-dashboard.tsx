import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/hooks/useTheme";

const AdminDashboard: React.FC = () => {
    const { colors } = useTheme();

    return (
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.surface.primary }}>
            <Text style={{ color: colors.content.primary }}>Admin Dashboard</Text>
        </View>
    );
};

export default AdminDashboard;
