import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../../../screens/homeScreen';
import ChateScreen from '../../../screens/chatScreen';
import ProfileScreen from '../../../screens/profileScreen';
import EditProfileScreen from '../../../screens/editProfileScreen';
import AddPostScreen from '../../../screens/addPostScreen';
import MessagesScreen from '../../../screens/messagesScreen';
import EditPostScreen from '../../../screens/editPostScreen';
import MyPostsScreen from '../../../screens/myPostsScreen';
import CoachScreen from '../../../screens/coachScreen';
import CoachProfileScreen from '../../../screens/coachProfileScreen';

const RootStack = createStackNavigator();

const RootStackHomeScreen = ({navigation}) => (
    <RootStack.Navigator  screenOptions={{headerMode: 'false'}}>
        <RootStack.Screen name="HomeScreen" component={HomeScreen}/>
        <RootStack.Screen name="ChateScreen" component={ChateScreen}/>
        <RootStack.Screen name="ProfileScreen" component={ProfileScreen}/>
        <RootStack.Screen name="EditProfileScreen" component={EditProfileScreen}/>
        <RootStack.Screen name="AddPostScreen" component={AddPostScreen}/>
        <RootStack.Screen name="MessagesScreen" component={MessagesScreen}/>
        <RootStack.Screen name="EditPostScreen" component={EditPostScreen}/>
        <RootStack.Screen name="MyPostsScreen" component={MyPostsScreen}/>
        <RootStack.Screen name="CoachScreen" component={CoachScreen}/>
        <RootStack.Screen name="CoachProfileScreen" component={CoachProfileScreen}/>
    </RootStack.Navigator>
);

export default RootStackHomeScreen;