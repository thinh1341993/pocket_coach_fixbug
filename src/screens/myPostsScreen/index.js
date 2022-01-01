import React, {useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Alert,
  TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors} from '../../styles'
import moment from 'moment';
import 'moment/locale/fr'
import {useSelector, useDispatch} from 'react-redux';
import {getMyPosts} from '../../redux/actions';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {getUser} from '../../redux/actions';
import { useIsFocused } from '@react-navigation/native';

import {
    Title,
    Caption,
} from 'react-native-paper';

import { Avatar, Text, NativeBaseProvider, Image, Center, Box, Stack, TextArea, Input } from "native-base";

const MyPostsScreen = ({navigation}) => {
    const [isLike, setIsLike] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const {myPostsFB} = useSelector(state => state.myPostsFBReducer);
    const dispatch = useDispatch();
    const fetchMyPostsFB = () => dispatch(getMyPosts());
    const {userFB} = useSelector(state => state.userFBReducer);
    const fetchUserFB = () => dispatch(getUser());
    const isFocused = useIsFocused();
    moment.locale('fr')

    let hour = Date.parse(new Date().getHours());
    const fetchData = () => {
      fetchMyPostsFB()
      setIsFetching(false);
    };

    const onRefresh = () => {
      hour = Date.parse(new Date().getHours());
      setIsFetching(true);
      fetchData();
    };

    useEffect(() => {
      if(isFocused){
        fetchUserFB()
      }
    },[isFocused]);

    useEffect(() => {
      if(isFocused){
        fetchMyPostsFB()
      }
    },[isFocused]);


    const showAlert = (item) =>{
        Alert.alert(
            "Editer votre post ",
            "Vous pouvez modifier ou supprimer le post",
            [
                { 
                  text: "Cancel", 
                  onPress: () => console.log("Cancel Pressed") 
                },
                {
                  text: "Modifier",
                  onPress: () => navigation.navigate('EditPostScreen',{cdata: item})
                },
                {
                  text: "Supprimer",
                  onPress: () => deletePost(item) 
                }
  
            ]
        );
    }

    const hundlLike = (item) => {
      if(item.peopleLikes)
        if (item.peopleLikes.includes(userFB.uid)){
          onDislikePress(item.id_post)
          return
        }
        onLikePress(item.id_post)
      return
    }
    const onLikePress = async (postId) => {
      let time2 = Date.parse(new Date())
      setIsLike(!isLike)
      await firestore().collection("posts")
                       .doc(postId)
                       .update({
                          likes: firestore.FieldValue.increment(1),
                          peopleLikes: firestore.FieldValue.arrayUnion(userFB.uid),
                        })
                        .then(() => {
                          console.log('post like increment!');
                          //fetchPostsFB()
                        });

          
      await firestore().collection("likes")
                        .doc(postId+userFB.uid)
                        .set({
                          pid: postId,
                          uuid: userFB.uid
                         })
                         .then(() => {
                          console.log('User like added!');
                          fetchMyPostsFB()
                        });
    }

    const onDislikePress = async (postId) => {
      let time2 = Date.parse(new Date())
      setIsLike(!isLike)
      await firestore().collection("posts")
                       .doc(postId)
                       .update({
                          likes: firestore.FieldValue.increment(-1),
                          peopleLikes: firestore.FieldValue.arrayRemove(userFB.uid),
                        })
                        .then(() => {
                          console.log('post like decrement!');
                        });


      await firestore().collection("likes")
                        .doc(postId+userFB.uid)
                        .delete()
                         .then(() => {
                           console.log('User like removed!');
                           fetchMyPostsFB()
                         });
    }

    const deletePost = async (item) => {
      await firestore().collection("posts")
      .doc(item.id_post)
      .delete()
       .then(() => {
         console.log('User like removed!');
         fetchMyPostsFB()
       });
    }

    
    const checkLike = (item) => {
      if(item.peopleLikes)
        if (item.peopleLikes.includes(userFB.uid)){
          return true
        }
      return false
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
                <Avatar
                    source={{
                    uri: item._data.avatar + '?random_number=' +hour,
                    }}
                />
                <View style={{marginLeft:15, flexDirection:'column'}}>
                    <Title style={{fontSize: 15, color: "#000"}}>{item._data.display_name}</Title>
                    <Caption style={[styles.caption,{color: "#000"}]}>{moment(item._data.time).fromNow()}</Caption>
                </View>
            </View>
            <TouchableOpacity onPress={() => showAlert(item._data)}>
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
            </TouchableOpacity>
            
            <View style={{flexDirection:'row',marginTop: 5}}>
                <TouchableOpacity style={{marginRight: 15 }} onPress={()=> hundlLike(item._data)}>
                    <Icon size={30} name={checkLike(item._data) ? "heart" :"ios-heart-outline"} style={{ color: Colors.btnSplash}} />
                    <Text style={{textAlign: 'center', color: "#000"}}>{item._data.likes} </Text>
                </TouchableOpacity>
                <TouchableOpacity transparent onPress={()=> navigation.navigate('CommentPostScreen')}>
                    <Icon size={30} name="ios-chatbubbles-outline" style={{ color: Colors.btnSplash}} />
                    <Text style={{textAlign: 'center', color: "#000"}}>{item._data.comments} </Text>
                </TouchableOpacity>
            </View>
          </Stack>
        </Box>
        </Center>
      )

    return (

      <SafeAreaView style={styles.container}>
        <NativeBaseProvider style={{marginTop: 0,marginBottom: '10', flex: 1, backgroundColor: '#fff'}}>
            <FlatList
              data={myPostsFB}
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

export default MyPostsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    //alignItems: 'center', 
    //justifyContent: 'center',
    backgroundColor: "#fff"
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },

});
