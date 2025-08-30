import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Core Screens
import HomeScreen from './screens/HomeScreen';
import MoodLogScreen from './screens/MoodLogScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import ProfileScreen from './screens/ProfileScreen';

// Services
import { AuthProvider } from './context/AuthContext';
import { SupabaseProvider } from './context/SupabaseContext';
import { NotificationService } from './services/NotificationService';
import { TabBarIcon } from './components/TabBarIcon';

const Tab = createBottomTabNavigator();

export default function App() {
  useEffect(() => {
    // Initialize notification service
    NotificationService.initialize();
    
    // Request notification permissions
    NotificationService.requestPermissions();
  }, []);

  return (
    <SafeAreaProvider>
      <SupabaseProvider>
        <AuthProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#8B5CF6" />
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => (
                  <TabBarIcon
                    name={route.name}
                    focused={focused}
                    color={color}
                    size={size}
                  />
                ),
                tabBarActiveTintColor: '#8B5CF6',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarStyle: {
                  backgroundColor: 'white',
                  borderTopWidth: 1,
                  borderTopColor: '#E5E7EB',
                  paddingBottom: 5,
                  height: 60,
                },
                headerShown: false,
              })}
            >
              <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                  title: 'Home',
                }}
              />
              <Tab.Screen
                name="MoodLog"
                component={MoodLogScreen}
                options={{
                  title: 'Log Mood',
                }}
              />
              <Tab.Screen
                name="Analytics"
                component={AnalyticsScreen}
                options={{
                  title: 'Analytics',
                }}
              />
              <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                  title: 'Profile',
                }}
              />
            </Tab.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </SupabaseProvider>
    </SafeAreaProvider>
  );
}
