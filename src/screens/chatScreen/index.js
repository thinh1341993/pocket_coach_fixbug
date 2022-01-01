//https://github.com/wix/react-native-gifted-chat/blob/master/example/App.js
import React, {useEffect, useState, useRef} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GiftedChat, Actions, Bubble } from 'react-native-gifted-chat';
import { NativeBaseProvider} from 'native-base';
import {Colors} from '../../styles'
import ImagePicker from 'react-native-image-crop-picker';
import firestore from '@react-native-firebase/firestore';
import {useSelector, useDispatch} from 'react-redux';
import {getUser, getAdminMsg} from '../../redux/actions';
import storage from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';
import axios from "axios";
import { GOOGLE_FCM_KEY } from '../../constants';
import { useIsFocused } from '@react-navigation/native';


const ChateScreen = ({route, navigation}) => {
    const { cuser } = route.params;
    //const [messages, setMessages]= React.useState([]);
    const [typingText, setTypingText]= React.useState(null);
    const [loadEarlier, setLoadEarlier]= React.useState(true);
    const [isLoadingEarlier, setIsLoadingEarlier]= React.useState(false);
    const {userFB} = useSelector(state => state.userFBReducer);
    const {chatAdminMsg} = useSelector(state => state.getChatAdminReducer);
    const dispatch = useDispatch();
    let [chatMsg, setChatMsg]= React.useState([]);
    const isRendered = useRef(false);
    const isFocused = useIsFocused();
    const fetchUserFB = () => dispatch(getUser());
    const fetchMsgAdminFB = () => dispatch(getAdminMsg());

    useEffect(() => {
      if(isFocused){
        console.log("myid", userFB.uid)
        console.log("clientid", cuser.id)
        fetchUserFB()
      }
    },[isFocused]);

    useEffect(async() => { 
      const unsubscribe = await firestore()
                          .collection('chat_admins')
                          .doc(userFB.uid )
                          .collection('messages')
                          .doc(cuser.id )
                          .collection('messages')
                          .orderBy('createdAt', 'desc')
                          .limit(500)
                          .onSnapshot(snap => {
                            chatMsg = []
                            console.log("mysnap", snap)
                            if(snap){
                            setChatMsg(
                            snap._docs.map(doc => ({
                               _id: doc.data()._id,
                               text: doc.data().text,
                               createdAt: doc.data().createdAt.toDate(),
                               user: {
                                 _id: doc.data().user._id,
                                 name: doc.data().user.name,
                                 avatar: doc.data().user.avatar,
                               },
                               image: doc.data().image,
                            }))
                          )
                            }
                          })

      //remember to unsubscribe from your realtime listener on unmount or you will create a memory leak
      return () => unsubscribe()
    }, []);

    const onLoadEarlier = () => {
          setIsLoadingEarlier(true)
    };

    const select_from_gallery = () => {
      ImagePicker.openPicker({
        width: 1000,
        height: 1000,
        cropping: true
      }).then(image => {
        console.log(image.path);
        //onSend ({ image: image.path })
        uploadImage(image.path)
      });
  
    }
  
    const select_from_camera = () => {
      ImagePicker.openCamera({
        width: 1000,
        height: 1000,
        cropping: true,
      }).then(image => {
        console.log(image.path);
        //onSend ({ image: image.path })
        uploadImage(image.path)
      });
    }

    const sendNotificationFirebaseAPI = async () => {
      let time2 = Date.parse(new Date())

      if ( userFB.uid != cuser.id ) {
        console.log('sendNotificationFirebaseAPI', true)
        let mchat_user; 
        await firestore()
        .collection('users')
        .where('uid', '==' , cuser.id)
        .get()
        .then((chat_user) => {
          mchat_user = chat_user;
        })

        if(mchat_user){
          const headers = {
            'Authorization': `key=${GOOGLE_FCM_KEY}`,
            'Content-Type': 'application/json',
          }
      
          const bodyToSend = JSON.stringify({
            to: mchat_user._docs[0]._data.notification_token,
            notification: {
              title: "Mon Conseiller Fitness",
              body: userFB.firstname +" "+userFB.lastname + " vous a envoyé un message.",
              imageUrl: userFB.photo,
              sound : "default",
            },
            data: {
              avatar: userFB.photo,
              type: "message",
              time: time2,
              displayName: userFB.firstname +" "+userFB.lastname,
              seen: false,
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

    const renderFooter = () => {
        if (typingText) {
          return (
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                {typingText}
              </Text>
            </View>
          );
        }
        return null;
      }

    const renderBubble = (props) => {
        if(props.currentMessage.user._id == userFB.uid) { 
          return <Bubble 
          {...props}
          wrapperStyle={{ right: { backgroundColor: Colors.btnSplash}, 
          }} 
          />
          } else {
          
          return <Bubble {...props} 
          textStyle={{
            left: {
            color: 'white',
          }
          }}
          wrapperStyle={{ left: { backgroundColor: Colors.backgroundSplash, },}}
          />
          }
          
    }


    
    const renderCustomActions = (props) => {
        // if (Platform.OS === 'ios') {
        //   return (
        //     <CustomActions
        //       {...props}
        //     />
        //   );
        // }
        const options = {
          'Prendre une photo': (props) => {
            select_from_camera();
          },
          'Ouvrir la galerie': (props) => {
            select_from_gallery();
          },
        };
        return (
          <Actions
            {...props}
            options={options}
          />
        );
    }

    const onSend = async (newMessages) => {

      let time = Date.parse(new Date())
      
      if (newMessages.image){
        setChatMsg(GiftedChat.append(chatMsg, {  
          image: newMessages.image,
          _id: userFB.uid + time,
          createdAt: new Date(),
           user: {
             _id: userFB.uid,
             role: userFB.role,
             avatar: userFB.photo,
             name: userFB.firstname +" "+userFB.lastname ,
           },
          }))

          await firestore()
          .collection('chat_admins')
          .doc(userFB.uid )
          .collection('messages')
          .doc(cuser.id)
          .collection('messages')
          .doc(userFB.uid + time)
          .set({ image: newMessages.image,
                 _id: userFB.uid + time,
                 createdAt: new Date(),
                 time: time,
                  user: {
                    _id: userFB.uid,
                    role: userFB.role,
                    avatar: userFB.photo,
                    name: userFB.firstname +" "+userFB.lastname ,
                  },
                  id_sender: userFB.uid ,
                  id_recever: cuser.id ,

          })
          .then(() => {
              firestore()
              .collection('chat_admins')
              .doc(cuser.id )
              .collection('messages')
              .doc(userFB.uid)
              .collection('messages')
              .doc(cuser.id + time)
              .set({ image: newMessages.image,
                     _id: userFB.uid + time,
                     createdAt: new Date(),
                     time: time,
                      user: {
                        _id: userFB.uid,
                        role: userFB.role,
                        avatar: userFB.photo,
                        name: userFB.firstname +" "+userFB.lastname ,
                      },
                      id_sender: userFB.uid ,
                      id_recever: cuser.id ,
    
              })
              .then(() => {
                firestore()
                .collection('chat_history')
                .doc(userFB.uid)
                .collection('messages')
                .doc(cuser.id)
                .set({ _id: userFB.uid + time,
                       text: "il a envoyé une photo dans le chat",
                       createdAt: new Date(),
                       time: time,
                        user: {
                          _id: cuser.id,
                          avatar: cuser.avatar,
                          name: cuser.name ,
                        },
                        id_sender: userFB.uid ,
                        id_recever: cuser.id ,
                        for: 'admin',
                        seen: false,
      
                })
                .then(() => {
                  firestore()
                  .collection('chat_history')
                  .doc(cuser.id)
                  .collection('messages')
                  .doc(userFB.uid)
                  .set({ _id: userFB.uid + time,
                         text: "il a envoyé une photo dans le chat",
                         createdAt: new Date(),
                         time: time,
                          user: {
                            _id: userFB.uid,
                            avatar: userFB.photo,
                            name: userFB.firstname +" "+userFB.lastname ,
                          },
                          id_sender: userFB.uid ,
                          id_recever: cuser.id ,
                          for: 'admin',
                          seen: false,
        
                  })
                  .then(() => {
                    sendNotificationFirebaseAPI()
                  });
                });
              });
          });
          return
      }else{
        setChatMsg(GiftedChat.append(chatMsg, { 
          text: newMessages[0].text,
          _id: userFB.uid + time,
          createdAt: new Date(),
           user: {
             _id: userFB.uid,
             role: userFB.role,
             avatar: userFB.photo,
             name: userFB.firstname +" "+userFB.lastname ,
           }}))

          await firestore()
          .collection('chat_admins')
          .doc(userFB.uid )
          .collection('messages')
          .doc(cuser.id)
          .collection('messages')
          .doc(userFB.uid + time)
          .set({ 
            text: newMessages[0].text,
            _id: userFB.uid + time,
            createdAt: new Date(),
            time: time,
             user: {
               _id: userFB.uid,
               role: userFB.role,
               avatar: userFB.photo,
               name: userFB.firstname +" "+userFB.lastname ,
             },
             id_sender: userFB.uid ,
             id_recever: cuser.id ,
            })
          .then(() => {
            firestore()
              .collection('chat_admins')
              .doc(cuser.id )
              .collection('messages')
              .doc(userFB.uid )
              .collection('messages')
              .doc(cuser.id + time)
              .set({ 
                text: newMessages[0].text,
                _id: userFB.uid + time,
                createdAt: new Date(),
                time: time,
                user: {
                  _id: userFB.uid,
                  role: userFB.role,
                  avatar: userFB.photo,
                  name: userFB.firstname +" "+userFB.lastname ,
                },
                id_sender: userFB.uid ,
                id_recever: cuser.id ,
                })
              .then(() => {
                firestore().collection('chat_history')
                  .doc(userFB.uid)
                  .collection('messages')
                  .doc(cuser.id)
                  .set({ _id: userFB.uid + time,
                        text: newMessages[0].text,
                        createdAt: new Date(),
                        time: time,
                          user: {
                            _id: cuser.id,
                            avatar: cuser.avatar,
                            name: cuser.name ,
                          },
                          id_sender: userFB.uid ,
                          id_recever: cuser.id ,
                          for: 'admin',
                          seen: false,
        
                  })
                  .then(() => {
                    firestore()
                    .collection('chat_history')
                    .doc(cuser.id)
                    .collection('messages')
                    .doc(userFB.uid)
                    .set({ _id: userFB.uid + time,
                           text: newMessages[0].text,
                           createdAt: new Date(),
                           time: time,
                            user: {
                              _id: userFB.uid,
                              avatar: userFB.photo,
                              name: userFB.firstname +" "+userFB.lastname ,
                            },
                            id_sender: userFB.uid ,
                            id_recever: cuser.id ,
                            for: 'admin',
                            seen: false,
          
                    })
                    .then(() => {
                      sendNotificationFirebaseAPI()
                    });
                  });
              });
          });
          
          return 
      }

      // for demo purpose
      //answerDemo(messages);
    }

    const uploadImage = async (uri) => {
      try {
        const filename_extension = uri.substring(uri.lastIndexOf('.') + 1);
        const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
        let time = Date.parse(new Date())

        const task = storage()
          .ref('/chat/'+userFB.uid+time+'.'+filename_extension)
          .putFile(uploadUri);

        try {
          await task;
        } catch (e) {
          console.error(e);
        }

        let url = await storage().ref('/chat/'+userFB.uid+time+'.'+filename_extension).getDownloadURL();
        onSend ({ image: url })
      } catch (e) {
        console.error(e);
      }

    }

    return (
        <NativeBaseProvider>
        <View style={styles.container}>
          <GiftedChat
              messages={chatMsg}
              onSend={(msg)=>onSend(msg)}
              user={{
               _id: userFB.uid,
               role: userFB.role,
               avatar: userFB.photo,
               name: userFB.firstname +" "+userFB.lastname ,
              }}
              renderFooter={renderFooter}
              renderBubble={renderBubble}
              renderActions={renderCustomActions}
              //loadEarlier={loadEarlier}
              //onLoadEarlier={onLoadEarlier}
              isLoadingEarlier={isLoadingEarlier}

          />
        </View>
      </NativeBaseProvider>
    );
};

export default ChateScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    marginBottom: '20%',
    backgroundColor: "#fff"
    //alignItems: 'center', 
    //justifyContent: 'center'
  },
  footerContainer: {
    marginTop: 5,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#aaa',
  },
});