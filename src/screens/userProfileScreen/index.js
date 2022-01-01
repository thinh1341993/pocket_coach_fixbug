import React, {useEffect, useState} from 'react';
import {View, SafeAreaView,ScrollView, StyleSheet, TouchableOpacity, TextInput,FlatList} from 'react-native';
import {
  Avatar,
  Title,
  Caption,
  Text,
  TouchableRipple,
} from 'react-native-paper';

import Icon from 'react-native-vector-icons/Ionicons';
import {Colors} from '../../styles'

import {useSelector, useDispatch} from 'react-redux';
import {getUser} from '../../redux/actions';
import { AuthContext } from '../../components/context';
import { useIsFocused } from '@react-navigation/native';
import moment from 'moment';
import 'moment/locale/fr'
import Modal from "react-native-modal";
import { justifyContent } from 'styled-system';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as Animatable from 'react-native-animatable';
import Feather from 'react-native-vector-icons/Feather';
import firestore from '@react-native-firebase/firestore';
import { Avatar as NBAvatar, NativeBaseProvider, Image, Center, Box, Stack, TextArea, Input } from "native-base";

const tmpuri = "https://cdn.pixabay.com/photo/2017/11/10/05/24/add-2935429_1280.png"

const UserProfileScreen = ({route, navigation}) => {
  const { uid } = route.params;
  const [user, setUser] = useState({}); 
  const [postsFB, setPosts] = useState({});
  const {userFB} = useSelector(state => state.userFBReducer);
  const dispatch = useDispatch();
  const fetchUserFB = () => dispatch(getUser());
  const isFocused = useIsFocused();
  const [isFetching, setIsFetching] = useState(false);
  let hour = Date.parse(new Date().getHours());
  moment.locale('fr')

  useEffect(() => {
    if(isFocused){
      //console.log(uid)
      get_User();
    }
    }, [isFocused]);

  useEffect(() => {
        if(isFocused){
          fetchUserFB()
        }
      },[isFocused]);

  useEffect(() => {
        if(isFocused){
          //console.log(uid)
          getPosts();
        }
    }, [isFocused]);

    const fetchData = () => {
        getPosts()
        setIsFetching(false);
      };
  
    const onRefresh = () => {
        hour = Date.parse(new Date().getHours());
        setIsFetching(true);
        fetchData();
      };

    const get_User = async () => {
        if(uid)
        firestore()
        .collection("users")
        .doc(uid)
        .get()
        .then((res) => {
                setUser(res._data)
        });
    }

    const getPosts = async () => {
        if(uid)
        firestore()
        .collection("posts")
        .where('uid', '==' , uid)
        .orderBy('time', 'desc')
        .get()
        .then((res) => {
            //console.log(res.docs[0])
            setPosts(res.docs)
        });
    }

  const getUri = () => {
    if (user)
      return user.photo
    return tmpuri
  }

  const showCard =  ({item})=>   
  (
    <Center>
    <Box
    bg="white"
    shadow={1}
    rounded="lg"
    style={{backgroundColor: Colors.cardBg, marginBottom: 10, width: '95%'}}
    >
      <Stack space={4} style={{ padding: 15}} >
        <View style={{flexDirection:'row',marginTop: 5}}>
            <NBAvatar
                source={{
                uri: item._data.avatar + '?random_number=' +hour,
                }}
            />
            <View style={{marginLeft:15, flexDirection:'column'}}>
                <Title style={{fontSize: 15, color: "#000"}}>{item._data.display_name}</Title>
                <Caption style={[styles.caption,{color: "#000"}]}>{moment(item._data.time).fromNow()}</Caption>
            </View>
        </View>
          <View style={{ alignItems: "center", justifyContent: "center", flex: 1}}>
            <Image source={{uri: item._data.photo_uri}} 
              alt="image base" 
              resizeMode="center" 
              height={300}
              width={400} 
              roundedTop="md"
            />
          </View>

          <Text lineHeight={[5, 5, 7]} noOfLines={[4, 4, 2]} color="#000">
          {item._data.content}
          </Text>
      </Stack>
    </Box>
    </Center>
  )
  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.userInfoSection}>
          <View style={{flexDirection: 'row', marginTop: 15}}>
            <Avatar.Image 
              source={{
                uri: getUri(),
              }}
              size={80}
            />
            <View style={{marginLeft: 20}}>
              <Title style={[styles.title, {
                marginTop:15,
                marginBottom: 5,
              }]}>{user.firstname} {user.lastname}</Title>
              <Caption style={styles.caption}>@{user.firstname}_{user.lastname}</Caption>
            </View>
          </View>
        </View>
        <View style={styles.userInfoSection}>
          <View style={styles.row}>
            <Icon name="mail-outline" color={Colors.btnSplash} size={20}/>
            <Text style={{color:"#777777", marginLeft: 20}}>{user.email}</Text>
          </View>
        </View>
      
        <View style={styles.infoBoxWrapper}>
            <View style={[styles.infoBox, {
              borderRightColor: '#dddddd',
              borderRightWidth: 1
            }]}>
              <Text style={{fontWeight: "bold", fontSize: 16, color: Colors.btnSplash, marginLeft: 30}}>Bio:</Text>
              <Text style={{fontSize: 16, color: "#000", marginLeft: 30}}>{user.bio}</Text>
            </View>

        </View>
        
        <NativeBaseProvider style={{marginTop: 0,marginBottom: '10', flex: 1, backgroundColor: '#fff'}}>
            <FlatList
                data={postsFB}
                style={{marginTop:30, marginBottom: '20%', marginHorizontal: 15}}
                renderItem={showCard}
                keyExtractor={(item) => item._data.id_post}
                onRefresh={() => onRefresh()}
                refreshing={isFetching}
                ListHeaderComponent={null}
                ListFooterComponent={null}
                showsVerticalScrollIndicator={false}
                />
        </NativeBaseProvider>
       
      </SafeAreaView>
    );
  };
  
  export default UserProfileScreen;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff'
    },
    commandButton: {
      padding: 15,
      borderRadius: 10,
      backgroundColor: Colors.btnSplash,
      alignItems: 'center',
      marginTop: 0,
      marginHorizontal: 15
    },
    userInfoSection: {
      paddingHorizontal: 30,
      marginBottom: 25,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    caption: {
      fontSize: 14,
      lineHeight: 14,
      fontWeight: '500',
    },
    row: {
      flexDirection: 'row',
      marginBottom: 10,
    },
    infoBoxWrapper: {
      borderBottomColor: '#dddddd',
      borderBottomWidth: 1,
      borderTopColor: '#dddddd',
      borderTopWidth: 1,
      flexDirection: 'row',
      // height: 100,
      paddingVertical: 10,
      backgroundColor: Colors.cardBg,
    },
    infoBox: {
      width: '100%',
      // alignItems: 'center',
      // justifyContent: 'center',
    },
    menuWrapper: {
      marginTop: 10,
    },
    menuItem: {
      flexDirection: 'row',
      paddingVertical: 15,
      paddingHorizontal: 30,
    },
    menuItemText: {
      color: '#777777',
      marginLeft: 20,
      fontWeight: '600',
      fontSize: 16,
      lineHeight: 26,
    },
    text_footer: {
        color: '#05375a',
        fontSize: 18
    },
    action: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 5
    },
    textInput: {
        marginTop: Platform.OS === 'ios' ? 0 : -12,
        paddingLeft: 10,
        color: '#05375a',
        width: '60%'
    },
    panelButtonTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: 'white',
    },
  });