import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Passwords from './components/Paaswords';
import Groceries from './components/Groceries';
import Links from './components/Links';
import Coupons from './components/Coupons';
import Todos from './components/Todos';

const Tab = createBottomTabNavigator();

const activeColor = '#7885D4';
const inactiveColor = '#eee';

function MyTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Tasks"
        component={Todos}
        options={{
          tabBarLabel: `Todo's`,
          tabBarIcon: ({ size, focused }) => (
            <MaterialCommunityIcons name="checkbox-marked" color={focused ? activeColor : inactiveColor} size={focused ? 30 : size} />
          ),
        }}
      />
      <Tab.Screen
        name="Passwords"
        component={Passwords}
        options={{
          tabBarLabel: 'Passwords',
          tabBarIcon: ({ size, focused }) => (
            <MaterialCommunityIcons name="lock" color={focused ? activeColor : inactiveColor} size={focused ? 30 : size} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookmarks"
        component={Links}
        options={{
          tabBarLabel: 'Web Links',
          tabBarIcon: ({ size, focused }) => (
            <MaterialCommunityIcons name="link" color={focused ? activeColor : inactiveColor} size={focused ? 30 : size} />
          ),
        }}
      />
      <Tab.Screen
        name="Coupons List"
        component={Coupons}
        options={{
          tabBarLabel: 'Coupons',
          tabBarIcon: ({ size, focused }) => (
            <MaterialCommunityIcons name="tag" color={focused ? activeColor : inactiveColor} size={focused ? 30 : size} />
          ),
        }}
      />
      <Tab.Screen
        name="Grocery List"
        component={Groceries}
        options={{
          tabBarLabel: 'Groceries',
          tabBarIcon: ({ size, focused }) => (
            <MaterialCommunityIcons name="cart" color={focused ? activeColor : inactiveColor} size={focused ? 30 : size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <MyTabs />
    </NavigationContainer>
  );
}

