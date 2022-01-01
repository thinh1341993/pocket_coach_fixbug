import React, {useState, useEffect} from 'react';
import { View, Text, LogBox, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView, Dimensions, SafeAreaView } from 'react-native';
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
import { NativeBaseProvider } from "native-base";
import Icon from 'react-native-vector-icons/Ionicons';
import {useSelector, useDispatch} from 'react-redux';
import {getUser, getPosts, getComments} from '../../redux/actions';
import { ProgressDialog } from 'react-native-simple-dialogs';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import 'moment/locale/fr'
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import axios from "axios";
import { GOOGLE_FCM_KEY } from '../../constants';
import { useIsFocused } from '@react-navigation/native';
import Modal from "react-native-modal";
import { TextInput as TextInputPaper } from 'react-native-paper';

const CommentPostScreen = ({route,navigation}) => {
    const { cdata, user } = route.params;
    const [muser, setUser] = useState(user);
    let rndm = Date.parse(new Date().getHours);
    const {postsFB} = useSelector(state => state.postsFBReducer);
    const {comments} = useSelector(state => state.commentsReducer);
    const [isFetching, setIsFetching] = useState(false);
    const [data, setData] = useState(cdata);
    const [content, setContent] = useState("");
    const [uploading, setUploading] = useState(false);
    const isFocused = useIsFocused();
    const {userFB} = useSelector(state => state.userFBReducer);
    const dispatch = useDispatch();
    const fetchPostsFB = () => dispatch(getPosts());
    const fetchCommentFB = (pid) => dispatch(getComments(pid));
    const fetchUserFB = () => dispatch(getUser());
    const [dataComment, setDataComment] = useState([]);
    const [isModalReplyMsg, setModalReplyMsgVisible] = useState(false);
    let [dataItem, setDataItem] = React.useState({})
    let myTextInput = React.useRef(null);
    moment.locale('fr')
    
    const [dataMsg, setDataMsg] = React.useState({
      replyMsg: '',
      check_textInputReplyMsg: false,
    });

    useEffect(() => {
        fetchUserFB()
    },[isFocused]);

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

    useEffect(async() => { 
      const unsubscribe = await firestore()
                                .collection('comments')
                                .where('pid', '==' , cdata.id_post)
                                .orderBy('time', 'desc')
                                .limit(100)
                                .onSnapshot(snap => {
                                  if(snap){
                                  const data = snap.docs.map(doc => doc.data())
                                  //console.log("unsubscribe Posts:", data)
                                  setDataComment(data)
                                  }
                          })
      //remember to unsubscribe from your realtime listener on unmount or you will create a memory leak
      return () => unsubscribe()
    }, []);


    const sendNotificationFirebaseAPI = async (puserid) => {
      let time2 = Date.parse(new Date())

      if ( muser.uid != puserid ) {
        console.log('sendNotificationFirebaseAPI', true)
        let post_user; 
        await firestore()
        .collection('users')
        .where('uid', '==' , puserid)
        .get()
        .then((p_user) => {
          post_user = p_user;
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
              imageUrl: muser.photo,
              sound : "default",
            },
            data: {
              avatar: muser.photo,
              type: "comment",
              time: time2,
              displayName: muser.firstname +" "+ muser.lastname ,
              sender_id: muser.uid,
              seen: false,
              pid: data.id_post,
              content: content.trim(),
              commentid: data.id_post+userFB.uid+time2
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
            })
          } catch (err) {
              console.log('sendNotificationFirebaseAPI err:', err)

            return { err }
          }
        }

      }else
        console.log('sendNotificationFirebaseAPI', false)
    }


    const fetchData = () => {
      fetchCommentFB(cdata.id_post)
      setIsFetching(false);
    };

    const onRefresh = () => {
      rndm = Date.parse(new Date().getHours);
      setIsFetching(true);
      fetchData();
    };
    
    const sendComment = async () => {
      setUploading(true);
      let time = Date.parse(new Date())
      await firestore().collection("posts")
                       .doc(data.id_post)
                       .update({
                          comments: firestore.FieldValue.increment(1),
                        })
                        .then(() => {
                          console.log('post comment increment!');
                          firestore().collection("comments")
                                      .doc(data.id_post+userFB.uid+time)
                                      .set({
                                        pid: data.id_post,
                                        uuid: userFB.uid,
                                        avatar: muser.photo,
                                        time: time,
                                        display_name: muser.firstname +" " +muser.lastname,
                                        content: content.trim(),
                                        commentid: data.id_post+userFB.uid+time
                                      })
                                      .then(() => {
                                        console.log('User comment added!');
                                        fetchCommentFB(cdata.id_post)
                                        sendNotificationFirebaseAPI(data.uid)
                                        fetchPostsFB()
                                        myTextInput.current.clear()
                                      });
                          
                        });          
      setUploading(false);
    }

    const sendReply = async () => {
      setUploading(true);
      let time = Date.parse(new Date())
      await firestore().collection("posts")
                       .doc(data.id_post)
                       .update({
                          comments: firestore.FieldValue.increment(1),
                        })
                        .then(() => {
                          console.log('post comment increment!');
                          console.log("dataMsg", dataItem);
                          firestore()
                          .collection("comments")
                          .doc(data.id_post+userFB.uid+time)
                          .set({
                            pid: data.id_post,
                            uuid: userFB.uid,
                            avatar: muser.photo,
                            time: time,
                            display_name: muser.firstname +" " +muser.lastname,
                            content: "@"+dataItem.display_name + " "+dataMsg.replyMsg.trim(),
                            commentid: data.id_post+userFB.uid+time,
                            to: dataItem.uuid,
                            forcommentid: dataItem.commentid,
                          })
                          .then(() => {
                            console.log('User comment added!');
                            setModalReplyMsgVisible(false)
                            fetchCommentFB(cdata.id_post)
                            sendNotificationToFirebaseAPI()
                            fetchPostsFB()

                          });
                          
                        });          
      setUploading(false);
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
              imageUrl: muser.photo,
              sound : "default",
            },
            data: {
              avatar: muser.photo,
              type: "comment",
              time: time2,
              displayName: muser.firstname +" "+ muser.lastname ,
              sender_id: muser.uid,
              seen: false,
              pid: data.id_post,
              content: "@"+dataItem.display_name + " "+dataMsg.replyMsg.trim(),
              commentid: data.id_post+userFB.uid+time2,
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


    const textInputContent = (val) => {
          setContent(val);
    }

    const checkComment = () => {
      if (content.length > 0){
        sendComment()
        return 
      }
      return
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

    return (
        <View style={{flex: 1, backgroundColor: "#fff", marginBottom: '20%',}}>
          {isModalReplyMsg ? addReplyMsg(): null}
          <View style={{backgroundColor: "#fff"}}>
          <ProgressDialog
                        visible={uploading}
                        title="En cours de traitement"
                        message="Veuillez patienter"
                />
            <View  style={styles.actions}>
                <View >
                    <Icon backgroundColor="#fff" name="clipboard-outline" color={Colors.backgroundSplash} size={35} />
                </View>               
                <TextInput
                  placeholder="ajouter un commentaire..."
                  placeholderTextColor="#666666"
                  numberOfLines={2}
                  ref={myTextInput}
                  multiline={true}
                  onChangeText={(val) => textInputContent(val)}
                  style={{color: "#000000",width: '70%'}}
                />
                <TouchableOpacity onPress={()=> checkComment()} style={{justifyContent: 'center', alignItems: 'center', width:50, marginTop: 5, backgroundColor:"#fff" }}>
                    <Icon backgroundColor="#fff"   name="send-outline" color={Colors.backgroundSplash} size={30} />
                </TouchableOpacity>
            </View>
            <FlatList
              onRefresh={onRefresh}
              refreshing={isFetching}
              data={dataComment}
              style={{marginBottom: '20%', marginHorizontal: '3%', backgroundColor: "#fff"}}
              keyExtractor={item=>item.commentid}
              renderItem={showBody}
            />
          </View>
        </View>
        );
    }
export default CommentPostScreen;

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
  