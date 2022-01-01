import React, {useState, useEffect} from 'react';

import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import {View, Image, StyleSheet, TouchableOpacity} from 'react-native';
import { Colors } from "../../styles"
import Icon from 'react-native-vector-icons/FontAwesome5';
import {useSelector, useDispatch} from 'react-redux';
import {getNotificationCount} from '../../redux/actions';
import {getErrors, getUser} from '../../redux/actions';
import HomeScreen from '../../screens/homeScreen';
import ChateScreen from '../../screens/chatScreen';
import ProfileScreen from '../../screens/profileScreen';
import EditProfileScreen from '../../screens/editProfileScreen';
import AddPostScreen from '../../screens/addPostScreen';
import MessagesScreen from '../../screens/messagesScreen';
import EditPostScreen from '../../screens/editPostScreen';
import MyPostsScreen from '../../screens/myPostsScreen';
import CoachScreen from '../../screens/coachScreen';
import CoachProfileScreen from '../../screens/coachProfileScreen';
import NotificationScreen from '../../screens/notificationScreen';
import CommentPostScreen from '../../screens/commentPostScreen';
import ChatCoachScreen from '../../screens/chatCoachScreen';
import DetailPostScreen from '../../screens/detailPostScreen';
import ErrorsScreen from '../../screens/errorScreen';
import UserProfileScreen from '../../screens/userProfileScreen';
import { useIsFocused } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';


const HomeStack = createStackNavigator();
const ChatStack = createStackNavigator();
const CoachStack = createStackNavigator();
const NotificationStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const PosteStack = createStackNavigator();

const Tab = createBottomTabNavigator();

const CustomTabBarButton = ({children, onPress}) => (
    <TouchableOpacity
      style={{
        top: -25,
        justifyContent: 'center',
        alignItems: 'center',
        ...styles.shadow
      }}
      onPress={onPress}
    >  
      <View
        style={{
          width:70,
          height:70,
          borderRadius: 70
        }}
      >
        {children}
      </View>

    </TouchableOpacity>
)

export default MainTabScreen = () => {
  const {notifCount} = useSelector(state => state.getNotificationCountReducer);
  const {errorsFB} = useSelector(state => state.getErrorsReducer);
  const {userFB} = useSelector(state => state.userFBReducer);
  let [mcount, setCount] = React.useState(0)
  let [countErr, setCountErr] = React.useState(0)

  const dispatch = useDispatch();
  const getNotifCount = () => dispatch(getNotificationCount());
  const fetchMyErrorsFB = () => dispatch(getErrors());
  const fetchUserFB = () => dispatch(getUser());


  useEffect(async() => { 
    const useruid = await auth().currentUser; 
    const unsubscribe = await firestore()
                              .collection('users')
                              .doc(useruid.uid)
                              .onSnapshot(snap => {
                                if(snap){
                                //const data = snap.docs.map(doc => doc.data())
                                //console.log("unsubscribe Posts:", snap.data().notificationsCount)
                                mcount = snap.data().notificationsCount ? snap.data().notificationsCount.length : 0
                                setCount(mcount)
                                //setDataCoach(data)
                                }
                        })
    //remember to unsubscribe from your realtime listener on unmount or you will create a memory leak
    return () => unsubscribe()
  }, []);

  useEffect(async() => { 
    const unsubscribe = await firestore()
                              .collection('signalisation')
                              .onSnapshot(snap => {
                                if(snap){
                                //const data = snap.docs.map(doc => doc.data())
                                setCountErr(snap.docs.length)
                                console.log("unsubscribe Err:", snap.docs.length)
                                //countErr = snap.data().notificationsCount ? snap.data().notificationsCount.length : 0
                                //setDataCoach(data)
                                }
                        })
    //remember to unsubscribe from your realtime listener on unmount or you will create a memory leak
    return () => unsubscribe()
  }, []);

  // useEffect(() => {
  //    // getNotifCount()
  //     //console.log("Navigator  MainTabScreen notifCount:", notifCount)
    
  // },[notifCount]);

  useEffect(() => {
    if(!userFB){
      fetchUserFB()
      console.log("Navigator  MainTabScreen userFB:", userFB)
    }
  },[userFB]);
  

    return(
    
    <Tab.Navigator
      initialRouteName="HomeScreen"
      activeColor="#000"
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: { 
          position: 'absolute',
          bottom: 2,
          left:10,
          right: 10,
          elevation: 0,
          backgroundColor: Colors.backgroundSplash,
          borderRadius: 15,
          height: 50,
          ...styles.shadow
        },
      }}
    >
      <Tab.Screen
        name="HomeStackScreen"
        component={HomeStackScreen}
        options={{
          headerBackTitleVisible: false,
          tabBarVisible: false,
          tabBarLabel: 'Fil d’Actualité',
          tabBarColor: Colors.backgroundSplash,
          tabBarIcon: ({ color, focused }) => (
            <Icon name="home" style={{ color: focused ? '#fff' : '#CDD0CB' }} size={20} />
          ),
        }}
      />
      <Tab.Screen
        name="NotificationStackScreen"
        component={NotificationStackScreen}
        options={{
          headerBackTitleVisible: false,
          tabBarBadge: (mcount == 0 ) ? null :  mcount,
          tabBarLabel: 'Notification',
          tabBarColor: Colors.backgroundSplash,
          tabBarIcon: ({ color, focused }) => (
            <Icon name="bell" style={{ color: focused ? '#fff' : '#CDD0CB' }} size={20} />
          ),
        }}
      />
      <Tab.Screen
        name="ChatStackScreen"
        component={ChatStackScreen}
        
        options={{
          tabBarLabel: 'Chat',
          headerBackTitleVisible: false,
          tabBarColor: Colors.backgroundSplash,
          tabBarIcon: ({focused}) => (
            <Image
            source={require('../../assets/logo.png')}
            resizeMode="contain"
            style={{
              width: 90,
              height: 90,
              borderRadius: 1000
            }}
          />
          ),
          tabBarButton: (props) => (
            <CustomTabBarButton {...props}/>
          )          
        }}
      />
      <Tab.Screen
        name="CoachStackScreen"
        component={CoachStackScreen}
        options={{
          tabBarLabel: 'Nos Coach',
          headerBackTitleVisible: false,
          tabBarColor: Colors.backgroundSplash,
          tabBarIcon: ({ color, focused }) => (
            <Icon name="dumbbell" style={{ color: focused ? '#fff' : '#CDD0CB' }} size={20} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileStackScreen"
        component={ProfileStackScreen}
        options={{
          headerBackTitleVisible: false,
          tabBarBadge: (countErr == 0 || userFB.role != "admin") ? null :  countErr,
          tabBarLabel: 'Profil',
          tabBarColor: Colors.backgroundSplash,
          tabBarIcon: ({ color, focused }) => (
            <Icon name="id-badge" style={{ color: focused ? '#fff' : '#CDD0CB' }} size={20} />
          ),
        }}
      />
    </Tab.Navigator>
)
};

const HomeStackScreen = ({navigation}) => (
<HomeStack.Navigator screenOptions={{
        headerStyle: {
        backgroundColor: Colors.backgroundSplash,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
        fontWeight: 'bold'
        }
    }}>
      <HomeStack.Screen 
        name="HomeScreen" 
        component={HomeScreen} 
        options={{
        title:'Fil d’Actualité',
        headerBackTitleVisible: false,
      }} />
      <HomeStack.Screen
        name="MessagesScreen"
        component={MessagesScreen}
        options={{
          title:'Chat',
          headerBackTitleVisible: false,
        }}
       />
      <HomeStack.Screen
        name="CommentPostScreen"
        component={CommentPostScreen}
        options={{
          title: 'Commentaire',
          headerBackTitleVisible: false,
        }}
      />
      <HomeStack.Screen
        name="DetailPostScreen"
        component={DetailPostScreen}
        options={{
          title: 'Post',
          headerBackTitleVisible: false,
        }}
      />
      <HomeStack.Screen
        name="ChateScreen"
        component={ChateScreen}
        options={{
          title: 'Chat',
          tabBarVisible: false,
          headerBackTitleVisible: false,
        }}
      />
      <HomeStack.Screen
        name="ChatCoachScreen"
        component={ChatCoachScreen}
        options={{
          title:'Chat',
          headerBackTitleVisible: false,
        }}
      />
      <HomeStack.Screen
        name="UserProfileScreen"
        component={UserProfileScreen}
        options={{
          title:'Profil',
          headerBackTitleVisible: false,
        }}
      />
</HomeStack.Navigator>
);

const NotificationStackScreen = ({navigation}) => (
  <NotificationStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: Colors.backgroundSplash,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
    <NotificationStack.Screen
      name="NotificationScreen"
      component={NotificationScreen}
      options={{
        title:'Notification',
        headerBackTitleVisible: false,
      }}
    />
    <NotificationStack.Screen
      name="AddPostScreen"
      component={AddPostScreen}
      options={{
        title: 'Publier un post',
        headerBackTitleVisible: false,
      }}
    />
    <NotificationStack.Screen
        name="UserProfileScreen"
        component={UserProfileScreen}
        options={{
          title:'Profil',
          headerBackTitleVisible: false,
        }}
      />
  </NotificationStack.Navigator>
);


const CoachStackScreen = ({navigation}) => {

  return (
  <CoachStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: Colors.backgroundSplash,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
        fontWeight: 'bold'
        }
    }}>
    <CoachStack.Screen
      name="CoachScreen"
      component={CoachScreen}
      options={{
        title:'Conseillers partenaires',
        headerBackTitleVisible: false,
      }}
    />
    <CoachStack.Screen
      name="CoachProfileScreen"
      component={CoachProfileScreen}
      options={{
        title:'Coach',
        tabBarVisible: false,
        headerBackTitleVisible: false,
      }}
    />
    <CoachStack.Screen
      name="ChatCoachScreen"
      component={ChatCoachScreen}
      options={{
        title:'Chat',
        headerBackTitleVisible: false,      
      }}
    />
  </CoachStack.Navigator>
)};


const ChatStackScreen = ({navigation}) => {
  return (

  <ChatStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: Colors.backgroundSplash,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
        fontWeight: 'bold'
        }
    }}>
    <ChatStack.Screen
      name="MessagesScreen"
      component={MessagesScreen}
      options={{
        title: 'Chat',
        headerBackTitleVisible: false,
      }}
    />
    <ChatStack.Screen
      name="ChateScreen"
      component={ChateScreen}
      options={{
        title: 'Chat',
        tabBarVisible: false,
        headerBackTitleVisible: false,
      }}
    />
    <CoachStack.Screen
      name="ChatCoachScreen"
      component={ChatCoachScreen}
      options={{
        title:'Chat',
        headerBackTitleVisible: false,
        
      }}
    />
  </ChatStack.Navigator>
)}

const ProfileStackScreen = ({navigation}) => {
  return (

  <ProfileStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: Colors.backgroundSplash,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
        fontWeight: 'bold'
        }
    }}>
    <ProfileStack.Screen
      name="ProfileScreen"
      component={ProfileScreen}
      options={{
        title: 'Mon profil',
        headerBackTitleVisible: false,
      }}
    />
    <ProfileStack.Screen
      name="EditProfileScreen"
      component={EditProfileScreen}
      options={{
        title: 'Editer le profil',
        headerBackTitleVisible: false,
      }}
    />
    <PosteStack.Screen
      name="MyPostsScreen"
      component={MyPostsScreen}
      options={{
        title: 'Mes posts',
        headerBackTitleVisible: false,
      }}
    />
    <PosteStack.Screen
      name="EditPostScreen"
      component={EditPostScreen}
      options={{
        title: 'Edite un post',
        headerBackTitleVisible: false,
      }}
    />
    <PosteStack.Screen
      name="CommentPostScreen"
      component={CommentPostScreen}
      options={{
        title: 'Commentaire',
        headerBackTitleVisible: false,
      }}
    />
    <PosteStack.Screen
      name="ErrorsScreen"
      component={ErrorsScreen}
      options={{
        title: 'Liste de signalisation',
        headerBackTitleVisible: false,
      }}
    />

  </ProfileStack.Navigator>
)}
;

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#7F5DF0", 
    shadowOffset:{
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5
  },
});