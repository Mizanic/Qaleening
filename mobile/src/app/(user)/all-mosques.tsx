import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/hooks/useTheme";

const AllMosquesDrawer: React.FC = () => {
    const { colors } = useTheme();

    return (
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.surface.primary }}>
            <Text style={{ color: colors.content.primary }}>All Mosques</Text>
        </View>
    );
};

export default AllMosquesDrawer;
