import React from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface TabBarIconProps {
  name: string;
  focused: boolean;
  color: string;
  size: number;
}

const iconMap: { [key: string]: string } = {
  Home: 'home',
  MoodLog: 'emoticon-happy',
  Analytics: 'chart-line',
  Profile: 'account',
};

export const TabBarIcon: React.FC<TabBarIconProps> = ({ name, focused, color, size }) => {
  const iconName = iconMap[name] || 'help';
  
  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      width: size + 10,
      height: size + 10,
    }}>
      <Icon
        name={iconName}
        size={focused ? size + 2 : size}
        color={color}
      />
      {/* Add a small indicator dot for active tab */}
      {focused && (
        <View style={{
          position: 'absolute',
          bottom: -2,
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: color,
        }} />
      )}
    </View>
  );
};
