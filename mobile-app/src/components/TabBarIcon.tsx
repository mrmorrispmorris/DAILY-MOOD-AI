import React from 'react';
import { View, Text } from 'react-native';

interface TabBarIconProps {
  name: string;
  color: string;
  focused: boolean;
}

// Simple icon component using text icons (emojis)
// In production, you'd use react-native-vector-icons or similar
export const TabBarIcon: React.FC<TabBarIconProps> = ({ name, color, focused }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return '🏠';
      case 'plus-circle':
        return '➕';
      case 'bar-chart':
        return '📊';
      case 'user':
        return '👤';
      default:
        return '❓';
    }
  };

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
      }}
    >
      <Text
        style={{
          fontSize: focused ? 20 : 18,
          opacity: focused ? 1 : 0.7,
        }}
      >
        {getIcon(name)}
      </Text>
    </View>
  );
};
