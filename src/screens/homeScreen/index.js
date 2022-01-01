import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  TextInput,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors} from '../../styles'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import moment from 'moment';
import 'moment/locale/fr'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as Animatable from 'react-native-animatable';
import BottomSheet from 'reanimated-bottom-sheet';
import Animated, { set } from 'react-native-reanimated';
import ImagePicker from 'react-native-image-crop-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {useSelector, useDispatch} from 'react-redux';
import {getUser, getPosts} from '../../redux/actions';
import { ProgressDialog } from 'react-native-simple-dialogs';
import auth from '@react-native-firebase/auth';
import ImageView from 'react-native-image-view';
import messaging from '@react-native-firebase/messaging';
import axios from "axios";
import { GOOGLE_FCM_KEY } from '../../constants';
import { useIsFocused } from '@react-navigation/native';


import {
    Title,
    Caption,
} from 'react-native-paper';

import { Avatar, Text, NativeBaseProvider, Image, Center, Box, Stack, TextArea, Input } from "native-base";

const c_width = Dimensions.width - 20

const HomeScreen = ({navigation}) => {
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState("");
    const [uploading, setUploading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [isLike, setIsLike] = useState(false);
    let rndm = Date.parse(new Date().getHours);
    let bs1 = React.useRef(null);
    let myTextInput = React.useRef(null);
    let fall1 = new Animated.Value(1);
    const [photo, setPhoto] = React.useState('https://cdn.pixabay.com/photo/2017/11/10/05/24/add-2935429_1280.png');
    const {userFB} = useSelector(state => state.userFBReducer);
    const mountedRef = useRef(true)
    const isFocused = useIsFocused();
    moment.locale('fr')
    
    const {postsFB} = useSelector(state => state.postsFBReducer);
    //let [postsFB, setPostsFB] = useState([]);

    const dispatch = useDispatch();
    const fetchUserFB = () => dispatch(getUser());
    const fetchPostsFB = () => dispatch(getPosts());

    const [zoomImage, setZoomImage] = React.useState([])
    const [visible, setVisible] = React.useState(false)
    const screenHeight = Dimensions.get('window').height
    const [dataPost, setDataPost] = useState([]);
    

    useEffect(() => {
        fetchUserFB()
    },[isFocused]);

    useEffect(async() => { 
      const unsubscribe = await firestore()
                          .collection('posts')
                          .orderBy('time', 'desc')
                          .limit(1000)
                          .onSnapshot(snap => {
                            if(snap){
                            const data = snap.docs.map(doc => doc.data())
                            //console.log("unsubscribe Posts:", data)
                            setDataPost(data)
                            
                          }
                        })
      //remember to unsubscribe from your realtime listener on unmount or you will create a memory leak
      return () => unsubscribe()
    }, []);


    const fetchData = () => {
      fetchPostsFB()
      setIsFetching(false);
    };

    const onRefresh = () => {
      rndm = Date.parse(new Date().getHours);
      setIsFetching(true);
      fetchData();
      return
    };


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
            })
          } catch (err) {
              console.log('sendNotificationFirebaseAPI err:', err)
            return { err }
          }
        }

      }else
        console.log('sendNotificationFirebaseAPI', false)

    }


    const createPost = async (uri, content) => {
      setUploading(true);
      try {
        fetchUserFB()
        //console.log('user home:',userFB)

        const filename = uri.substring(uri.lastIndexOf('/') + 1);
        const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
        let time = Date.parse(new Date())

        console.log('filename:',filename)

        const task = storage()
          .ref('/posts/'+time+filename)
          .putFile(uploadUri);
  
        try {
          await task;
        } catch (e) {
          console.error(e);
        }
  
        const url = await storage().ref('/posts/'+time+filename).getDownloadURL();
        let token = userFB.photo.substring(userFB.photo.lastIndexOf('token=') + 6);
        console.log('token:',token)

        let time2 = Date.parse(new Date())
        await firestore()
        .collection('posts')
        .doc(userFB.uid+time2)
        .set({
          photo_uri: url,
          display_name: userFB.firstname+' '+userFB.lastname,
          content: content.trim(),
          avatar: userFB.photo,
          uid: userFB.uid,
          likes: 0,
          comments: 0,
          time: time2,
          id_post: userFB.uid+time2,
          token: token, 
        })
        .then(() => {
          console.log('Post added!');
          setUploading(false);
          Alert.alert(
            '',
            'Votre post a bien été enregistré !', [
              {text: 'ok'}
          ]);
          setPhoto('https://cdn.pixabay.com/photo/2017/11/10/05/24/add-2935429_1280.png');
          setContent("")
          myTextInput.current.clear()
          //fetchPostsFB()
        });
  
      } catch (e) {
        console.error(e);
        setUploading(false);
        Alert.alert(
          "Votre post n'a pas pu être enregistré !",
          "Veuillez réessayer", [
            {text: 'ok'}
        ]);
      }
    }

    const checkPostToCreat = () =>{
      setUploading(true);
      if(!content || photo.includes("https://cdn.pixabay.com/photo")){
        Alert.alert('Entrée incorrect', "Le champ est vide et/ou l'image est incorrecte !", [
          {text: 'ok'}
        ]);
        setUploading(false)
        return
      }else{
        createPost(photo, content)
      }
      //setUploading(false)
    }

    const textInputContent = (val) => {
      if( val.length !== 0 ) {
          setContent(val);
      }else{
        setContent("");
      }
    }


    renderInner = () => (
      <View style={styles.panel}>
        <View style={{alignItems: 'center'}}>
          <Text style={styles.panelTitle}>Envoyer la photo</Text>
          <Text style={styles.panelSubtitle}>Choisissez votre photo</Text>
        </View>
        <TouchableOpacity style={styles.panelButton} onPress={select_from_camera} >
          <Text style={styles.panelButtonTitle}>Prendre une photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.panelButton} onPress={select_from_gallery} >
          <Text style={styles.panelButtonTitle}>Choisir dans la galerie</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.panelButton}
          onPress={() => bs1.current.snapTo(1)}>
          <Text style={styles.panelButtonTitle}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  
    renderHeader = () => (
      <View style={styles.header}>
        <View style={styles.panelHeader}>
          <View style={styles.panelHandle} />
        </View>
      </View>
    );
  
    const select_from_gallery = () => {
      ImagePicker.openPicker({
        width: 1000,
        height: 900,
        cropping: true
      }).then(image => {
        console.log(image.path);
        bs1.current.snapTo(1)
        setPhoto(image.path)
      });
  
    }
  
    const select_from_camera = () => {
      ImagePicker.openCamera({
        width: 1000,
        height: 900,
        cropping: true,
      }).then(image => {
        console.log(image.path);
        bs1.current.snapTo(1)
        setPhoto(image.path)
      });
    }

    const custom = () => {
      if(bs1)
        bs1.current.snapTo(0)
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
                                       //fetchPostsFB()
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
                                       //fetchPostsFB()
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

    const checkLike = (item) => {
      if(item.peopleLikes)
        if (item.peopleLikes.includes(userFB.uid)){
          return true
        }
      return false
    }

    const showCard =  ({item})=>   
      (
        <Center style={{ borderColor: Colors.cardBg, borderWidth: 1}}>
        <Box
        bg="white"
        shadow={1}
        rounded="lg"
        style={{ marginBottom: 10, width: '99%'}}
        >
          <Stack space={4} style={{ padding: 15}} >
            <TouchableOpacity 
              onPress={() => navigation.navigate('UserProfileScreen', {uid: item.uid})}
              style={{flexDirection:'row',marginTop: 5}}>
                <Avatar
                    source={{
                    uri: item.avatar + '?token=' + rndm,
                    }}
                />
                <View style={{marginLeft:15, flexDirection:'column'}}>
                    <Title style={{fontSize: 15, color: "#000"}}>{item.display_name}</Title>
                    <Caption style={[styles.caption,{color: "#000"}]}>{moment(item.time).fromNow()}</Caption>
                </View>
            </TouchableOpacity>
            <View style={{ alignItems: "center", justifyContent: "center", flex: 1}}>
                <Image source={{uri: item.photo_uri}} 
                  alt="image base" 
                  resizeMode="center" 
                  height={300}
                  width={400} 
                  roundedTop="md"
                />
            </View>
            <Text lineHeight={[5, 5, 7]} noOfLines={[4, 4, 2]} color="#000">
            {item.content}
            </Text>
            
            <View style={{flexDirection:'row',marginTop: 5}}>
                <TouchableOpacity style={{marginRight: 15 }} onPress={()=> hundlLike(item)}>
                    <Icon size={30} name={checkLike(item) ? "heart" :"ios-heart-outline"} style={{ color: Colors.btnSplash}} />
                    <Text style={{textAlign: 'center', color: "#000"}}>{item.likes} </Text>
                </TouchableOpacity>
                <TouchableOpacity transparent onPress={()=> navigation.navigate('CommentPostScreen',{cdata: item, user: userFB})}>
                    <Icon size={30} name="ios-chatbubbles-outline" style={{ color: Colors.btnSplash}} />
                    <Text style={{textAlign: 'center', color: "#000"}}>{item.comments} </Text>
                </TouchableOpacity>
            </View>            
          </Stack>
        </Box>
        </Center>
      )

    return (

      <SafeAreaView style={styles.container}>
        {loading ? (
        <ScrollView
          style={{flex: 1, margin: 30}}
          contentContainerStyle={{alignItems: 'center'}}>
          <SkeletonPlaceholder>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={{width: 60, height: 60, borderRadius: 50}} />
              <View style={{marginLeft: 20}}>
                <View style={{width: 120, height: 20, borderRadius: 4}} />
                <View
                  style={{marginTop: 6, width: 80, height: 20, borderRadius: 4}}
                />
              </View>
            </View>
            <View style={{marginTop: 10, marginBottom: 30}}>
              <View style={{width: 300, height: 20, borderRadius: 4}} />
              <View
                style={{marginTop: 6, width: 250, height: 20, borderRadius: 4}}
              />
              <View
                style={{marginTop: 6, width: 350, height: 200, borderRadius: 4}}
              />
            </View>
          </SkeletonPlaceholder>
          <SkeletonPlaceholder>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={{width: 60, height: 60, borderRadius: 50}} />
              <View style={{marginLeft: 20}}>
                <View style={{width: 120, height: 20, borderRadius: 4}} />
                <View
                  style={{marginTop: 6, width: 80, height: 20, borderRadius: 4}}
                />
              </View>
            </View>
            <View style={{marginTop: 10, marginBottom: 30}}>
              <View style={{width: 300, height: 20, borderRadius: 4}} />
              <View
                style={{marginTop: 6, width: 250, height: 20, borderRadius: 4}}
              />
              <View
                style={{marginTop: 6, width: 350, height: 200, borderRadius: 4}}
              />
            </View>
          </SkeletonPlaceholder>
        </ScrollView>
      ) : (
        <NativeBaseProvider style={{marginTop: 0,marginBottom: '10', flex: 1, backgroundColor: '#fff'}}>
          <BottomSheet
          ref={bs1}
          snapPoints={[400, 0]}
          renderContent={() =>renderInner()}
          renderHeader={() => renderHeader()}
          initialSnap={1}
          callbackNode={fall1}
          enabledGestureInteraction={true}
          />
          <Animated.View style={{margin: 20,
            opacity: Animated.add(0.1, Animated.multiply(fall1, 1.0)),
          }}>
              <Animatable.View 
                  animation="fadeInUpBig"
                  
              >
                <ProgressDialog
                        visible={uploading}
                        title="En cours de traitement"
                        message="Veuillez patienter"
                />
                {
                  userFB.role == "admin"
                  ?
                <View
                  style={{
                    //marginHorizontal: 30, 
                    width: '100%', 
                    flexDirection:'row',
                    marginTop: 20, 
                    marginBottom: 10,
                    justifyContent: 'center', 
                    alignContent: 'center',
                    backgroundColor: "#fff",
                    borderRadius: 5,
                    backgroundColor: Colors.cardBg
                    }}>
                      <TouchableOpacity 
                        onPress={() => custom()}
                        style={{justifyContent: 'center', 
                                alignItems: 'center', 
                                width:50, 
                                marginTop: 0, 
                                backgroundColor: Colors.cardBg }}>
                      <Image
                        source={{
                          uri: photo,
                        }}
                        alt="Alternate Text"
                        size={"xs"}
                        style={{marginTop: 0}}
                      />
                      </TouchableOpacity>

                      <TextInput
                            placeholder="De quoi souhaitez-vous discuter ?"
                            placeholderTextColor="#666666"
                            autoCorrect={false}
                            numberOfLines={3}
                            multiline={true}
                            ref={myTextInput}
                            onChangeText={(val) => textInputContent(val)}
                            style={[
                            styles.textInput,
                            {
                                color: "#000000",
                                width: '70%',
                                borderColor: "#000000",
                                
                            },
                            ]}
                      />
                      <TouchableOpacity 
                          onPress={()=>checkPostToCreat()} 
                          style={{justifyContent: 'center', 
                                  alignItems: 'center', 
                                  width:50, 
                                  marginTop: 0, 
                                  backgroundColor: Colors.cardBg }}>
                          <FontAwesome backgroundColor="#fff"   name="bullhorn" color={Colors.btnSplash} size={25} />
                      </TouchableOpacity>

                </View>
                :
                null
                }
                <FlatList
                  data={dataPost}
                  style={{marginTop:30,marginBottom: userFB.role == "admin" ?'45%': '15%'}}
                  onRefresh={onRefresh}
                  refreshing={isFetching}
                  renderItem={showCard}
                  keyExtractor={(item) => item.id_post}
                  ListHeaderComponent={null}
                  ListFooterComponent={null}
                  showsVerticalScrollIndicator={false}
                />
              </Animatable.View>
          </Animated.View>
        </NativeBaseProvider>
      )}

      </SafeAreaView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },
  panel: {
    padding: 20,
    backgroundColor: '#fff',
    paddingTop: 20,
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    // shadowColor: '#000000',
    // shadowOffset: {width: 0, height: 0},
    // shadowRadius: 5,
    // shadowOpacity: 0.4,
  },
  header: {
    backgroundColor: '#fff',
    shadowColor: '#333333',
    shadowOffset: {width: -1, height: -3},
    shadowRadius: 2,
    shadowOpacity: 0.4,
    // elevation: 5,
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panelHeader: {
    alignItems: 'center',
  },
  panelHandle: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00000040',
    marginBottom: 10,
  },
  panelTitle: {
    fontSize: 27,
    height: 35,
  },
  panelSubtitle: {
    fontSize: 14,
    color: 'gray',
    height: 30,
    marginBottom: 10,
  },
  panelButton: {
    padding: 13,
    borderRadius: 10,
    backgroundColor: Colors.btnSplash,
    alignItems: 'center',
    marginVertical: 7,
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
  action: {
    flexDirection: 'row',
    marginTop: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingBottom: 5,
  },
});
