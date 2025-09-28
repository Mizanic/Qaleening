import React from "react";
import { Tabs } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import BottomTabs from "@/components/layout/BottomTabs";

const AdminTabs: React.FC = () => {
    return (
        <BottomTabs>
            <Tabs.Screen
                name="index"
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({ color }) => <MaterialIcons size={28} name="dashboard" color={color} />,
                }}
            />
            <Tabs.Screen
                name="mosques"
                options={{
                    title: "Mosques",
                    tabBarIcon: ({ color }) => <MaterialIcons size={28} name="mosque" color={color} />,
                }}
            />
        </BottomTabs>
    );
};

export default AdminTabs;
