import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useDispatch } from 'react-redux';
import { store, setHabits, setHistory } from './src/store/habitSlice';
import { getHabits, getHistoryForDate, getUserName } from './src/db/sqlite';
import { formatDate } from './src/utils/dateUtils';
import HomeScreen from './src/screens/HomeScreen';
import InsightsScreen from './src/screens/InsightsScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import AddHabitScreen from './src/screens/AddHabitScreen';
import AllHabitsScreen from './src/screens/AllHabitsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { Home as HomeIcon, LineChart, CalendarDays } from 'lucide-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#FFF8F2',
        borderTopWidth: 0,
        elevation: 0,
        height: 64,
        paddingBottom: 10,
      },
      tabBarActiveTintColor: '#FF8A00',
      tabBarInactiveTintColor: '#C4C4C4',
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}
  >
    <Tab.Screen
      name="Today"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color, size }: { color: string; size: number }) => (
          <HomeIcon color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Insights"
      component={InsightsScreen}
      options={{
        tabBarIcon: ({ color, size }: { color: string; size: number }) => (
          <LineChart color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Calendar"
      component={CalendarScreen}
      options={{
        tabBarIcon: ({ color, size }: { color: string; size: number }) => (
          <CalendarDays color={color} size={size} />
        ),
      }}
    />
  </Tab.Navigator>
);

/** Main stack: tabs + modals */
const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Main" component={MainTabs} />
    <Stack.Screen
      name="AddHabit"
      component={AddHabitScreen}
      options={{ presentation: 'modal' }}
    />
    <Stack.Screen
      name="AllHabits"
      component={AllHabitsScreen}
      options={{ presentation: 'card' }}
    />
    <Stack.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ presentation: 'card', animation: 'slide_from_right' }}
    />
  </Stack.Navigator>
);

/** Root app content — checks for onboarding */
const AppContent = () => {
  const dispatch = useDispatch();
  const [userName, setUserNameState] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Synchronous MMKV reads
    const storedName = getUserName();
    const habits = getHabits();
    const history = getHistoryForDate(formatDate(new Date()));

    dispatch(setHabits(habits));
    dispatch(setHistory(history));
    setUserNameState(storedName);
    setIsReady(true);
  }, [dispatch]);

  if (!isReady) return null; // Brief splash while reading MMKV

  // First-time user → show Onboarding
  if (!userName) {
    return (
      <OnboardingScreen
        onComplete={(name) => setUserNameState(name)}
      />
    );
  }

  // Returning user → show main app
  return (
    <NavigationContainer>
      <MainStack />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}
