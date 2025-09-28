import React from "react";
import { Stack } from "expo-router";
import { View, Text, ScrollView, Pressable, Switch } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useSettingsStore } from "@/stores/settingStore";
import { Theme } from "@/types/settingsTypes";
import * as Haptics from "expo-haptics";
import BackButton from "@/components/ui/BackButton";

const Settings: React.FC = () => {
    const { theme, hapticFeedback, setTheme, setHapticFeedback } = useSettingsStore();
    const { colors } = useTheme();

    const themeOptions: { label: string; value: Theme }[] = [
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" },
        { label: "System", value: "system" },
    ];

    const handleThemeChange = (newTheme: Theme) => {
        if (hapticFeedback === "enabled") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setTheme(newTheme);
    };

    const handleHapticFeedbackChange = (value: boolean) => {
        if (value) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        setHapticFeedback(value ? "enabled" : "disabled");
    };

    return (
        <View className="flex-1" style={{ backgroundColor: colors.surface.primary }}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerLeft: () => <BackButton />,
                    headerStyle: {
                        backgroundColor: colors.surface.secondary,
                    },
                    headerTintColor: colors.content.primary,
                    headerTitleStyle: {
                        color: colors.content.primary,
                    },
                }}
            />

            {/* Settings Content */}
            <ScrollView className="flex-1" style={{ backgroundColor: colors.surface.primary }}>
                <View className="p-lg">
                    {/* Theme Setting */}
                    <View className="flex-row justify-between items-center mb-lg">
                        <Text className="text-base flex-1" style={{ color: colors.content.primary }}>
                            Theme
                        </Text>
                        <View className="flex-row rounded-md overflow-hidden" style={{ backgroundColor: colors.surface.secondary }}>
                            {themeOptions.map((option) => (
                                <Pressable
                                    key={option.value}
                                    className="py-sm px-md"
                                    style={{ backgroundColor: theme === option.value ? colors.palette.primary[500] : "transparent" }}
                                    onPress={() => handleThemeChange(option.value)}
                                >
                                    <Text style={{ color: theme === option.value ? colors.pure.white : colors.content.primary }}>
                                        {option.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Haptic Feedback Setting */}
                    <View className="flex-row justify-between items-center mb-lg">
                        <Text className="text-base flex-1" style={{ color: colors.content.primary }}>
                            Haptic Feedback
                        </Text>
                        <Switch value={hapticFeedback === "enabled"} onValueChange={handleHapticFeedbackChange} />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default Settings;
