import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuthStore } from '../stores/authStore';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MainTabNavigator from './MainTabNavigator';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  registerForPushNotificationsAsync, 
  sendTokenToBackend,
  setupNotificationListeners 
} from '../lib/notifications';
import * as Notifications from 'expo-notifications';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated, isLoading, fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Setup notifications when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    // Register for push notifications
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        sendTokenToBackend(token);
      }
    });

    // Setup notification listeners
    const cleanup = setupNotificationListeners(
      (notification) => {
        console.log('Notification received:', notification);
      },
      (response) => {
        console.log('Notification tapped:', response);
        const data = response.notification.request.content.data;
        // Handle navigation based on notification data
        if (data?.taskId) {
          // Navigate to task details if needed
          console.log('Navigate to task:', data.taskId);
        }
      }
    );

    return cleanup;
  }, [isAuthenticated]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

