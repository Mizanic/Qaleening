import React from "react";
import { Drawer } from "expo-router/drawer";
import { useTheme } from "@/hooks/useTheme";
import DrawerContent from "@/components/layout/DrawerContent";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const AdminLayout: React.FC = () => {
    const { colors } = useTheme();

    return (
        <Drawer
            drawerContent={(props) => <DrawerContent {...props} />}
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
                name="dashboard"
                options={{
                    drawerLabel: "Admin Dashboard",
                    title: "Admin Dashboard",
                    headerShown: false,
                    drawerIcon: ({ color }) => <MaterialIcons size={28} name="dashboard" color={color} />,
                }}
            />
            <Drawer.Screen
                name="manage-requests"
                options={{
                    drawerLabel: "Requests",
                    title: "Cleaning Requests",
                    headerShown: false,
                    drawerIcon: ({ color }) => <MaterialIcons size={28} name="assignment" color={color} />,
                }}
            />
            <Drawer.Screen
                name="mosques"
                options={{
                    drawerLabel: "Mosques",
                    title: "Mosques",
                    headerShown: false,
                    drawerIcon: ({ color }) => <MaterialIcons size={28} name="mosque" color={color} />,
                }}
            />
            <Drawer.Screen
                name="settings"
                options={{
                    drawerLabel: "Settings",
                    title: "Settings",
                    drawerIcon: ({ color }) => <MaterialIcons size={28} name="settings" color={color} />,
                }}
            />
        </Drawer>
    );
};

export default AdminLayout;
