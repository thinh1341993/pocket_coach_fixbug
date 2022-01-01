import React, {useState, useEffect} from 'react';
import { View, Text,  LogBox, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView, Dimensions, SafeAreaView } from 'react-native';
import {
  Card,
  UserInfo,
  UserImgWrapper,
  UserImg,
  UserInfoText,
  UserName,
  PostTime,
  MessageText,
  TextSection,
} from '../../styles/MessageStyles';
import {Colors} from '../../styles'
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import 'moment/locale/fr'
import {useSelector, useDispatch} from 'react-redux';
import {getUser} from '../../redux/actions';
import { useIsFocused } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Modal from "react-native-modal";
import { TextInput as TextInputPaper } from 'react-native-paper';
import { GOOGLE_FCM_KEY } from '../../constants';
import axios from "axios";
import FastImage from 'react-native-fast-image'

import { Avatar, NativeBaseProvider, Image, Center, Box, Stack} from "native-base";
import {
    Title,
    Caption,
} from 'react-native-paper';

const DetailPostScreen = ({route,navigation}) => {
    const { pid } = route.params;
    const {userFB} = useSelector(state => state.userFBReducer);
    let rndm = Date.parse(new Date().getHours);
    const [isLike, setIsLike] = useState(false);
    let [postFB, setpostFB] = React.useState({})
    let [comments, setComments] = React.useState({})
    const [dataComment, setDataComment] = useState([]);
    let [dataItem, setDataItem] = React.useState({})
    const [isModalReplyMsg, setModalReplyMsgVisible] = useState(false);
    moment.locale('fr')
    
    const dispatch = useDispatch();
    const fetchUserFB = () => dispatch(getUser());
    const isFocused = useIsFocused();
    
    const [dataMsg, setDataMsg] = React.useState({
      replyMsg: '',
      check_textInputReplyMsg: false,
    });

    useEffect(() => {
      if(!userFB){
        fetchUserFB()
        console.log("fetchUserFB", userFB)
      }
    },[userFB]);

    useEffect(async() => { 
      const unsubscribe = await firestore()
                                .collection('posts')
                                .doc(pid)
                                .onSnapshot(snap => {
                                  if(snap){
                                  const data = snap.data()
                                  console.log("unsubscribe Posts:", data)
                                  setpostFB(data)
                                  }
                          })
      //remember to unsubscribe from your realtime listener on unmount or you will create a memory leak
      return () => unsubscribe()
    }, []);

    useEffect(async() => { 
      const unsubscribe = await firestore()
                                .collection('comments')
                                .where('pid', '==' , pid)
                                .orderBy('time', 'desc')
                                .onSnapshot(snap => {
                                  if(snap){
                                    const data = snap.docs.map(doc => doc.data())
                                    //console.log("unsubscribe Comments:", data)
                                    setComments(data)
                                  //setpostFB(data)
                                  }
                          })
      //remember to unsubscribe from your realtime listener on unmount or you will create a memory leak
      return () => unsubscribe()
    }, []);


    const toggleModalReplyMsg = (item) => {
      console.log(item)
      setDataItem(item)
      setModalReplyMsgVisible(!isModalReplyMsg);
      
    };

    const textInputReplyMsg = (val) => {
      if( val.length !== 0) {
        setDataMsg({
              ...dataMsg,
              replyMsg: val,
              check_textInputReplyMsg: true
          });
      } else {
        setDataMsg({
              ...dataMsg,
              replyMsg: val,
              check_textInputReplyMsg: false
          });
      }
    }

    const checkLike = (item) => {
        if (!item) false
        if(item.peopleLikes)
          if (item.peopleLikes.includes(userFB.uid)){
            return true
          }
        return false
    }
    
    const sendNotificationFirebaseAPI = async (puserid, id_post) => {
        let time2 = Date.parse(new Date())
        if (userFB.uid != puserid ) {
          console.log('sendNotificationFirebaseAPI', true)
          let post_user; 
          await firestore()
                .collection('users')
                .where('uid', '==' , puserid)
                .get()
                .then((p_user) => {
                  post_user = p_user;
                })
          
          if(post_user){
            const headers = {
              'Authorization': `key=${GOOGLE_FCM_KEY}`,
              'Content-Type': 'application/json',
            }
        
            const bodyToSend = JSON.stringify({
              to: post_user._docs[0]._data.notification_token,
              notification: {
                title: "Mon Conseiller Fitness",
                body: userFB.firstname +" "+userFB.lastname + " a aimé votre post.",
                imageUrl: userFB.photo,
                sound : "default",
              },
              data: {
                avatar: userFB.photo,
                type: "like",
                displayName: userFB.firstname +" "+ userFB.lastname ,
                time: time2,
                sender_id: userFB.uid,
                seen: false,
                pid: id_post,
              }
            })
            try {
              await axios({
                method: 'post',
                url: 'https://fcm.googleapis.com/fcm/send',
                headers: headers,
                data: bodyToSend,
              }).then((response) => {
                //console.log("response", response)
                fetchPostFB(pid)
              })
            } catch (err) {
                console.log('sendNotificationFirebaseAPI err:', err)
              return { err }
            }
          }
  
        }else
          console.log('sendNotificationFirebaseAPI', false)
  
      }
    const onLikePress = async (postId, puserid, notification_token) => {
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
                            firestore().collection("likes")
                                        .doc(postId+userFB.uid)
                                        .set({
                                            pid: postId,
                                            uuid: userFB.uid
                                        })
                                        .then(() => {
                                            console.log('User like added!');
                                            sendNotificationFirebaseAPI(puserid, postId)
                                            fetchPostFB(pid)
                                        });
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
                            firestore().collection("likes")
                                        .doc(postId+userFB.uid)
                                        .delete()
                                        .then(() => {
                                            console.log('User like removed!');
                                            fetchPostFB(pid)
                                        });
                            });
    }
  
    const hundlLike = (item) => {
        if(item.peopleLikes)
          if (item.peopleLikes.includes(userFB.uid)){
            onDislikePress(item.id_post)
            return
          }
          onLikePress(item.id_post, item.uid, item.notification_token)
        return
    }

    const sendReply = async () => {
      let time = Date.parse(new Date())
      await firestore().collection("posts")
                       .doc(postFB.id_post)
                       .update({
                          comments: firestore.FieldValue.increment(1),
                        })
                        .then(() => {
                          console.log('post comment increment!');
                          console.log("dataMsg", dataItem);
                          firestore()
                          .collection("comments")
                          .doc(postFB.id_post+userFB.uid+time)
                          .set({
                            pid: postFB.id_post,
                            uuid: userFB.uid,
                            avatar: userFB.photo,
                            time: time,
                            display_name: userFB.firstname +" " +userFB.lastname,
                            content: "@"+dataItem.display_name + " "+dataMsg.replyMsg.trim(),
                            commentid: postFB.id_post+userFB.uid+time,
                            to: dataItem.uuid,
                            forcommentid: dataItem.commentid,
                          })
                          .then(() => {
                            console.log('User comment added!');
                            setModalReplyMsgVisible(false)
                            //fetchCommentFB(cdata.id_post)
                            sendNotificationToFirebaseAPI()
                            //fetchPostsFB()

                          });
                          
                        });          
    }

    const sendNotificationToFirebaseAPI = async () => {
      let time2 = Date.parse(new Date())
        console.log('sendNotificationFirebaseAPI', true)
        let post_user;
        if ( dataItem.uuid != userFB.uid ) {
        await firestore()
        .collection('users')
        .where('uid', '==' , dataItem.uuid)
        .get()
        .then((p_user) => {
          post_user = p_user;
          console.log('p_user', p_user._docs[0]._data.notification_token)
        })

        if(post_user._docs){
          const headers = {
            'Authorization': `key=${GOOGLE_FCM_KEY}`,
            'Content-Type': 'application/json',
          }
      
          const bodyToSend = JSON.stringify({
            to: post_user._docs[0]._data.notification_token,
            notification: {
              title: "Mon Conseiller Fitness",
              body: userFB.firstname +" "+userFB.lastname + " a commenté votre post.",
              imageUrl: userFB.photo,
              sound : "default",
            },
            data: {
              avatar: userFB.photo,
              type: "comment",
              time: time2,
              displayName: userFB.firstname +" "+ userFB.lastname ,
              sender_id: userFB.uid,
              seen: false,
              pid: postFB.id_post,
              content: "@"+dataItem.display_name + " "+dataMsg.replyMsg.trim(),
              commentid: postFB.id_post+userFB.uid+time2,
              forcommentid: dataItem.commentid,
            }
          })
          try {
            axios({
              method: 'post',
              url: 'https://fcm.googleapis.com/fcm/send',
              headers: headers,
              data: bodyToSend,
            }).then((response) => {
              //console.log("response", response)
              setDataItem(null)
            })
          } catch (err) {
              console.log('sendNotificationFirebaseAPI err:', err)
              setDataItem(null)
            return { err }
          }
        }
      }else
      console.log('sendNotificationFirebaseAPI', false)
    }

    const showBody =  ({item})=>  
    (
      <Card>
        <UserInfo>
            <TouchableOpacity onPress={() => navigation.navigate('UserProfileScreen', {uid: item.uuid})}>
              <UserImgWrapper>
                <UserImg source={{uri: item.avatar+ '?token=' + rndm,}} />
              </UserImgWrapper>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleModalReplyMsg(item)}>
              <TextSection>
              <UserInfoText>
                  <UserName>{item.display_name}</UserName>
                  <PostTime>{moment(item.time).fromNow()}</PostTime>
              </UserInfoText>
              <MessageText>{item.content}</MessageText>
              </TextSection>
            </TouchableOpacity>
        </UserInfo>
      </Card>
    )

    const showHeader =  ()=>{
      return(
        <Center>
            <Box
            bg="white"
            shadow={1}
            rounded="lg"
            style={{backgroundColor: "#fff", marginBottom: 10, width: '95%'}}
            >
            <Stack space={4} style={{ padding: 15}} >
                <View style={{flexDirection:'row',marginTop: 5}}>
                    <Avatar
                        source={{
                        uri: postFB ? postFB.avatar : null + '?token=' + rndm,
                        }}
                    />
                    <View style={{marginLeft:15, flexDirection:'column'}}>
                        <Title style={{fontSize: 15, color: "#000"}}>{ postFB ? postFB.display_name : null}</Title>
                        <Caption style={[styles.caption,{color: "#000"}]}>{moment(postFB ? postFB.time : null).fromNow()}</Caption>
                    </View>
                </View>
                <View style={{ alignItems: "center", justifyContent: "center", flex: 1}}>
                  <FastImage 
                    source={{
                      uri: postFB ? postFB.photo_uri : null, 
                      priority: FastImage.priority.normal,
                    }}
                    //alt="image base"
                    //resizeMode="center"
                    style={{ width: 400, height: 300 }}
                    //roundedTop="md"
                    resizeMode={FastImage.resizeMode.center}
                  />
                </View>
                <Text lineHeight={[5, 5, 7]} noOfLines={[4, 4, 2]} color="#000">
                {postFB ? postFB.content : null}
                </Text>
                
                <View style={{flexDirection:'row',marginTop: 5}}>
                    <TouchableOpacity style={{marginRight: 15 }} onPress={()=> hundlLike(postFB)}>
                        <Icon size={30} name={checkLike(postFB) ? "heart" :"ios-heart-outline"} style={{ color: Colors.btnSplash}} />
                        <Text style={{textAlign: 'center', color: "#000"}}>{ postFB ?  postFB.likes : null} </Text>
                    </TouchableOpacity>
                    <TouchableOpacity transparent onPress={()=> navigation.navigate('CommentPostScreen',{cdata: postFB, user: userFB})}>
                        <Icon size={30} name="ios-chatbubbles-outline" style={{ color: Colors.btnSplash}} />
                        <Text style={{textAlign: 'center', color: "#000"}}>{postFB ? postFB.comments : null} </Text>
                    </TouchableOpacity>
                </View>            
            </Stack>
            </Box>
        </Center>
      )
  } 

  const  addReplyMsg=() => 
  (
   <View>
     <Modal isVisible={isModalReplyMsg}
            onSwipeComplete={() => setModalReplyMsgVisible(false)}
            swipeDirection="right"
            swipeDirection="left"
     >
       <View style={{  backgroundColor: "#fff", height: '50%',  borderRadius: 20 }}>
         <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
           <View style={styles.action}>
               <TextInputPaper 
                   label="Répondez à ce commentaire"
                   mode='outlined'
                   numberOfLines={3}
                   multiline={true}
                   style={[styles.textInput, {height: '60%', width: '70%'}]}
                   autoCapitalize="none"
                   onChangeText={(val) => textInputReplyMsg(val)}
               />
           </View>
             <TouchableOpacity style={styles.commandButton} onPress={() => sendReply()}>
               <Text style={styles.panelButtonTitle}>Ajouter</Text>
             </TouchableOpacity>
         </View>
       </View>
     </Modal>
   </View>
  );


    return(
        <NativeBaseProvider>
          {isModalReplyMsg ? addReplyMsg(): null}
          <SafeAreaView>
            <FlatList
                data={comments}
                style={{marginBottom: '20%', marginHorizontal: '3%', backgroundColor: "#fff"}}
                keyExtractor={ item => item.commentid }
                renderItem={showBody}
                ListHeaderComponent={showHeader}
                ListFooterComponent={null}
            />
          </SafeAreaView>
        </NativeBaseProvider>
    )
}

export default DetailPostScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center'
    },
    actions: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        width: '90%',
        marginLeft: 20,
        backgroundColor: "#fff",
        marginTop: 15
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
      commandButton: {
        padding: 15,
        borderRadius: 10,
        backgroundColor: Colors.btnSplash,
        alignItems: 'center',
        marginTop: 0,
        marginHorizontal: 15
      },
      action: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 5
    },
  });