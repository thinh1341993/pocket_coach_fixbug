import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import ChateScreen from '../../../screens/chatScreen';
import MessagesScreen from '../../../screens/messagesScreen';

const RootStack = createStackNavigator();

const RootStackChatScreen = ({navigation}) => (
    <RootStack.Navigator  screenOptions={{headerMode: 'false'}}>
        <RootStack.Screen name="MessagesScreen" component={MessagesScreen}/>
        <RootStack.Screen name="ChateScreen" component={ChateScreen}/>
    </RootStack.Navigator>
);

export default RootStackHomeScreen;