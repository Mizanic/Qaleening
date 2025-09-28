import React from "react";
import { Drawer } from "expo-router/drawer";
import { useTheme } from "@/hooks/useTheme";
import DrawerContent from "@/components/layout/DrawerContent";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const AdminLayout: React.FC = () => {
    const { colors } = useTheme();

    return (
        <Drawer
            drawerContent={(props) => <DrawerContent {...props} variant="admin" />}
            screenOptions={{
                drawerStyle: { backgroundColor: colors.surface.primary },
                drawerActiveBackgroundColor: colors.interactive.neutral.pressed,
                headerStyle: { backgroundColor: colors.surface.secondary },
                headerTintColor: colors.content.primary,
                headerTitleStyle: { color: colors.content.primary },
                drawerInactiveTintColor: colors.content.disabled,
                drawerActiveTintColor: colors.content.primary,
            }}
        >
            <Drawer.Screen
                name="(tabs)"
                options={{
                    drawerLabel: "Admin Dashboard",
                    title: "Admin Dashboard",
                    headerShown: false,
                    drawerIcon: ({ color }) => <MaterialIcons size={28} name="dashboard" color={color} />,
                }}
            />
            {/* Hide legacy manage-requests file route to avoid duplicate menu item */}
            <Drawer.Screen name="manage-requests" options={{ drawerLabel: "Requests", title: "Requests" }} />
        </Drawer>
    );
};

export default AdminLayout;
