import React from "react";
import { Tabs } from "expo-router";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { useTheme } from "@/hooks/useTheme";
import { View } from "react-native";

const BottomTabs: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { colors } = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: colors.surface.secondary }}>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: colors.accent.green,
                    tabBarStyle: {
                        backgroundColor: colors.surface.secondary,
                        borderColor: colors.border.secondary,
                        borderWidth: 1,
                        margin: 4,
                    },
                    headerShown: true,
                    headerLeft: () => <DrawerToggleButton tintColor={colors.content.primary} />,
                    headerStyle: {
                        backgroundColor: colors.surface.secondary,
                    },
                    headerTintColor: colors.content.primary,
                    headerTitleStyle: {
                        color: colors.content.primary,
                    },
                }}
            >
                {children}
            </Tabs>
        </View>
    );
};

export default BottomTabs;
