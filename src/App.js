/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  StatusBar,
  View,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';

import {Provider as PaperProvider} from 'react-native-paper';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContext} from './components/context';
import RootStackAuthScreen from './navigations/stack/auth';
import RootNavScreen from './navigations/bottomNav';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import {Colors} from './styles';
import auth from '@react-native-firebase/auth';
import {getNotificationCount} from '../src/redux/actions';
import {useSelector, useDispatch} from 'react-redux';
const registerAppWithFCM = async () => {
  try {
    if (Platform.OS === 'ios') {
      // await messaging().registerDeviceForRemoteMessages();
      await messaging().setAutoInitEnabled(true);
    }
  } catch (e) {
    console.log('error registerAppWithFCM', e);
  }
};
registerAppWithFCM();
const App = () => {
  const [isLoading, setIsLoading] = React.useState(true);

  const initialLoginState = {
    isLoading: true,
    email: null,
    user_uid: null,
  };
  const [user_uid, setUser_uid] = useState('');
  //const notifications = firebase().notifications();
  const [count, setCount] = useState(0);

  const loginReducer = (prevState, action) => {
    switch (action.type) {
      case 'RETRIEVE_uid':
        return {
          ...prevState,
          user_uid: action.uid,
          isLoading: false,
        };
      case 'LOGIN':
        return {
          ...prevState,
          email: action.id,
          user_uid: action.uid,
          isLoading: false,
        };
      case 'LOGOUT':
        return {
          ...prevState,
          email: null,
          user_uid: null,
          isLoading: false,
        };
      case 'REGISTER':
        return {
          ...prevState,
          email: action.id,
          user_uid: action.uid,
          isLoading: false,
        };
    }
  };

  const [loginState, dispatch] = React.useReducer(
    loginReducer,
    initialLoginState,
  );

  const {notifCount} = useSelector(state => state.getNotificationCountReducer);
  const dispatch1 = useDispatch();
  const getNotifCount = () => dispatch1(getNotificationCount());

  const authContext = React.useMemo(
    () => ({
      signIn: async foundUser => {
        // setuser_uid('fgkj');
        // setIsLoading(false);
        getfcmToken();
        const user_uid = String(foundUser.user.uid);
        const email = foundUser.user.email;
        console.log('signIn', user_uid);
        setUser_uid(user_uid);
        try {
          await AsyncStorage.setItem('user_uid', user_uid);
        } catch (e) {
          console.log(e);
        }
        // console.log('user uid: ', user_uid);
        dispatch({type: 'LOGIN', id: email, uid: user_uid});
      },

      signOut: async () => {
        // setuser_uid(null);
        // setIsLoading(false);
        try {
          await messaging().deleteToken();
          await AsyncStorage.removeItem('user_uid');
          await AsyncStorage.removeItem('fcmToken');
        } catch (e) {
          console.log(e);
        }
        dispatch({type: 'LOGOUT'});
      },

      signUp: async foundUser => {
        // setuser_uid('fgkj');
        // setIsLoading(false);
        const user_uid = String(foundUser.user.uid);
        const email = foundUser.user.email;
        console.log('signUp', user_uid);

        try {
          //await  messaging().deleteToken()
          await AsyncStorage.setItem('user_uid', user_uid);
        } catch (e) {
          console.log(e);
        }
        // console.log('user uid: ', user_uid);
        dispatch({type: 'REGISTER', id: email, uid: user_uid});
      },

      getuid: () => {
        return loginState.user_uid;
      },
    }),
    [],
  );

  useEffect(() => {
    getfcmToken();
    setTimeout(async () => {
      // setIsLoading(false);
      let user_uid;
      user_uid = null;
      try {
        user_uid = await AsyncStorage.getItem('user_uid');
        setUser_uid(user_uid);
      } catch (e) {
        console.log(e);
      }
      //console.log('user uid: ', user_uid);
      dispatch({type: 'RETRIEVE_uid', uid: user_uid});
    }, 1000);
  }, []);

  /**************************************************************/

  const requestUserPermission = async () => {
    /**
     * On iOS, messaging permission must be requested by
     * the current application before messages can be
     * received or sent
     */
    const authStatus = await messaging().requestPermission();
    console.log('Authorization status(authStatus):', authStatus);
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  };

  const getfcmToken = async () => {
    if (requestUserPermission()) {
      /**
       * Returns an FCM token for this device
       */
      //await  messaging().deleteToken()
      const useruid = await auth().currentUser;
      messaging()
        .getToken()
        .then(fcmToken => {
          console.log('APP FCM Token -> ', fcmToken);

          //alert('APP FCM Token -> '+fcmToken, [{text: 'ok'} ]);
          firestore()
            .collection('users')
            .doc(useruid.uid)
            .update({
              notification_token: fcmToken,
            })
            .then(() => {
              console.log('APP FCM Token -> ', fcmToken);
            });
        });
    } else console.log('Not Authorization status:', authStatus);
  };

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    incriseNotificationCount(remoteMessage);
    console.log('Message handled in the background!', remoteMessage);
  });

  const unsubscribe = messaging().onMessage(async remoteMessage => {
    //alert('A new FCM message arrived!');
    //console.log('remoteMessage:',JSON.stringify(remoteMessage))
    incriseNotificationCount(remoteMessage);
    console.log('unsubscribe:', notifCount);
    console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
  });

  const incriseNotificationCount = async notif => {
    try {
      console.log('incriseNotificationCount', notif);
      const useruid = await auth().currentUser;
      await firestore()
        .collection('users')
        .doc(useruid.uid)
        .collection('notification')
        .doc(notif.messageId)
        .set(notif)
        .then(() => {
          firestore()
            .collection('users')
            .doc(useruid.uid)
            .update({
              notificationsCount: firestore.FieldValue.arrayUnion(
                notif.messageId,
              ),
            })
            .then(() => {
              getNotifCount();
            });
        });
    } catch (error) {
      // Add custom logic to handle errors
      console.log('error', error);
    }
  };

  /**************************************************************/

  if (loginState.isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <StatusBar
        backgroundColor={Colors.backgroundSplash}
        barStyle="light-content"
      />
      <AuthContext.Provider value={authContext}>
        <NavigationContainer>
          {loginState.user_uid ? <RootNavScreen /> : <RootStackAuthScreen />}
        </NavigationContainer>
      </AuthContext.Provider>

      {/* <AuthContext.Provider value={authContext}>
            <NavigationContainer>
              <RootNavScreen />
            </NavigationContainer>
          </AuthContext.Provider> */}
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
