import React from "react";
import { View } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import UserDashboard from "@/screens/Dashboard/user-dashboard";
import AdminDashboard from "@/screens/Dashboard/admin-dashboard";
import { useAuth } from "@/stores/authStore";

const Dashboard: React.FC = () => {
    const { colors } = useTheme();
    const { isAdmin } = useAuth();

    return (
        <View className="flex-1" style={{ backgroundColor: colors.surface.primary }}>
            {isAdmin ? <AdminDashboard /> : <UserDashboard />}
        </View>
    );
};

export default Dashboard;
