import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/lib/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.obsidian, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.matrixGreen,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Arena",
          tabBarIcon: ({ color, size }) => <Feather name="target" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="stakes"
        options={{
          title: "Stakes",
          tabBarIcon: ({ color, size }) => <Feather name="dollar-sign" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
