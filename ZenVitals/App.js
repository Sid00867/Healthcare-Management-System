import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from './screens/HomeScreen';
import VoiceAssistantScreen from './screens/VoiceAssistantScreen';
import HealthDashboardScreen from './screens/HealthDashboardScreen';
import ProfileScreen from './screens/ProfileScreen';

// Import Data
import { PatientVitalData } from './screens/HomeScreen'
import { physicalData } from './screens/HealthDashboardScreen'
import { DoctorPatientData } from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Voice Assistant') {
                iconName = focused ? 'mic' : 'mic-outline';
              } else if (route.name === 'Health Dashboard') {
                iconName = focused ? 'fitness' : 'fitness-outline';
              } else if (route.name === 'Profile') {
                iconName = focused ? 'person' : 'person-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#6200ee',
            tabBarInactiveTintColor: 'gray',
            headerShown: false,
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Voice Assistant" component={VoiceAssistantScreen} />
          <Tab.Screen name="Health Dashboard" component={HealthDashboardScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider >
  );
}
