import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import SplashScreen from '../../../screens/splashScreen';
import SignInScreen from '../../../screens/signInScreen';
import SignUpScreen from '../../../screens/signUpScreen';
import ForgotPasswordScreen from '../../../screens/forgotPasswordScreen';


const RootStack = createStackNavigator();

const RootStackAuthScreen = ({navigation}) => (
    <RootStack.Navigator screenOptions={{headerMode: 'false'}}>
        <RootStack.Screen name="SplashScreen" component={SplashScreen}/>
        <RootStack.Screen name="SignInScreen" component={SignInScreen}/>
        <RootStack.Screen name="SignUpScreen" component={SignUpScreen}/>
        <RootStack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen}/>

    </RootStack.Navigator>
);

export default RootStackAuthScreen;