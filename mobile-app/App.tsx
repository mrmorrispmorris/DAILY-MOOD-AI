import React, { useEffect, useState } from 'react';
import { StatusBar, Alert, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import MoodLogScreen from './src/screens/MoodLogScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';

// Services
import { supabase } from './src/services/SupabaseClient';
import { NotificationService } from './src/services/NotificationService';

// Components
import { TabBarIcon } from './src/components/TabBarIcon';

// Types
import { Session } from '@supabase/supabase-js';

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize notifications
    NotificationService.configure();
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Handle app state changes for push notifications
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // App came to foreground - clear badge count
        PushNotification.setApplicationIconBadgeNumber(0);
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      appStateSubscription?.remove();
    };
  }, []);

  if (loading) {
    // TODO: Add proper loading screen
    return null;
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#8B5CF6',
            tabBarInactiveTintColor: '#6B7280',
            tabBarStyle: {
              backgroundColor: '#ffffff',
              borderTopColor: '#E5E7EB',
              paddingTop: 8,
              paddingBottom: 8,
            },
            headerStyle: {
              backgroundColor: '#ffffff',
              shadowColor: '#000000',
              shadowOpacity: 0.1,
              shadowRadius: 3,
              shadowOffset: { width: 0, height: 2 },
            },
            headerTintColor: '#111827',
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Dashboard',
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon name="home" color={color} focused={focused} />
              ),
            }}
          />
          <Tab.Screen
            name="MoodLog"
            component={MoodLogScreen}
            options={{
              title: 'Log Mood',
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon name="plus-circle" color={color} focused={focused} />
              ),
            }}
          />
          <Tab.Screen
            name="Analytics"
            component={AnalyticsScreen}
            options={{
              title: 'Analytics',
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon name="bar-chart" color={color} focused={focused} />
              ),
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon name="user" color={color} focused={focused} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;


