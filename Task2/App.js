import { registerRootComponent } from 'expo';
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Task2Feed from './Task2Feed';
import PostDetails from './PostDetails';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Task2Feed" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Task2Feed" component={Task2Feed} />
        <Stack.Screen name="PostDetails" component={PostDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

registerRootComponent(App);
