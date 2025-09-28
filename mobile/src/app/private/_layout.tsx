import React from "react";
import { Drawer } from "expo-router/drawer";
import { useTheme } from "@/hooks/useTheme";
import DrawerContent from "@/components/layout/DrawerContent";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const PrivateLayout: React.FC = () => {
    const { colors } = useTheme();

    return (
        <Drawer
            drawerContent={(props) => <DrawerContent {...props} />}
            screenOptions={{
                drawerStyle: {
                    backgroundColor: colors.surface.primary,
                },
                drawerActiveBackgroundColor: colors.interactive.neutral.pressed,
                headerStyle: {
                    backgroundColor: colors.surface.secondary,
                },
                headerTintColor: colors.content.primary,
                headerTitleStyle: {
                    color: colors.content.primary,
                },
                drawerInactiveTintColor: colors.content.disabled,
                drawerActiveTintColor: colors.content.primary,
            }}
        >
            <Drawer.Screen
                name="(tabs)"
                options={{
                    drawerLabel: "Dashboard",
                    title: "Dashboard",
                    headerShown: false,
                    drawerIcon: ({ color }) => <MaterialIcons size={28} name="dashboard" color={color} />,
                }}
            />
            <Drawer.Screen
                name="my-profile"
                options={{
                    drawerItemStyle: { display: "none" },
                    title: "My Profile",
                    headerShown: false,
                }}
            />
            <Drawer.Screen
                name="my-mosques"
                options={{
                    drawerLabel: "My Mosques",
                    title: "My Mosques",
                    headerShown: false,
                    drawerIcon: ({ color }) => <MaterialIcons size={28} name="favorite" color={color} />,
                }}
            />
            <Drawer.Screen
                name="all-mosques"
                options={{
                    drawerLabel: "All Mosques",
                    title: "All Mosques",
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

export default PrivateLayout;
